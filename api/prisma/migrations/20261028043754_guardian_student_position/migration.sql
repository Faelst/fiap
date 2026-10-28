-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuardianStudent" (
    "guardianId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("guardianId", "studentId"),
    CONSTRAINT "GuardianStudent_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuardianStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GuardianStudent" ("guardianId", "studentId") SELECT "guardianId", "studentId" FROM "GuardianStudent";
DROP TABLE "GuardianStudent";
ALTER TABLE "new_GuardianStudent" RENAME TO "GuardianStudent";
CREATE INDEX "GuardianStudent_studentId_idx" ON "GuardianStudent"("studentId");

-- Bancos já populados (dev.db, volume do Docker): o seed não roda de novo, então
-- os vínculos existentes são numerados por rm dentro de cada responsável, que no
-- JSON oficial é a mesma ordem da lista. Banco novo: tabela vazia, o seed grava.
UPDATE "GuardianStudent" SET "position" = (
    SELECT COUNT(*) FROM "GuardianStudent" AS "other"
    JOIN "Student" AS "otherStudent" ON "otherStudent"."id" = "other"."studentId"
    WHERE "other"."guardianId" = "GuardianStudent"."guardianId"
      AND "otherStudent"."rm" < (
          SELECT "rm" FROM "Student" WHERE "id" = "GuardianStudent"."studentId"
      )
);
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
