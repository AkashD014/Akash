import { pgTable, text, integer, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const foodEntriesTable = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  foodName: text("food_name").notNull(),
  calories: integer("calories").notNull(),
  confidence: real("confidence"),
  protein: real("protein"),
  carbs: real("carbs"),
  fat: real("fat"),
  goal: text("goal"),
  imageBase64: text("image_base64"),
  loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertFoodEntrySchema = createInsertSchema(foodEntriesTable).omit({ id: true, loggedAt: true });
export type InsertFoodEntry = z.infer<typeof insertFoodEntrySchema>;
export type FoodEntry = typeof foodEntriesTable.$inferSelect;
