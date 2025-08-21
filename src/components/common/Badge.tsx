type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md";

type Props = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-2 py-1 text-sm",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: Props) {
  return (
    <span
      className={`inline-flex items-center rounded font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}
