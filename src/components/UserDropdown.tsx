import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { AdminPanelModal } from "./modals/AdminPanelModal";
import ChangePasswordModal from "./modals/ChangePassword";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ROLES } from "@/utils/permissions";
import useToggle from "@/hooks/useToggle";
import { getInitials } from "@/lib/utils";
import { ChevronUp } from "lucide-react";
import { useStore } from "@/stores";

export default function UserDropdown() {
  const { data: user } = useCurrentUser();
  const { authState } = useStore();

  const { toggle, handleToggle } = useToggle({
    changePasswordModal: false,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex gap-2 items-center cursor-pointer">
            {user?.name && (
              <>
                <Avatar className="">
                  <AvatarFallback className="bg-foreground text-background">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div>{user?.name}</div>
                  <div className="text-xs text-muted uppercase">
                    {user?.role}
                  </div>
                </div>
              </>
            )}
            <ChevronUp className="ml-auto" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          className="w-[--radix-popper-anchor-width]"
        >
          {([ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(
            authState.user.role,
          ) && (
            <DropdownMenuItem
              onClick={() => handleToggle({ adminPanelModal: true })}
            >
              Admin Panel
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => handleToggle({ changePasswordModal: true })}
          >
            Change Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={authState.logout}>
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
        {toggle.changePasswordModal && (
          <ChangePasswordModal
            isOpen={true}
            onClose={() => {
              handleToggle({ changePasswordModal: false });
            }}
          />
        )}
        {toggle.adminPanelModal && (
          <AdminPanelModal
            isOpen
            onClose={() => handleToggle({ adminPanelModal: false })}
          />
        )}
      </DropdownMenu>
    </>
  );
}
