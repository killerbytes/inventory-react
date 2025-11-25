import { Avatar, AvatarFallback } from "./ui/avatar";
import { authServices } from "@/services";
import { useStore } from "@/stores";
import { User } from "@/types";
import React from "react";

export default function UserIcon() {
  const {
    authState: { user, setUser, logout },
  } = useStore();

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
        const res: User = await authServices.me();
        setUser(res);
      } catch (error) {
        console.log(error);
      }
    };
    if (localStorage.getItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`)) {
      getData();
    } else {
      logout();
    }
  }, [logout, setUser]);

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
