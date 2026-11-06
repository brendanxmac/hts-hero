"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Select } from "@/components/ui/Select";
import * as ui from "@/components/ui/styles";
import { getImportLists, ListTarget, useImportLists } from "../catalogStore";

// Where imports being added go: one of the user's lists, or a new one they name (a client's name).
// In every add flow (the add dialog, the import takeover, "Add to Duty Guard" buttons). Starts on
// the list shown.

const NEW = "__new";
const n = (x: number) => x.toLocaleString("en-US");

// The list shown, as a target
export const activeTarget = (): ListTarget => ({ listId: getImportLists().activeId });

// A target that can be added to: a new list needs a name
export const targetReady = (t: ListTarget) => Boolean(t.listId || t.newListName?.trim());

export const useListTarget = () => {
  const { activeId } = useImportLists();
  const [target, setTarget] = useState<ListTarget>({ listId: activeId });
  // Follows the list shown until the user picks
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    if (!picked) setTarget({ listId: activeId });
  }, [activeId, picked]);
  return {
    target,
    setTarget: (t: ListTarget) => {
      setPicked(true);
      setTarget(t);
    },
    reset: () => {
      setPicked(false);
      setTarget({ listId: getImportLists().activeId });
    },
  };
};

export const ListPicker = ({
  value,
  onChange,
  label = "Add to list",
  className = "",
  size = "md",
}: {
  value: ListTarget;
  onChange: (t: ListTarget) => void;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) => {
  const { lists } = useImportLists();
  const isNew = value.newListName !== undefined;
  const options = [
    ...lists.map((l) => ({ value: l.id, label: l.name, description: `${n(l.count)} ${l.count === 1 ? "import" : "imports"}` })),
    { value: NEW, label: "+ New list…", description: "Name it after a client, say" },
  ];
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className={ui.fieldLabel} id="tt-list-picker-label">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        <Select
          value={isNew ? NEW : (value.listId ?? lists[0]?.id ?? NEW)}
          onChange={(v) => onChange(v === NEW ? { newListName: "" } : { listId: v })}
          options={options}
          label={label}
          size={size}
          className={isNew ? "w-48" : "w-full sm:w-72"}
          menuClassName="w-72"
        />
        {isNew && (
          <input
            autoFocus
            value={value.newListName}
            maxLength={80}
            onChange={(e) => onChange({ newListName: e.target.value })}
            placeholder="New list name, e.g. Acme Imports"
            aria-label="New list name"
            className={`${size === "sm" ? ui.inputSm : ui.input} min-w-0 flex-1`}
          />
        )}
      </div>
    </div>
  );
};

// A flow's choice of list, for the steps inside it (the import takeover's add pages)
export const ListTargetContext = createContext<{ target: ListTarget; setTarget: (t: ListTarget) => void } | null>(null);
export const useListTargetContext = () => useContext(ListTargetContext);
