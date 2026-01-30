import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";

  const styles =
    variant === "primary"
      ? "text-white bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-dark))] shadow-[0_10px_22px_rgba(5,150,105,0.18)]"
      : "border border-[rgb(var(--border))] bg-white/70 text-[rgb(var(--text))] hover:bg-emerald-50";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
