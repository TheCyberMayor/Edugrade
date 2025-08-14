"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp } from "lucide-react"
import type { StudentResult } from "./results-management"

interface GPACalculatorProps {
  results: StudentResult[]
}

const gradePoints: Record<string, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0.0,
}

interface GPAData {
  studentId: string
  studentName: string
  semester: string
  session: string
  gpa: number
  totalUnits: number
  courses: StudentResult[]
}

interface CGPAData {
  studentId: string
  studentName: string
  cgpa: number
  totalUnits: number
  semesters: GPAData[]
}

export function GPACalculator({ results }: GPACalculatorProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>("all")
  const [selectedSession, setSelectedSession] = useState<string>("all")

  const students = useMemo(() => {
    const uniqueStudents = Array.from(new Set(results.map((r) => r.studentId))).map((id) => {
      const result = results.find((r) => r.studentId === id)
      return { id, name: result?.studentName || "" }
    })
    return uniqueStudents
  }, [results])

  const gpaData = useMemo(() => {
    const grouped = results.reduce(
      (acc, result) => {
        const key = `${result.studentId}-${result.semester}-${result.session}`
        if (!acc[key]) {
          acc[key] = {
            studentId: result.studentId,
            studentName: result.studentName,
            semester: result.semester,
            session: result.session,
            courses: [],
            totalUnits: 0,
            totalPoints: 0,
          }
        }
        acc[key].courses.push(result)
        acc[key].totalUnits += result.unit
        acc[key].totalPoints += gradePoints[result.grade] * result.unit
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(grouped).map((data: any) => ({
      ...data,
      gpa: data.totalPoints / data.totalUnits,
    })) as GPAData[]
  }, [results])

  const cgpaData = useMemo(() => {
    const studentGPAs = gpaData.reduce(
      (acc, gpa) => {
        if (!acc[gpa.studentId]) {
          acc[gpa.studentId] = {
            studentId: gpa.studentId,
            studentName: gpa.studentName,
            semesters: [],
            totalUnits: 0,
            totalPoints: 0,
          }
        }
        acc[gpa.studentId].semesters.push(gpa)
        acc[gpa.studentId].totalUnits += gpa.totalUnits
        acc[gpa.studentId].totalPoints += gpa.gpa * gpa.totalUnits
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(studentGPAs).map((data: any) => ({
      ...data,
      cgpa: data.totalPoints / data.totalUnits,
    })) as CGPAData[]
  }, [gpaData])

  const filteredGPAData = gpaData.filter((gpa) => {
    const matchesStudent = selectedStudent === "all" || gpa.studentId === selectedStudent
    const matchesSession = selectedSession === "all" || gpa.session === selectedSession
    return matchesStudent && matchesSession
  })

  const filteredCGPAData = cgpaData.filter((cgpa) => {
    return selectedStudent === "all" || cgpa.studentId === selectedStudent
  })

  const getGPABadgeVariant = (gpa: number) => {
    if (gpa >= 3.5) return "default"
    if (gpa >= 3.0) return "secondary"
    if (gpa >= 2.5) return "outline"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select session" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="2024/2025">2024/2025</SelectItem>
            <SelectItem value="2023/2024">2023/2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Semester GPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGPAData.map((gpa, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{gpa.studentName}</TableCell>
                    <TableCell>{gpa.semester}</TableCell>
                    <TableCell>{gpa.session}</TableCell>
                    <TableCell>
                      <Badge variant={getGPABadgeVariant(gpa.gpa)}>{gpa.gpa.toFixed(2)}</Badge>
                    </TableCell>
                    <TableCell>{gpa.totalUnits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Cumulative GPA (CGPA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Total Units</TableHead>
                  <TableHead>Semesters</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCGPAData.map((cgpa) => (
                  <TableRow key={cgpa.studentId}>
                    <TableCell className="font-medium">{cgpa.studentName}</TableCell>
                    <TableCell>
                      <Badge variant={getGPABadgeVariant(cgpa.cgpa)}>{cgpa.cgpa.toFixed(2)}</Badge>
                    </TableCell>
                    <TableCell>{cgpa.totalUnits}</TableCell>
                    <TableCell>{cgpa.semesters.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
