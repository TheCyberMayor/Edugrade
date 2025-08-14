"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, TrendingUp, TrendingDown } from "lucide-react"

const mockFeedback = [
  {
    id: 1,
    course: "CS101 - Computer Science 101",
    rating: 5,
    comment:
      "Excellent teaching style and very clear explanations. The examples really helped me understand complex concepts.",
    sentiment: "Positive",
    date: "2024-01-15",
  },
  {
    id: 2,
    course: "CS201 - Data Structures",
    rating: 4,
    comment: "Good course content but could use more practical examples.",
    sentiment: "Positive",
    date: "2024-01-14",
  },
  {
    id: 3,
    course: "CS301 - Web Development",
    rating: 3,
    comment: "The pace was a bit fast for beginners.",
    sentiment: "Neutral",
    date: "2024-01-13",
  },
  {
    id: 4,
    course: "CS101 - Computer Science 101",
    rating: 2,
    comment: "Assignments were unclear and grading seemed inconsistent.",
    sentiment: "Negative",
    date: "2024-01-12",
  },
]

export function LecturerFeedbackDashboard() {
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedSentiment, setSelectedSentiment] = useState("all")

  const filteredFeedback = mockFeedback.filter((feedback) => {
    const courseMatch = selectedCourse === "all" || feedback.course.includes(selectedCourse)
    const sentimentMatch = selectedSentiment === "all" || feedback.sentiment === selectedSentiment
    return courseMatch && sentimentMatch
  })

  const averageRating =
    filteredFeedback.reduce((sum, feedback) => sum + feedback.rating, 0) / filteredFeedback.length || 0
  const sentimentCounts = {
    Positive: filteredFeedback.filter((f) => f.sentiment === "Positive").length,
    Neutral: filteredFeedback.filter((f) => f.sentiment === "Neutral").length,
    Negative: filteredFeedback.filter((f) => f.sentiment === "Negative").length,
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <Badge className="bg-green-100 text-green-800">Positive</Badge>
      case "Neutral":
        return <Badge className="bg-yellow-100 text-yellow-800">Neutral</Badge>
      case "Negative":
        return <Badge className="bg-red-100 text-red-800">Negative</Badge>
      default:
        return <Badge variant="secondary">{sentiment}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentCounts.Positive}</div>
            <p className="text-xs text-muted-foreground">Positive feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neutral</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentCounts.Neutral}</div>
            <p className="text-xs text-muted-foreground">Neutral feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negative</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentCounts.Negative}</div>
            <p className="text-xs text-muted-foreground">Negative feedback</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-4">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="CS101">CS101</SelectItem>
            <SelectItem value="CS201">CS201</SelectItem>
            <SelectItem value="CS301">CS301</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="Positive">Positive</SelectItem>
            <SelectItem value="Neutral">Neutral</SelectItem>
            <SelectItem value="Negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredFeedback.map((feedback) => (
          <Card key={feedback.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{feedback.course}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getSentimentBadge(feedback.sentiment)}
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{feedback.comment}</p>
              <p className="text-xs text-muted-foreground">Submitted on {feedback.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
