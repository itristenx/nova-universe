-- Add XP events and leaderboard tables

CREATE TABLE "xp_events" (
  "id" SERIAL NOT NULL,
  "user_id" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "leaderboard" (
  "user_id" TEXT NOT NULL PRIMARY KEY,
  "xp_total" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
