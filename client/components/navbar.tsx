"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import type { User } from "@/lib/types"

interface NavbarProps {
  isLoggedIn: boolean
  onLogout: () => void
  onLogin: () => void
  currentUser?: User
}

export function Navbar({ isLoggedIn, onLogout, onLogin, currentUser }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const getDisplayBalance = () => {
    if (!currentUser?.balance || typeof currentUser.balance !== "number") return "$0"
    return `$${currentUser.balance.toFixed(0)}`
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
          {isLoggedIn && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border/50 rounded-xl text-sm shadow-sm">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">Balance</span>
                <span className="font-semibold text-foreground">{getDisplayBalance()}</span>
              </div>

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

              <button
                onClick={onLogout}
                className="px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-all"
              >
                Logout
              </button>
            </>
          )}

          {!isLoggedIn && (
            <button
              onClick={onLogin}
              className="px-5 py-2.5 border-2 border-foreground text-foreground rounded-xl text-sm font-semibold hover:bg-foreground hover:text-background transition-all"
            >
              Login with X
            </button>
          )}
        </div>

        {!isLoggedIn && (
          <button
            onClick={onLogin}
            className="md:hidden px-4 py-2 border-2 border-foreground text-foreground rounded-xl text-sm font-semibold hover:bg-foreground hover:text-background transition-all"
          >
            Login with X
          </button>
        )}

        {isLoggedIn && (
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-foreground hover:text-accent transition-colors"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {showMobileMenu && isLoggedIn && (
        <div className="border-t border-border/50 px-4 sm:px-6 py-4 space-y-3 md:hidden backdrop-blur-sm bg-background/95">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Balance</span>
            <span className="text-foreground font-semibold text-lg">{getDisplayBalance()}</span>
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
            <button
              onClick={() => {
                onLogout()
                setShowMobileMenu(false)
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
