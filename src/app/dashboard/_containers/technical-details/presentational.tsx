type TechnicalDetail = {
  label: string;
  description: string;
  hasCode?: boolean;
  code?: string;
};

type TechnicalDetailsPresentationProps = {
  title: string;
  details: TechnicalDetail[];
};

// Presentational Component: UIの表示のみを担当
export function TechnicalDetailsPresentation({
  title,
  details,
}: TechnicalDetailsPresentationProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2 text-sm text-gray-600">
        {details.map((detail) => (
          <div key={detail.label} className="flex items-start">
            <span className="font-medium mr-2 text-gray-900">
              {detail.label}:
            </span>
            {detail.hasCode ? (
              <code className="text-xs bg-gray-200 px-1 rounded">
                {detail.code}
              </code>
            ) : (
              <span>{detail.description}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
