"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { ResultsUpload } from "./results-upload"
import { GPACalculator } from "./gpa-calculator"

export interface StudentResult {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseCode: string
  courseTitle: string
  score: number
  grade: string
  unit: number
  semester: string
  session: string
  createdAt: string
}

const mockResults: StudentResult[] = [
  {
    id: "1",
    studentId: "3",
    studentName: "John Doe",
    courseId: "1",
    courseCode: "CS101",
    courseTitle: "Introduction to Programming",
    score: 85,
    grade: "A",
    unit: 3,
    semester: "Fall",
    session: "2024/2025",
    createdAt: "2024-02-15",
  },
  {
    id: "2",
    studentId: "3",
    studentName: "John Doe",
    courseId: "3",
    courseCode: "MATH101",
    courseTitle: "Calculus I",
    score: 78,
    grade: "B+",
    unit: 3,
    semester: "Fall",
    session: "2024/2025",
    createdAt: "2024-02-15",
  },
  {
    id: "3",
    studentId: "4",
    studentName: "Jane Wilson",
    courseId: "3",
    courseCode: "MATH101",
    courseTitle: "Calculus I",
    score: 92,
    grade: "A",
    unit: 3,
    semester: "Fall",
    session: "2024/2025",
    createdAt: "2024-02-15",
  },
  {
    id: "4",
    studentId: "4",
    studentName: "Jane Wilson",
    courseId: "2",
    courseCode: "CS201",
    courseTitle: "Data Structures and Algorithms",
    score: 88,
    grade: "A-",
    unit: 4,
    semester: "Fall",
    session: "2024/2025",
    createdAt: "2024-02-15",
  },
]

export function ResultsManagement() {
  const [results, setResults] = useState<StudentResult[]>(mockResults)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedSession, setSelectedSession] = useState("all")

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSemester = selectedSemester === "all" || result.semester === selectedSemester
    const matchesSession = selectedSession === "all" || result.session === selectedSession

    return matchesSearch && matchesSemester && matchesSession
  })

  const getGradeBadgeVariant = (grade: string) => {
    if (grade === "A" || grade === "A+") return "default"
    if (grade === "A-" || grade === "B+") return "secondary"
    if (grade === "B" || grade === "B-") return "outline"
    return "destructive"
  }

  const handleAddResult = (newResult: Omit<StudentResult, "id" | "createdAt">) => {
    const result: StudentResult = {
      ...newResult,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setResults([...results, result])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Results Management</h2>
          <p className="text-muted-foreground">Upload and manage student academic results</p>
        </div>
      </div>

      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">View Results</TabsTrigger>
          <TabsTrigger value="upload">Upload Results</TabsTrigger>
          <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 flex-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, course code, or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="Fall">Fall</SelectItem>
                      <SelectItem value="Spring">Spring</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sessions</SelectItem>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.studentName}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{result.courseCode}</div>
                          <div className="text-sm text-muted-foreground">{result.courseTitle}</div>
                        </div>
                      </TableCell>
                      <TableCell>{result.score}%</TableCell>
                      <TableCell>
                        <Badge variant={getGradeBadgeVariant(result.grade)}>{result.grade}</Badge>
                      </TableCell>
                      <TableCell>{result.unit}</TableCell>
                      <TableCell>{result.semester}</TableCell>
                      <TableCell>{result.session}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <ResultsUpload onAddResult={handleAddResult} />
        </TabsContent>

        <TabsContent value="gpa">
          <GPACalculator results={results} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
