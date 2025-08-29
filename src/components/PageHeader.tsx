import { useStickySentinel } from "@/hooks/useStickySentinel";
import { SidebarTrigger } from "./ui/sidebar";
import { cn } from "@/lib/utils";
import * as React from "react";

function PageHeader({ className, ...props }: React.ComponentProps<"header">) {
  const { sentinelRef, stuck } = useStickySentinel();
  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px" />

      <header
        data-slot="page-header"
        className={cn(
          "@container/page-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-2 py-2 border-b border-border mb-4 has-data-[slot=page-header-actions]:grid-cols-[1fr_auto]",
          "sticky top-0 z-10 bg-background",
          stuck && "shadow",
          className,
        )}
        {...props}
      />
    </>
  );
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn("text-base font-semibold leading-none", className)}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-header-description"
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  );
}

function PageHeaderActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end flex items-center gap-2",
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderContent({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-content"
      className="flex items-center gap-2"
      {...props}
    >
      <SidebarTrigger />
      <div className="bg-border h-5 w-[1px] mr-2" />
      <div>{children}</div>
    </div>
  );
}

export {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
  PageHeaderContent,
};
