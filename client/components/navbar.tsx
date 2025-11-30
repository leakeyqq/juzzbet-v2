"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import ConnectWalletButton from "@/components/connectWallet/connectBtn"
import { useAccount } from "wagmi"
import { getWeb3AuthInstance } from "../lib/web3AuthConnector"
import { useWeb3 } from "@/contexts/useWeb3"
import { useAuth } from '@/contexts/AuthContext';




export function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { address, isConnected } = useAccount()
  const [userInfo, setUserInfo] = useState<any>(null)
  const { isWalletReady, checkBalanceOfSingleAsset } = useWeb3();
  const { isAuthenticated } = useAuth();
  const [userBalance, setUserBalance] = useState(0)
    const [isMounted, setIsMounted] = useState(false)


  
  // Set mounted state to avoid hydration mismatches
  useEffect(() => {
    setIsMounted(true)
  }, [])

  
useEffect(() => {
  const fetchBalance = async () => {
    if (address && isConnected && isWalletReady) {
      try {
        const balance = await checkBalanceOfSingleAsset("cUSD", "celo")
        setUserBalance(Number(balance.balance))
      } catch (error) {
        console.error("Error fetching balance:", error)
        setUserBalance(0)
      }
    }
  }

  fetchBalance()
}, [address, isConnected, isWalletReady])

  // Fetch user info when connected
  useEffect(() => {
        if (!isMounted) return;
    
    const fetchUserInfo = async () => {
      const web3auth = getWeb3AuthInstance();
      if (web3auth.connected) {
        try {
          const info = await web3auth.getUserInfo()
          setUserInfo(info)
        } catch (error) {
          console.error('Failed to fetch user info:', error)
        }
      }
    }

    fetchUserInfo()
  }, [isConnected, address, isWalletReady, isMounted])

  useEffect(() => {
        if (!isMounted) return;
    
    const hasLoggedIn = sessionStorage.getItem('hasLoggedIn') === 'true';
    // if (isConnected && address && isAuthenticated && !hasLoggedIn) {
    if (isConnected && address && isAuthenticated && !hasLoggedIn) {

      console.log('going to log in')
      const login = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ethAddress: address,
                names: userInfo.typeOfLogin === 'email_passwordless' ? null : (userInfo.name || null),
                email: userInfo.email,
                profileImage: userInfo.profileImage || null,
                typeOfLogin: userInfo.typeOfLogin
              }),
              credentials: "include",
            }
          );
          const data = await res.json();
          if (data.success) {
            document.cookie = `userWalletAddress=${address}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict}`; // 7 days
            console.log("Login successful:", data);
            sessionStorage.setItem('hasLoggedIn', 'true'); // Set session storage
            window.location.reload();
          } else {
            console.log("Login failed:", data);
          }

        } catch (err) {
          console.error("Login error:", err);
        }
      };

      login();
    }
  }, [isConnected, address, isMounted]);
  // Reset login state when disconnected

  useEffect(() => {
        if (!isMounted) return;
    if (!isConnected) {
      sessionStorage.removeItem('hasLoggedIn');
      sessionStorage.removeItem('hasSentInviteCode');
    }
  }, [isConnected, isMounted]);

  // User is considered logged in if they have a connected wallet
  // const isLoggedIn = isConnected && address
  if (!isMounted) {
    return (
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-foreground tracking-tight hover:text-accent transition-colors"
          >
            Juzzbet
          </Link>
          {/* Show only connect button during SSR */}
          <div className="hidden md:block">
            <ConnectWalletButton />
          </div>
          <div className="md:hidden">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-foreground tracking-tight hover:text-accent transition-colors"
        >
          Juzzbet
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {isConnected && address ? (
            <>
              <Link
                href="/my-bets"
                className="px-4 py-2 text-foreground text-sm font-medium hover:text-accent transition-colors"
              >
                My Bets
              </Link>

              <Link
                href="/wallet"
                className="px-4 py-2 text-foreground text-sm font-medium hover:text-accent transition-colors"
              >
                Wallet
              </Link>

<div className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-full border border-green-600 shadow-sm">
   ${userBalance.toFixed(2)}
</div>



              {/* Profile dropdown */}
              <div className="relative group">
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white hover:bg-accent/80 transition-colors">
                  {userInfo?.profileImage ? (
                    <img
                      src={userInfo.profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold">
                      {userInfo?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border/50 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                  <div className="p-4 border-b border-border/50">
                    <p className="font-semibold text-foreground truncate">
                      {userInfo?.name || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {userInfo?.email || 'No email provided'}
                    </p>
                  </div>
                  <div className="p-2">
                    <ConnectWalletButton />
                  </div>
                </div>
              </div>


              {/* <ConnectWalletButton /> */}
            </>
          ) : (
            // Desktop Connect Button (hidden on mobile)
            <div className="hidden md:block">
              <ConnectWalletButton />
            </div>
          )}
        </div>

        {/* Mobile Connect Button when not logged in */}
        {!(isConnected && address) && (
          <div className="md:hidden">
            <ConnectWalletButton />
          </div>
        )}

        {/* Mobile Menu Button when logged in */}

        {/* Mobile Menu Button when logged in */}
{isConnected && address && (
  <div className="md:hidden flex items-center gap-2">
    <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-lg border border-green-600 shadow-sm">
      ${userBalance.toFixed(2)}
    </div>
    <button
      onClick={() => setShowMobileMenu(!showMobileMenu)}
      className="text-foreground hover:text-accent transition-colors"
    >
      {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  </div>
)}

      </div>

      {/* Mobile Menu */}
      {showMobileMenu && isConnected && address && (
        <div className="border-t border-border/50 px-4 sm:px-6 py-4 space-y-3 md:hidden backdrop-blur-sm bg-background/95">
          {/* User Profile Section */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white">
              {userInfo?.profileImage ? (
                <img
                  src={userInfo.profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="font-semibold text-lg">
                  {userInfo?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {userInfo?.name || 'User'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {userInfo?.email || 'No email provided'}
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/my-bets"
              className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              My Bets
            </Link>
            <Link
              href="/wallet"
              className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Wallet
            </Link>


            <div className="px-4 py-3">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}