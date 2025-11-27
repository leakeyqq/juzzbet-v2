"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Minus } from "lucide-react"

export default function WalletPage() {
  const [showTopupModal, setShowTopupModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [topupAmount, setTopupAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const userBalance = 1500

  const handleTopup = () => {
    const amount = Number.parseFloat(topupAmount)
    if (amount > 0) {
      setTopupAmount("")
      setShowTopupModal(false)
    }
  }

  const handleWithdraw = () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (amount > 0 && amount <= userBalance) {
      setWithdrawAmount("")
      setShowWithdrawModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-6 px-4 pt-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-foreground hover:text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        </div>

        <div className="bg-card border-2 border-primary rounded-lg p-6 mb-8 bg-primary/5">
          <p className="text-sm text-muted-foreground mb-1">USD Balance</p>
          <p className="text-4xl font-bold text-foreground">${userBalance.toLocaleString()}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setShowTopupModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Top Up
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Minus className="w-5 h-5" />
            Withdraw
          </button>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {[
              {
                id: 1,
                type: "topup",
                amount: 500,
                date: "Nov 20, 2025",
              },
              {
                id: 2,
                type: "withdraw",
                amount: 200,
                date: "Nov 18, 2025",
              },
              {
                id: 3,
                type: "topup",
                amount: 300,
                date: "Nov 15, 2025",
              },
            ].map((tx) => (
              <div
                key={tx.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground capitalize">{tx.type}</p>
                  <p className="text-sm text-muted-foreground">{tx.date}</p>
                </div>
                <p className={`text-lg font-bold ${tx.type === "topup" ? "text-green-600" : "text-orange-600"}`}>
                  {tx.type === "topup" ? "+" : "-"}${tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topup Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-background rounded-t-2xl border-t border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Top Up USD</h2>
            <input
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleTopup}
                className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowTopupModal(false)}
                className="flex-1 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-background rounded-t-2xl border-t border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Withdraw USD</h2>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
