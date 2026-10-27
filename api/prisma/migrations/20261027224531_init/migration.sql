-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rm" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "period" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GuardianStudent" (
    "guardianId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    PRIMARY KEY ("guardianId", "studentId"),
    CONSTRAINT "GuardianStudent_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuardianStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgendaDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    CONSTRAINT "AgendaDay_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agendaDayId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Lesson_agendaDayId_fkey" FOREIGN KEY ("agendaDayId") REFERENCES "AgendaDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "className" TEXT NOT NULL,
    CONSTRAINT "ReportCard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TermResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportCardId" TEXT NOT NULL,
    "term" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" REAL,
    "absences" INTEGER,
    "order" INTEGER NOT NULL,
    CONSTRAINT "TermResult_reportCardId_fkey" FOREIGN KEY ("reportCardId") REFERENCES "ReportCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_cpf_key" ON "Guardian"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_email_key" ON "Guardian"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rm_key" ON "Student"("rm");

-- CreateIndex
CREATE INDEX "GuardianStudent_studentId_idx" ON "GuardianStudent"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "AgendaDay_studentId_date_key" ON "AgendaDay"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_agendaDayId_order_key" ON "Lesson"("agendaDayId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ReportCard_studentId_year_key" ON "ReportCard"("studentId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "TermResult_reportCardId_term_order_key" ON "TermResult"("reportCardId", "term", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TermResult_reportCardId_term_subject_key" ON "TermResult"("reportCardId", "term", "subject");

