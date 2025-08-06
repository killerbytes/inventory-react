import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cx } from "class-variance-authority";
import React from "react";

export default function Modal({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  className = "!max-w-[500px]",
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(isOpen);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
        setTimeout(() => {
          onOpenChange();
        }, 500);
      }}
    >
      <DialogContent className={cx("w-full ", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
