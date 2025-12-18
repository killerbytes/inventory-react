import { Store } from "lucide-react";

export default function Header() {
  return (
    <header>
      <h1 className="container mx-auto flex items-center p-4 gap-2 font-semibold text-2xl">
        <Store /> {import.meta.env.VITE_APP_TITLE}
      </h1>
    </header>
  );
}
