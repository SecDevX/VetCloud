import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }>;

export function Button({ children, variant = "primary", style, ...props }: ButtonProps) {
  const colors = variant === "primary" ? { background: "#0369a1", color: "white" } : { background: "#e0f2fe", color: "#075985" };
  return <button {...props} style={{ border: 0, borderRadius: 12, cursor: "pointer", fontWeight: 700, padding: "12px 17px", ...colors, ...style }}>{children}</button>;
}
