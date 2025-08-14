"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { GraduationCap, TrendingUp, FileText, Star, Download, BookOpen } from "lucide-react"
import { StudentResults } from "./student-results"
import { StudentTranscript } from "./student-transcript"
import Link from "next/link"

export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <DashboardLayout title="Student Dashboard">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">My Results</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.45</div>
                <p className="text-xs text-muted-foreground">Out of 4.0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6th</div>
                <p className="text-xs text-muted-foreground">Fall 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98</div>
                <p className="text-xs text-muted-foreground">Credits earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback Given</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">This semester</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Degree Progress</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Credits Required</p>
                    <p className="font-medium">150</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Credits Earned</p>
                    <p className="font-medium">98</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current GPA</p>
                    <p className="font-medium">3.45</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expected Graduation</p>
                    <p className="font-medium">Spring 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">CS301 - Web Development</p>
                      <p className="text-sm text-muted-foreground">Fall 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">A (88%)</p>
                      <p className="text-xs text-muted-foreground">3 Units</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">CS201 - Data Structures</p>
                      <p className="text-sm text-muted-foreground">Fall 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">B+ (82%)</p>
                      <p className="text-xs text-muted-foreground">4 Units</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">MATH201 - Statistics</p>
                      <p className="text-sm text-muted-foreground">Fall 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">A- (85%)</p>
                      <p className="text-xs text-muted-foreground">3 Units</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-transparent"
                  onClick={() => setActiveTab("results")}
                >
                  View All Results
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => setActiveTab("results")} className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  View My Results
                </Button>
                <Button onClick={() => setActiveTab("transcript")} variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download Transcript
                </Button>
                <Button asChild variant="outline" className="justify-start bg-transparent">
                  <Link href="/student/feedback">
                    <Star className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <StudentResults />
        </TabsContent>

        <TabsContent value="transcript">
          <StudentTranscript />
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Course Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Submit anonymous feedback for your courses to help improve the learning experience.
              </p>
              <Button asChild>
                <Link href="/student/feedback">
                  <Star className="mr-2 h-4 w-4" />
                  Submit Course Feedback
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
