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
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CircleAlert, Loader2Icon } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import React from "react";

export default function ConfirmDialog({
  children,
  onConfirm,
  title = "Confirm",
  description = `Are you sure you want to continue?`,
  confirmText = "Confirm",
  isLoading,
  shouldConfirm,
}: {
  children: React.ReactNode;
  onConfirm: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  isLoading?: boolean;
  shouldConfirm?: () => boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [requiresConfirm, setRequiresConfirm] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(true);
  React.useEffect(() => {
    if (shouldConfirm && open) {
      const result: boolean = shouldConfirm();
      setRequiresConfirm(result);
      setConfirmed(!result);
    }
  }, [open, shouldConfirm]);

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
          <AlertDialogDescription className="flex flex-col gap-4">
            <p>{description}</p>
            {requiresConfirm && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Wholesale items</AlertTitle>
                <AlertDescription>
                  This order includes wholesale items. Please confirm that you
                  intend to resell these products.
                  <Label>
                    <Checkbox
                      onCheckedChange={(checked) =>
                        setConfirmed(checked === true)
                      }
                      checked={confirmed}
                    />{" "}
                    Check to confirm
                  </Label>
                </AlertDescription>
              </Alert>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || !confirmed}
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
