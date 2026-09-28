export interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  program: "CPE" | "ISNE";
  status: "Active" | "Inactive";
  enrolledCourses: string[];
}

export interface Course {
  courseCode: string;
  courseTitle: string;
  instructors?: string[];
}
