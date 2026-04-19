import { Request, Response } from "express";
import { db, foodEntriesTable } from "@workspace/db";
import { eq, and, gte, lt } from "drizzle-orm";
import { GetDailySummaryQueryParams } from "@workspace/api-zod";

export async function getDailySummary(req: Request, res: Response) {
  const parseResult = GetDailySummaryQueryParams.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const { userId, date } = parseResult.data;
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const entries = await db
      .select()
      .from(foodEntriesTable)
      .where(
        and(
          eq(foodEntriesTable.userId, userId),
          gte(foodEntriesTable.loggedAt, startOfDay),
          lt(foodEntriesTable.loggedAt, endOfDay),
        ),
      );

    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const lastGoal = entries.find((e) => e.goal)?.goal ?? undefined;

    res.json({
      date: targetDate.toISOString().split("T")[0],
      totalCalories,
      entryCount: entries.length,
      goal: lastGoal,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get daily summary");
    res.status(500).json({ error: "Failed to get daily summary" });
  }
}
