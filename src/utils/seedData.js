export const initialSeedData = {
  users: [
    {
      id: 'admin_1',
      uid: 'admin_uid_001',
      name: 'Dr. Sarah Connor (Admin)',
      email: 'admin@university.edu',
      role: 'admin',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'teacher_1',
      uid: 'teacher_uid_001',
      name: 'Prof. Alan Turing',
      email: 'turing@university.edu',
      role: 'teacher',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'teacher_2',
      uid: 'teacher_uid_002',
      name: 'Dr. Ada Lovelace',
      email: 'lovelace@university.edu',
      role: 'teacher',
      status: 'Active',
      createdAt: new Date().toISOString()
    }
  ],
  faculties: [
    {
      id: 'fac_1',
      name: 'Faculty of Information Technology',
      description: 'Department of CS, SE, and Cyber Security',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fac_2',
      name: 'Faculty of Health Sciences',
      description: 'Medicine, Nursing, and Public Health',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fac_3',
      name: 'Faculty of Engineering',
      description: 'Electrical, Mechanical, and Civil Engineering',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fac_4',
      name: 'Faculty of Business',
      description: 'Accounting, Management, and Marketing',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  departments: [
    {
      id: 'dept_1',
      facultyId: 'fac_1',
      name: 'Computer Science',
      description: 'Algorithms, Software Engineering, and AI',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'dept_2',
      facultyId: 'fac_1',
      name: 'Information Technology',
      description: 'Networking, Systems, and Cloud',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'dept_3',
      facultyId: 'fac_2',
      name: 'General Medicine',
      description: 'Clinical Medicine and Surgery',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'dept_4',
      facultyId: 'fac_3',
      name: 'Electrical Engineering',
      description: 'Electronics, Power Systems, and Telecommunications',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  courses: [
    {
      id: 'course_1',
      facultyId: 'fac_1',
      departmentId: 'dept_1',
      courseCode: 'CS101',
      courseName: 'Introduction to Programming & Algorithms',
      creditHours: 4,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'course_2',
      facultyId: 'fac_1',
      departmentId: 'dept_1',
      courseCode: 'CS302',
      courseName: 'Database Management Systems',
      creditHours: 3,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'course_3',
      facultyId: 'fac_1',
      departmentId: 'dept_2',
      courseCode: 'IT204',
      courseName: 'Network Security & Firewalls',
      creditHours: 3,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'course_4',
      facultyId: 'fac_2',
      departmentId: 'dept_3',
      courseCode: 'MED102',
      courseName: 'Human Anatomy & Physiology',
      creditHours: 5,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  teachers: [
    {
      id: 'teacher_1',
      userId: 'teacher_uid_001',
      employeeId: 'EMP-1001',
      name: 'Prof. Alan Turing',
      email: 'turing@university.edu',
      phone: '+1 (555) 019-2834',
      facultyId: 'fac_1',
      departmentId: 'dept_1',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'teacher_2',
      userId: 'teacher_uid_002',
      employeeId: 'EMP-1002',
      name: 'Dr. Ada Lovelace',
      email: 'lovelace@university.edu',
      phone: '+1 (555) 018-9921',
      facultyId: 'fac_1',
      departmentId: 'dept_1',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  exams: [
    {
      id: 'exam_1',
      title: 'CS101 Midterm Examination 2026',
      courseId: 'course_1',
      teacherId: 'teacher_1',
      examType: 'Midterm',
      totalMarks: 100,
      date: '2026-08-15',
      duration: '120 min',
      status: 'Scheduled',
      description: 'Midterm assessment covering chapters 1 through 5.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'exam_2',
      title: 'CS302 Database Systems Final Exam',
      courseId: 'course_2',
      teacherId: 'teacher_2',
      examType: 'Final',
      totalMarks: 100,
      date: '2026-09-01',
      duration: '180 min',
      status: 'Completed',
      description: 'Comprehensive exam on relational algebra and SQL optimization.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  examSchedules: [
    {
      id: 'sched_1',
      examId: 'exam_1',
      courseId: 'course_1',
      teacherId: 'teacher_1',
      room: 'Hall A - Building 3',
      date: '2026-08-15',
      startTime: '09:00',
      endTime: '11:00',
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  results: [
    {
      id: 'res_1',
      examId: 'exam_2',
      courseId: 'course_2',
      teacherId: 'teacher_2',
      totalMarks: 100,
      obtainedMarks: 88,
      grade: 'A',
      status: 'Published',
      date: '2026-09-02',
      notes: 'Overall class average 88%. Excellent performance in SQL optimization section.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};
