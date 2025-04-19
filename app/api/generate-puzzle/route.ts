import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { roomId, prompt } = await request.json();

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2500,
        temperature: 0.8,
      }),
    });
    if (!apiRes.ok) {
      const err = await apiRes.json();
      throw new Error(err.error?.message || apiRes.statusText);
    }

    const { choices } = await apiRes.json();
    const raw = choices[0].message.content.trim();

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse AI JSON:", raw);
      throw new Error("Invalid puzzle format received from AI.");
    }

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("Generate puzzle error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
