function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  // split by space and remove empty values
  const keywords = query.split(/\s+/).filter(Boolean).map(escapeRegExp);

  if (!keywords.length) return <>{text}</>;

  const regex = new RegExp(`(${keywords.join("|")})`, "ig");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        keywords.some((k) => part.toLowerCase() === k.toLowerCase()) ? (
          <span key={i} className="text-yellow-900 bg-yellow-100">
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
