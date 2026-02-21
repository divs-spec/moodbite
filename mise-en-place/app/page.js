"use client";

import { useState } from "react";
import { MEAL_TIMES, MOODS, CUISINES, DIETARY } from "@/lib/constants";
import {
  Section, Label, Chip, PrimaryButton,
  Badge, InfoCard, SummaryRow, StepDots
} from "@/components/ui";

export default function Home() {
  const [step, setStep]         = useState(1);
  const [mealTime, setMealTime] = useState(null);
  const [mood, setMood]         = useState(null);
  const [dietary, setDietary]   = useState([]);
  const [calories, setCalories] = useState(2000);
  const [cuisines, setCuisines] = useState([]);
  const [meals, setMeals]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [expanded, setExpanded] = useState(null);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const reset = () => {
    setStep(1); setMealTime(null); setMood(null);
    setDietary([]); setCalories(2000); setCuisines([]);
    setMeals(null); setError(null); setExpanded(null);
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setMeals(null);
    setExpanded(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealTime, mood, dietary, calories, cuisines }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMeals(data.meals);
      setStep(5);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep2 = mood && dietary.length > 0;
  const canProceedStep3 = cuisines.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "var(--bg-card)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          width: 40, height: 40,
          background: "var(--gold)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>🍴</div>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.05em" }}>MISE EN PLACE</div>
          <div style={{ fontSize: 11, color: "var(--text-mute)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Personalized Meal Intelligence
          </div>
        </div>
        {step > 1 && step < 5 && (
          <div style={{ marginLeft: "auto" }}>
            <StepDots current={step} total={4} />
          </div>
        )}
        {step === 5 && (
          <button onClick={reset} style={{
            marginLeft: "auto",
            padding: "8px 18px",
            border: "1px solid var(--border-hi)",
            borderRadius: 8,
            color: "var(--text-mute)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
          }}>← Start over</button>
        )}
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── STEP 1: Meal Time ── */}
        <Section
          title="When are you eating?"
          subtitle="Select your meal time — this determines everything that follows."
          faded={step > 1 && step !== 1}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {MEAL_TIMES.map(mt => (
              <button key={mt.id}
                onClick={() => { setMealTime(mt.id); setStep(Math.max(step, 2)); }}
                style={{
                  padding: "18px 14px",
                  background: mealTime === mt.id ? "var(--gold)" : "var(--bg-inset)",
                  border: `1px solid ${mealTime === mt.id ? "var(--gold)" : "var(--border)"}`,
                  borderRadius: 10,
                  textAlign: "left",
                  color: mealTime === mt.id ? "#0f0e0c" : "var(--text)",
                  transition: "all 0.2s",
                }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{mt.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{mt.label}</div>
                <div style={{ fontSize: 11, opacity: 0.65, fontFamily: "var(--font-body)", marginBottom: 4 }}>{mt.time}</div>
                <div style={{ fontSize: 12, opacity: 0.75, fontStyle: "italic" }}>{mt.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* ── STEP 2: Mood + Dietary + Calories ── */}
        {step >= 2 && (
          <Section title="Tell us about you" subtitle="Mood, diet, and daily calorie goal." faded={step > 2}>

            <div style={{ marginBottom: 24 }}>
              <Label>How are you feeling right now?</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOODS.map(m => (
                  <Chip key={m.id} active={mood === m.id} onClick={() => setMood(m.id)}>
                    {m.icon} {m.id}
                  </Chip>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Label>Dietary requirements</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DIETARY.map(d => (
                  <Chip key={d} active={dietary.includes(d)} onClick={() => toggle(dietary, setDietary, d)}>{d}</Chip>
                ))}
              </div>
              {dietary.length === 0 && (
                <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-mute)", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
                  Select at least one dietary preference.
                </p>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <Label>
                Daily calorie target —{" "}
                <span style={{ color: "var(--gold)" }}>{calories.toLocaleString()} kcal</span>
              </Label>
              <input type="range" min={800} max={3500} step={50} value={calories}
                onChange={e => setCalories(+e.target.value)} />
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 11, color: "var(--text-mute)", marginTop: 6,
                fontFamily: "var(--font-body)"
              }}>
                <span>800 kcal · Light</span>
                <span>3500 kcal · Athletic</span>
              </div>
            </div>

            {canProceedStep2 && step === 2 && (
              <PrimaryButton onClick={() => setStep(3)}>Continue →</PrimaryButton>
            )}
          </Section>
        )}

        {/* ── STEP 3: Cuisines ── */}
        {step >= 3 && (
          <Section title="Choose your cuisines" subtitle="Multi-select allowed — no fusion, each dish belongs to one cuisine only." faded={step > 3}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {CUISINES.map(c => (
                <Chip key={c} active={cuisines.includes(c)} onClick={() => toggle(cuisines, setCuisines, c)}>{c}</Chip>
              ))}
            </div>
            {cuisines.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--text-mute)", fontFamily: "var(--font-body)", fontStyle: "italic", marginBottom: 16 }}>
                Select at least one cuisine.
              </p>
            )}
            {canProceedStep3 && step === 3 && (
              <PrimaryButton onClick={() => setStep(4)}>Continue →</PrimaryButton>
            )}
          </Section>
        )}

        {/* ── STEP 4: Review + Generate ── */}
        {step >= 4 && !meals && (
          <Section title="Ready to generate your menu?" subtitle="Review your selections below.">
            <div style={{
              background: "var(--bg-inset)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "20px 24px",
              marginBottom: 24,
            }}>
              <SummaryRow label="Meal time"    value={`${MEAL_TIMES.find(m => m.id === mealTime)?.icon} ${mealTime}`} />
              <SummaryRow label="Mood"         value={`${MOODS.find(m => m.id === mood)?.icon} ${mood}`} />
              <SummaryRow label="Dietary"      value={dietary.join(", ")} />
              <SummaryRow label="Calories"     value={`${calories.toLocaleString()} kcal / day`} />
              <SummaryRow label="Cuisines"     value={cuisines.join(", ")} last />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="spinner" style={{ fontSize: 36, display: "block", marginBottom: 14 }}>⏳</div>
                <p className="pulse" style={{ color: "var(--text-mute)", fontStyle: "italic", fontFamily: "var(--font-body)" }}>
                  Curating your personalized menu…
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <p style={{ color: "#e07070", fontFamily: "var(--font-body)", fontSize: 13, marginBottom: 14 }}>
                    ⚠ {error}
                  </p>
                )}
                <PrimaryButton onClick={generate}>✦ Generate My Menu</PrimaryButton>
              </>
            )}
          </Section>
        )}

        {/* ── STEP 5: Results ── */}
        {step === 5 && meals && (
          <div className="animate-fade-up">
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{
                fontSize: 11, color: "var(--text-mute)", letterSpacing: "0.18em",
                textTransform: "uppercase", marginBottom: 10,
                fontFamily: "var(--font-body)", fontWeight: 600,
              }}>
                {MEAL_TIMES.find(m => m.id === mealTime)?.icon}&ensp;
                {mealTime} Menu
              </div>
              <h1 style={{ fontSize: 34, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.1 }}>
                Your Personalized Selections
              </h1>
              <p style={{ color: "var(--text-mute)", fontStyle: "italic", fontSize: 14 }}>
                {mood} mood · {dietary.join(", ")} · {cuisines.join(", ")}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {meals.map((meal, i) => {
                const open = expanded === i;
                return (
                  <div key={i}
                    onClick={() => setExpanded(open ? null : i)}
                    className="animate-fade-up"
                    style={{
                      background: "var(--bg-card)",
                      border: `1px solid ${open ? "var(--gold)" : "var(--border-hi)"}`,
                      borderRadius: 12,
                      padding: "22px 24px",
                      cursor: "pointer",
                      transition: "border-color 0.2s",
                      animationDelay: `${i * 0.08}s`,
                    }}>
                    {/* Card header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ fontSize: 44, lineHeight: 1 }}>{meal.emoji}</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 19, color: "var(--text)", marginBottom: 6 }}>
                            {meal.name}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            <Badge>{meal.cuisine}</Badge>
                            <Badge gold>{meal.calorie_range}</Badge>
                            {meal.cook_time && <Badge>⏱ {meal.cook_time}</Badge>}
                          </div>
                        </div>
                      </div>
                      <span style={{ color: "var(--text-mute)", fontSize: 20, flexShrink: 0, paddingTop: 4 }}>
                        {open ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {open && (
                      <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                          <InfoCard label="🧠 Mood Match"     text={meal.why_mood} />
                          <InfoCard label="⏰ Meal Time Fit"  text={meal.why_mealtime} />
                          <InfoCard label="🥗 Dietary Notes"  text={meal.why_dietary} />
                          {meal.optional_sides?.length > 0 && (
                            <InfoCard label="✦ Optional Sides" text={meal.optional_sides.join("  ·  ")} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
              <PrimaryButton outline onClick={reset} style={{ flex: 1 }}>
                ← Start Over
              </PrimaryButton>
              <PrimaryButton onClick={generate} style={{ flex: 1 }}>
                ↻ Regenerate
              </PrimaryButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
