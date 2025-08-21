type Props = {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gray" | "white";
  text?: string;
};

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-6 h-6",
};

const colorClasses = {
  blue: "border-blue-600 border-t-transparent",
  gray: "border-gray-400 border-t-transparent",
  white: "border-white border-t-transparent",
};

export default function LoadingSpinner({
  size = "md",
  color = "blue",
  text,
}: Props) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`border-2 rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}
