"use client"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Calendar, AlertTriangle } from "lucide-react"
import { mockBets } from "@/lib/mock-data"
import { PlaceBetModal } from "@/components/place-bet-modal"

export default function BetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const betId = params.id as string
  const [showModal, setShowModal] = useState(false)
  const [selectedVote, setSelectedVote] = useState<"yes" | "no" | null>(null)
  const currentUserBalance = 2000

  const bet = mockBets.find((b) => b.id === betId)

  if (!bet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Bet not found</p>
      </div>
    )
  }

  const handleVoteClick = (vote: "yes" | "no") => {
    setSelectedVote(vote)
    setShowModal(true)
  }

  const handlePlaceBet = (amount: number) => {
    setShowModal(false)
  }

  const yesVolume = bet.yesBets.reduce((sum, b) => sum + (b.amount || 0), 0)
  const noVolume = bet.noBets.reduce((sum, b) => sum + (b.amount || 0), 0)
  const totalVolume = yesVolume + noVolume

  const yesPct = totalVolume > 0 ? Math.round((yesVolume / totalVolume) * 100) : 50

  const bettingEndsDate = new Date(bet.bettingEndsAt)
  const resolutionDateObj = new Date(bet.resolutionDate)
  const bettingEndsString = bettingEndsDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
  const resolutionString = resolutionDateObj.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-foreground/60 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-medium text-foreground/80">Back to Markets</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Main content card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {bet.image && (
              <div className="relative w-full h-48 md:h-64 overflow-hidden bg-muted">
                <Image src={bet.image || "/placeholder.svg"} alt={bet.title} fill className="object-cover" />
              </div>
            )}

            {/* Bet title section */}
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4 leading-tight">{bet.title}</h2>

              {/* Creator info */}
              <div className="flex items-center gap-3">
                {bet.creator.avatar && (
                  <Image
                    src={bet.creator.avatar || "/placeholder.svg"}
                    alt={bet.creator.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full ring-2 ring-border"
                  />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Created by</p>
                  <p className="text-sm font-semibold text-foreground">{bet.creator.name}</p>
                </div>
              </div>
            </div>

            {/* Odds and volume section */}
            <div className="p-6 bg-muted/30 border-b border-border">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current odds */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Market Odds
                  </h3>
                  <div className="flex gap-3 h-3 rounded-full overflow-hidden bg-muted mb-3">
                    <div className="bg-emerald-200 dark:bg-emerald-900/40" style={{ width: `${yesPct}%` }} />
                    <div className="bg-rose-200 dark:bg-rose-900/40 flex-1" />
                  </div>
                  <div className="flex justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{yesPct}%</p>
                      <p className="text-xs text-muted-foreground">YES</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{100 - yesPct}%</p>
                      <p className="text-xs text-muted-foreground">NO</p>
                    </div>
                  </div>
                </div>

                {/* Volume */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Total Volume
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-card rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">YES bets</span>
                      <span className="text-lg font-bold text-foreground">${yesVolume.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-card rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">NO bets</span>
                      <span className="text-lg font-bold text-foreground">${noVolume.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Betting buttons */}
            <div className="p-6 border-b border-border">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleVoteClick("yes")}
                  className="py-4 px-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all hover:scale-[1.02] border border-emerald-200 dark:border-emerald-800"
                >
                  Bet YES
                </button>
                <button
                  onClick={() => handleVoteClick("no")}
                  className="py-4 px-6 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 font-bold rounded-xl hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-all hover:scale-[1.02] border border-rose-200 dark:border-rose-800"
                >
                  Bet NO
                </button>
              </div>
            </div>

            {/* Market details */}
            <div className="p-6 border-b border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Market Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Betting Ends
                  </span>
                  <span className="font-semibold text-foreground">{bettingEndsString}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Resolution Date
                  </span>
                  <span className="font-semibold text-foreground">{resolutionString}</span>
                </div>
              </div>
            </div>

            {/* Judges section */}
            {bet.judges && bet.judges.length > 0 && (
              <div className="p-6 border-b border-border bg-muted/20">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Final Judges
                </h3>
                <div className="flex flex-wrap gap-3 mb-3">
                  {bet.judges.map((judge) => (
                    <div
                      key={judge.id}
                      className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border"
                    >
                      {judge.avatar && (
                        <Image
                          src={judge.avatar || "/placeholder.svg"}
                          alt={judge.name}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full ring-2 ring-border"
                        />
                      )}
                      <span className="text-sm font-medium text-foreground">{judge.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Judges will make the final decision on which side won
                </p>
              </div>
            )}

            {/* Warning section */}
            <div className="p-6 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-900 dark:text-red-100 mb-1">Warning!</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                    You should only participate if you trust the person that created this & the judges. They will determine if you
                    will win or lose your bet based on their judgement!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedVote && (
        <PlaceBetModal
          bet={bet}
          userBalance={currentUserBalance}
          prediction={selectedVote}
          onClose={() => setShowModal(false)}
          onPlaceBet={handlePlaceBet}
        />
      )}
    </>
  )
}
