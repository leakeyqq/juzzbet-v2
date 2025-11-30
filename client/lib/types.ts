export interface User {
  id: string
  name: string
  handle: string
  avatar?: string
  balance?: number
}

export interface Bet {
  id: string
  title: string
  marketShortId: string,
  description?: string
  creator: User
  image?: string
  currency: "USD"
  bettingEndsAt: string
  resolutionDate: string
  yesBets: Array<{ userId: string; amount?: number }>
  noBets: Array<{ userId: string; amount?: number }>
  createdAt: string
  resolved?: boolean
  resolution?: "yes" | "no" | "cancelled"
  judges?: User[],
  totalYesBets: number,
  totalNoBets: number
}

export interface UserBet {
  betId: string
  userId: string
  prediction: "yes" | "no"
  amount: number
  placedAt: string
  resolved: boolean
  won?: boolean
}
