import services from "@/services";
import React, { useContext } from "react";
import { Link } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { GlobalContext } from "./GlobalContext";
import type { User } from "@/pages/Users";
import { ROUTES } from "@/utils/definitions";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function Header() {
  const [user, setUser] = React.useState<User | null>(null);
  const { store, fetchData } = useContext(GlobalContext || null) || {};

  const getInitials = (name: string) => {
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  React.useEffect(() => {
    if (
      fetchData &&
      localStorage.getItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`)
    ) {
      fetchData("user", async () => {
        const { data } = await services.authServices.me();
        return data;
      });
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
    <header className="bg-gray-800 text-white ">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">My Hardware</h1>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            <li>
              <Link to={ROUTES.PURCHASE_ORDERS} className="hover:text-gray-400">
                Purchases
              </Link>
            </li>
            <li>
              <Link to={ROUTES.SALES_ORDERS} className="hover:text-gray-400">
                Sales
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {user?.name && (
                <Avatar>
                  <AvatarFallback className="text-primary">
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

              <DropdownMenuItem asChild>
                <Link to={ROUTES.INVENTORY}> Inventory</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <Link to={ROUTES.LOGIN} onClick={handleLogout}>
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
