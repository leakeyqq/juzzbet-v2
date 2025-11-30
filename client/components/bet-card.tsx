"use client"

import Link from "next/link"
import { useState } from "react"
import type { Bet } from "@/lib/types"
import Image from "next/image"
import { PlaceBetModal } from "./place-bet-modal"
import { CountdownTimer } from "./countdown-timer"

interface BetCardProps {
  bet: Bet
  onVote: (betId: string, vote: "yes" | "no", userId: string, amount: number) => void
}

export function BetCard({ bet, onVote }: BetCardProps) {
  const [userVote, setUserVote] = useState<"yes" | "no" | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedVote, setSelectedVote] = useState<"yes" | "no" | null>(null)
  const currentUserBalance = 2000

  const handleVote = (vote: "yes" | "no") => {
    setSelectedVote(vote)
    setShowModal(true)
  }

  const handlePlaceBet = (amount: number) => {
    const userId = "current-user-123"
    setUserVote(selectedVote)
    onVote(bet.id, selectedVote as "yes" | "no", userId, amount)
    setShowModal(false)
  }

  const creator = bet.creator
  
  // Calculate percentages safely
  const totalBets = (bet.totalYesBets || 0) + (bet.totalNoBets || 0)
  let yesPct = 50 // Default to 50% when no bets
  let noPct = 50
  
  if (totalBets > 0) {
    yesPct = Math.round(((bet.totalYesBets || 0) / totalBets) * 100)
    noPct = 100 - yesPct
  } else {
    // When no bets at all, show equal distribution
    yesPct = 50
    noPct = 50
  }

  const postedDate = new Date(bet.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - postedDate.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  let postedText = ""
  if (diffDays > 0) {
    postedText = `• Created ${diffDays}d ago`
  } else if (diffHours > 0) {
    postedText = `• Created ${diffHours}h ago`
  }else if(diffMins > 0){
    postedText = `• Created ${diffMins}m ago`
  }else {
    postedText = "• Created just now"
  }

  // Determine bar colors based on the situation
  const getBarColors = () => {
    if (totalBets === 0) {
      // No bets at all - show neutral/gray bars
      return {
        yesBar: "bg-gray-200 dark:bg-gray-700",
        noBar: "bg-gray-200 dark:bg-gray-700"
      }
    } else if (bet.totalYesBets === 0) {
      // Only no bets - red bar only
      return {
        yesBar: "bg-gray-200 dark:bg-gray-700",
        noBar: "bg-gradient-to-r from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40"
      }
    } else if (bet.totalNoBets === 0) {
      // Only yes bets - green bar only
      return {
        yesBar: "bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40",
        noBar: "bg-gray-200 dark:bg-gray-700"
      }
    } else {
      // Both have bets - normal colors
      return {
        yesBar: "bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40",
        noBar: "bg-gradient-to-r from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40"
      }
    }
  }

  const barColors = getBarColors()

  return (
    <>
      <Link href={`/bet/${bet.marketShortId}`}>
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden cursor-pointer hover:border-accent/50 hover:shadow-lg transition-all duration-300 h-full group">
          <div className="flex gap-3 sm:gap-4 p-3 sm:p-5">
            {bet.image && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                <Image
                  src={bet.image || "/placeholder.svg"}
                  alt={bet.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
              </div>
            )}

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                {creator.avatar && (
                  <Image
                    src={creator.avatar || "/placeholder.svg"}
                    alt={creator.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full ring-2 ring-border/50"
                  />
                )}
                <span className="text-xs text-muted-foreground truncate">
                  <span className="text-foreground font-semibold">{creator.name}</span>
                </span>
                <span className="text-xs text-muted-foreground/60">{postedText}</span>
              </div>

              <h3 className="text-foreground font-semibold mb-1.5 text-sm leading-snug line-clamp-2">{bet.title}</h3>

              <div className="mb-1">
                <CountdownTimer endTime={bet.bettingEndsAt} />
              </div>
            </div>
          </div>

          <div className="px-3 pb-3 sm:px-5 sm:pb-5 space-y-2 sm:space-y-3">
            <div className="space-y-2">
              <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-muted shadow-inner">
                <div
                  className={`transition-all duration-500 ${barColors.yesBar}`}
                  style={{ width: `${yesPct}%` }}
                />
                <div 
                  className={`transition-all duration-500 ${barColors.noBar}`}
                  style={{ width: `${noPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Yes {totalBets === 0 ? "0%" : `${yesPct}%`}
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  No {totalBets === 0 ? "0%" : `${noPct}%`}
                </span>
              </div>
            </div>

            <div onClick={(e) => e.preventDefault()} className="flex gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleVote("yes")
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  userVote === "yes"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-green-500/30"
                    : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800"
                }`}
              >
                Yes
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleVote("no")
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  userVote === "no"
                    ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </Link>

      {showModal && (
        <PlaceBetModal
          bet={bet}
          userBalance={currentUserBalance}
          prediction={selectedVote as "yes" | "no"}
          onClose={() => setShowModal(false)}
          onPlaceBet={handlePlaceBet}
        />
      )}
    </>
  )
}