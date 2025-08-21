type Props = {
  title: string;
  features: { label: string; description: string }[];
  variant?: "purple" | "blue" | "green";
};

const variantClasses = {
  purple: {
    container: "bg-purple-50 text-purple-700",
    title: "text-purple-900",
  },
  blue: {
    container: "bg-blue-50 text-blue-700",
    title: "text-blue-900",
  },
  green: {
    container: "bg-green-50 text-green-700",
    title: "text-green-900",
  },
};

export default function FeatureExplanation({
  title,
  features,
  variant = "purple",
}: Props) {
  const classes = variantClasses[variant];

  return (
    <div className={`p-3 rounded text-xs ${classes.container}`}>
      <h4 className={`font-medium mb-2 ${classes.title}`}>{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {features.map((feature) => (
          <div key={feature.label}>
            <strong>{feature.label}:</strong> {feature.description}
          </div>
        ))}
      </div>
    </div>
  );
}
