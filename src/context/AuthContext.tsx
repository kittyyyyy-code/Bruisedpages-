import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  isSetup: boolean;
  loading: boolean;
  token: string | null;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  setupMasterPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  checkStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bruised_pages_token'));
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSetup, setIsSetup] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const checkStatus = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/auth/status', { headers });
      if (res.ok) {
        const data = await res.json();
        setIsSetup(data.isSetup);
        setIsAdmin(Boolean(data.authenticated));
        if (!data.authenticated && token) {
          localStorage.removeItem('bruised_pages_token');
          setToken(null);
        }
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [token]);

  const login = async (password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('bruised_pages_token', data.token);
        setToken(data.token);
        setIsAdmin(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to authenticate.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login.' };
    }
  };

  const setupMasterPassword = async (password: string) => {
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('bruised_pages_token', data.token);
        setToken(data.token);
        setIsAdmin(true);
        setIsSetup(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to setup password.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during setup.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('bruised_pages_token');
      setToken(null);
      setIsAdmin(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!token) throw new Error('Not logged in');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to change password.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        isSetup,
        loading,
        token,
        login,
        setupMasterPassword,
        logout,
        changePassword,
        checkStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
