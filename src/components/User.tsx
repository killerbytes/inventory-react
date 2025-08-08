import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import VariantTemplateModal from "./VariantTemplateModal";
import { useGlobalStore } from "@/stores/global.store";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUserStore } from "@/stores/user.store";
import { ROUTES } from "@/utils/definitions";
import useToggle from "@/hooks/useToggle";
import { authServices } from "@/services";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { User } from "@/types";
import React from "react";

export default function UserIcon() {
  const { variantTemplateModal, setVariantTemplateModal } = useGlobalStore();
  const [toggle, handleToggle] = useToggle({
    variantTemplateModal: false,
  });

  const getInitials = (name: string) => {
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const { user, setUser } = useUserStore();

  React.useEffect(() => {
    const getData = async () => {
      const user: User = await authServices.me();
      setUser(user);
    };
    if (localStorage.getItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`)) {
      getData();
    } else {
      handleLogout();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`);
    window.location.href = "/login";
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {user?.name && (
            <Avatar className="cursor-pointer ">
              <AvatarFallback className="text-primary bg-gray-500">
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
            <Link
              to=""
              onClick={() => {
                setVariantTemplateModal(true);
              }}
            >
              Variants Templates
            </Link>
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
    </>
  );
}
