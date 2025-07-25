-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_admin_pins" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "globalPin" TEXT,
    "kioskPins" JSONB,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_admin_pins" ("globalPin", "id", "kioskPins", "updatedAt") SELECT "globalPin", "id", "kioskPins", "updatedAt" FROM "admin_pins";
DROP TABLE "admin_pins";
ALTER TABLE "new_admin_pins" RENAME TO "admin_pins";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Create support_tickets table
CREATE TABLE "support_tickets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "assigneeId" TEXT,
    FOREIGN KEY ("userId") REFERENCES "users" ("id"),
    FOREIGN KEY ("assigneeId") REFERENCES "users" ("id")
);

-- Create knowledge_base_articles table
CREATE TABLE "knowledge_base_articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
