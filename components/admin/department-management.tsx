"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Building } from "lucide-react"

interface Department {
  id: string
  name: string
  description: string
  head: string
  courses: number
  students: number
  createdAt: string
}

const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Computer Science",
    description: "Department of Computer Science and Information Technology",
    head: "Dr. Smith",
    courses: 25,
    students: 450,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Mathematics",
    description: "Department of Pure and Applied Mathematics",
    head: "Prof. Johnson",
    courses: 18,
    students: 320,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Physics",
    description: "Department of Physics and Astronomy",
    head: "Dr. Wilson",
    courses: 22,
    students: 280,
    createdAt: "2024-01-25",
  },
  {
    id: "4",
    name: "Engineering",
    description: "Department of Mechanical and Electrical Engineering",
    head: "Prof. Brown",
    courses: 30,
    students: 520,
    createdAt: "2024-02-01",
  },
]

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    head: "",
  })

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateDepartment = () => {
    const department: Department = {
      id: Date.now().toString(),
      ...newDepartment,
      courses: 0,
      students: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setDepartments([...departments, department])
    setNewDepartment({ name: "", description: "", head: "" })
    setIsCreateDialogOpen(false)
  }

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter((dept) => dept.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Department Management</h2>
          <p className="text-muted-foreground">Manage academic departments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="Enter department name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-description">Description</Label>
                <Textarea
                  id="dept-description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  placeholder="Enter department description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-head">Department Head</Label>
                <Input
                  id="dept-head"
                  value={newDepartment.head}
                  onChange={(e) => setNewDepartment({ ...newDepartment, head: e.target.value })}
                  placeholder="Enter department head name"
                />
              </div>
              <Button onClick={handleCreateDepartment} className="w-full">
                Create Department
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Building className="mr-2 h-5 w-5" />
                {dept.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{dept.description}</p>
                <div className="flex justify-between text-sm">
                  <span>Head:</span>
                  <span className="font-medium">{dept.head}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Courses:</span>
                  <span className="font-medium">{dept.courses}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Students:</span>
                  <span className="font-medium">{dept.students}</span>
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
              placeholder="Search departments..."
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
                <TableHead>Name</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.head}</TableCell>
                  <TableCell>{dept.courses}</TableCell>
                  <TableCell>{dept.students}</TableCell>
                  <TableCell>{dept.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteDepartment(dept.id)}>
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
