import type React from "react"
// <CHANGE> Updated metadata for prediction market app
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AppProvider } from '@/providers/AppProvider';
import { AuthProvider } from '@/contexts/AuthContext';



const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Juzzbet",
  description: "Create and trade prediction markets powered by X",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      {
        url: "/juzz.jpeg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/juzz.jpeg",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.jpeg",
        type: "image/svg+xml",
      },
    ],
    apple: "/juzz.jpeg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AppProvider>
          <AuthProvider>

            {children}
          </AuthProvider>

          <Analytics />
        </AppProvider>

      </body>
    </html>
  )
}
