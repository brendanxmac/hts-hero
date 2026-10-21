"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { NewsPreferencesFields, type NewsPreferencesValue } from "@/components/tariff-updates/NewsPreferencesFields";

// Tariff news for the signed-in user: every new US tariff action from /tariff-updates, weekly or
// as it happens, for the laws and countries they pick. Goes by email and to the Slack / Teams set
// above. Every account starts on the weekly digest.
export const TariffNewsSettings = () => {
  const [saved, setSaved] = useState<NewsPreferencesValue | null>(null);
  const [prefs, setPrefs] = useState<NewsPreferencesValue | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/tracker/news")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Couldn't load your tariff news choices"))))
      .then((p: NewsPreferencesValue) => {
        setSaved(p);
        setPrefs(p);
      })
      .catch((e) => toast.error(e.message));
  }, []);

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tracker/news", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prefs) });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Couldn't save");
      setSaved(prefs);
      toast.success("Tariff news saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  };

  const changed = !!prefs && JSON.stringify(prefs) !== JSON.stringify(saved);

  return (
    <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-5`} aria-labelledby="tt-tariff-news">
      <div className="flex flex-col gap-1">
        <h2 id="tt-tariff-news" className={tt.title}>
          Tariff News
        </h2>
        <p className="text-sm text-base-content/70">
          Every new US tariff action from{" "}
          <Link href="/tariff-updates" className={ui.link}>
            tariff updates
          </Link>
          , in plain English with the official documents. By email, and to Slack or Teams if you&apos;ve set them above.
        </p>
      </div>
      {prefs ? (
        <>
          <NewsPreferencesFields value={prefs} onChange={setPrefs} allowOff />
          <button type="button" className={`${ui.button({ variant: "primary" })} self-start`} disabled={!changed || saving} onClick={save}>
            {saving ? "Saving…" : "Save tariff news"}
          </button>
        </>
      ) : (
        <span className="loading loading-spinner loading-sm text-base-content/50" />
      )}
    </section>
  );
};
