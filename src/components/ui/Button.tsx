import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "#/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border-cyan-400/60 bg-cyan-400 text-slate-950 hover:bg-cyan-300",
  secondary:
    "border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500 hover:bg-slate-800",
  ghost:
    "border-transparent bg-transparent text-slate-300 hover:bg-slate-900 hover:text-white",
  danger: "border-rose-400/60 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
};

export function Button({
  children,
  className,
  icon,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
