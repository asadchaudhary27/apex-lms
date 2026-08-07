
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.BranchScalarFieldEnum = {
  id: 'id',
  name: 'name',
  address: 'address',
  currency: 'currency',
  timezone: 'timezone',
  phone: 'phone',
  email: 'email',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'role',
  permissions: 'permissions',
  avatarUrl: 'avatarUrl',
  phone: 'phone',
  cnic: 'cnic',
  address: 'address',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  bloodGroup: 'bloodGroup',
  religion: 'religion',
  nationality: 'nationality',
  guardianName: 'guardianName',
  guardianPhone: 'guardianPhone',
  guardianCnic: 'guardianCnic',
  guardianRelation: 'guardianRelation',
  permanentAddress: 'permanentAddress',
  presentAddress: 'presentAddress',
  city: 'city',
  district: 'district',
  hostelResident: 'hostelResident',
  designation: 'designation',
  bio: 'bio',
  education: 'education',
  emergencyName: 'emergencyName',
  emergencyPhone: 'emergencyPhone',
  rollNumber: 'rollNumber',
  baseSalary: 'baseSalary',
  hourlyRate: 'hourlyRate',
  overtimeHours: 'overtimeHours',
  employmentType: 'employmentType',
  themePreference: 'themePreference',
  joinedAt: 'joinedAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ParentStudentScalarFieldEnum = {
  id: 'id',
  parentId: 'parentId',
  studentId: 'studentId',
  relationship: 'relationship'
};

exports.Prisma.AcademicYearScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  isCurrent: 'isCurrent',
  createdAt: 'createdAt'
};

exports.Prisma.SemesterScalarFieldEnum = {
  id: 'id',
  academicYearId: 'academicYearId',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  name: 'name',
  hodId: 'hodId'
};

exports.Prisma.ClassScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  academicYearId: 'academicYearId',
  departmentId: 'departmentId',
  name: 'name',
  createdAt: 'createdAt'
};

exports.Prisma.SectionScalarFieldEnum = {
  id: 'id',
  classId: 'classId',
  name: 'name',
  capacity: 'capacity',
  createdAt: 'createdAt'
};

exports.Prisma.ClassTeacherScalarFieldEnum = {
  id: 'id',
  sectionId: 'sectionId',
  teacherId: 'teacherId',
  courseId: 'courseId',
  isClassTeacher: 'isClassTeacher',
  createdAt: 'createdAt'
};

exports.Prisma.SectionEnrollmentScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  sectionId: 'sectionId',
  rollNo: 'rollNo',
  status: 'status',
  joinedAt: 'joinedAt',
  leftAt: 'leftAt'
};

exports.Prisma.CourseScalarFieldEnum = {
  id: 'id',
  departmentId: 'departmentId',
  name: 'name',
  code: 'code',
  description: 'description',
  creditHours: 'creditHours',
  totalMarks: 'totalMarks',
  createdAt: 'createdAt'
};

exports.Prisma.TimetableScalarFieldEnum = {
  id: 'id',
  sectionId: 'sectionId',
  courseId: 'courseId',
  teacherId: 'teacherId',
  dayOfWeek: 'dayOfWeek',
  startTime: 'startTime',
  endTime: 'endTime',
  roomNumber: 'roomNumber',
  createdAt: 'createdAt'
};

exports.Prisma.DateSheetScalarFieldEnum = {
  id: 'id',
  sectionId: 'sectionId',
  examId: 'examId',
  scheduledAt: 'scheduledAt',
  venue: 'venue',
  instructions: 'instructions',
  createdAt: 'createdAt'
};

exports.Prisma.ExamScalarFieldEnum = {
  id: 'id',
  sectionId: 'sectionId',
  courseId: 'courseId',
  createdById: 'createdById',
  title: 'title',
  type: 'type',
  totalMarks: 'totalMarks',
  passingMarks: 'passingMarks',
  date: 'date',
  venue: 'venue',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TestResultScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  examId: 'examId',
  courseId: 'courseId',
  marksObtained: 'marksObtained',
  percentage: 'percentage',
  grade: 'grade',
  remarks: 'remarks',
  gradedById: 'gradedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GradebookScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  semesterId: 'semesterId',
  gpa: 'gpa',
  percentage: 'percentage',
  rank: 'rank',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BehaviorLogScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  teacherId: 'teacherId',
  type: 'type',
  description: 'description',
  date: 'date'
};

exports.Prisma.FeeCategoryScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  name: 'name',
  description: 'description',
  isRecurring: 'isRecurring',
  frequency: 'frequency',
  createdAt: 'createdAt'
};

exports.Prisma.FeeStructureScalarFieldEnum = {
  id: 'id',
  classId: 'classId',
  feeCategoryId: 'feeCategoryId',
  amount: 'amount',
  createdAt: 'createdAt'
};

exports.Prisma.BillingPlanScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  type: 'type',
  description: 'description',
  discountPct: 'discountPct',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeeVoucherScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  semesterId: 'semesterId',
  challanId: 'challanId',
  issueDate: 'issueDate',
  dueDate: 'dueDate',
  validityDate: 'validityDate',
  totalAmount: 'totalAmount',
  arrears: 'arrears',
  discountAmount: 'discountAmount',
  penaltyAmount: 'penaltyAmount',
  netAmount: 'netAmount',
  status: 'status',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  userId: 'userId'
};

exports.Prisma.VoucherLineItemScalarFieldEnum = {
  id: 'id',
  feeVoucherId: 'feeVoucherId',
  feeCategoryId: 'feeCategoryId',
  description: 'description',
  amount: 'amount'
};

