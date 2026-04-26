import { Placement, Student } from "@prisma/client";

export type ScoredPlacement = {
  placement: Placement;
  matchScore: number;
  breakdown: {
    location: number;
    department: number;
    level: number;
    cgpa: number;
  };
};

export class MatchingService {
  static calculate(student: Student, placement: Placement): ScoredPlacement {
    const breakdown = { location: 0, department: 0, level: 0, cgpa: 0 };

    if (placement.isRemote) {
      breakdown.location = 30;
    } else if (student.preferredStates.includes(placement.state)) {
      breakdown.location = 40;
    } else if (student.currentState === placement.state) {
      breakdown.location = 20;
    }

    if (!placement.requiredDepartment) {
      breakdown.department = 15;
    } else if (placement.requiredDepartment.toLowerCase() === student.department.toLowerCase()) {
      breakdown.department = 30;
    }

    const studentLevel = Number.parseInt(student.level, 10);
    if (!Number.isNaN(studentLevel)) {
      breakdown.level = studentLevel >= 300 ? 20 : 10;
    }

    const cgpa = student.cgpa ? Number(student.cgpa) : null;
    if (cgpa && cgpa >= 4.5) breakdown.cgpa = 10;
    else if (cgpa && cgpa >= 3.5) breakdown.cgpa = 6;
    else if (cgpa && cgpa > 0) breakdown.cgpa = 3;

    const matchScore = breakdown.location + breakdown.department + breakdown.level + breakdown.cgpa;
    return { placement, matchScore, breakdown };
  }
}
