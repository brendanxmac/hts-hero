import { useEffect, useState } from "react";
import Modal from "./Modal";
import TariffImpactCodesInput from "./TariffImpactCodesInput";
import toast from "react-hot-toast";
import {
  createHtsCodeSet,
  fetchHtsCodeSetsForUser,
  formatHtsCodeWithPeriods,
  getHtsCodesFromString,
} from "../libs/hts-code-set";
import { HtsCodeSet } from "../interfaces/hts";
import { validateTariffableHtsCode } from "../libs/hts";

interface ValidatedCode {
  code: string;
  error?: string;
}

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSetCreated: (set: HtsCodeSet) => void;
}

export const ManageCodeListModal = ({
  isOpen,
  setIsOpen,
  onSetCreated,
}: Props) => {
  const [name, setName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState<ValidatedCode[]>([]);

  useEffect(() => {
    const htsCodesFromInput = getHtsCodesFromString(inputValue).map(
      formatHtsCodeWithPeriods
    );
    const validatedCodes = htsCodesFromInput.map((htsCode) => {
      return {
        code: htsCode,
        error: validateTariffableHtsCode(htsCode).error,
      };
    });

    setCodes(validatedCodes);
  }, [inputValue]);

  // Create new set of codes
  const upsertCodeSet = async (name: string, codes: string[]) => {
    console.log("Creating New Code Set");
    try {
      setSaving(true);
      const newHtsCodeSet = await createHtsCodeSet(inputValue, name);
      onSetCreated(newHtsCodeSet);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error saving codes");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    // Check that there is a name
    const codeSetName = name.trim();
    const noErrors = codes.every(({ error }) => !error);
    const atLeastOneCode = codes.length > 0;
    const htsCodes = codes.map(({ code }) => code);
    // Check that there are codes
    if (codeSetName && noErrors && atLeastOneCode) {
      await upsertCodeSet(name.trim(), htsCodes);
    }
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="w-full p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-base-content">
            Create List of Codes
          </h2>
          <p className="text-base-content/70">
            Enter the HTS codes you want to do tariff impact checks on. We will
            also notify you when these codes are affected by new tariff
            announcements.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-base-content"
            >
              List Name<sup className="text-error text-xs">*</sup>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full placeholder:text-sm placeholder:text-base-content/50"
              placeholder="e.g. My Imports, Product Name, Client Name, Country Name, etc..."
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-base-content"
            >
              HTS Codes<sup className="text-error text-xs">*</sup>
            </label>
            <TariffImpactCodesInput
              value={inputValue}
              onChange={(value) => setInputValue(value)}
              placeholder="Enter the codes you want to check against"
            />
          </div>

          {codes.length > 0 && codes.some(({ error }) => error) && (
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-base-content mb-2"
              >
                ⚠️ Invalid Codes
              </label>
              <div className="w-full rounded-md border-2 border-warning overflow-hidden">
                <table className="table table-zebra table-sm table-pin-cols w-full">
                  <thead className="bg-base-100">
                    <tr>
                      <th>Code</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes
                      .filter(({ error }) => error)
                      .map(({ code, error }, index) => (
                        <tr key={code + index}>
                          <td>{code}</td>
                          <td>{error || "-"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost flex-1"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              disabled={
                !name.trim() ||
                saving ||
                codes.some(({ error }) => error) ||
                codes.length === 0
              }
              onClick={() => {
                handleCreate();
              }}
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
