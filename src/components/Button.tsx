"use client";

import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent) => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg hover:shadow-xl",
  secondary:
    "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
  ghost:
    "bg-transparent text-white hover:bg-white/10",
  danger:
    "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
}: ButtonProps) {
  const baseStyles =
    "rounded-xl font-heading font-bold transition-all duration-300 inline-flex items-center justify-center";
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
    disabled || loading ? "opacity-50 cursor-not-allowed" : ""
  } ${className}`;

  const content = loading ? (
    <>
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      {children}
    </>
  ) : (
    children
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
