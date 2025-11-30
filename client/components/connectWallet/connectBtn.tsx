"use client";
import { useEffect, useState, useCallback } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { getWeb3AuthInstance } from "../../lib/web3AuthConnector"
import { Web3Auth  } from "@web3auth/modal";
import { userInfo } from "os";
import { useAuth } from '@/contexts/AuthContext';

interface UserInfo {
  name: string;
  email: string;
  profileImage?: string;
  typeOfLogin?: string;
}

export default function ConnectWalletButton() {
  const [mounted, setMounted] = useState(false);
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [refreshPage, setRefreshpage] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRedirectFromAuth, setIsRedirectFromAuth] = useState(false);
  const [user, setUser] = useState(null);
  const { triggerAuthCheck } = useAuth();

  const web3authConnector = connectors.find((c) => c.id === "web3auth");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use useCallback to memoize the auth check effect
  const handleAuthCheck = useCallback(() => {
    if (isConnected && address) {
      triggerAuthCheck();
    }
  }, [isConnected, address, triggerAuthCheck]);

  // After successful connection - FIXED: use the memoized callback
  useEffect(() => {
    handleAuthCheck();
  }, [handleAuthCheck]);

  // Detect if we're coming back from Web3Auth redirect
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const url = window.location.href;
      const isAuthRedirect = url.includes('/#b64Params=');
      
      if (isAuthRedirect) {
        setIsRedirectFromAuth(true);
        setIsSigningIn(true);
      }
    }
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  if (!mounted || (typeof window !== "undefined" && window.ethereum?.isMiniPay)) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ✅ Web3Auth Connect Button */}
      {web3authConnector && !isConnected && (
        <button
          onClick={() => {
            connect({ connector: web3authConnector });
          }}
          className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 border border-gray-800 ${
            isSigningIn 
              ? 'bg-gray-400 cursor-not-allowed text-gray-800' 
              : 'bg-white text-gray-800 hover:bg-gray-100'
          } transition`}
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
            </>
          ) : (
            <div className="flex items-center gap-2">
              Sign In
              <img src="/google-icon.png" alt="X" className="w-5 h-5" />
            </div>
          )}
        </button>
      )}

      {isConnected && (
        <button
          onClick={() => {
            disconnect(); 
            document.cookie = 'userWalletAddress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'solanaWalletAddress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }}
          className="px-4 py-2 rounded-lg border border-red-600 text-red-600 font-medium hover:bg-red-600 hover:text-white transition"
        >
          Log Out
        </button>
      )}
    </div>
  );
}