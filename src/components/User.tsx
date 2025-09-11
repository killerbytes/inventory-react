import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGlobalStore } from "@/stores/global.store";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUserStore } from "@/stores/user.store";
import { ApiErrorResponse, User } from "@/types";
import { ROUTES } from "@/utils/definitions";
import { authServices } from "@/services";
import { Link } from "react-router-dom";
import React from "react";

export default function UserIcon() {
  const { setVariantTemplateModal } = useGlobalStore();
  const { user, setUser } = useUserStore();

  const getInitials = (name: string) => {
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  React.useEffect(() => {
    const getData = async () => {
      try {
        const user: User = await authServices.me();
        setUser(user);
      } catch (error) {
        // const apiError = error as ApiErrorResponse;
        console.log(error);
      }
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
      {user?.name && (
        <>
          <Avatar className="cursor-pointer ">
            <AvatarFallback className="bg-foreground text-background">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          {user?.name}
        </>
      )}
    </>
  );
}
