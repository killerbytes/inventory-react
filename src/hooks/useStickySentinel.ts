import React from "react";

export function useStickySentinel() {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const [stuck, setStuck] = React.useState(false);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // sentinel not visible -> header is stuck
        setStuck(!entry.isIntersecting);
      },
      { root: null, threshold: 0 }, // root null = viewport; threshold 0 detects any intersection
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, stuck };
}
