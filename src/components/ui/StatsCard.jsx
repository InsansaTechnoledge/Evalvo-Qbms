import React from "react";

const colorClasses = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-green-50 text-green-700 border-green-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
};

export function StatsCard({ title, value, icon: Icon, color = "blue" }) {
  return (
    <div
      className={`
        flex-1 min-w-[200px] p-5 rounded-xl border-2 transition-all duration-200
        hover:scale-105 hover:shadow-md
        ${colorClasses[color] || colorClasses.blue}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        {Icon && <Icon className="w-8 h-8 opacity-50" />}
      </div>
    </div>
  );
}
