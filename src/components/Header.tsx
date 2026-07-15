export default function Header() {
  return (
    <header className="flex flex-col justify-center items-center text-center text-gray-400 leading-tight uppercase">
      <img src="/logo.png" className="mx-auto w-20" />
      <h1 className="text-white">H.CONCEPCION</h1>
      {import.meta.env.VITE_APP_TITLE}
    </header>
  );
}
