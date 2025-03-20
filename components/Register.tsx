"use client";

import React from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  addToEarlyRegistration,
  RegistrationTrigger,
} from "../libs/early-registration";
import { addEarlyRegistrationAttempt } from "../libs/early-registration";
import { classNames } from "../utilities/style";

interface RegisterProps {
  triggerButton: RegistrationTrigger;
  isOpen: boolean;
  onClose: () => void;
}

export default function Register({
  triggerButton,
  isOpen,
  onClose,
}: RegisterProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [otherJobTitle, setOtherJobTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      addEarlyRegistrationAttempt(window.name, triggerButton);
    }
  }, [isOpen]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getJobTitle = () => {
    if (jobTitle === "other") {
      return otherJobTitle !== "" ? otherJobTitle : "other";
    }

    return jobTitle;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // TODO: add source (where the lead came from, if possible)
    const registrationResponse = await addToEarlyRegistration(
      window.name,
      email,
      triggerButton,
      getJobTitle()
    );

    if (registrationResponse.error) {
      console.error(
        "Error registering for early access:",
        registrationResponse
      );
      setError("Error registering for early access");
      setIsSubmitting(false);
      return;
    }

    if (registrationResponse.success) {
      setIsRegistered(true);
      setIsSubmitting(false);
    }

    setIsSubmitting(false);
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
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title
                  as="h3"
                  className="text-4xl font-extrabold tracking-tight text-white"
                >
                  Coming Soon!
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="rounded-full bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="mb-6 flex flex-col gap-2">
                <p className="text-gray-100">
                  We&apos;re finalizing HTS Hero for launch in{" "}
                  <span className="underline font-bold">May 2025</span>.
                </p>
                <p className="text-gray-100">
                  To thank you for your patience and early interest, here&apos;s
                  a special deal:
                </p>
              </div>

              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <h3 className="text-2xl text-white font-bold">
                    Early Registration Deal{" "}
                    <span className="text-xs text-gray-400"></span>
                  </h3>
                </div>
                <ul className="list-none list-inside text-gray-200 space-y-2">
                  <li className="text-[#40C969] font-bold">
                    <div className="flex items-center gap-2">
                      {/* <CheckSVG viewBox={"0 0 24 24"} /> */}
                      <p className="text-xl">💰</p>
                      <p className="animate-pulse">
                        50% discount on launch week!
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-2 font-semibold">
                      <p className="text-xl">🚀</p>
                      <span>Access the Product Before Launch</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-2 font-semibold">
                      <p className="text-xl">🔔</p>
                      <span>Update Announcements</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-2 font-semibold">
                      <div className="flex gap-2">
                        <p className="text-xl">🔑</p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <p>
                              <a
                                className="link"
                                href="https://www.facebook.com/groups/661021869759082"
                              >
                                HTS Hero Insider
                              </a>{" "}
                              Access
                            </p>
                            <p className="text-[#40C969]/80 text-xs font-bold">
                              (14 Spots Left)
                            </p>
                          </div>
                          <p className="text-gray-400 text-xs">
                            Talk with the team, get the inside scoop on
                            what&apos;s coming next, connect with other
                            classifiers, ask questions, give feedback, & more!
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              {isRegistered ? (
                <div className="space-y-4 my-10">
                  <hr className="border-gray-700" />
                  <p className="text-2xl  font-bold">
                    🎉 You&apos;re Registered!
                  </p>
                  {/* {email && (
                    <p>
                      We&apos;ve sent your welcome email{" "}
                      {email && `to ${email}`} and will be sure to keep you up
                      to date with HTS Hero&apos;s progress!
                    </p>
                  )} */}

                  <p>
                    Thank you for your interest in HTS Hero! We&apos;re excited
                    to help you speed up your classifications.
                  </p>

                  <p>
                    Feel free to share us with anyone who might be interested,
                    and if you have any feedback just reach out to{" "}
                    <span className="link">support@htshero.com</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className={`w-full input input-bordered bg-gray-800 text-white placeholder:text-gray-400 border-gray-700 focus:border-[#40C969] transition-colors ${
                        error ? "border-red-500" : ""
                      }`}
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                  <div>
                    <select
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className={classNames(
                        jobTitle === "" ? "text-gray-400" : "text-white",
                        "w-full select select-bordered bg-gray-800 text-sm border-gray-700 focus:border-[#40C969] transition-colors"
                      )}
                    >
                      <option value="" disabled>
                        Select your job title
                      </option>
                      <option value="customs_broker">Customs Broker</option>
                      <option value="customs_compliance_specialist">
                        Customs Compliance Specialist
                      </option>
                      <option value="import_export_specialist">
                        Import/Export Specialist
                      </option>
                      <option value="trade_compliance_manager">
                        Trade Compliance Manager
                      </option>
                      <option value="trade_analyst">Trade Analyst</option>
                      <option value="tariff_classification_analyst">
                        Tariff Classification Analyst
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {jobTitle === "other" && (
                    <div>
                      <input
                        type="text"
                        placeholder="Enter your job title"
                        value={otherJobTitle}
                        onChange={(e) => setOtherJobTitle(e.target.value)}
                        className="w-full input input-bordered bg-gray-800 text-white placeholder:text-gray-400 border-gray-700 focus:border-[#40C969] transition-colors"
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary bg-[#40C969] hover:bg-[#40C969]/90 text-white w-full border-none rounded-md shadow-lg hover:shadow-sm transition-all"
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Register"
                    )}
                  </button>
                </form>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
