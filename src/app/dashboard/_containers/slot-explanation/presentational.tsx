type SlotInfo = {
  title: string;
  description: string;
  codePath: string;
  bgColor: string;
  textColor: string;
  codeColor: string;
};

type SlotExplanationPresentationProps = {
  slots: SlotInfo[];
};

// Presentational Component: UIの表示のみを担当
export function SlotExplanationPresentation({
  slots,
}: SlotExplanationPresentationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {slots.map((slot) => (
        <div key={slot.title} className={`${slot.bgColor} p-4 rounded-lg`}>
          <h4 className={`font-medium ${slot.textColor} mb-2`}>{slot.title}</h4>
          <p className={`text-sm ${slot.textColor} mb-3`}>{slot.description}</p>
          <div className={`text-xs ${slot.codeColor}`}>
            <code>{slot.codePath}</code>
          </div>
        </div>
      ))}
    </div>
  );
}
