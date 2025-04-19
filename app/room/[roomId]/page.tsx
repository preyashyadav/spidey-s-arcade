"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type PuzzlePayload = {
  description: string;
  question: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  answer: "A" | "B" | "C" | "D";
};

export default function RoomPage() {
  const { roomId } = useParams() as { roomId: string };
  const router = useRouter();

  const [puzzle, setPuzzle] = useState<PuzzlePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminated, setEliminated] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setEliminated(false);

    async function fetchPuzzle() {
      try {
        const res = await fetch("/api/generate-puzzle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            prompt: `
You’re designing a Multiple‑Choice puzzle for a digital escape room (Room ${roomId}).
1. Give a very brief scene description (1–2 sentences).
2. Then ask a clear question about the puzzle.
3. Provide exactly four answer choices labeled A, B, C, and D.
4. Mark one choice as the correct one, and indicate it in the JSON output only in a field called "answer".

Respond *only* with a JSON object in this format:

{
  "description": "…brief narrative…",
  "question": "…the multiple‑choice question…",
  "options": {
    "A": "…option A…",
    "B": "…option B…",
    "C": "…option C…",
    "D": "…option D…"
  },
  "answer": "B"
}
            `,
          }),
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Failed to fetch puzzle");
        }

        const data = await res.json();
        setPuzzle(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPuzzle();
  }, [roomId]);

  const handleChoice = (choice: "A" | "B" | "C" | "D") => {
    if (!puzzle) return;
    if (choice === puzzle.answer) {
      const nextRoom = parseInt(roomId, 10) + 1;
      router.push(`/room/${nextRoom}`);
    } else {
      setEliminated(true);
    }
  };

  if (loading) {
    return <p className="p-8 text-center">Loading puzzle...</p>;
  }

  if (error || !puzzle) {
    return (
      <p className="p-8 text-red-600 text-center">
        Error: {error || "Unknown error"}
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">🔐 Room {roomId}</h1>
      <p className="italic text-gray-700 mb-6">{puzzle.description}</p>
      <h2 className="text-xl font-semibold mb-4">{puzzle.question}</h2>

      <ul className="space-y-3 mb-6">
        {(["A", "B", "C", "D"] as const).map((key) => (
          <li key={key}>
            <button
              disabled={eliminated}
              onClick={() => handleChoice(key)}
              className={`
                w-full text-left px-4 py-2 rounded border 
                hover:bg-gray-100 transition
                ${eliminated ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <span className="font-bold mr-2">{key}.</span>
              {puzzle.options[key]}
            </button>
          </li>
        ))}
      </ul>

      {eliminated && (
        <div className="text-red-700 font-semibold text-center">
          ❌ Wrong choice! You have been eliminated.
        </div>
      )}
    </div>
  );
}
