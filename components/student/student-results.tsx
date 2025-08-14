"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp } from "lucide-react"

const mockResults = [
  {
    id: 1,
    course: "CS301 - Web Development",
    code: "CS301",
    score: 88,
    grade: "A",
    units: 3,
    semester: "Fall 2024",
    session: "2024/2025",
    gpa: 4.0,
  },
  {
    id: 2,
    course: "CS201 - Data Structures",
    code: "CS201",
    score: 82,
    grade: "B+",
    units: 4,
    semester: "Fall 2024",
    session: "2024/2025",
    gpa: 3.3,
  },
  {
    id: 3,
    course: "MATH201 - Statistics",
    code: "MATH201",
    score: 85,
    grade: "A-",
    units: 3,
    semester: "Fall 2024",
    session: "2024/2025",
    gpa: 3.7,
  },
  {
    id: 4,
    course: "CS101 - Introduction to Programming",
    code: "CS101",
    score: 90,
    grade: "A",
    units: 3,
    semester: "Spring 2024",
    session: "2023/2024",
    gpa: 4.0,
  },
  {
    id: 5,
    course: "MATH101 - Calculus I",
    code: "MATH101",
    score: 78,
    grade: "B+",
    units: 4,
    semester: "Spring 2024",
    session: "2023/2024",
    gpa: 3.3,
  },
  {
    id: 6,
    course: "ENG101 - Technical Writing",
    code: "ENG101",
    score: 92,
    grade: "A",
    units: 2,
    semester: "Spring 2024",
    session: "2023/2024",
    gpa: 4.0,
  },
]

export function StudentResults() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedSession, setSelectedSession] = useState("all")

  const filteredResults = mockResults.filter((result) => {
    const searchMatch =
      result.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.code.toLowerCase().includes(searchTerm.toLowerCase())
    const semesterMatch = selectedSemester === "all" || result.semester === selectedSemester
    const sessionMatch = selectedSession === "all" || result.session === selectedSession
    return searchMatch && semesterMatch && sessionMatch
  })

  const calculateSemesterGPA = (semester: string, session: string) => {
    const semesterResults = mockResults.filter((r) => r.semester === semester && r.session === session)
    const totalPoints = semesterResults.reduce((sum, result) => sum + result.gpa * result.units, 0)
    const totalUnits = semesterResults.reduce((sum, result) => sum + result.units, 0)
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00"
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "A-":
        return "bg-green-100 text-green-700"
      case "B+":
        return "bg-blue-100 text-blue-800"
      case "B":
        return "bg-blue-100 text-blue-700"
      case "B-":
        return "bg-yellow-100 text-yellow-800"
      case "C+":
        return "bg-yellow-100 text-yellow-700"
      case "C":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  const semesters = [...new Set(mockResults.map((r) => `${r.semester} ${r.session}`))]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.45</div>
            <p className="text-xs text-muted-foreground">Cumulative GPA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Semester GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateSemesterGPA("Fall 2024", "2024/2025")}</div>
            <p className="text-xs text-muted-foreground">Fall 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResults.reduce((sum, result) => sum + result.units, 0)}</div>
            <p className="text-xs text-muted-foreground">Credits earned</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            <SelectItem value="Fall 2024">Fall 2024</SelectItem>
            <SelectItem value="Spring 2024">Spring 2024</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by session" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="2024/2025">2024/2025</SelectItem>
            <SelectItem value="2023/2024">2023/2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {semesters.map((semesterSession) => {
          const [semester, session] = semesterSession.split(" ")
          const semesterResults = filteredResults.filter((r) => r.semester === semester && r.session === session)

          if (semesterResults.length === 0) return null

          return (
            <Card key={semesterSession}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {semester} {session}
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Semester GPA</p>
                      <p className="font-bold text-lg">{calculateSemesterGPA(semester, session)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {semesterResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{result.course}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.code} • {result.units} Units
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{result.score}%</p>
                          <p className="text-sm text-muted-foreground">Score</p>
                        </div>
                        <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                        <div className="text-right">
                          <p className="font-medium">{result.gpa.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground">GPA</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
