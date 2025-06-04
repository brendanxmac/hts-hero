interface Props {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationCard = ({
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card bg-neutral text-neutral-content w-96">
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <div className="flex flex-col gap-4">
            {description.split(".").map((sentence, index) => (
              <p
                key={index}
                className={index > 0 && "text-sm font-bold text-accent"}
              >
                {`${sentence}.`}
              </p>
            ))}
          </div>
          <div className="card-actions justify-end">
            <button className="btn btn-sm btn-ghost" onClick={onCancel}>
              {cancelText}
            </button>
            <button className="btn btn-sm btn-primary" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
