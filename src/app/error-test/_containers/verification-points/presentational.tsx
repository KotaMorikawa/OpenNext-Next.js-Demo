type VerificationPointsPresentationProps = {
  verificationPoints: string[];
};

// Presentational Component: UIの表示のみを担当
export function VerificationPointsPresentation({
  verificationPoints,
}: VerificationPointsPresentationProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">検証ポイント</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-600">
        {verificationPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
