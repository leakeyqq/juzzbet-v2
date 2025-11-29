// contexts/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from 'react';
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

  const triggerAuthCheck = () => {
    setAuthCheck(prev => prev + 1);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: isConnected && !!address,
      triggerAuthCheck
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);