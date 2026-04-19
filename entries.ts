import { Request, Response } from "express";
import { db, foodEntriesTable } from "@workspace/db";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { CreateFoodEntryBody, GetFoodEntriesQueryParams, DeleteFoodEntryParams } from "@workspace/api-zod";

export async function getFoodEntries(req: Request, res: Response) {
  const parseResult = GetFoodEntriesQueryParams.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid query params", details: parseResult.error });
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
      )
      .orderBy(desc(foodEntriesTable.loggedAt));

    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

    res.json({ entries, totalCalories });
  } catch (err) {
    req.log.error({ err }, "Failed to get food entries");
    res.status(500).json({ error: "Failed to get food entries" });
  }
}

export async function createFoodEntry(req: Request, res: Response) {
  const parseResult = CreateFoodEntryBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body", details: parseResult.error });
    return;
  }

  try {
    const [entry] = await db
      .insert(foodEntriesTable)
      .values({
        userId: parseResult.data.userId,
        foodName: parseResult.data.foodName,
        calories: parseResult.data.calories,
        confidence: parseResult.data.confidence,
        protein: parseResult.data.protein,
        carbs: parseResult.data.carbs,
        fat: parseResult.data.fat,
        goal: parseResult.data.goal,
        imageBase64: parseResult.data.imageBase64,
      })
      .returning();

    res.status(201).json(entry);
  } catch (err) {
    req.log.error({ err }, "Failed to create food entry");
    res.status(500).json({ error: "Failed to create food entry" });
  }
}

export async function deleteFoodEntry(req: Request, res: Response) {
  const parseResult = DeleteFoodEntryParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  try {
    await db.delete(foodEntriesTable).where(eq(foodEntriesTable.id, parseResult.data.id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete food entry");
    res.status(500).json({ error: "Failed to delete food entry" });
  }
}
