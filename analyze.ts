import { Request, Response } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { AnalyzeFoodBody } from "@workspace/api-zod";

export async function analyzeFood(req: Request, res: Response) {
  const parseResult = AnalyzeFoodBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body", details: parseResult.error });
    return;
  }

  const { imageBase64, mimeType, goal } = parseResult.data;

  const goalContext = goal === "weight_loss"
    ? "The user is trying to lose weight. Suggest lower calorie alternatives or portion control."
    : goal === "weight_gain"
    ? "The user is trying to gain weight. Suggest protein-rich additions or larger portions."
    : "The user wants a balanced diet. Suggest balanced nutrition tips.";

  const prompt = `You are a nutrition expert specializing in Indian and global cuisine. Analyze this food image and provide detailed nutritional information.

Respond ONLY with valid JSON in this exact format:
{
  "foodName": "Name of the food dish",
  "calories": <integer calories per typical serving>,
  "confidence": <float 0-1 representing how confident you are>,
  "protein": <float grams of protein>,
  "carbs": <float grams of carbohydrates>,
  "fat": <float grams of fat>,
  "suggestion": "A brief 1-sentence tip based on the user's goal"
}

${goalContext}

If you cannot identify food in the image, respond with:
{"foodName":"Unknown Food","calories":0,"confidence":0,"protein":0,"carbs":0,"fat":0,"suggestion":"Could not identify food. Please try a clearer image."}

Important: Only respond with JSON, no other text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: { maxOutputTokens: 8192 },
    });

    const text = response.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to analyze food image");
    res.status(500).json({ error: "Failed to analyze food image" });
  }
}
