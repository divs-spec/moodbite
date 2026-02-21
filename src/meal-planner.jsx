import { useState, useEffect } from "react";

const MOODS = ["Energetic", "Tired", "Stressed", "Comfort-seeking", "Adventurous", "Light & Fresh"];
const MEAL_TIMES = [
  { id: "breakfast", label: "Breakfast", icon: "🌅", time: "7–9 AM", desc: "Light, energizing start" },
  { id: "elevenses", label: "Elevenses", icon: "☕", time: "10–11 AM", desc: "Small mid-morning bite" },
  { id: "brunch", label: "Brunch", icon: "🍳", time: "10 AM–12 PM", desc: "Best of both worlds" },
  { id: "lunch", label: "Lunch", icon: "🍛", time: "12–2 PM", desc: "Balanced & filling" },
  { id: "snack", label: "Snack", icon: "🍪", time: "3–5 PM", desc: "Small but satisfying" },
  { id: "dinner", label: "Dinner", icon: "🍽️", time: "7–9 PM", desc: "Hearty evening meal" },
];
const CUISINES = ["Indian", "Italian", "American", "Chinese", "Korean", "Japanese", "Spanish", "French", "Middle Eastern", "European"];
const DIETARY = ["Non-Vegetarian", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free"];

const SYSTEM_PROMPT = `You are a professional nutrition-aware meal recommendation engine. Generate personalized meal suggestions based on the user's inputs.

STRICT RULES:
- Salads are NEVER the main dish. They may only appear as optional sides.
- All meals must be FULLY COOKED dishes.
- NO fusion cuisines. Each dish must belong to exactly ONE cuisine.
- Meals must be appropriate for the selected meal-time category:
  * Breakfast: light, energizing (porridges, egg dishes, dosas, breakfast bowls). NO heavy curries or large rice portions.
  * Elevenses: very small portions, low calorie, lightly cooked snacks. NO full meals.
  * Brunch: hybrid breakfast+lunch, medium portions, protein+carbs, DISTINCT from breakfast/lunch.
  * Lunch: balanced, filling, proper carbs+protein+veg, main cooked dishes.
  * Snack: small but satisfying, savory or mildly sweet. NO full meals or heavy gravies.
  * Dinner: heavier/more indulgent than lunch, DISTINCT from lunch dishes. NO breakfast/snack-style dishes.

OUTPUT FORMAT (respond ONLY with valid JSON, no markdown, no explanation):
{
  "meals": [
    {
      "name": "Dish Name",
      "cuisine": "Cuisine Name",
      "calories": 450,
      "calorie_range": "400–500 kcal",
      "why_mood": "Explanation of why this fits the mood",
      "why_mealtime": "Why this fits the selected meal time",
      "why_dietary": "How it meets dietary needs",
      "optional_sides": ["Optional side 1", "Optional side 2"],
      "emoji": "🍛"
    }
  ]
}

Generate exactly 4 meal options. Be specific with dish names (e.g., "Chicken Tikka Masala" not "Indian curry"). Calories must realistically match the meal-time and calorie target.`;

export default function MealPlannerApp() {
  const [step, setStep] = useState(1);
  const [mealTime, setMealTime] = useState(null);
  const [mood, setMood] = useState(null);
  const [dietary, setDietary] = useState([]);
  const [calories, setCalories] = useState(500);
  const [cuisines, setCuisines] = useState([]);
  const [meals, setMeals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const toggleDietary = (d) => setDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleCuisine = (c) => setCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const generateMeals = async () => {
    setLoading(true);
    setError(null);
    setMeals(null);
    setSelectedMeal(null);

    const userPrompt = `
Meal Time: ${mealTime}
User Mood: ${mood}
Dietary Requirements: ${dietary.join(", ") || "None specified"}
Daily Calorie Target: ${calories} kcal (adjust per meal-time appropriately)
Selected Cuisines: ${cuisines.join(", ") || "Any cuisine"}

Generate 4 meal recommendations following all the rules in the system prompt.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setMeals(parsed.meals);
      setStep(5);
    } catch (e) {
      setError("Failed to generate meals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = mealTime && mood && cuisines.length > 0 && dietary.length > 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0e0c",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#f5f0e8",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #2a2520",
        padding: "24px 40px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "#13120f",
      }}>
        <div style={{
          width: 42, height: 42, background: "#c8a97e", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0
        }}>🍴</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.04em", color: "#f5f0e8" }}>MISE EN PLACE</div>
          <div style={{ fontSize: 12, color: "#8a7a66", letterSpacing: "0.12em", textTransform: "uppercase" }}>Personalized Meal Intelligence</div>
        </div>
        {step > 1 && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {[1,2,3,4].map(s => (
              <div key={s} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: step > s ? "#c8a97e" : step === s ? "#e8c99a" : "#2a2520"
              }}/>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>

        {/* STEP 1: Meal Time */}
        <Section title="When are you eating?" subtitle="Select your meal time to begin" active={step === 1}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {MEAL_TIMES.map(mt => (
              <button key={mt.id}
                onClick={() => { setMealTime(mt.id); if (step === 1) setStep(2); }}
                style={{
                  padding: "20px 16px",
                  background: mealTime === mt.id ? "#c8a97e" : "#1a1814",
                  border: mealTime === mt.id ? "1px solid #c8a97e" : "1px solid #2a2520",
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  color: mealTime === mt.id ? "#0f0e0c" : "#f5f0e8",
                }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{mt.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{mt.label}</div>
                <div style={{ fontSize: 11, opacity: 0.7, fontFamily: "sans-serif", marginBottom: 4 }}>{mt.time}</div>
                <div style={{ fontSize: 12, opacity: 0.8, fontStyle: "italic" }}>{mt.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* STEP 2: Mood + Dietary + Calories */}
        {step >= 2 && (
          <Section title="Tell us about yourself" subtitle="Mood, diet, and calorie goal" active={step === 2}>
            <div style={{ marginBottom: 28 }}>
              <Label>How are you feeling?</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOODS.map(m => (
                  <Chip key={m} active={mood === m} onClick={() => setMood(m)}>{m}</Chip>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <Label>Dietary requirements</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DIETARY.map(d => (
                  <Chip key={d} active={dietary.includes(d)} onClick={() => toggleDietary(d)}>{d}</Chip>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <Label>Daily calorie target: <span style={{ color: "#c8a97e" }}>{calories} kcal</span></Label>
              <input type="range" min={800} max={3500} step={50} value={calories}
                onChange={e => setCalories(+e.target.value)}
                style={{ width: "100%", accentColor: "#c8a97e", cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8a7a66", marginTop: 4, fontFamily: "sans-serif" }}>
                <span>800 kcal</span><span>3500 kcal</span>
              </div>
            </div>
            {mood && dietary.length > 0 && (
              <button onClick={() => setStep(3)} style={primaryBtn}>
                Continue →
              </button>
            )}
          </Section>
        )}

        {/* STEP 3: Cuisines */}
        {step >= 3 && (
          <Section title="Pick your cuisines" subtitle="Select at least one — no fusion" active={step === 3}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {CUISINES.map(c => (
                <Chip key={c} active={cuisines.includes(c)} onClick={() => toggleCuisine(c)}>{c}</Chip>
              ))}
            </div>
            {cuisines.length > 0 && (
              <button onClick={() => setStep(4)} style={primaryBtn}>
                Continue →
              </button>
            )}
          </Section>
        )}

        {/* STEP 4: Confirm + Generate */}
        {step >= 4 && !meals && (
          <Section title="Ready to cook up suggestions?" subtitle="Review your selections" active={step === 4}>
            <div style={{ background: "#1a1814", border: "1px solid #2a2520", borderRadius: 8, padding: 24, marginBottom: 24 }}>
              <Row label="Meal time" value={MEAL_TIMES.find(m => m.id === mealTime)?.label} />
              <Row label="Mood" value={mood} />
              <Row label="Dietary" value={dietary.join(", ")} />
              <Row label="Calories" value={`${calories} kcal/day`} />
              <Row label="Cuisines" value={cuisines.join(", ")} last />
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#8a7a66" }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⏳</div>
                <div style={{ fontStyle: "italic" }}>Curating your personalized menu…</div>
              </div>
            ) : (
              <>
                {error && <div style={{ color: "#e07070", marginBottom: 16, fontFamily: "sans-serif", fontSize: 14 }}>{error}</div>}
                <button onClick={generateMeals} disabled={!canGenerate} style={{
                  ...primaryBtn,
                  opacity: canGenerate ? 1 : 0.4,
                  cursor: canGenerate ? "pointer" : "not-allowed"
                }}>
                  Generate My Menu ✦
                </button>
              </>
            )}
          </Section>
        )}

        {/* STEP 5: Results */}
        {step === 5 && meals && (
          <div>
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#8a7a66", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontFamily: "sans-serif" }}>
                {MEAL_TIMES.find(m => m.id === mealTime)?.label} Menu
              </div>
              <h2 style={{ fontSize: 32, margin: 0, fontWeight: 700, color: "#f5f0e8" }}>
                Your Personalized Selections
              </h2>
              <p style={{ color: "#8a7a66", marginTop: 8, fontStyle: "italic" }}>
                Curated for {mood?.toLowerCase()} mood · {dietary.join(", ")} · {cuisines.join(", ")}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {meals.map((meal, i) => (
                <div key={i} onClick={() => setSelectedMeal(selectedMeal === i ? null : i)}
                  style={{
                    background: "#1a1814",
                    border: selectedMeal === i ? "1px solid #c8a97e" : "1px solid #2a2520",
                    borderRadius: 12,
                    padding: "24px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ fontSize: 40 }}>{meal.emoji}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 20, color: "#f5f0e8", marginBottom: 4 }}>{meal.name}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Badge>{meal.cuisine}</Badge>
                          <Badge gold>{meal.calorie_range}</Badge>
                        </div>
                      </div>
                    </div>
                    <div style={{ color: "#c8a97e", fontSize: 20 }}>{selectedMeal === i ? "▲" : "▼"}</div>
                  </div>

                  {selectedMeal === i && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #2a2520" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                        <InfoCard label="🧠 Mood Match" text={meal.why_mood} />
                        <InfoCard label="⏰ Meal Time Fit" text={meal.why_mealtime} />
                        <InfoCard label="🥗 Dietary Notes" text={meal.why_dietary} />
                        {meal.optional_sides?.length > 0 && (
                          <InfoCard label="✦ Optional Sides" text={meal.optional_sides.join(" · ")} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button onClick={() => { setStep(1); setMealTime(null); setMood(null); setDietary([]); setCuisines([]); setMeals(null); setCalories(500); }}
                style={{ ...primaryBtn, background: "transparent", border: "1px solid #c8a97e", color: "#c8a97e" }}>
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        button:hover { transform: translateY(-1px); }
        input[type=range]::-webkit-slider-thumb { width: 18px; height: 18px; }
      `}</style>
    </div>
  );
}

function Section({ title, subtitle, active, children }) {
  return (
    <div style={{
      marginBottom: 32,
      padding: "32px",
      background: active ? "#13120f" : "#0f0e0c",
      border: active ? "1px solid #3a3025" : "1px solid #1a1814",
      borderRadius: 12,
      opacity: active ? 1 : 0.7,
      transition: "all 0.3s"
    }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f5f0e8" }}>{title}</h2>
        <p style={{ margin: "4px 0 0", color: "#8a7a66", fontStyle: "italic", fontSize: 14 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontFamily: "sans-serif", fontSize: 13, color: "#8a7a66", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}

function Chip({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px",
      background: active ? "#c8a97e" : "#1a1814",
      border: active ? "1px solid #c8a97e" : "1px solid #2a2520",
      borderRadius: 100,
      color: active ? "#0f0e0c" : "#c8b99a",
      cursor: "pointer",
      fontSize: 13,
      fontFamily: "sans-serif",
      fontWeight: active ? 600 : 400,
      transition: "all 0.15s"
    }}>{children}</button>
  );
}

function Badge({ children, gold }) {
  return (
    <span style={{
      padding: "3px 10px",
      borderRadius: 100,
      fontSize: 12,
      fontFamily: "sans-serif",
      background: gold ? "rgba(200,169,126,0.15)" : "rgba(255,255,255,0.07)",
      color: gold ? "#c8a97e" : "#a09080",
      border: `1px solid ${gold ? "rgba(200,169,126,0.3)" : "rgba(255,255,255,0.1)"}`,
    }}>{children}</span>
  );
}

function InfoCard({ label, text }) {
  return (
    <div style={{ background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: 14 }}>
      <div style={{ fontSize: 11, fontFamily: "sans-serif", color: "#8a7a66", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#c8b99a", fontStyle: "italic", lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: last ? 0 : 12, marginBottom: last ? 0 : 12, borderBottom: last ? "none" : "1px solid #2a2520" }}>
      <span style={{ color: "#8a7a66", fontFamily: "sans-serif", fontSize: 13 }}>{label}</span>
      <span style={{ color: "#c8a97e", fontFamily: "sans-serif", fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const primaryBtn = {
  padding: "14px 32px",
  background: "#c8a97e",
  border: "none",
  borderRadius: 8,
  color: "#0f0e0c",
  fontFamily: "'Georgia', serif",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.04em",
  transition: "all 0.2s",
  display: "block",
  width: "100%",
};
