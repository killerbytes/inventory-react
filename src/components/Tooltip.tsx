import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

export default function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipComponent open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <div onClick={() => setOpen(!open)}>{children}</div>
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </TooltipComponent>
  );
}
