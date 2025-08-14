# Student Management System

A comprehensive web application for managing student results, course feedback, and academic administration with role-based access control.

## 🚀 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **React Server Components** - Server-side rendering
- **Local Storage** - Client-side data persistence (development)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📁 Project Structure

\`\`\`
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin dashboard pages
│   │   ├── feedback/            # Admin feedback management
│   │   ├── results/             # Admin results management
│   │   └── page.tsx             # Main admin dashboard
│   ├── lecturer/                # Lecturer dashboard pages
│   │   └── page.tsx             # Main lecturer dashboard
│   ├── student/                 # Student dashboard pages
│   │   ├── feedback/            # Student feedback submission
│   │   └── page.tsx             # Main student dashboard
│   ├── login/                   # Authentication pages
│   │   └── page.tsx             # Login page
│   ├── layout.tsx               # Root layout component
│   ├── globals.css              # Global styles
│   └── page.tsx                 # Landing page
├── components/                   # Reusable React components
│   ├── admin/                   # Admin-specific components
│   │   ├── admin-dashboard.tsx  # Admin dashboard layout
│   │   ├── user-management.tsx  # User CRUD operations
│   │   ├── department-management.tsx # Department management
│   │   └── course-management.tsx # Course management
│   ├── lecturer/                # Lecturer-specific components
│   │   ├── lecturer-dashboard.tsx # Lecturer dashboard layout
│   │   ├── lecturer-courses.tsx # Course management for lecturers
│   │   ├── lecturer-feedback-dashboard.tsx # Feedback analytics
│   │   └── lecturer-results-upload.tsx # Results upload interface
│   ├── student/                 # Student-specific components
│   │   ├── student-dashboard.tsx # Student dashboard layout
│   │   ├── student-results.tsx  # Results viewing interface
│   │   └── student-transcript.tsx # Transcript generation
│   ├── results/                 # Results management components
│   │   ├── results-management.tsx # Results overview
│   │   ├── results-upload.tsx   # Manual results upload
│   │   └── gpa-calculator.tsx   # GPA/CGPA calculations
│   ├── feedback/                # Feedback system components
│   │   ├── feedback-submission.tsx # Student feedback form
│   │   └── feedback-management.tsx # Admin feedback management
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard-layout.tsx     # Common dashboard layout
│   └── login-form.tsx           # Authentication form
├── hooks/                       # Custom React hooks
│   └── use-auth.tsx             # Authentication hook
└── lib/                         # Utility functions
    └── utils.ts                 # Common utilities
\`\`\`

## 👥 User Roles & Permissions

### Admin
- **User Management**: Create, view, edit, and delete users (students, lecturers, admins)
- **Department Management**: Manage academic departments
- **Course Management**: Create and assign courses to departments
- **Results Management**: View and manage all student results
- **Feedback Management**: View all course feedback and analytics
- **System Overview**: Access to system-wide statistics and reports

### Lecturer
- **Course Management**: View assigned courses and student lists
- **Results Upload**: Upload student results (manual form or CSV bulk import)
- **Feedback Analytics**: View course feedback with sentiment analysis
- **Performance Tracking**: Monitor course performance and student progress

### Student
- **Results Viewing**: Access personal academic results by semester
- **GPA/CGPA Tracking**: View calculated grade point averages
- **Feedback Submission**: Submit anonymous course and lecturer feedback
- **Transcript Generation**: Download academic transcripts and reports

## 🗄️ Data Structure

### Users
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lecturer' | 'student';
  department?: string;
  studentId?: string;
  createdAt: string;
}
\`\`\`

### Departments
\`\`\`typescript
interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}
\`\`\`

### Courses
\`\`\`typescript
interface Course {
  id: string;
  title: string;
  code: string;
  unit: number;
  departmentId: string;
  lecturerId: string;
  semester: string;
  session: string;
}
\`\`\`

### Results
\`\`\`typescript
interface Result {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  grade: string;
  semester: string;
  session: string;
  createdAt: string;
}
\`\`\`

### Feedback
\`\`\`typescript
interface Feedback {
  id: string;
  studentId: string;
  courseId: string;
  lecturerId: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}
\`\`\`

## ✨ Key Features

### 🔐 Authentication System
- Role-based access control
- Secure login/logout functionality
- Protected routes for each user type
- Session management with local storage

### 📊 Results Management
- Manual result entry with automatic grade calculation
- CSV bulk import for efficient data entry
- GPA/CGPA calculation per semester and cumulative
- Grade point system (A=5, B=4, C=3, D=2, F=0)
- Results filtering and search functionality

### 📝 Feedback System
- Anonymous course and lecturer evaluation
- 5-star rating system with comments
- Basic sentiment analysis using keyword matching
- Feedback analytics and reporting
- Sentiment classification (positive/neutral/negative)

### 📈 Dashboard Analytics
- Role-specific dashboard views
- Real-time statistics and metrics
- Performance tracking and trends
- Visual data representation with charts

### 📄 Report Generation
- Student transcript generation
- Semester-wise result breakdown
- Academic progress tracking
- Downloadable reports (future enhancement)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials
\`\`\`
Admin:
Email: admin@university.edu
Password: admin123

Lecturer:
Email: lecturer@university.edu  
Password: lecturer123

Student:
Email: student@university.edu
Password: student123
\`\`\`

## 🔮 Future Enhancements

### Database Integration
- Replace mock data with real database (Supabase/PostgreSQL)
- Implement proper data persistence
- Add data validation and constraints

### Advanced Features
- Email notifications for results and feedback
- Advanced analytics and reporting
- Mobile responsive design improvements
- PDF transcript generation
- Bulk operations for admin tasks

### Security Enhancements
- JWT token authentication
- Password encryption
- Rate limiting
- Input sanitization
- CSRF protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
