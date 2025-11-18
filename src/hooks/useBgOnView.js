// hooks/useToggleClassOnView.js
import { useEffect } from "react";

export default function useToggleClassOnView(
  targetRefs,
  { add = "bg-black text-white", remove = "bg-white text-gray-900", threshold = 0.3, rootMargin = "0px 0px -10% 0px" } = {}
) {
  useEffect(() => {
    const refs = Array.isArray(targetRefs) ? targetRefs : [targetRefs];
    const els = refs.map(r => r?.current).filter(Boolean);
    if (!els.length) return;

    const addClasses = Array.isArray(add) ? add : add.split(" ").filter(Boolean);
    const removeClasses = Array.isArray(remove) ? remove : remove.split(" ").filter(Boolean);

    const apply = (el, isOn) => {
      if (isOn) {
        removeClasses.length && el.classList.remove(...removeClasses);
        addClasses.length && el.classList.add(...addClasses);
      } else {
        addClasses.length && el.classList.remove(...addClasses);
        removeClasses.length && el.classList.add(...removeClasses);
      }
    };

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          apply(entry.target, entry.isIntersecting);
        }
      },
      { threshold, rootMargin }
    );

    els.forEach(el => io.observe(el));

    // initial state (in case already in view)
    els.forEach(el => apply(el, isInViewport(el)));

    return () => io.disconnect();
  }, [targetRefs, add, remove, threshold, rootMargin]);
}

function isInViewport(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}
