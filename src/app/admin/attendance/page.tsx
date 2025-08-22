'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RehearsalDetail, Member } from '@/lib/supabase';
import { auth } from '@/lib/auth';

interface MemberAttendance {
  id: string;
  member_id: string;
  event_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  member: {
    id: string;
    surname: string;
    first_name: string;
    registration_number: string;
    role: string;
  };
}

export default function AdminAttendancePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [generalFilter, setGeneralFilter] = useState('All');
  const [selectedRehearsal, setSelectedRehearsal] = useState<RehearsalDetail | null>(null);
  const [rehearsals, setRehearsals] = useState<RehearsalDetail[]>([]);
  const [showRehearsalDropdown, setShowRehearsalDropdown] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<MemberAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated with persistent session
    if (auth.isAuthenticated()) {
      setIsAuthenticated(true);
      loadRehearsals();
      loadAllMembers(); // Always load all members
      
      // Check if session needs refresh
      if (auth.needsRefresh()) {
        auth.refreshSession();
      }
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  // Set up periodic session refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh session every 30 minutes to keep it alive
    const refreshInterval = setInterval(() => {
      if (auth.isAuthenticated()) {
        auth.refreshSession();
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Check session status every minute
    const sessionCheckInterval = setInterval(() => {
      if (auth.needsRefresh()) {
        auth.refreshSession();
      }
      
      // Show warning if session expires in less than 1 hour
      const session = auth.getSession();
      if (session) {
        const expiresAt = new Date(session.expiresAt);
        const oneHourFromNow = new Date();
        oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
        
        if (expiresAt < oneHourFromNow) {
          // Show warning message
          setSaveMessage({ 
            type: 'error', 
            text: 'Your session will expire soon. Please save your work.' 
          });
        }
      }
    }, 60 * 1000); // 1 minute

    // Cleanup intervals on unmount
    return () => {
      clearInterval(refreshInterval);
      clearInterval(sessionCheckInterval);
    };
  }, [isAuthenticated]);

  const loadRehearsals = async () => {
    try {
      const response = await fetch('/api/rehearsals');
      if (response.ok) {
        const data = await response.json();
        setRehearsals(data);
      }
    } catch (error) {
      console.error('Error loading rehearsals:', error);
    }
  };

  const loadAllMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/members');
      if (response.ok) {
        const members = await response.json();
        const memberRecords = members.map((member: Member) => ({
          id: member.id,
          member_id: member.id,
          event_id: '',
          status: 'present' as const,
          notes: '',
          member: {
            id: member.id,
            surname: member.surname,
            first_name: member.first_name,
            registration_number: member.registration_number || `WOM${member.id.slice(0, 4)}`,
            role: member.role
          }
        }));
        setAttendanceRecords(memberRecords);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      setAttendanceRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRehearsalSelect = async (rehearsal: RehearsalDetail) => {
    setSelectedRehearsal(rehearsal);
    setShowRehearsalDropdown(false);
    
    // Load existing attendance data for this rehearsal if available
    await loadAttendanceForRehearsal(rehearsal.event_id);
  };

  const loadAttendanceForRehearsal = async (eventId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/attendance?eventId=${eventId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          // If attendance records exist, update the status for existing members
          setAttendanceRecords(prev => 
            prev.map(memberRecord => {
              const existingAttendance = data.find((att: { member_id: string; status: string; notes?: string }) => 
                att.member_id === memberRecord.member_id
              );
              if (existingAttendance) {
                return {
                  ...memberRecord,
                  status: existingAttendance.status as 'present' | 'absent' | 'late' | 'excused',
                  notes: existingAttendance.notes || ''
                };
              }
              return memberRecord;
            })
          );
        }
        // If no existing attendance, keep current member records with default 'present' status
      }
    } catch (error) {
      console.error('Error loading attendance for rehearsal:', error);
      // Keep current member records if loading fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (memberId: string, newStatus: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.member_id === memberId ? { ...record, status: newStatus } : record
      )
    );
  };

  const markAllPresent = () => {
    setAttendanceRecords(prev => 
      prev.map(record => ({ ...record, status: 'present' }))
    );
  };

  const handleSave = async () => {
    if (!selectedRehearsal) {
      setSaveMessage({ type: 'error', text: 'Please select a rehearsal first to save attendance data.' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      setIsLoading(true);
      
      const attendanceData = attendanceRecords.map(record => ({
        event_id: selectedRehearsal.event_id,
        member_id: record.member_id,
        status: record.status,
        notes: record.notes || ''
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceData })
      });

      const responseData = await response.json();

      if (response.ok) {
        setSaveMessage({ type: 'success', text: responseData.message || 'Attendance saved successfully!' });
        // Optionally reload attendance data to get the latest from database
        // await loadAttendanceForRehearsal(selectedRehearsal.event_id);
      } else {
        throw new Error(responseData.error || 'Failed to save attendance');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSaveMessage({ 
        type: 'error', 
        text: `Error saving attendance: ${error instanceof Error ? error.message : 'Please try again.'}` 
      });
      // Clear error message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (!selectedRehearsal) {
      setSaveMessage({ type: 'error', text: 'Please select a rehearsal first to export attendance data.' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      // Create CSV content
      const csvContent = [
        ['Name', 'Registration ID', 'Role', 'Status', 'Notes'],
        ...attendanceRecords.map(record => [
          `${record.member.surname} ${record.member.first_name}`,
          record.member.registration_number || record.member.id,
          record.member.role,
          record.status,
          record.notes || ''
        ])
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${selectedRehearsal?.display_name?.replace(/\s+/g, '_') || 'rehearsal'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSaveMessage({ type: 'success', text: 'Attendance data exported successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error exporting attendance:', error);
      setSaveMessage({ 
        type: 'error', 
        text: 'Error exporting attendance data. Please try again.' 
      });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const handleLogout = () => {
    auth.logout();
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.member.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.member.registration_number && record.member.registration_number.includes(searchTerm)) ||
                         record.member.id.includes(searchTerm);
    const matchesRole = roleFilter === 'All' || record.member.role === roleFilter;
    const matchesGeneral = generalFilter === 'All' || record.status === generalFilter;
    
    return matchesSearch && matchesRole && matchesGeneral;
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin/dashboard" className="flex items-center">
              <Image
                src="/assets/Womimlogo.svg"
                alt="WOMIM Logo"
                width={80}
                height={65}
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                {auth.getSession()?.username || 'Admin'} Dashboard
              </span>
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary">
            WOMIM ATTENDANCE
          </h1>
        </div>

        {/* Event Selection */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-4">
            {selectedRehearsal && (
              <button
                onClick={() => {
                  setSelectedRehearsal(null);
                  // Reset all members to 'present' status
                  setAttendanceRecords(prev => 
                    prev.map(record => ({ ...record, status: 'present', notes: '' }))
                  );
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Selection
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowRehearsalDropdown(!showRehearsalDropdown)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700 font-medium">
                  {selectedRehearsal ? selectedRehearsal.display_name : 'Select Rehearsal'}
                </span>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Rehearsal Dropdown */}
              {showRehearsalDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {rehearsals.map((rehearsal) => (
                    <button
                      key={rehearsal.event_id}
                      onClick={() => handleRehearsalSelect(rehearsal)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{rehearsal.display_name}</div>
                      <div className="text-sm text-gray-600">
                        {rehearsal.focus_area && `Focus: ${rehearsal.focus_area}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {saveMessage.text}
          </div>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by Name or Reg. Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="All">Role</option>
              <option value="Chorister">Chorister</option>
              <option value="Instrumentalist">Instrumentalist</option>
              <option value="Usher">Usher</option>
            </select>
          </div>

          {/* General Filter */}
          <div>
            <select
              value={generalFilter}
              onChange={(e) => setGeneralFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="All">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>

          {/* QR Scan Button */}
          <div>
            <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              QR Scan
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading members data...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No members found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.member.surname} {record.member.first_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.member.registration_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.member.role}</div>
                      </td>
                     {/*  <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            value={record.status}
                            onChange={(e) => handleStatusChange(record.member_id, e.target.value as 'present' | 'absent' | 'late' | 'excused')}
                            className={`appearance-none px-3 py-1 rounded-full text-xs font-medium text-white border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              record.status === 'present' 
                                ? 'bg-green-500 focus:ring-green-500' 
                                : record.status === 'late'
                                ? 'bg-yellow-500 focus:ring-yellow-500'
                                : record.status === 'excused'
                                ? 'bg-blue-500 focus:ring-blue-500'
                                : 'bg-red-500 focus:ring-red-500'
                            }`}
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                            <option value="excused">Excused</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </td> */}

<td className="px-6 py-4 whitespace-nowrap">
  <div className="relative inline-block w-full">
    <select
      value={record.status}
      onChange={(e) =>
        handleStatusChange(
          record.member_id,
          e.target.value as 'present' | 'absent' | 'late' | 'excused'
        )
      }
      className={`
        w-full pr-8 pl-4 py-2 rounded-lg font-semibold text-white text-sm
        cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none
        ${
          record.status === 'present'
            ? 'bg-green-600 focus:ring-green-600'
            : record.status === 'late'
            ? 'bg-yellow-500 focus:ring-yellow-500'
            : record.status === 'excused'
            ? 'bg-blue-500 focus:ring-blue-500'
            : 'bg-red-600 focus:ring-red-600'
        }
      `}
    >
      <option value="present">Present</option>
      <option value="absent">Absent</option>
      <option value="late">Late</option>
      <option value="excused">Excused</option>
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg
        className="h-4 w-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </div>
</td>



                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={record.notes || ''}
                          onChange={(e) => {
                            setAttendanceRecords(prev => 
                              prev.map(r => 
                                r.member_id === record.member_id 
                                  ? { ...r, notes: e.target.value }
                                  : r
                              )
                            );
                          }}
                          placeholder="Add notes..."
                          className="block w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={markAllPresent}
            disabled={isLoading || filteredRecords.length === 0}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all Present
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || filteredRecords.length === 0 || !selectedRehearsal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleExportToExcel}
            disabled={isLoading || filteredRecords.length === 0 || !selectedRehearsal}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export to Excel
          </button>
        </div>

        {/* Rehearsal Selection Notice */}
        {!selectedRehearsal && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Select a rehearsal from the dropdown above to save or export attendance data.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
