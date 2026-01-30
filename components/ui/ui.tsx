// components/ui/ui.tsx
import React from "react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto max-w-6xl px-4", className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-200/70 bg-white/70 backdrop-blur shadow-[0_1px_2px_rgba(0,0,0,0.05),0_14px_34px_rgba(15,23,42,0.06)]",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 sm:p-8", className)} {...props} />;
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-900",
        "placeholder:text-slate-400",
        "outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400",
        className
      )}
      {...props}
    />
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_10px_22px_rgba(5,150,105,0.20)]"
      : variant === "secondary"
      ? "bg-white/80 text-slate-900 border border-slate-200/70 hover:bg-white"
      : "bg-transparent text-slate-700 hover:bg-slate-100/70";

  return <button className={cn(base, styles, className)} {...props} />;
}

export function LinkChip({
  className,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "rounded-full px-4 py-2 text-sm font-black border transition",
        active
          ? "bg-emerald-600 text-white border-emerald-600 shadow-[0_10px_18px_rgba(5,150,105,0.20)]"
          : "bg-white/70 text-slate-700 border-slate-200/70 hover:bg-white",
        className
      )}
      {...props}
    />
  );
}
