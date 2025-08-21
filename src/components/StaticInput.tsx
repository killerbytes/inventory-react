import { cx } from "class-variance-authority";

interface StaticInputProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  error?: string;
}

export function StaticInput({
  value,
  error,
  className,
  ...props
}: StaticInputProps) {
  return (
    <div
      {...props}
      aria-invalid={!!error}
      className={cx(
        "w-full rounded-md px-3 py-2 text-sm",
        error
          ? "border-red-500 ring-red-500 focus-visible:ring-red-500 border"
          : "text-muted-foreground",
        className,
      )}
    >
      {value}
    </div>
  );
}
