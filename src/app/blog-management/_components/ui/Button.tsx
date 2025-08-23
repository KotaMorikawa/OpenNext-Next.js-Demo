import { forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      className = "",
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "font-medium transition-colors rounded-lg inline-flex items-center justify-center";

    const variantClasses = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400",
      secondary:
        "text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100",
      danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400",
      ghost: "text-blue-600 hover:text-blue-800 disabled:text-gray-400",
    };

    const sizeClasses = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    const isDisabled = disabled || isLoading;

    const classes = `
      ${baseClasses} 
      ${variantClasses[variant]} 
      ${sizeClasses[size]}
      ${isDisabled ? "cursor-not-allowed opacity-60" : ""}
      ${className}
    `
      .trim()
      .replace(/\s+/g, " ");

    return (
      <button ref={ref} disabled={isDisabled} className={classes} {...props}>
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>読み込み中</title>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            処理中...
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
