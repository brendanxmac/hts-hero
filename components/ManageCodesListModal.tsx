import { useEffect, useState } from "react";
import Modal from "./Modal";
import TariffImpactCodesInput from "./TariffImpactCodesInput";
import toast from "react-hot-toast";
import {
  createHtsCodeSet,
  formatHtsCodeWithPeriods,
  getHtsCodesFromString,
} from "../libs/hts-code-set";
import { HtsCodeSet } from "../interfaces/hts";
import { validateTariffableHtsCode } from "../libs/hts";
import { User } from "@supabase/supabase-js";
import { sentEmailWithExampleOfTariffImpactCheck } from "../libs/tariff-impact-check";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";

interface ValidatedCode {
  code: string;
  error?: string;
}

interface Props {
  user: User;
  usersCodeSets?: HtsCodeSet[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSetCreated: (set: HtsCodeSet) => void;
  codes: string[];
}

export const ManageCodeListModal = ({
  user,
  isOpen,
  setIsOpen,
  onSetCreated,
  codes: passedCodes,
  usersCodeSets,
}: Props) => {
  const validateCodes = (codes: string[]) => {
    return codes.map((htsCode) => ({
      code: htsCode,
      error: validateTariffableHtsCode(htsCode).error,
    }));
  };
  const [name, setName] = useState("");
  const [inputValue, setInputValue] = useState(passedCodes.join(", "));
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState<ValidatedCode[]>([]);

  useEffect(() => {
    setInputValue(passedCodes.join(", "));
  }, [passedCodes]);

  useEffect(() => {
    const htsCodesFromInput = getHtsCodesFromString(inputValue).map(
      formatHtsCodeWithPeriods
    );
    const validatedCodes = validateCodes(htsCodesFromInput);

    setCodes(validatedCodes);
  }, [inputValue]);

  // Create new set of codes
  const createCodeSet = async (name: string) => {
    try {
      setSaving(true);
      const newHtsCodeSet = await createHtsCodeSet(inputValue, name);

      try {
        trackEvent(MixpanelEvent.CODE_SET_CREATED, {
          numCodes: newHtsCodeSet.codes.length,
        });
      } catch (e) {
        console.error("Error tracking code set created");
        console.error(e);
      }

      if (!usersCodeSets || usersCodeSets.length === 0) {
        if (user) {
          try {
            await sentEmailWithExampleOfTariffImpactCheck(user.email);
            toast.success(
              "List Created! Check your email for an example of an impact notification. (Be sure to check spam too!)",
              { duration: 10000 }
            );
          } catch (error) {
            console.error("Error sending tariff impact check example email");
            console.error(error);
            toast.success("List Created!");
          }
        } else {
          toast.success("List Created!");
        }
      } else {
        toast.success("List Created!");
      }
      onSetCreated(newHtsCodeSet);
      setIsOpen(false);
      setName("");
      setInputValue("");
      setCodes([]);
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

    // Check that there are codes
    if (codeSetName && noErrors && atLeastOneCode) {
      await createCodeSet(name.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="w-full px-8 pt-8 pb-4 max-w-3xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Create Tariff Notifications List
          </h2>
          <p className="text-base-content/70">
            Enter the HTS codes you want to do tariff impact checks on and get
            notified about.
          </p>
        </div>

        <form className="flex flex-col gap-4">
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
              // placeholder="Enter the codes you want to check against"
              placeholder="3808.94.10.00, 0202.20.80.00, etc..."
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

          <div className="flex gap-3 pt-2">
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
        </form>
      </div>
    </Modal>
  );
};
