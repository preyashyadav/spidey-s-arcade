"use client";

import { useEffect, useState } from "react";
import GameOrchestrator from "../../components/GameOrchestrator";
import type { Stage } from "../../lib/gameData";

export default function GamePage() {
  const [stages, setStages] = useState<Stage[] | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("dynamicStages");
    if (raw) {
      setStages(JSON.parse(raw));
    }
  }, []);

  if (!stages) {
    return (
      <section className="panel red full-screen">
        <div className="inner stack">
          <div className="comics-dialog">
            <h2>⚠️ Missing Quest</h2>
            <p>No quest stages found. Please start from the homepage.</p>
          </div>
          <button
            className="comics-button"
            onClick={() => (window.location.href = "/")}
          >
            Go Back
          </button>
        </div>
      </section>
    );
  }

  return <GameOrchestrator initialStages={stages} />;
}
