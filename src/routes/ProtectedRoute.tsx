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
  console.log(1);

  if (!authState.user || !authState.user.id) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  console.log(2, allowedRoles, authState.user.role);

  if (
    allowedRoles &&
    authState.user.role &&
    !allowedRoles.includes(authState.user.role)
  ) {
    return <Navigate to="/" replace />;
  }
  console.log(3);

  return children;
};
