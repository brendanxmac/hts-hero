"use client";

import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { BuyAttempt } from "../app/api/buy-attempt/route";
import { upsertBuyAttempt } from "../libs/buy-attempt";

interface ItsFreeProps {
  buyAttempt: BuyAttempt;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItsFree({ buyAttempt, isOpen, onClose }: ItsFreeProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [customJobTitle, setCustomJobTitle] = useState("");

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      {/* Full-screen container for centering */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-gray-900 shadow-gray-400/30 p-4 px-6 text-left align-middle shadow-md transition-all border border-gray-700">
            {/* Content */}
            <div className="mt-2">
              <div className="flex items-start justify-between mb-4">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-extrabold tracking-tight text-white"
                >
                  🎉 Good news — you get it free!
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="rounded-full bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="mb-6 flex flex-col gap-4">
                <p className="text-gray-100">
                  Instead of charging you, we&apos;re offering full access to
                  everyone who helps us shape the future of HTS Hero.
                </p>
                <p className="text-gray-100">
                  Your feedback helps us build the right features — and
                  eventually, the right pricing too.
                </p>

                <div className="mt-2">
                  <select
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="select select-bordered w-full bg-gray-800 text-white border-gray-700"
                  >
                    <option value="">What&apos;s your job title?</option>
                    <option value="Customs Broker">Customs Broker</option>
                    <option value="Freight Forwarder">Freight Forwarder</option>
                    <option value="Ecommerce Seller">Ecommerce Seller</option>
                    <option value="Other">Other</option>
                  </select>
                  {jobTitle === "Other" && (
                    <input
                      type="text"
                      value={customJobTitle}
                      onChange={(e) => setCustomJobTitle(e.target.value)}
                      placeholder="Please specify your job title"
                      className="input input-bordered w-full mt-2 bg-gray-800 text-white placeholder:text-gray-400 border-gray-700"
                    />
                  )}
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What excites you about HTS Hero?"
                    className="textarea textarea-bordered resize-none w-full mt-4 bg-gray-800 text-white placeholder:text-gray-400 border-gray-700 min-h-[100px]"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  setLoading(true);
                  await upsertBuyAttempt({
                    ...buyAttempt,
                    reason: feedback,
                    job_title:
                      jobTitle === "Other"
                        ? customJobTitle || "Other"
                        : jobTitle,
                  });
                  setLoading(false);
                  router.push("/signin");
                }}
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Try it Free!"
                )}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
