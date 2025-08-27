import { SidebarTrigger } from "./ui/sidebar";

export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="flex items-center justify-between p-2 border-b border-border mb-4">
      <div>
        <div className="flex items-center gap-2 font-semibold">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          {title}
        </div>
        {description && <p>{description}</p>}
      </div>
    </header>
  );
}
