interface Props {
  label: string;
}

export const CenteredSpinner = ({ label }: Props) => (
  <div className="flex flex-col items-center justify-center py-16">
    <span className="loading loading-spinner loading-lg text-primary" />
    <p className="text-sm text-base-content/50 mt-4">{label}</p>
  </div>
);
