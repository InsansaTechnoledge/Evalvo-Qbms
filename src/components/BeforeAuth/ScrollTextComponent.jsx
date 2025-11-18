// components/ScrollTextComponent.jsx
import React, { useRef } from "react";
import ScrollReveal from "./Laptop/ScrollReveal";
import useToggleClassOnView from "../../hooks/useBgOnView";
import { text1, text2, text3 } from "../../utils/Constants";

const ScrollTextComponent = () => {
  const deskRef = useRef(null);
  const mobileRef = useRef(null);

  useToggleClassOnView(deskRef, {
    add: "bg-black text-white",
    remove: "bg-white text-gray-900",
    threshold: 0.1,
    rootMargin: "0px 0px -15% 0px",
  });

  useToggleClassOnView(mobileRef, {
    add: "bg-black text-white",
    remove: "bg-white text-gray-900",
    threshold: 0.1,
    rootMargin: "0px 0px -15% 0px",
  });

  return (
    <div>
      {/* Desktop */}
      <div
        ref={deskRef}
        className="hidden md:block min-h-screen px-4 py-12 space-y-12 transition-colors duration-500"
      >
        <div className="mr-auto w-full md:w-[80%] rounded-2xl p-10 text-right">
          <ScrollReveal baseOpacity={0} enableBlur baseRotation={5} blurStrength={10}>
            {text1}    
          </ScrollReveal>
        </div>

        <div className="ml-auto w-full md:w-[60%] rounded-2xl p-10 text-left">
          <ScrollReveal baseOpacity={0} enableBlur baseRotation={5} blurStrength={10}>
            {text2}
          </ScrollReveal>
        </div>

        <div className="mr-auto w-full md:w-[80%] rounded-2xl p-10 text-right">
          <ScrollReveal baseOpacity={0} enableBlur baseRotation={5} blurStrength={10}>
            {text3}
          </ScrollReveal>
        </div>
      </div>

      {/* Mobile */}
      <div
        ref={mobileRef}
        className="md:hidden px-4 py-12 space-y-12 transition-colors duration-500"
      >
        <div className="mr-auto max-w-7xl w-full rounded-2xl p-10 text-right">
          <ScrollReveal baseOpacity={0} enableBlur baseRotation={5} blurStrength={10}>
            {text1}
          </ScrollReveal>
        </div>

        <div className="ml-auto max-w-7xl w-full rounded-2xl p-10 text-left">
          <ScrollReveal baseOpacity={0} enableBlur baseRotation={5} blurStrength={10}>
            {text2}
          </ScrollReveal>
        </div>

        <div className="mr-auto max-w-7xl w-full rounded-2xl p-10 text-right">
          <ScrollReveal baseOpacity={0} enableBlur baseRotation={5} blurStrength={10}>
            {text3}
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default ScrollTextComponent;
