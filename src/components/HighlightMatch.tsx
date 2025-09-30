function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const regex = new RegExp(`(${query})`, "ig");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-300 rounded">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default HighlightMatch;
