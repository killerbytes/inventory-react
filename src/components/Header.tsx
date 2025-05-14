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
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="/" className="hover:text-gray-400">
                Home
              </a>
            </li>
            <li>
              <a href="/users" className="hover:text-gray-400">
                Users
              </a>
            </li>

            <li>
              <Link to="/products" className="hover:text-gray-400">
                Products
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-gray-400">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/suppliers" className="hover:text-gray-400">
                Suppliers
              </Link>
            </li>
            <li>
              <Link to="/purchases" className="hover:text-gray-400">
                Purchases
              </Link>
            </li>

            <li>
              <a href="/about" className="hover:text-gray-400">
                About
              </a>
            </li>
          </ul>
        </nav>
        <div></div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <div className="font-medium">{user?.name.charAt(0)}</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
