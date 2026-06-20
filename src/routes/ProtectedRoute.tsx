import { Navigate, useLocation } from "react-router";
import { useStore } from "@/stores";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { authState } = useStore();
  const location = useLocation();

  if (!authState.user || !authState.user.id) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    allowedRoles &&
    authState.user.role &&
    !allowedRoles.includes(authState.user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};
