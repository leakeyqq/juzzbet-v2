"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Bet } from "@/lib/types"
import { useWeb3 } from "@/contexts/useWeb3"
import { useAccount } from "wagmi";




interface PlaceBetModalProps {
  bet: Bet
  prediction: "yes" | "no"
  onClose: () => void
  onPlaceBet: (amount: number) => void
}

export function PlaceBetModal({ bet, prediction, onClose, onPlaceBet }: PlaceBetModalProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { placeBetOnchain_celo, approveSpending, checkBalanceOfSingleAsset, isWalletReady } = useWeb3();
   const [userBalance, setUserBalance] = useState(0)
    const { address, isConnected } = useAccount()
   

       useEffect(() => {
       const fetchBalance = async () => {
         if (address && isConnected) {
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
   
   


  const handlePlaceBet = async () => {
    console.log('bet is ', bet)
    const betAmount = Number.parseFloat(amount)
    
    if (betAmount <= 0 || betAmount > userBalance) {
      setError("Invalid bet amount")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const tokenSymbol = "cUSD"
      const network = "celo"

      const balance = await checkBalanceOfSingleAsset(tokenSymbol, network)

      if(Number(balance.balance) < Number(betAmount)){
        throw new Error('Insufficient account balance! Please top up.')
      }
      await approveSpending(betAmount.toString(), tokenSymbol)
      await placeBetOnchain_celo(betAmount.toString(), bet.onchainId, prediction === "yes" )

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bettor/placeBet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketShortId: bet.marketShortId || bet.id,
          title: bet.title,
          predictedYes: prediction === "yes",
          betAmountUSD: betAmount.toString()
        }),
        credentials: "include" // This will include cookies for authentication
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to place bet")
      }

      const data = await response.json()
      
      // Call the parent handler
      onPlaceBet(betAmount)
      onClose()
      
      // Optional: Show success message or refresh data
      console.log("Bet placed successfully:", data)
      alert('Bet placed successfully!')

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bet")
      console.error("Error placing bet:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const predictionLabel = prediction === "yes" ? "Yes" : "No"
  const predictionColor = prediction === "yes" ? "text-green-600" : "text-red-600"
  const predictionBgColor = prediction === "yes" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-background rounded-t-2xl border-t border-border animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Place Your Bet</h2>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Prediction Display */}
          <div className={`${predictionBgColor} border rounded-lg p-4`}>
            <p className="text-sm text-muted-foreground mb-1">You are betting</p>
            <p className={`text-2xl font-bold ${predictionColor}`}>{predictionLabel}</p>
            <p className="text-sm text-muted-foreground mt-2">{bet.title}</p>
          </div>

          {/* Balance - Always shows USD now */}
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
            <p className="text-xl font-semibold text-foreground">${userBalance}</p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Bet Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError(null) // Clear error when user types
                }}
                placeholder="Enter amount"
                className="flex-1 px-3 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max={userBalance}
                step="0.01"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Min: $1 | Max: ${userBalance.toFixed(2)}</p>
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((preset) => {
              const presetAmount = Math.min(preset, userBalance)
              return (
                <button
                  key={preset}
                  onClick={() => {
                    setAmount(presetAmount.toString())
                    setError(null) // Clear error when preset is selected
                  }}
                  className="py-2 px-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  +${presetAmount}
                </button>
              )
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={!amount || Number.parseFloat(amount) <= 0 || Number.parseFloat(amount) > userBalance || isLoading}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Placing Bet...
              </>
            ) : (
              "Place Bet"
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}