"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X } from "lucide-react"
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { useWeb3 } from "@/contexts/useWeb3"



export default function CreateBetPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [bettingStartsDate, setBettingStartsDate] = useState("")
  const [bettingStartsTime, setBettingStartsTime] = useState("")
  const [bettingEndsDate, setBettingEndsDate] = useState("")
  const [bettingEndsTime, setBettingEndsTime] = useState("")
  const [resolutionDate, setResolutionDate] = useState("")
  const [resolutionTime, setResolutionTime] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [judgesEmails, setJudgesEmails] = useState<string[]>([""])
  const [currentUserEmail] = useState("alice@example.com") // Mock current user email
  const [marketVisibility, setMarketVisibility] = useState<"public" | "private">("public")
  const [timezone, setTimezone] = useState("")
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const { createMarket } = useWeb3();




  useEffect(() => {
    // Set current timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)

    // Set default start time to current time
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    setBettingStartsDate(dateStr)
    setBettingStartsTime(timeStr)

    // Pre-fill current user's email in judges
    setJudgesEmails([currentUserEmail])
  }, [currentUserEmail])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try{
    const file = e.target.files?.[0]
    if (!file) return;

    setUploading(true);
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
      console.log("image url is ", url)
    }
    }catch(e){
      alert(e)
      console.log(e)
    }finally{
      setUploading(false);
    }
  }
//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

//   const file = e.target.files?.[0];
//   if (!file) return;

//   setUploading(true);
//   try {
//     const url = await uploadToCloudinary(file);
//     setImageUrl(url);
//     console.log("Uploaded image URL:", url);
//   } catch (err) {
//     alert(`Upload failed : ${err}`)
//     // console.error("Upload failed", err);
//   }
//   setUploading(false);
// };


  const handleAddJudgeEmail = () => {
    setJudgesEmails([...judgesEmails, ""])
  }

  const handleRemoveJudgeEmail = (index: number) => {
    setJudgesEmails(judgesEmails.filter((_, i) => i !== index))
  }

  const handleJudgeEmailChange = (index: number, value: string) => {
    const newEmails = [...judgesEmails]
    newEmails[index] = value
    setJudgesEmails(newEmails)
  }


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Basic validation
  if (!title.trim() || !bettingStartsDate || !bettingStartsTime || !bettingEndsDate || !bettingEndsTime || !imageUrl) {
    alert("Please fill in all required fields")
    return
  }

  // Validate judges emails
  const validJudgesEmails = judgesEmails.filter(email => 
    email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )

  if (validJudgesEmails.length === 0) {
    alert("Please add at least one valid judge email")
    return
  }

  setIsSubmitting(true)

  try {
    let coverImageUrl = null

    // 2. Combine date and time into Date objects
    const betStartTime = new Date(`${bettingStartsDate}T${bettingStartsTime}`).toISOString()
    const betEndTime = new Date(`${bettingEndsDate}T${bettingEndsTime}`).toISOString()
    
    let betResolvedOn = null
    if (resolutionDate && resolutionTime) {
      betResolvedOn = new Date(`${resolutionDate}T${resolutionTime}`).toISOString()
    }

    const celoMarketId = await createMarket()


    // 3. Prepare the data for API
    const betData = {
      coverImage: imageUrl,
      title: title.trim(),
      description: description.trim(),
      betStartTime,
      betEndTime,
      betResolvedOn,
      judges: validJudgesEmails,
      marketVisibility,
      timezone,
      marketId: celoMarketId
    }

    // Send data to your backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/market/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include", // send cookies for auth
      body: JSON.stringify(betData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      alert(`${errorData.error || "Failed to create bet"}`)
      throw new Error(errorData.error || 'Failed to create bet')
    }

    const result = await response.json()
    
    alert('Market created succefully')
    // router.push(`/bet/${result.id}`)

    
    // Redirect to the newly created bet page or home
    // router.push(`/bet/${result.id}`)
    
  } catch (error) {
    console.error('Error creating bet:', error)
    alert(error instanceof Error ? error.message : 'Failed to create bet. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Create Market</h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pt-6 pb-20 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cover Image</label>
            {imageUrl ? (
              <div className="relative">
                <img
                  src={coverImage || "/placeholder.svg"}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
                 {uploading && <p className="text-lg text-gray-500">Uploading...wait patiently!</p>}

              </div>

            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload cover image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Market Question
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Will Bitcoin reach $100k by end of year?"
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/200</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context about this market..."
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{description.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Betting Starts At <span className="text-xs text-muted-foreground">({timezone})</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={bettingStartsDate}
                onChange={(e) => setBettingStartsDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="time"
                value={bettingStartsTime}
                onChange={(e) => setBettingStartsTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Betting Ends At <span className="text-xs text-muted-foreground">({timezone})</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={bettingEndsDate}
                onChange={(e) => setBettingEndsDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="time"
                value={bettingEndsTime}
                onChange={(e) => setBettingEndsTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Bet Will Be Resolved On <span className="text-xs text-muted-foreground">(Optional)</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              The time when the decision of which side won will be determined
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={resolutionDate}
                onChange={(e) => setResolutionDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="time"
                value={resolutionTime}
                onChange={(e) => setResolutionTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Judges</label>
            <p className="text-xs text-muted-foreground mb-3">
              Judges will decide the final results of which side won. All their votes must match for it to be valid.
            </p>
            <div className="space-y-2">
              {judgesEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleJudgeEmailChange(index, e.target.value)}
                    placeholder="judge@example.com"
                    className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {judgesEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveJudgeEmail(index)}
                      className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddJudgeEmail}
                className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:bg-muted/50 transition-colors text-sm"
              >
                + Add Another Judge
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Market Visibility</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={marketVisibility === "public"}
                  onChange={(e) => setMarketVisibility(e.target.value as "public")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-foreground">Public Market</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    It will be listed publicly on our app for anyone to see and participate in betting. This will need
                    to go under review by an admin.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={marketVisibility === "private"}
                  onChange={(e) => setMarketVisibility(e.target.value as "private")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-foreground">Private Market</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    It will not be publicly listed on our app. Only the people you share the link with can see it and
                    participate in betting.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              !title.trim() ||
              !bettingStartsDate ||
              !bettingStartsTime ||
              !bettingEndsDate ||
              !bettingEndsTime ||
              isSubmitting
            }
            className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Market"}
          </button>
        </form>
      </div>
    </div>
  )
}
