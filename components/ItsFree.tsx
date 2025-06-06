"use client";

import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface ItsFreeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ItsFree({ isOpen, onClose }: ItsFreeProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");

  const handleSignUp = () => {
    // Here you could save the feedback before redirecting
    router.push("/signin");
  };

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
                  Instead of charging you, we're offering full access to
                  everyone who helps us shape the future of HTS Hero.
                </p>
                <p className="text-gray-100">
                  Your feedback helps us build the right features — and
                  eventually, the right pricing too.
                </p>
                <div className="mt-2">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What are you most excited about with HTS Hero?"
                    className="resize-none w-full input input-bordered bg-gray-800 text-white placeholder:text-gray-400 border-gray-700 transition-colors min-h-[100px] p-3 rounded-md"
                  />
                </div>
              </div>

              <button onClick={handleSignUp} className="btn btn-primary w-full">
                Get Started
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
