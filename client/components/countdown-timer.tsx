"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  endTime: string
}

export function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("")
  // const {postedText, setPostedText} =  useState<string>("")
  const [postedText2, setPostedText] = useState<string>("") // Fixed: separate useState hook



  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const end = new Date(endTime)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Ended")
        setPostedText(`Has ended!`)

        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
        setPostedText(`Ends in ${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`)
        setPostedText(`Ends in ${hours}h ${mins}m`)
      } else {
        setTimeLeft(`${mins}m`)
        setPostedText(`Ends in ${mins}m`)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [endTime])

  // return <span className="text-xs text-muted-foreground font-medium">Ends in {timeLeft}</span>
  return <span className="text-xs text-muted-foreground font-medium">{postedText2}</span>

}
