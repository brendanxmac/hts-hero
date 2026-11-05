import { EmptyState } from "./EmptyState";

export const IncompleteView = () => (
  <div className="max-w-6xl mx-auto flex flex-col gap-6">
    <div>
      <h1 className="text-2xl font-bold text-base-content">
        CROSS Ruling Validation
      </h1>
      <p className="text-sm text-base-content/50 mt-1">
        Find CBP rulings for similar products on CROSS, then save the ones
        that back this classification as evidence.
      </p>
    </div>
    <EmptyState description="CROSS ruling validation will be available once the classification is complete. Finish classifying your item to look up rulings and save them as evidence." />
  </div>
);
