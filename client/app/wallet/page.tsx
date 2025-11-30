"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Minus, Copy, Check } from "lucide-react"
import QRCodeComponent from '@/components/QRCodeComponent';
import { useAccount } from "wagmi";
import { useWeb3 } from "@/contexts/useWeb3"


export default function WalletPage() {
  const [showTopupModal, setShowTopupModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [topupAmount, setTopupAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
   const [userBalance, setUserBalance] = useState(0)
  const [copied, setCopied] = useState(false)
  const { address, isConnected } = useAccount()
  const {checkBalanceOfSingleAsset, isWalletReady } = useWeb3();

  const walletAddress = address || "" // Use Web3Auth address

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <div className="hidden">
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
          <div className="w-full bg-background rounded-t-2xl border-t border-border p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-foreground mb-4">Top Up USD</h2>

            {/* Warning Message */}
            <div className="border border-yellow-200 rounded-lg p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">Deposit
                  <img src="/cUSD.png" alt="cUSD" className="w-5 h-5" />
                  <span className="text-sm font-medium text-yellow-800">cUSD</span>
                </div>
                <span className="text-yellow-800">on</span>
                <div className="flex items-center gap-1">
                  <img src="/celo.jpg" alt="Celo" className="w-5 h-5" />
                  <span className="text-sm font-medium text-yellow-800">Celo</span>
                </div>
              </div>

            </div>

            {/* QR Code Section */}
            <div className="bg-card border border-border rounded-lg p-6 mb-0">
              <div className="flex flex-col items-center">


                {/* QR Code using your component */}
                <div className="mb-4 p-2 bg-white rounded-lg border-2 border-border">
                  <QRCodeComponent text={`ethereum:${walletAddress}`} />
                </div>

                {/* Wallet Address */}
                <div className="w-full">
                  <p className="text-sm text-muted-foreground mb-2 text-center">Scan wallet address!</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                    <code className="flex-1 text-sm font-mono text-foreground break-all">
                      {walletAddress}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTopupModal(false)}
                className="flex-1 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors"
              >
                Close
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