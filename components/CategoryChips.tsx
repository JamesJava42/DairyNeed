"use client";

export function CategoryChips({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const all = ["All", ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {all.map((c) => {
        const active = value === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={[
              "rounded-full px-3 py-1 text-sm font-semibold border transition",
              active
                ? "bg-[rgb(var(--primary-soft))] text-[rgb(var(--primary-dark))] border-sky-200"
                : "bg-white text-slate-700 border-[rgb(var(--border))] hover:bg-slate-50",
            ].join(" ")}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
