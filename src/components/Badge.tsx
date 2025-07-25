import { Badge as BadgeComponent } from "@/components/ui/badge";
import { cx } from "class-variance-authority";

export default function Badge({
  type,
  children,
}: {
  type?: string | undefined;
  children?: React.ReactNode;
}) {
  const status = type?.toLowerCase();

  return (
    <BadgeComponent className={cx(`capitalize status-${status}`)}>
      {children || status}
    </BadgeComponent>
  );
}