exports.Prisma.InstitutionalExpenseScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  category: 'category',
  description: 'description',
  date: 'date',
  recordedById: 'recordedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  feeVoucherId: 'feeVoucherId',
  invoiceId: 'invoiceId',
  studentId: 'studentId',
  amount: 'amount',
  method: 'method',
  reference: 'reference',
  receiptNo: 'receiptNo',
  notes: 'notes',
  recordedById: 'recordedById',
  paidAt: 'paidAt',
  createdAt: 'createdAt'
};

exports.Prisma.ConcessionScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  type: 'type',
  value: 'value',
  reason: 'reason',
  validFrom: 'validFrom',
  validTo: 'validTo',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.LateFeeRuleScalarFieldEnum = {
  id: 'id',
  feeCategoryId: 'feeCategoryId',
  graceDays: 'graceDays',
  penaltyType: 'penaltyType',
  penaltyValue: 'penaltyValue',
  maxPenalty: 'maxPenalty',
  createdAt: 'createdAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  userId: 'userId',
  feeVoucherId: 'feeVoucherId',
  amount: 'amount',
  type: 'type',
  status: 'status',
  dueDate: 'dueDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeacherSubjectRateScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  courseId: 'courseId',
  amount: 'amount',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeePayrollScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  month: 'month',
  year: 'year',
  baseSalary: 'baseSalary',
  hourlyRate: 'hourlyRate',
  overtimeHours: 'overtimeHours',
  subjectAllowances: 'subjectAllowances',
  deductions: 'deductions',
  netAmount: 'netAmount',
  status: 'status',
  notes: 'notes',
  approvedById: 'approvedById',
  disbursedAt: 'disbursedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayrollItemScalarFieldEnum = {
  id: 'id',
  employeePayrollId: 'employeePayrollId',
  type: 'type',
  amount: 'amount',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.DeletionRequestScalarFieldEnum = {
  id: 'id',
  requestedById: 'requestedById',
  targetModel: 'targetModel',
  targetId: 'targetId',
  targetLabel: 'targetLabel',
  targetSnapshot: 'targetSnapshot',
  reason: 'reason',
  status: 'status',
  approvedById: 'approvedById',
  approvedAt: 'approvedAt',
  rejectedReason: 'rejectedReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AnnouncementScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  sectionId: 'sectionId',
  authorId: 'authorId',
  title: 'title',
  body: 'body',
  audience: 'audience',
  pinned: 'pinned',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  announcementId: 'announcementId',
  title: 'title',
  message: 'message',
  type: 'type',
  read: 'read',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.BatchScalarFieldEnum = {
  id: 'id',
  courseId: 'courseId',
  instructorId: 'instructorId',
  name: 'name',
  capacity: 'capacity',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EnrollmentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  batchId: 'batchId',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  userId: 'userId',
  courseId: 'courseId',
  sectionId: 'sectionId',
  type: 'type',
  date: 'date',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.LeaveRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  startDate: 'startDate',
  endDate: 'endDate',
  reason: 'reason',
  attachmentUrl: 'attachmentUrl',
  status: 'status',
  approvedById: 'approvedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditTicketScalarFieldEnum = {
  id: 'id',
  actionType: 'actionType',
  entityType: 'entityType',
  entityId: 'entityId',
  originalData: 'originalData',
  proposedData: 'proposedData',
  requestedById: 'requestedById',
  reason: 'reason',
  status: 'status',
  approvedById: 'approvedById',
  approvedAt: 'approvedAt',
  rejectedReason: 'rejectedReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ModuleScalarFieldEnum = {
  id: 'id',
  courseId: 'courseId',
  title: 'title',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LessonScalarFieldEnum = {
  id: 'id',
  moduleId: 'moduleId',
  title: 'title',
  content: 'content',
  videoUrl: 'videoUrl',
  type: 'type',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  lessonId: 'lessonId',
  text: 'text',
  options: 'options',
  answer: 'answer',
  createdAt: 'createdAt'
};

exports.Prisma.ProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  lessonId: 'lessonId',
  completed: 'completed',
  score: 'score',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Branch: 'Branch',
  User: 'User',
  ParentStudent: 'ParentStudent',
  AcademicYear: 'AcademicYear',
  Semester: 'Semester',
  Department: 'Department',
  Class: 'Class',
  Section: 'Section',
  ClassTeacher: 'ClassTeacher',
  SectionEnrollment: 'SectionEnrollment',
  Course: 'Course',
  Timetable: 'Timetable',
  DateSheet: 'DateSheet',
  Exam: 'Exam',
  TestResult: 'TestResult',
  Gradebook: 'Gradebook',
  BehaviorLog: 'BehaviorLog',
  FeeCategory: 'FeeCategory',
  FeeStructure: 'FeeStructure',
  BillingPlan: 'BillingPlan',
  FeeVoucher: 'FeeVoucher',
  VoucherLineItem: 'VoucherLineItem',
  InstitutionalExpense: 'InstitutionalExpense',
  Payment: 'Payment',
  Concession: 'Concession',
  LateFeeRule: 'LateFeeRule',
  Invoice: 'Invoice',
  TeacherSubjectRate: 'TeacherSubjectRate',
  EmployeePayroll: 'EmployeePayroll',
  PayrollItem: 'PayrollItem',
  DeletionRequest: 'DeletionRequest',
  Announcement: 'Announcement',
  Notification: 'Notification',
  Batch: 'Batch',
  Enrollment: 'Enrollment',
  Attendance: 'Attendance',
  LeaveRequest: 'LeaveRequest',
  AuditTicket: 'AuditTicket',
  Module: 'Module',
  Lesson: 'Lesson',
  Question: 'Question',
  Progress: 'Progress'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
