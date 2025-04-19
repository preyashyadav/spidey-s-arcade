// app/api/generate-stages/route.ts
import { NextResponse } from "next/server";
import type { RiddleStage, ShapeStage, QuizStage } from "../../../lib/gameData";

type GeneratedStage = RiddleStage | ShapeStage | QuizStage;

export async function POST(request: Request) {
  const { theme } = await request.json();
  if (!theme) {
    return NextResponse.json({ error: "Missing theme" }, { status: 400 });
  }

  const system = `
You are a JSON‑only generator.  When given a "theme", you MUST reply with
an array of exactly 3 objects, in this exact order:

1) A riddle stage:
   {
     "type": "riddle",
     "description": string,    // a little setup scene invoking the theme
     "question": string,       // a poetic riddle whose answer is a key element of the theme
     "options": { "A": string, "B": string, "C": string },
     "answer": "A"|"B"|"C"
   }

2) A shape matching stage:
   {
     "type": "shape",
     "description": string,    // ties to the theme world
     "shapes": string[],       // four theme‑specific categories (e.g. Hogwarts houses)
     "targets": string[]       // four emoji or symbol names that represent them, e.g. "🦅","🦡","🐍","🦉"
   }
   // If you're using a theme without emojis, match character names to their roles or abilities instead.

3) A quiz stage:
   {
     "type": "quiz",
     "description": string,    // context or flavor text from the theme
     "questions": [            // at least 3 MCQs all about deep theme lore
       {
         "type": "mcq",
         "question": string,
         "options": { "A": string, "B": string, "C": string, "D": string },
         "answer": string,
         "hint": string
       }
     ]
   }

**Constraints:**
- Use the user’s theme term in every description, question, hint, etc.
- Do NOT emit a maze stage (that’s hard‑coded in the client).
- Output strictly valid JSON (no markdown fences, no extra keys, exact field names).
- Make each part as rich and detailed as possible, fully “immersive” in the theme.
`;

  const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Generate exactly 3 stages (riddle, shape, quiz) for theme "${theme}".`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!apiRes.ok) {
    const err = await apiRes.json();
    throw new Error(err.error?.message || apiRes.statusText);
  }
  const { choices } = await apiRes.json();
  const raw = choices[0].message.content.trim();

  let stages: GeneratedStage[];
  try {
    stages = JSON.parse(raw);
    if (!Array.isArray(stages) || stages.length !== 3) {
      throw new Error("Expected an array of 3 stages");
    }
  } catch (e) {
    console.error("Invalid JSON from OpenAI:", raw);
    throw new Error("AI returned invalid JSON for stages.");
  }

  return NextResponse.json(stages);
}
