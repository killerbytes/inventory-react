import { useBackupDB, useUpdateGSheet } from "@/hooks/useCommon";
import { Button } from "@/components/ui/button";
import { ApiErrorResponse } from "@/schemas";
import { ROLES } from "@/utils/permissions";
import Modal from "@/components/Modal";
import { useStore } from "@/stores";
import { toast } from "sonner";
import React from "react";

export const AdminPanelModal = ({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) => {
  const { authState } = useStore();
  const { mutate: updateGSheet, isPending } = useUpdateGSheet();
  const { mutate: backupDB, isPending: isPendingBackup } = useBackupDB();

  React.useEffect(() => {
    if (
      !([ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(authState.user.role)
    ) {
      onClose();
    }
  }, []);

  const onUpdateGSheet = async () => {
    try {
      updateGSheet(undefined, {
        onSuccess: () => {
          toast.success("GSheet updated successfully");
        },
        onError: (error) => {
          const apiError = error as unknown as ApiErrorResponse;
          toast.error("Failed to update GSheet: " + apiError.message);
        },
      });
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Failed to update GSheet: " + apiError.message);
    }
  };

  const onBackupDB = async () => {
    try {
      backupDB(undefined, {
        onSuccess: () => {
          toast.success("DB backed up successfully");
        },
        onError: (error) => {
          const apiError = error as unknown as ApiErrorResponse;
          toast.error("Failed to backup DB: " + apiError.message);
        },
      });
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Failed to backup DB: " + apiError.message);
    }
  };

  return (
    <Modal
      size="sm"
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Admin Panel"
      description=""
    >
      <div className="flex gap-2 mt-6">
        <Button
          size="sm"
          variant="outline"
          onClick={onUpdateGSheet}
          disabled={isPending}
        >
          {isPending ? "Updating..." : "Update GSheet"}
        </Button>
        {([ROLES.ADMIN] as string[]).includes(authState.user.role) && (
          <Button
            size="sm"
            variant="outline"
            onClick={onBackupDB}
            disabled={isPendingBackup}
          >
            {isPending ? "Backing up..." : "Backup DB"}
          </Button>
        )}
      </div>
    </Modal>
  );
};
