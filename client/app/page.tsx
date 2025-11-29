"use client"

import { useState } from "react"
import { BetCard } from "@/components/bet-card"
import { Navbar } from "@/components/navbar"
import { mockBets } from "@/lib/mock-data"
import type { Bet } from "@/lib/types"
import { Plus } from "lucide-react"
import { useAccount } from "wagmi"



export default function Home() {
  const [bets, setBets] = useState<Bet[]>(mockBets)
  const [showCreateOptions, setShowCreateOptions] = useState(false)
  const { address, isConnected } = useAccount()

  const currentUser = {
    id: "user-1",
    xHandle: "@yourhandle",
    xUsername: "Your Name",
    xProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    balance: 1500,
  }

  const handleVote = (betId: string, vote: "yes" | "no", userId: string, amount: number) => {
    setBets(
      bets.map((bet) => {
        if (bet.id === betId) {
          const updatedBet = { ...bet }
          if (vote === "yes") {
            updatedBet.noBets = updatedBet.noBets.filter((b) => b.userId !== userId)
            if (!updatedBet.yesBets.find((b) => b.userId === userId)) {
              updatedBet.yesBets.push({ userId })
            }
          } else {
            updatedBet.yesBets = updatedBet.yesBets.filter((b) => b.userId !== userId)
            if (!updatedBet.noBets.find((b) => b.userId === userId)) {
              updatedBet.noBets.push({ userId })
            }
          }
          return updatedBet
        }
        return bet
      }),
    )
  }

  const isLoggedIn = isConnected && address


  return (
    <div className="min-h-screen bg-background">
      <Navbar/>

      <div className="max-w-7xl mx-auto pb-24 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 auto-rows-max">
          {bets.map((bet) => (
            <div key={bet.id}>
              <BetCard bet={bet} onVote={handleVote} />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => {
            if (isLoggedIn) {
              setShowCreateOptions(!showCreateOptions)
            } else {
              alert("Please login with X to create a bet")
            }
          }}
          className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-full shadow-2xl hover:shadow-accent/50 transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          aria-label="Create bet"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {showCreateOptions && isLoggedIn && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowCreateOptions(false)} />
            <div className="absolute right-0 bottom-20 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 w-64 overflow-hidden backdrop-blur-sm">
              <a
                href="/my-bets?tab=created"
                className="block px-5 py-4 text-sm font-medium text-foreground hover:bg-muted transition-colors border-b border-border/50"
                onClick={() => setShowCreateOptions(false)}
              >
                View created bets
              </a>
              <a
                href="/create"
                className="block px-5 py-4 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                onClick={() => setShowCreateOptions(false)}
              >
                Create a new bet
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
