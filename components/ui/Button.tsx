import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";

  const styles =
    variant === "primary"
      ? "text-white bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-dark))] shadow-sm"
      : "border border-[rgb(var(--border))] text-[rgb(var(--text))] hover:bg-slate-100";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
