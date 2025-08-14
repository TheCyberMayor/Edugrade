"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, User, Calendar } from "lucide-react"

const studentInfo = {
  name: "John Doe",
  studentId: "STU001",
  program: "Bachelor of Science in Computer Science",
  department: "Computer Science",
  admissionDate: "September 2021",
  expectedGraduation: "May 2025",
  currentLevel: "400 Level",
}

const transcriptData = [
  {
    session: "2023/2024",
    semesters: [
      {
        semester: "Spring 2024",
        courses: [
          { code: "CS101", title: "Introduction to Programming", units: 3, score: 90, grade: "A", gpa: 4.0 },
          { code: "MATH101", title: "Calculus I", units: 4, score: 78, grade: "B+", gpa: 3.3 },
          { code: "ENG101", title: "Technical Writing", units: 2, score: 92, grade: "A", gpa: 4.0 },
        ],
      },
    ],
  },
  {
    session: "2024/2025",
    semesters: [
      {
        semester: "Fall 2024",
        courses: [
          { code: "CS301", title: "Web Development", units: 3, score: 88, grade: "A", gpa: 4.0 },
          { code: "CS201", title: "Data Structures", units: 4, score: 82, grade: "B+", gpa: 3.3 },
          { code: "MATH201", title: "Statistics", units: 3, score: 85, grade: "A-", gpa: 3.7 },
        ],
      },
    ],
  },
]

export function StudentTranscript() {
  const calculateSemesterGPA = (courses: any[]) => {
    const totalPoints = courses.reduce((sum, course) => sum + course.gpa * course.units, 0)
    const totalUnits = courses.reduce((sum, course) => sum + course.units, 0)
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00"
  }

  const calculateCGPA = () => {
    const allCourses = transcriptData.flatMap((session) => session.semesters.flatMap((semester) => semester.courses))
    return calculateSemesterGPA(allCourses)
  }

  const getTotalCredits = () => {
    return transcriptData.reduce(
      (total, session) =>
        total +
        session.semesters.reduce(
          (semTotal, semester) =>
            semTotal + semester.courses.reduce((courseTotal, course) => courseTotal + course.units, 0),
          0,
        ),
      0,
    )
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

  const handleDownloadPDF = () => {
    // In a real application, this would generate and download a PDF
    alert("PDF download functionality would be implemented here")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Academic Transcript</h2>
          <p className="text-muted-foreground">Complete academic record</p>
        </div>
        <Button onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Student Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{studentInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-medium">{studentInfo.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Program</p>
              <p className="font-medium">{studentInfo.program}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{studentInfo.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admission Date</p>
              <p className="font-medium">{studentInfo.admissionDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Graduation</p>
              <p className="font-medium">{studentInfo.expectedGraduation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateCGPA()}</div>
            <p className="text-xs text-muted-foreground">Out of 4.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalCredits()}</div>
            <p className="text-xs text-muted-foreground">Credits earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentInfo.currentLevel}</div>
            <p className="text-xs text-muted-foreground">Academic level</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {transcriptData.map((sessionData) => (
          <Card key={sessionData.session}>
            <CardHeader>
              <CardTitle className="text-lg">{sessionData.session} Academic Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {sessionData.semesters.map((semesterData) => (
                <div key={semesterData.semester} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-base">{semesterData.semester}</h4>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Semester GPA</p>
                      <p className="font-bold">{calculateSemesterGPA(semesterData.courses)}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Course Code</th>
                          <th className="text-left py-2">Course Title</th>
                          <th className="text-center py-2">Units</th>
                          <th className="text-center py-2">Score</th>
                          <th className="text-center py-2">Grade</th>
                          <th className="text-center py-2">GPA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semesterData.courses.map((course, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{course.code}</td>
                            <td className="py-2">{course.title}</td>
                            <td className="py-2 text-center">{course.units}</td>
                            <td className="py-2 text-center">{course.score}%</td>
                            <td className="py-2 text-center">
                              <Badge className={getGradeColor(course.grade)}>{course.grade}</Badge>
                            </td>
                            <td className="py-2 text-center font-medium">{course.gpa.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transcript Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{calculateCGPA()}</p>
              <p className="text-sm text-muted-foreground">Cumulative GPA</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{getTotalCredits()}</p>
              <p className="text-sm text-muted-foreground">Total Credits</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{transcriptData.length}</p>
              <p className="text-sm text-muted-foreground">Academic Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {transcriptData.reduce((total, session) => total + session.semesters.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Semesters Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
