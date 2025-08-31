import { useState } from "react";
import Modal from "./Modal";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (name: string, description: string) => void;
  isLoading: boolean;
}

export const SaveCodeListModal = ({
  isOpen,
  setIsOpen,
  onSave,
  isLoading,
}: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      setName("");
      setDescription("");
    }
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="w-full p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-base-content mb-2">
            Save List of Codes
          </h2>
          <p className="text-sm text-base-content/70">
            Give your list of codes a name to save them for later
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-base-content mb-2"
            >
              List Name<sup className="text-error text-xs">*</sup>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter a name for your list"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-base-content mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Enter a description (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Save List"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
