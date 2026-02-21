import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a professional nutrition-aware meal recommendation engine. Generate personalized meal suggestions based on the user's inputs.

STRICT RULES:
- Salads are NEVER the main dish. They may only appear as optional sides.
- All meals must be FULLY COOKED dishes (curries, rice plates, pasta, bowls, wraps, grills, baked dishes, stews, etc.).
- NO fusion cuisines. Each dish must belong to exactly ONE cuisine from the user's selection.
- NO raw-food-only meals.
- Meals must be appropriate for the selected meal-time category:
  * Breakfast: light, energizing (porridges, egg dishes, dosas, pancakes, breakfast bowls). NO heavy curries or large rice portions.
  * Elevenses: very small portions, low calorie, lightly cooked snacks (steamed, baked, lightly sautéed). NO full meals, NO heavy carbs.
  * Brunch: hybrid breakfast+lunch, medium portions, protein+carbs balance, MUST feel distinct from both breakfast and lunch dishes.
  * Lunch: balanced and filling, proper carbs+protein+veg, main cooked dishes only.
  * Snack: small but satisfying, savory or mildly sweet. NO full meals, NO heavy gravies.
  * Dinner: heavier and more indulgent than lunch, DISTINCT from lunch dishes. NO breakfast-style or snack-style dishes.
- Never repeat dishes across categories.
- Pick dishes that a real chef would proudly serve.

OUTPUT FORMAT — respond ONLY with valid JSON, zero markdown, zero explanation:
{
  "meals": [
    {
      "name": "Exact Dish Name",
      "cuisine": "Single Cuisine Name",
      "calories": 450,
      "calorie_range": "420–480 kcal",
      "why_mood": "One sentence: why this suits the user's stated mood",
      "why_mealtime": "One sentence: why this fits the meal-time category",
      "why_dietary": "One sentence: how it meets the dietary requirements",
      "optional_sides": ["Optional side dish 1", "Optional side dish 2"],
      "emoji": "🍛",
      "cook_time": "25 min"
    }
  ]
}

Generate exactly 4 meal options. Be specific with dish names. Calories must realistically match meal-time (e.g., Elevenses: 80–200 kcal, Snack: 150–350 kcal, Breakfast: 300–500 kcal, Lunch/Dinner: proportional to daily target).`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { mealTime, mood, dietary, calories, cuisines } = body;

    if (!mealTime || !mood || !cuisines?.length || !dietary?.length) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const userPrompt = `
Meal Time Category: ${mealTime}
User Mood: ${mood}
Dietary Requirements: ${dietary.join(", ")}
Daily Calorie Target: ${calories} kcal (scale meal portion to the meal-time appropriately)
Selected Cuisines: ${cuisines.join(", ")}

Generate 4 meal recommendations strictly following all system rules.`;

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = message.content.map((b) => b.text || "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Meal API error:", err);
    return NextResponse.json({ error: "Failed to generate meals. Please try again." }, { status: 500 });
  }
}
