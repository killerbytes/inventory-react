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
  className,
  size = "md",
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
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
      <DialogContent
        className={cx(
          "w-full max-h-[95%] overflow-auto",
          `${Modal.sizes[size]}`,
          className,
        )}
        tabIndex={undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

Modal.sizes = {
  sm: "sm:max-w-[500px]",
  md: "sm:max-w-[800px]",
  lg: "sm:max-w-[70%]",
  xl: "sm:max-w-[90%]",
};
