"use client";

import { useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else setChecking(false);
    });
    return unsub;
  }, [router]);

  if (checking) return <p style={{ padding: 16 }}>Checking authentication…</p>;
  return <>{children}</>;
}
