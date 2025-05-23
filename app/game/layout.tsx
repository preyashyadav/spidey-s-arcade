import RequireAuth from "../../components/RequireAuth";
import { ReactNode } from "react";

export default function GameLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
