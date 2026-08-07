import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo branch
  const branch = await prisma.branch.upsert({
    where: { id: "branch-main" },
    update: {},
    create: {
      id: "branch-main",
      name: "Main Campus",
      address: "123 Education Street, Karachi",
      phone: "+92-21-1234567",
      email: "main@school.edu",
    },
  });

  // Hash password helper
  const pw = (raw: string) => bcrypt.hash(raw, 10);

  // Create all role accounts
  const users = [
    { id: "u-head",    email: "superadmin@lms.com",   name: "Dr. Tariq Ahmed",    role: "HEAD_ADMIN", pass: "admin123",   permissions: "[]" },
    { id: "u-admin",   email: "admin@lms.com",         name: "Mrs. Sara Khan",     role: "ADMIN",      pass: "admin123",   permissions: '["MANAGE_USERS","MANAGE_FEES","VIEW_FINANCE","MANAGE_LEAVES"]' },
    { id: "u-hod",     email: "hod@lms.com",           name: "Prof. Ali Hassan",   role: "HOD",        pass: "employee123", permissions: '["MANAGE_COURSES","MANAGE_EXAMS"]' },
    { id: "u-employee", email: "employee@lms.com",        name: "Mr. Usman Malik",   role: "TEACHING_STAFF",    pass: "employee123", permissions: '["MANAGE_GRADES","MANAGE_EXAMS"]' },
    { id: "u-student", email: "student@lms.com",        name: "Ahmed Raza",        role: "STUDENT",    pass: "student123", permissions: "[]" },
    { id: "u-parent",  email: "parent@lms.com",         name: "Mr. Raza Sr.",      role: "PARENT",     pass: "parent123",  permissions: "[]" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        password: await pw(u.pass),
        permissions: u.permissions,
        branchId: branch.id,
        joinedAt: new Date(),
      },
    });
    console.log(`  ✓ ${u.role}: ${u.email}`);
  }

  // Link parent to student
  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: "u-parent", studentId: "u-student" } },
    update: {},
    create: { parentId: "u-parent", studentId: "u-student", relationship: "FATHER" },
  });
  console.log("  ✓ Parent linked to student");

  // Create Academic Year
  const ay = await prisma.academicYear.upsert({
    where: { id: "ay-2025" },
    update: {},
    create: {
      id: "ay-2025",
      branchId: branch.id,
      name: "2024-2025",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-06-30"),
      isCurrent: true,
    },
  });

  // Department
  const dept = await prisma.department.upsert({
    where: { id: "dept-sci" },
    update: {},
    create: { id: "dept-sci", branchId: branch.id, name: "Science", hodId: "u-hod" },
  });

  // Course
  const course = await prisma.course.upsert({
    where: { id: "crs-math" },
    update: {},
    create: {
      id: "crs-math",
      name: "Mathematics",
      code: "MATH-101",
      departmentId: dept.id,
      creditHours: 4,
      totalMarks: 100,
    },
  });

  // Class & Section
  const cls = await prisma.class.upsert({
    where: { id: "cls-9" },
    update: {},
    create: { id: "cls-9", branchId: branch.id, academicYearId: ay.id, departmentId: dept.id, name: "Grade 9" },
  });

  const section = await prisma.section.upsert({
    where: { id: "sec-9a" },
    update: {},
    create: { id: "sec-9a", classId: cls.id, name: "A", capacity: 30 },
  });

  // Enroll student
  await prisma.sectionEnrollment.upsert({
    where: { studentId_sectionId: { studentId: "u-student", sectionId: section.id } },
    update: {},
    create: { studentId: "u-student", sectionId: section.id, rollNo: "2025-001" },
  });

  // Assign employee
  await prisma.classTeacher.upsert({
    where: { sectionId_teacherId_courseId: { sectionId: section.id, teacherId: "u-employee", courseId: course.id } },
    update: {},
    create: { sectionId: section.id, teacherId: "u-employee", courseId: course.id, isClassTeacher: true },
  });

  // Fee category
  const feeCat = await prisma.feeCategory.upsert({
    where: { id: "fc-tuition" },
    update: {},
    create: { id: "fc-tuition", branchId: branch.id, name: "Tuition Fee", isRecurring: true, frequency: "MONTHLY" },
  });

  // Late fee rule
  await prisma.lateFeeRule.upsert({
    where: { id: "lfr-default" },
    update: {},
    create: { id: "lfr-default", graceDays: 7, penaltyType: "FLAT", penaltyValue: 100, maxPenalty: 500 },
  });

  // Create a demo invoice for the student
  const inv = await prisma.feeVoucher.upsert({
    where: { challanId: "INV-2501-DEMO" },
    update: {},
    create: {
      studentId: "u-student",
      challanId: "INV-2501-DEMO",
      dueDate: new Date("2025-02-10"),
      totalAmount: 5000,
      discountAmount: 0,
      netAmount: 5000,
      status: "UNPAID",
    },
  });

  // Demo exam + result
  const exam = await prisma.exam.upsert({
    where: { id: "exam-mid-1" },
    update: {},
    create: {
      id: "exam-mid-1",
      sectionId: section.id,
      courseId: course.id,
      createdById: "u-employee",
      title: "Mid-Term Exam 1",
      type: "MID_TERM",
      totalMarks: 100,
      passingMarks: 40,
      date: new Date("2025-01-15"),
    },
  });

  await prisma.testResult.upsert({
    where: { studentId_examId: { studentId: "u-student", examId: exam.id } },
    update: {},
    create: {
      studentId: "u-student",
      examId: exam.id,
      courseId: course.id,
      marksObtained: 82,
      percentage: 82,
      grade: "A",
      gradedById: "u-employee",
    },
  });

  try {
    await prisma.announcement.create({
      data: {
        id: "ann-welcome",
        authorId: "u-head",
        title: "Welcome to EduERP Portal",
        body: "All students and staff now have access to the new unified management portal. Please log in and explore your personalized dashboard.",
        audience: "ALL",
        pinned: true,
      },
    });
  } catch { /* already exists */ }



  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Demo login credentials:");
  console.log("   HEAD_ADMIN → superadmin@lms.com / admin123");
  console.log("   ADMIN      → admin@lms.com / admin123");
  console.log("   HOD        → hod@lms.com / employee123");
  console.log("   TEACHING_STAFF    → employee@lms.com / employee123");
  console.log("   STUDENT    → student@lms.com / student123");
  console.log("   PARENT     → parent@lms.com / parent123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
