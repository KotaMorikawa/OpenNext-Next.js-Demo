type PageHeaderPresentationProps = {
  title: string;
  description: string;
};

// Presentational Component: UIの表示のみを担当
export function PageHeaderPresentation({
  title,
  description,
}: PageHeaderPresentationProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
    </div>
  );
}
