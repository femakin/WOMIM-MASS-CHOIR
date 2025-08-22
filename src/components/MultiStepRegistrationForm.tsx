'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RegistrationFormData {
  // Part A - Personal Information
  surname: string;
  first_name: string;
  contact_address: string;
  email: string;
  mobile_number: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  whatsapp_number: string;
  social_media_id: string;
  
  // Part B - Spiritual Information
  is_born_again: string;
  holy_ghost_baptism: string;
  local_church_name: string;
  local_church_address: string;
  academic_qualification: string;
  job_status: string;
  profession: string;
  photo: File | null;
}

export default function MultiStepRegistrationForm() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);




  useEffect(() => {
    // Check if admin is authenticated
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationFormData>({
    surname: '',
    first_name: '',
    contact_address: '',
    email: '',
    mobile_number: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    whatsapp_number: '',
    social_media_id: '',
    is_born_again: '',
    holy_ghost_baptism: '',
    local_church_name: '',
    local_church_address: '',
    academic_qualification: '',
    job_status: '',
    profession: '',
    photo: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        photo: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration successful! Redirecting to confirmation page...' });
        // Redirect to thank you page after a short delay
        setTimeout(() => {
          router.push('/thank-you');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Network error. Please check your connection and try again. ${error}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.surname || !formData.first_name || !formData.contact_address || 
          !formData.email || !formData.mobile_number || !formData.date_of_birth || 
          !formData.gender || !formData.marital_status || !formData.whatsapp_number || 
          !formData.social_media_id) {
        setMessage({ type: 'error', text: 'Please fill in all required fields in Part A.' });
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
    setMessage(null);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setMessage(null);
  };


  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={'/'} className="flex items-center" >
              <Image
                src="/assets/Womimlogo.svg"
                alt="WOMIM Logo"
                width={80}
                height={65}
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <Link href={'/admin/login?redirect=/admin/attendance'} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium text-sm">
                Attendance
              </Link>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 left-0">
            <Image
              src="/assets/dottedsquaregreen.svg"
              alt="Decorative Pattern"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          <div className="absolute top-0 right-0">
            <Image
              src="/assets/dottedsquaregreen.svg"
              alt="Decorative Pattern"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Register Now!
          </h1>
          <p className="text-lg text-gray-900 mb-2">
            to be a part of the 3500 targeted choir.
          </p>
          <p className="text-md text-gray-600">
            Fill the information carefully
          </p>
          
          <div className="absolute bottom-0 left-0">
            <Image
              src="/assets/dottedsquaregreen.svg"
              alt="Decorative Pattern"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          <div className="absolute bottom-0 right-0">
            <Image
              src="/assets/dottedsquaregreen.svg"
              alt="Decorative Pattern"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${
              currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Part A - Personal Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Personal Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-2">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your surname name"
                    />
                  </div>

                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_address" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact_address"
                      name="contact_address"
                      value={formData.contact_address}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter contact address"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobile_number"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">---</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="marital_status" className="block text-sm font-medium text-gray-700 mb-2">
                      Marital Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="marital_status"
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">---</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="whatsapp_number"
                      name="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter whatsapp number"
                    />
                  </div>

                  <div>
                    <label htmlFor="social_media_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Social Media ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="social_media_id"
                      name="social_media_id"
                      value={formData.social_media_id}
                      placeholder="Enter your instagram ID"
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Part B - Spiritual Information */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">PART B</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Are you Born Again? <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="is_born_again"
                          value="Yes"
                          checked={formData.is_born_again === 'Yes'}
                          onChange={(e) => handleRadioChange('is_born_again', e.target.value)}
                          required
                          className="mr-2 text-primary focus:ring-primary"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="is_born_again"
                          value="No"
                          checked={formData.is_born_again === 'No'}
                          onChange={(e) => handleRadioChange('is_born_again', e.target.value)}
                          required
                          className="mr-2 text-primary focus:ring-primary"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Holy Ghost Baptism with Speaking in Tongues? <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="holy_ghost_baptism"
                          value="Yes"
                          checked={formData.holy_ghost_baptism === 'Yes'}
                          onChange={(e) => handleRadioChange('holy_ghost_baptism', e.target.value)}
                          required
                          className="mr-2 text-primary focus:ring-primary"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="holy_ghost_baptism"
                          value="No"
                          checked={formData.holy_ghost_baptism === 'No'}
                          onChange={(e) => handleRadioChange('holy_ghost_baptism', e.target.value)}
                          required
                          className="mr-2 text-primary focus:ring-primary"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="local_church_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Local Church Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="local_church_name"
                      name="local_church_name"
                      value={formData.local_church_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter church name"
                    />
                  </div>

                  <div>
                    <label htmlFor="local_church_address" className="block text-sm font-medium text-gray-700 mb-2">
                      Local Church Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="local_church_address"
                      name="local_church_address"
                      value={formData.local_church_address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your church address"
                    />
                  </div>

                  <div>
                    <label htmlFor="academic_qualification" className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Qualification <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="academic_qualification"
                      name="academic_qualification"
                      value={formData.academic_qualification}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your academic qualification"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Status <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRadioChange('job_status', 'Employed')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          formData.job_status === 'Employed'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        Employed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRadioChange('job_status', 'Unemployed')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          formData.job_status === 'Unemployed'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        Unemployed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRadioChange('job_status', 'Self-employed')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          formData.job_status === 'Self-employed'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        Self-employed
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">
                      Profession <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your profession"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {formData.photo ? (
                          <Image
                            src={URL.createObjectURL(formData.photo)}
                            alt="Profile"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="file"
                        id="photo"
                        name="photo"
                        onChange={handlePhotoChange}
                        accept="image/*"
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-8 py-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
