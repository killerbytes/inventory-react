import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function UserIcon() {
  const { data: user } = useCurrentUser();

  const getInitials = (name: string) => {
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[1].substring(0, 1).toUpperCase();
    }
    return initials;
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
