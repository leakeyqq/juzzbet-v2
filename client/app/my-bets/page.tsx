"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react"
import { mockBets, mockCreatedBets } from "@/lib/mock-data"
import { Navbar } from "@/components/navbar"
import type { Bet } from "@/lib/types"

interface MyBet {
  marketShortId: string
  title: string
  predictedYes: boolean
  placedBetOn: string
  betAmountUSD: string
  marketOutcome: string
}

export default function MyBetsPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<"my-bets" | "created">(tabParam === "created" ? "created" : "my-bets")
  const [selectedCurrency, setSelectedCurrency] = useState<"All" | "USD" | "KES" | "NGN">("All")
  const [createdBets, setCreatedBets] = useState<Bet[]>(mockCreatedBets)
  const [myBets, setMyBets] = useState<MyBet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tabParam === "created") {
      setActiveTab("created")
    }
  }, [tabParam])

  // Fetch real bets from backend
  useEffect(() => {
    const fetchMyBets = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bettor/myBets`, {
          credentials: "include" // Include cookies for authentication
        })

        if (!response.ok) {
          throw new Error('Failed to fetch bets')
        }

        const data = await response.json()
        setMyBets(data.mybets || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bets')
        console.error('Error fetching bets:', err)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if we're on the "my-bets" tab
    if (activeTab === "my-bets") {
      fetchMyBets()
    }
  }, [activeTab])

  // Categorize bets into pending and resolved
  const pendingBets = myBets.filter(bet => bet.marketOutcome === "pending")
  const resolvedBets = myBets.filter(bet => bet.marketOutcome !== "pending")

  // Helper function to check if bet was won
  const checkIfBetWon = (bet: MyBet) => {
    if (bet.marketOutcome === "pending") return undefined
    if (bet.marketOutcome === "cancelled") return false // Cancelled bets don't win
    if (bet.marketOutcome === "yesWon" && bet.predictedYes) return true
    if (bet.marketOutcome === "noWon" && !bet.predictedYes) return true
    return false
  }

  const renderBetItem = (bet: MyBet, index: number) => {
    const won = checkIfBetWon(bet)
    const isResolved = bet.marketOutcome !== "pending"

    return (
      <Link key={`${bet.marketShortId}-${index}`} href={`/bet/${bet.marketShortId}`}>
        <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground line-clamp-2 flex-1">{bet.title}</h3>
            {isResolved && (
              <div
                className={`ml-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  won ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                {won ? "Won" : "Lost"}
              </div>
            )}
            {!isResolved && (
              <div className="ml-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                <Clock className="w-3 h-3" />
                Pending
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Your prediction</p>
              <p className={`text-lg font-bold ${bet.predictedYes ? "text-green-600" : "text-red-600"}`}>
                {bet.predictedYes ? "YES" : "NO"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Bet amount</p>
              <p className="text-lg font-bold text-foreground">
                ${bet.betAmountUSD} USD
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Placed {new Date(bet.placedBetOn).toLocaleDateString(undefined, { 
              month: "short", 
              day: "numeric",
              year: "numeric"
            })}
          </p>
          
          {isResolved && bet.marketOutcome === "cancelled" && (
            <p className="text-xs text-yellow-600 mt-2">
              Bet was cancelled - refunded
            </p>
          )}
        </div>
      </Link>
    )
  }

  const renderCreatedBet = (bet: Bet) => {
    const totalBets = bet.yesBets.length + bet.noBets.length
    const bettingEnded = new Date(bet.bettingEndsAt) < new Date()

    return (
      <div key={bet.id} className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/bet/${bet.id}`} className="flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer">
              {bet.title}
            </h3>
          </Link>
          {bet.resolved && (
            <div
              className={`ml-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                bet.resolution === "cancelled"
                  ? "bg-gray-100 text-gray-700"
                  : bet.resolution === "yes"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {bet.resolution === "cancelled" ? (
                <>
                  <XCircle className="w-3 h-3" />
                  Cancelled
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Resolved: {bet.resolution?.toUpperCase()}
                </>
              )}
            </div>
          )}
          {!bet.resolved && (
            <div className="ml-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
              <Clock className="w-3 h-3" />
              Active
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Currency</p>
            <p className="text-sm font-semibold text-foreground">{bet.currency}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Bets</p>
            <p className="text-sm font-semibold text-foreground">{totalBets}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">YES/NO</p>
            <p className="text-sm font-semibold text-foreground">
              {bet.yesBets.length}/{bet.noBets.length}
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          <p>
            Betting ends:{" "}
            {new Date(bet.bettingEndsAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p>
            Resolution date:{" "}
            {new Date(bet.resolutionDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {!bet.resolved && bettingEnded && (
          <div className="flex gap-2">
            <button
              onClick={() => handleResolveBet(bet.id, "yes")}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Resolve YES
            </button>
            <button
              onClick={() => handleResolveBet(bet.id, "no")}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Resolve NO
            </button>
          </div>
        )}

        {!bet.resolved && (
          <button
            onClick={() => handleCancelBet(bet.id)}
            className="w-full mt-2 px-3 py-2 bg-muted text-foreground border border-border rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            Cancel Bet & Refund All
          </button>
        )}
      </div>
    )
  }

  // Keep the same handleResolveBet and handleCancelBet functions for created bets
  const handleResolveBet = (betId: string, resolution: "yes" | "no") => {
    if (confirm(`Are you sure you want to resolve this bet to ${resolution.toUpperCase()}?`)) {
      setCreatedBets(
        createdBets.map((bet) =>
          bet.id === betId
            ? {
                ...bet,
                resolved: true,
                resolution,
              }
            : bet,
        ),
      )
      alert(`Bet resolved to ${resolution.toUpperCase()}. Winners will be notified.`)
    }
  }

  const handleCancelBet = (betId: string) => {
    if (confirm("Are you sure you want to cancel this bet? All users will be refunded.")) {
      setCreatedBets(
        createdBets.map((bet) =>
          bet.id === betId
            ? {
                ...bet,
                resolved: true,
                resolution: "cancelled" as const,
              }
            : bet,
        ),
      )
      alert("Bet cancelled. All users have been refunded.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>

      <div className="pb-6 px-4 pt-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-foreground hover:text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">My Bets</h1>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("my-bets")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "my-bets"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Bets
          </button>
          {/* <button
            onClick={() => setActiveTab("created")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "created"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Created Bets
          </button> */}
        </div>

        {activeTab === "my-bets" ? (
          <>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading your bets...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                {/* Pending Bets */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Pending Bets ({pendingBets.length})
                  </h2>
                  {pendingBets.length > 0 ? (
                    <div className="space-y-3">{pendingBets.map(renderBetItem)}</div>
                  ) : (
                    <p className="text-muted-foreground">No pending bets</p>
                  )}
                </div>

                {/* Resolved Bets */}
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Resolved Bets ({resolvedBets.length})
                  </h2>
                  {resolvedBets.length > 0 ? (
                    <div className="space-y-3">{resolvedBets.map(renderBetItem)}</div>
                  ) : (
                    <p className="text-muted-foreground">No resolved bets</p>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Bets You Created</h2>
            {createdBets.length > 0 ? (
              <div className="space-y-3">{createdBets.map(renderCreatedBet)}</div>
            ) : (
              <p className="text-muted-foreground">You haven't created any bets yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}