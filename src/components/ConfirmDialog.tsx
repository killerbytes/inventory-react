import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2Icon } from "lucide-react";
import React from "react";

export default function ConfirmDialog({
  children,
  onConfirm,
  title = "Confirm",
  description = `Are you sure you want to continue?`,
  confirmText = "Confirm",
  isLoading,
}: {
  children: React.ReactNode;
  onConfirm: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  isLoading?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const handleConfirm = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    await onConfirm(e);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={handleConfirm}
            autoFocus
          >
            {isLoading && <Loader2Icon className="animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
