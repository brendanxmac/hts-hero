import { EmptyState } from "./EmptyState";

export const IncompleteView = () => (
  <div className="max-w-6xl mx-auto flex flex-col gap-6">
    <div>
      <h1 className="text-2xl font-bold text-base-content">
        CROSS Ruling Validation
      </h1>
      <p className="text-sm text-base-content/50 mt-1">
        See which CROSS rulings are relevant to this classification, and have
        our system analyze them for you.
      </p>
    </div>
    <EmptyState description="CROSS ruling validation will be available once the classification is complete. Finish classifying your item to search for relevant rulings." />
  </div>
);
