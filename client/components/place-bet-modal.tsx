"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { Bet } from "@/lib/types"

interface PlaceBetModalProps {
  bet: Bet
  userBalance: number
  prediction: "yes" | "no"
  onClose: () => void
  onPlaceBet: (amount: number) => void
}

export function PlaceBetModal({ bet, userBalance, prediction, onClose, onPlaceBet }: PlaceBetModalProps) {
  const [amount, setAmount] = useState("")

  const handlePlaceBet = () => {
    const betAmount = Number.parseFloat(amount)
    if (betAmount > 0 && betAmount <= userBalance) {
      onPlaceBet(betAmount)
      onClose()
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
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
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
            <p className="text-xl font-semibold text-foreground">${userBalance.toFixed(2)}</p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Bet Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-3 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                max={userBalance}
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
                  onClick={() => setAmount(presetAmount.toString())}
                  className="py-2 px-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors"
                >
                  +${presetAmount}
                </button>
              )
            })}
          </div>

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={!amount || Number.parseFloat(amount) <= 0 || Number.parseFloat(amount) > userBalance}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Bet
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
