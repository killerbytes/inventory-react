import services from "@/services";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { GlobalContext } from "./GlobalContext";
import type { User } from "@/pages/Users";
import { ROUTES } from "@/utils/definitions";

export default function Header() {
  const [user, setUser] = React.useState<User | null>(null);
  const { store, fetchData } = useContext(GlobalContext || null) || {};

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
            <DropdownMenuTrigger>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <div className="font-medium">{user?.name.charAt(0)}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <Link to={ROUTES.USERS}> Users</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to={ROUTES.PRODUCTS}>Products</Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Link to={ROUTES.CATEGORIES}> Categories</Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Link to={ROUTES.SUPPLIERS}> Suppliers</Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Link to={ROUTES.INVENTORY}> Inventory</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
