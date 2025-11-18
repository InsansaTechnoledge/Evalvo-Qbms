import { useEffect, useState } from "react";


export default function useScrolled(threshold = 10, getTarget = () =>
  typeof window !== "undefined" ? window : null
) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const target = getTarget();
    if (!target) return;

    const getScrollTop =
      target === window
        ? () => window.scrollY || window.pageYOffset
        : () => target.scrollTop;

    const onScroll = () => setScrolled(getScrollTop() > threshold);

    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [threshold, getTarget]);

  return scrolled;
}
