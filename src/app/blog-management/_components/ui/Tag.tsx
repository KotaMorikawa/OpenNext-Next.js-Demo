export type TagSize = "sm" | "md";

interface TagProps {
  color?: string | null;
  size?: TagSize;
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Tag({
  color,
  size = "sm",
  selected = false,
  onClick,
  children,
  className = "",
  style: customStyle,
}: TagProps) {
  const baseClasses =
    "font-medium rounded-full inline-flex items-center justify-center transition-colors";

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const defaultColor = "#6b7280";
  const tagColor = color || defaultColor;

  const interactiveClasses = onClick ? "cursor-pointer hover:opacity-80" : "";

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${interactiveClasses}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  const defaultStyle = selected
    ? {
        backgroundColor: tagColor,
        color: "#ffffff",
        border: `1px solid ${tagColor}`,
      }
    : {
        backgroundColor: `${tagColor}20`,
        color: tagColor,
        border: `1px solid ${tagColor}40`,
      };

  const style = { ...defaultStyle, ...customStyle };

  const Element = onClick ? "button" : "span";

  return (
    <Element
      className={classes}
      style={style}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {children}
    </Element>
  );
}
