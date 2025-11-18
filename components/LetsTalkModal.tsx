"use client";

import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import apiClient from "@/libs/api";
import toast from "react-hot-toast";
import {
  ClipboardIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";

export type EnterpriseProductType = "classify" | "tariff";

interface ClassifyTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType?: EnterpriseProductType;
}

const LetsTalkModal = ({
  isOpen,
  onClose,
  productType = "classify",
}: ClassifyTeamModalProps) => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    notes: "",
  });

  // Prefill form data when modal opens and user is logged in
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        email: user.email || "",
        name: user.user_metadata?.full_name || "",
        notes: "",
      });
    }
  }, [isOpen, user]);

  const getProductName = () => {
    return productType === "classify" ? "Classify Pro" : "Tariff Pro";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post("/lead", {
        email: formData.email,
        name: formData.name,
        notes: formData.notes,
        productType,
      });

      toast.success(
        "Demo request successfull! Check your email to confirm your time slot (Be sure to check spam!).",
        { duration: 15000 }
      );

      // Reset form and close modal
      setFormData({ email: "", name: "", notes: "" });
      onClose();

      // Open a new tab at this url: https://calendly.com/brendan-htshero/30min
      window.open(
        `https://calendly.com/brendan-htshero/30min?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`,
        "_blank"
      );
    } catch (error) {
      console.error("Error submitting enterprise request:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("brendan@htshero.com");
    toast.success("Email copied to clipboard!", { duration: 3000 });
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box w-11/12 max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-3 mb-4">
          <h3 className="font-bold text-lg sm:text-xl md:text-2xl leading-tight flex-1">
            Get {getProductName()} for your Team
          </h3>

          <p className="text-sm sm:text-base text-base-content/70">
            Fill out the form below or{" "}
            <a href="mailto:brendan@htshero.com" className="link">
              send us an email
            </a>{" "}
            to schedule a quick demo!
            <br />
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm sm:text-base font-medium">
                Email <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="input input-bordered w-full text-sm sm:text-base"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm sm:text-base font-medium">
                Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="Your name"
              className="input input-bordered w-full text-sm sm:text-base"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm sm:text-base font-medium">
                Notes{" "}
                <span className="text-base-content/50 font-normal">
                  (Optional)
                </span>
              </span>
            </label>
            <textarea
              placeholder="Tell us about your team size, needs, or any questions you have..."
              className="textarea textarea-bordered w-full h-24 sm:h-32 text-sm sm:text-base resize-none"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4">
            <button
              type="button"
              className="btn btn-outline w-full sm:w-auto sm:flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-primary hover:bg-primary/80 text-white w-full sm:w-auto sm:flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="text-sm sm:text-base">Submitting...</span>
                </>
              ) : (
                <span className="text-sm sm:text-base">Book Your Demo</span>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        {/* <div className="divider mt-8">OR</div>

        <button
          type="button"
          onClick={handleCopyEmail}
          className="group btn btn-outline btn-primary w-full my-3"
          disabled={isSubmitting}
        >
          <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-base-100" />
          <span className="text-sm sm:text-base">Send Us An Email</span>
        </button> */}
      </div>
      <div className="modal-backdrop bg-black/50" onClick={handleClose}></div>
    </div>
  );
};

export default LetsTalkModal;
