import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ROUTES } from "@/utils/definitions";
import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { authServices, type User } from "@/services";
import { UserContext } from "./UserContext";

export default function User() {
  const getInitials = (name: string) => {
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const [user, setUser] = React.useState<User | null>(null);
  const { store, fetchData } = useContext(UserContext || null) || {};

  React.useEffect(() => {
    if (
      fetchData &&
      localStorage.getItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`)
    ) {
      fetchData("user", async () => {
        const { data } = await authServices.me();
        return data;
      });
    } else {
      handleLogout();
    }
  }, []);

  React.useEffect(() => {
    setUser(store?.user ?? null);
  }, [store?.user]);

  const handleLogout = () => {
    localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`);
    window.location.href = "/login";
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {user?.name && (
          <Avatar className="cursor-pointer ">
            <AvatarFallback className="text-primary bg-gray-500 text-white">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to={ROUTES.USERS}> Users</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={ROUTES.PRODUCTS}>Products</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to={ROUTES.CATEGORIES}> Categories</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to={ROUTES.SUPPLIERS}> Suppliers</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link to={ROUTES.LOGIN} onClick={handleLogout}>
            Logout
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
