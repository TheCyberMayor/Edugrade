"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search, BookOpen } from "lucide-react"

interface Course {
  id: string
  title: string
  code: string
  unit: number
  department: string
  lecturer: string
  students: number
  semester: string
  createdAt: string
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to Programming",
    code: "CS101",
    unit: 3,
    department: "Computer Science",
    lecturer: "Dr. Smith",
    students: 45,
    semester: "Fall 2024",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Data Structures and Algorithms",
    code: "CS201",
    unit: 4,
    department: "Computer Science",
    lecturer: "Dr. Smith",
    students: 38,
    semester: "Fall 2024",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    title: "Calculus I",
    code: "MATH101",
    unit: 3,
    department: "Mathematics",
    lecturer: "Prof. Johnson",
    students: 52,
    semester: "Fall 2024",
    createdAt: "2024-01-25",
  },
  {
    id: "4",
    title: "Physics Mechanics",
    code: "PHY101",
    unit: 4,
    department: "Physics",
    lecturer: "Dr. Wilson",
    students: 41,
    semester: "Fall 2024",
    createdAt: "2024-02-01",
  },
]

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: "",
    code: "",
    unit: 3,
    department: "",
    lecturer: "",
    semester: "Fall 2024",
  })

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateCourse = () => {
    const course: Course = {
      id: Date.now().toString(),
      ...newCourse,
      students: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setCourses([...courses, course])
    setNewCourse({
      title: "",
      code: "",
      unit: 3,
      department: "",
      lecturer: "",
      semester: "Fall 2024",
    })
    setIsCreateDialogOpen(false)
  }

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  const getUnitBadgeVariant = (unit: number) => {
    if (unit >= 4) return "default"
    if (unit === 3) return "secondary"
    return "outline"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Manage courses and assignments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-title">Course Title</Label>
                <Input
                  id="course-title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-code">Course Code</Label>
                <Input
                  id="course-code"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-unit">Credit Units</Label>
                <Select
                  value={newCourse.unit.toString()}
                  onValueChange={(value) => setNewCourse({ ...newCourse, unit: Number.parseInt(value) })}
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
              <div className="space-y-2">
                <Label htmlFor="course-department">Department</Label>
                <Select
                  value={newCourse.department}
                  onValueChange={(value) => setNewCourse({ ...newCourse, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-lecturer">Lecturer</Label>
                <Select
                  value={newCourse.lecturer}
                  onValueChange={(value) => setNewCourse({ ...newCourse, lecturer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                    <SelectItem value="Prof. Johnson">Prof. Johnson</SelectItem>
                    <SelectItem value="Dr. Wilson">Dr. Wilson</SelectItem>
                    <SelectItem value="Prof. Brown">Prof. Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-semester">Semester</Label>
                <Select
                  value={newCourse.semester}
                  onValueChange={(value) => setNewCourse({ ...newCourse, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                    <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                    <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateCourse} className="w-full">
                Create Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.slice(0, 6).map((course) => (
          <Card key={course.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  {course.code}
                </div>
                <Badge variant={getUnitBadgeVariant(course.unit)}>{course.unit} Units</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{course.title}</p>
                <div className="flex justify-between text-sm">
                  <span>Department:</span>
                  <span className="font-medium">{course.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lecturer:</span>
                  <span className="font-medium">{course.lecturer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Students:</span>
                  <span className="font-medium">{course.students}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell>{course.lecturer}</TableCell>
                  <TableCell>
                    <Badge variant={getUnitBadgeVariant(course.unit)}>{course.unit}</Badge>
                  </TableCell>
                  <TableCell>{course.students}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
