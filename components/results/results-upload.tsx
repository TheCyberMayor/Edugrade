"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, Plus } from "lucide-react"
import type { StudentResult } from "./results-management"

interface ResultsUploadProps {
  onAddResult: (result: Omit<StudentResult, "id" | "createdAt">) => void
}

const gradeScale = {
  A: { min: 90, max: 100, points: 4.0 },
  "A-": { min: 85, max: 89, points: 3.7 },
  "B+": { min: 80, max: 84, points: 3.3 },
  B: { min: 75, max: 79, points: 3.0 },
  "B-": { min: 70, max: 74, points: 2.7 },
  "C+": { min: 65, max: 69, points: 2.3 },
  C: { min: 60, max: 64, points: 2.0 },
  "C-": { min: 55, max: 59, points: 1.7 },
  D: { min: 50, max: 54, points: 1.0 },
  F: { min: 0, max: 49, points: 0.0 },
}

function calculateGrade(score: number): string {
  for (const [grade, range] of Object.entries(gradeScale)) {
    if (score >= range.min && score <= range.max) {
      return grade
    }
  }
  return "F"
}

export function ResultsUpload({ onAddResult }: ResultsUploadProps) {
  const [manualResult, setManualResult] = useState({
    studentId: "",
    studentName: "",
    courseId: "",
    courseCode: "",
    courseTitle: "",
    score: "",
    unit: "3",
    semester: "Fall",
    session: "2024/2025",
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const score = Number.parseInt(manualResult.score)
    const grade = calculateGrade(score)

    onAddResult({
      studentId: manualResult.studentId,
      studentName: manualResult.studentName,
      courseId: manualResult.courseId,
      courseCode: manualResult.courseCode,
      courseTitle: manualResult.courseTitle,
      score,
      grade,
      unit: Number.parseInt(manualResult.unit),
      semester: manualResult.semester,
      session: manualResult.session,
    })

    setManualResult({
      studentId: "",
      studentName: "",
      courseId: "",
      courseCode: "",
      courseTitle: "",
      score: "",
      unit: "3",
      semester: "Fall",
      session: "2024/2025",
    })
    setUploadStatus("success")
    setTimeout(() => setUploadStatus("idle"), 3000)
  }

  const handleCsvUpload = () => {
    if (!csvFile) return

    // Mock CSV processing
    setUploadStatus("success")
    setTimeout(() => setUploadStatus("idle"), 3000)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="csv">CSV Import</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Add Individual Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input
                      id="student-id"
                      value={manualResult.studentId}
                      onChange={(e) => setManualResult({ ...manualResult, studentId: e.target.value })}
                      placeholder="Enter student ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Student Name</Label>
                    <Input
                      id="student-name"
                      value={manualResult.studentName}
                      onChange={(e) => setManualResult({ ...manualResult, studentName: e.target.value })}
                      placeholder="Enter student name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-code">Course Code</Label>
                    <Input
                      id="course-code"
                      value={manualResult.courseCode}
                      onChange={(e) => setManualResult({ ...manualResult, courseCode: e.target.value })}
                      placeholder="e.g., CS101"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-title">Course Title</Label>
                    <Input
                      id="course-title"
                      value={manualResult.courseTitle}
                      onChange={(e) => setManualResult({ ...manualResult, courseTitle: e.target.value })}
                      placeholder="Enter course title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Credit Units</Label>
                    <Select
                      value={manualResult.unit}
                      onValueChange={(value) => setManualResult({ ...manualResult, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Unit</SelectItem>
                        <SelectItem value="2">2 Units</SelectItem>
                        <SelectItem value="3">3 Units</SelectItem>
                        <SelectItem value="4">4 Units</SelectItem>
                        <SelectItem value="5">5 Units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Score (%)</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      value={manualResult.score}
                      onChange={(e) => setManualResult({ ...manualResult, score: e.target.value })}
                      placeholder="Enter score"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={manualResult.semester}
                      onValueChange={(value) => setManualResult({ ...manualResult, semester: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session">Academic Session</Label>
                    <Select
                      value={manualResult.session}
                      onValueChange={(value) => setManualResult({ ...manualResult, session: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                        <SelectItem value="2023/2024">2023/2024</SelectItem>
                        <SelectItem value="2022/2023">2022/2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {uploadStatus === "success" && (
                  <Alert>
                    <AlertDescription>Result uploaded successfully!</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full">
                  Upload Result
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                CSV Bulk Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Your CSV file should contain the following columns in this order:
                </p>
                <code className="text-xs bg-background p-2 rounded block">
                  student_id,student_name,course_code,course_title,score,unit,semester,session
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: 3,John Doe,CS101,Introduction to Programming,85,3,Fall,2024/2025
                </p>
              </div>

              {uploadStatus === "success" && (
                <Alert>
                  <AlertDescription>CSV file processed successfully!</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleCsvUpload} disabled={!csvFile} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Process CSV File
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
