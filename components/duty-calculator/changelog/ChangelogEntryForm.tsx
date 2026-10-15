"use client";

import { FormEvent, ReactNode, useState } from "react";
import {
  ChangelogEntryInput,
  ChangelogTypeLabels,
  ChangelogTypes,
} from "@/libs/supabase/tariff-changelog";
import * as mk from "@/components/ui/marketing/styles";
import { Select } from "@/components/ui/Select";

// A labelled control with an optional hint, in the marketing look
const Field = ({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-2">
    <label htmlFor={htmlFor} className={mk.fieldLabel}>
      {label}
    </label>
    {children}
    {hint && <p className="text-xs leading-snug text-slate-500">{hint}</p>}
  </div>
);

// The admin's form for adding or editing a changelog entry
export const ChangelogEntryForm = ({
  initial,
  onSave,
  onCancel,
}: {
  initial: ChangelogEntryInput;
  onSave: (input: ChangelogEntryInput) => Promise<void>;
  onCancel: () => void;
}) => {
  const [draft, setDraft] = useState<ChangelogEntryInput>({
    entry_date: initial.entry_date,
    type: initial.type,
    title: initial.title,
    summary: initial.summary,
    revision: initial.revision,
    status: initial.status,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ChangelogEntryInput>(key: K, value: ChangelogEntryInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className={`${mk.card} mb-10 flex flex-col gap-5 p-6`}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date" htmlFor="cl-date">
          <input
            id="cl-date"
            type="date"
            required
            className={mk.input}
            value={draft.entry_date}
            onChange={(e) => set("entry_date", e.target.value)}
          />
        </Field>
        <Field label="Type" htmlFor="cl-type">
          <Select<ChangelogEntryInput["type"]>
            id="cl-type"
            className="w-full"
            buttonClassName="!h-11 !rounded-lg !px-3.5 !text-base"
            value={draft.type}
            onChange={(type) => set("type", type)}
            options={ChangelogTypes.map((type) => ({ value: type, label: ChangelogTypeLabels[type] }))}
          />
        </Field>
        <Field label="Status" htmlFor="cl-status">
          <Select<ChangelogEntryInput["status"]>
            id="cl-status"
            className="w-full"
            buttonClassName="!h-11 !rounded-lg !px-3.5 !text-base"
            value={draft.status}
            onChange={(status) => set("status", status)}
            options={[
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
            ]}
          />
        </Field>
      </div>
      {draft.type === "revision" && (
        <Field label="HTS revision" htmlFor="cl-revision" hint="e.g. 2026HTSRev7">
          <input
            id="cl-revision"
            className={mk.input}
            value={draft.revision ?? ""}
            onChange={(e) => set("revision", e.target.value || null)}
          />
        </Field>
      )}
      <Field label="Title" htmlFor="cl-title" hint="One line: what changed.">
        <input
          id="cl-title"
          required
          maxLength={120}
          className={mk.input}
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Summary" htmlFor="cl-summary" hint="One to three sentences: what it means for an estimate.">
        <textarea
          id="cl-summary"
          required
          rows={3}
          className={mk.textarea}
          value={draft.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </Field>
      <div className="flex justify-end gap-2">
        <button type="button" className={`${mk.buttonSecondary} h-9 px-4 text-sm`} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className={`${mk.buttonPrimary} h-9 px-4 text-sm disabled:opacity-60`} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
};
