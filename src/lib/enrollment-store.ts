import { create } from "zustand";
import { persist } from "zustand/middleware";
import { students, courses } from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  addCourse: (course: Course) => boolean;
  removeCourse: (courseCode: string) => void;
  removeInstructor: (courseCode: string, instructor: string) => void;
  enrollStudents: (courseCode: string, studentIds: string[]) => void;
  dropStudent: (courseCode: string, studentId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist((set, get) => ({
    students,
    courses,
    addCourse: (course) => {
      const courseCode = course.courseCode.trim().toUpperCase();
      if (!courseCode || !course.courseTitle.trim() || get().courses.some(c => c.courseCode.toUpperCase() === courseCode)) return false;
      set(state => ({ courses: [...state.courses, {
        courseCode,
        courseTitle: course.courseTitle.trim(),
        instructors: [...new Set((course.instructors ?? []).map(name => name.trim()).filter(Boolean))],
      }] }));
      return true;
    },
    removeCourse: (courseCode) => set(state => ({
      courses: state.courses.filter(c => c.courseCode !== courseCode),
      students: state.students.map(s => ({ ...s, enrolledCourses: s.enrolledCourses.filter(code => code !== courseCode) })),
    })),
    removeInstructor: (courseCode, instructor) => set(state => ({
      courses: state.courses.map(c => c.courseCode === courseCode ? { ...c, instructors: (c.instructors ?? []).filter(name => name !== instructor) } : c),
    })),
    enrollStudents: (courseCode, studentIds) => set(state => {
      if (!state.courses.some(c => c.courseCode === courseCode)) return state;
      return { students: state.students.map(s => studentIds.includes(s.studentId) && !s.enrolledCourses.includes(courseCode)
        ? { ...s, enrolledCourses: [...s.enrolledCourses, courseCode] } : s) };
    }),
    dropStudent: (courseCode, studentId) => set(state => ({
      students: state.students.map(s => s.studentId === studentId ? { ...s, enrolledCourses: s.enrolledCourses.filter(code => code !== courseCode) } : s),
    })),
  }), {
    name: "lab16-2569-680610725",
    partialize: (state) => ({ students: state.students, courses: state.courses }),
  }),
);
