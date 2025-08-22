// Authentication utility functions

export interface AdminSession {
  isAuthenticated: boolean;
  adminId: string;
  username: string;
  role: string;
  expiresAt: string;
}

export const auth = {
  // Check if user is authenticated and session is valid
  isAuthenticated(): boolean {
    try {
      const sessionData = localStorage.getItem('adminSession');
      if (!sessionData) return false;

      const session: AdminSession = JSON.parse(sessionData);
      
      // Check if session has expired
      if (new Date(session.expiresAt) < new Date()) {
        this.logout();
        return false;
      }

      return session.isAuthenticated;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Get current session data
  getSession(): AdminSession | null {
    try {
      const sessionData = localStorage.getItem('adminSession');
      if (!sessionData) return null;

      const session: AdminSession = JSON.parse(sessionData);
      
      // Check if session has expired
      if (new Date(session.expiresAt) < new Date()) {
        this.logout();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('adminSession');
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  },

  // Refresh session (extend expiration)
  refreshSession(): void {
    try {
      const session = this.getSession();
      if (session) {
        // Extend session by 24 hours
        const newExpiresAt = new Date();
        newExpiresAt.setHours(newExpiresAt.getHours() + 24);
        
        const updatedSession: AdminSession = {
          ...session,
          expiresAt: newExpiresAt.toISOString()
        };
        
        localStorage.setItem('adminSession', JSON.stringify(updatedSession));
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  },

  // Check if session needs refresh (within 1 hour of expiry)
  needsRefresh(): boolean {
    try {
      const session = this.getSession();
      if (!session) return false;

      const expiresAt = new Date(session.expiresAt);
      const oneHourFromNow = new Date();
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

      return expiresAt < oneHourFromNow;
    } catch (error) {
      console.log(error)
      return false;
    }
  }
};
