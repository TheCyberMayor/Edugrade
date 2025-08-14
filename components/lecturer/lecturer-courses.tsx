"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Users, BookOpen, Calendar } from "lucide-react"

const mockCourses = [
  {
    id: 1,
    code: "CS101",
    title: "Computer Science 101",
    department: "Computer Science",
    students: 45,
    semester: "Fall 2024",
    status: "Active",
  },
  {
    id: 2,
    code: "CS201",
    title: "Data Structures",
    department: "Computer Science",
    students: 38,
    semester: "Fall 2024",
    status: "Active",
  },
  {
    id: 3,
    code: "CS301",
    title: "Web Development",
    department: "Computer Science",
    students: 32,
    semester: "Fall 2024",
    status: "Active",
  },
  {
    id: 4,
    code: "CS401",
    title: "Database Systems",
    department: "Computer Science",
    students: 28,
    semester: "Fall 2024",
    status: "Active",
  },
]

export function LecturerCourses() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCourses = mockCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{course.code}</CardTitle>
                <Badge variant="secondary">{course.status}</Badge>
              </div>
              <p className="text-muted-foreground">{course.title}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{course.semester}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{course.department}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  View Students
                </Button>
                <Button size="sm" variant="outline">
                  Upload Results
                </Button>
                <Button size="sm" variant="outline">
                  View Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
