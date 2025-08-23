interface TimelineStep {
  label: string;
  duration: number;
  type: "db" | "cache" | "process" | "hit" | "miss";
  icon?: string;
}

interface TimelineProps {
  title: string;
  steps: TimelineStep[];
  totalTime: number;
  variant: "danger" | "warning" | "success";
  description?: string;
}

export function Timeline({
  title,
  steps,
  totalTime,
  variant,
  description,
}: TimelineProps) {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "danger":
        return {
          border: "border-red-500",
          bg: "bg-red-50",
          text: "text-red-700",
          accent: "border-red-200",
        };
      case "warning":
        return {
          border: "border-yellow-500",
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          accent: "border-yellow-200",
        };
      case "success":
        return {
          border: "border-green-500",
          bg: "bg-green-50",
          text: "text-green-700",
          accent: "border-green-200",
        };
      default:
        return {
          border: "border-gray-500",
          bg: "bg-gray-50",
          text: "text-gray-700",
          accent: "border-gray-200",
        };
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case "hit":
        return "bg-green-500";
      case "miss":
        return "bg-red-500";
      case "cache":
        return "bg-blue-500";
      case "db":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const classes = getVariantClasses(variant);

  return (
    <div className={`border-2 rounded-lg p-6 ${classes.border} ${classes.bg}`}>
      {/* ヘッダー */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>

      {/* タイムライン */}
      <div className="relative">
        {/* 縦の線 */}
        <div className="absolute left-4 top-0 bottom-16 w-0.5 bg-gray-300" />

        {/* 各ステップ */}
        {steps.map((step, index) => (
          <div key={index} className="flex items-start mb-6 relative">
            {/* ノード */}
            <div
              className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${getStepColor(step.type)}
              text-white text-xs font-bold z-10 relative
            `}
            >
              {step.icon || index + 1}
            </div>

            {/* ラベルと時間 */}
            <div className="ml-4 flex-1">
              <div className="font-medium text-gray-900">{step.label}</div>
              <div className="text-sm text-gray-600">
                {step.duration.toFixed(2)}ms
              </div>

              {/* プログレスバー（視覚的効果） */}
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    step.type === "hit"
                      ? "bg-green-400"
                      : step.type === "cache"
                        ? "bg-blue-400"
                        : step.type === "db"
                          ? "bg-orange-400"
                          : "bg-gray-400"
                  }`}
                  style={{
                    width: `${Math.min((step.duration / Math.max(...steps.map((s) => s.duration))) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* 合計時間 */}
        <div
          className={`
          mt-6 pt-4 border-t-2 ${classes.accent}
          ${classes.text} font-bold text-lg
          flex items-center justify-between
        `}
        >
          <span>合計時間:</span>
          <span className="text-xl">{totalTime.toFixed(2)}ms</span>
        </div>
      </div>
    </div>
  );
}
