import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useDemo } from "@/contexts/DemoContext";
import type { PersonaId } from "@/types/demo";

interface PersonaGateProps {
  children: ReactNode;
  allow?: PersonaId[];
}

export default function PersonaGate({ children, allow }: PersonaGateProps) {
  const { currentPersona } = useDemo();
  const location = useLocation();

  if (!currentPersona) {
    return <Navigate to="/persona" replace state={{ from: location.pathname }} />;
  }

  if (allow && !allow.includes(currentPersona.id)) {
    return <Navigate to={currentPersona.homePath} replace />;
  }

  return <>{children}</>;
}
