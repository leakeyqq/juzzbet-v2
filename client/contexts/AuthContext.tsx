// contexts/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface AuthContextType {
  isAuthenticated: boolean;
  triggerAuthCheck: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  triggerAuthCheck: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authCheck, setAuthCheck] = useState(0);
  const { address, isConnected } = useAccount();

  // Use useCallback to memoize the trigger function
  const triggerAuthCheck = useCallback(() => {
    setAuthCheck(prev => prev + 1);
  }, []);

  const isAuthenticated = isConnected && !!address;

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      triggerAuthCheck
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);