import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  tooltip: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export default function Button({
  href,
  onClick,
  icon,
  tooltip,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full p-2 sm:p-3 transition-colors disabled:cursor-not-allowed disabled:opacity-50 relative group";
  const variantClasses =
    variant === "primary"
      ? "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
      : "border border-solid border-black/[.08] hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]";
  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  const buttonContent = (
    <>
      <span className="flex-shrink-0">{icon}</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-zinc-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 dark:bg-zinc-700">
        {tooltip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700"></span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} title={tooltip}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      title={tooltip}
    >
      {buttonContent}
    </button>
  );
}

