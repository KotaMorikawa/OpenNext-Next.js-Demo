interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export function Card({
  children,
  hoverable = false,
  className = "",
}: CardProps) {
  const baseClasses = "bg-white border border-gray-200 rounded-lg shadow-sm";
  const hoverClasses = hoverable ? "hover:shadow-md transition-shadow" : "";

  const classes = `
    ${baseClasses}
    ${hoverClasses}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return <div className={classes}>{children}</div>;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <header className={`p-6 pb-4 ${className}`}>{children}</header>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`px-6 pb-4 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <footer className={`px-6 pb-6 ${className}`}>{children}</footer>;
}
