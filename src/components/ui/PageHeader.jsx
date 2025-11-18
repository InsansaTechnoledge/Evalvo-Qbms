import React from "react";

const alignClassMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function PageHeader({ title, subtitle, align = "center", className = "" }) {
  const alignClass = alignClassMap[align] || alignClassMap.center;

  return (
    <header className={`${alignClass} mb-8 ${className}`}>
      <h1 className="pageHeader mb-2">{title}</h1>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </header>
  );
}
