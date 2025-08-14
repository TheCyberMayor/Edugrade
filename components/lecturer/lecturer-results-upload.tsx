"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Plus } from "lucide-react"

const mockCourses = [
  { id: 1, code: "CS101", title: "Computer Science 101" },
  { id: 2, code: "CS201", title: "Data Structures" },
  { id: 3, code: "CS301", title: "Web Development" },
  { id: 4, code: "CS401", title: "Database Systems" },
]

export function LecturerResultsUpload() {
  const [uploadMethod, setUploadMethod] = useState("manual")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [studentId, setStudentId] = useState("")
  const [score, setScore] = useState("")
  const [semester, setSemester] = useState("")
  const [session, setSession] = useState("")

  const handleManualUpload = () => {
    // Handle manual result upload
    console.log("Manual upload:", { selectedCourse, studentId, score, semester, session })
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle CSV file upload
      console.log("CSV upload:", file.name)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={uploadMethod === "manual" ? "ring-2 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Manual Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant={uploadMethod === "manual" ? "default" : "outline"}
              onClick={() => setUploadMethod("manual")}
              className="w-full"
            >
              Upload Individual Results
            </Button>
          </CardContent>
        </Card>

        <Card className={uploadMethod === "csv" ? "ring-2 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>CSV Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant={uploadMethod === "csv" ? "default" : "outline"}
              onClick={() => setUploadMethod("csv")}
              className="w-full"
            >
              Bulk Upload via CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {uploadMethod === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Individual Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCourses.map((course) => (
                      <SelectItem key={course.id} value={course.code}>
                        {course.code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="Enter student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="Enter score (0-100)"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Semester</SelectItem>
                    <SelectItem value="2">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session">Academic Session</Label>
                <Input
                  id="session"
                  placeholder="e.g., 2023/2024"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleManualUpload} className="w-full">
              Upload Result
            </Button>
          </CardContent>
        </Card>
      )}

      {uploadMethod === "csv" && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload via CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-csv">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {mockCourses.map((course) => (
                    <SelectItem key={course.id} value={course.code}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <div className="flex items-center space-x-2">
                <Input id="csv-file" type="file" accept=".csv" onChange={handleCSVUpload} className="flex-1" />
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
              <p className="text-sm text-muted-foreground mb-2">Your CSV file should have the following columns:</p>
              <code className="text-xs bg-background p-2 rounded block">student_id,score,semester,session</code>
              <p className="text-xs text-muted-foreground mt-2">Example: STU001,85,1,2023/2024</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
