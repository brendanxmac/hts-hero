"use client";

import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Register({ isOpen, onClose }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement your registration logic here

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Full-screen container for centering */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
            {/* Content */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-extrabold tracking-tight text-white"
                >
                  Register for Early Access
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="rounded-full bg-white p-1 hover:bg-gray-200 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-black" />
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                Sign up to start classifying products in minutes, not hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full input input-bordered bg-neutral-700 text-white placeholder:text-gray-400 border-gray-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary bg-[#40C969] hover:bg-[#40C969]/80 text-white w-full rounded-md"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
