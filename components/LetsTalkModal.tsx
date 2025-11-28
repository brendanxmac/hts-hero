"use client";

import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import apiClient from "@/libs/api";
import toast from "react-hot-toast";
import { ArrowRightIcon } from "@heroicons/react/16/solid";

export type ProductType = "classify" | "tariff" | "both";

interface ClassifyTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType?: ProductType;
  showProductSelector?: boolean;
}

const LetsTalkModal = ({
  isOpen,
  onClose,
  productType = "both",
  showProductSelector = false,
}: ClassifyTeamModalProps) => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductType>(productType);
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
    // Reset selected product when modal opens
    if (isOpen) {
      setSelectedProduct(productType);
    }
  }, [isOpen, user, productType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalProductType = showProductSelector
        ? selectedProduct
        : productType;

      await apiClient.post("/lead", {
        email: formData.email,
        name: formData.name,
        notes: formData.notes,
        productType: finalProductType,
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
        `https://calendly.com/brendan-htshero/30min?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}&a1=${encodeURIComponent(formData.notes)}`,
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

  if (!isOpen) return null;

  return (
    <div className="modal modal-open !m-0 z-50">
      <div className="modal-box w-11/12 max-w-2xl p-4 sm:p-6 max-h-[95vh] overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-3 mb-4">
          <h3 className="font-bold text-lg sm:text-xl md:text-2xl leading-tight flex-1">
            Book Your Demo
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
          {showProductSelector && (
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm sm:text-base font-medium">
                  What would you like a demo of?{" "}
                  <span className="text-error">*</span>
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct("classify")}
                  className={`btn flex-1 ${
                    selectedProduct === "classify"
                      ? "btn-primary text-white"
                      : "btn-outline"
                  }`}
                  disabled={isSubmitting}
                >
                  Quicker Classifications
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct("tariff")}
                  className={`btn flex-1 ${
                    selectedProduct === "tariff"
                      ? "btn-primary text-white"
                      : "btn-outline"
                  }`}
                  disabled={isSubmitting}
                >
                  Effortless Tariffs
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct("both")}
                  className={`btn flex-1 ${
                    selectedProduct === "both"
                      ? "btn-primary text-white"
                      : "btn-outline"
                  }`}
                  disabled={isSubmitting}
                >
                  Both
                </button>
              </div>
            </div>
          )}

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
              className="btn btn-primary w-full sm:w-auto sm:flex-1"
              disabled={isSubmitting || !formData.email || !formData.name}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="text-sm sm:text-base">Submitting...</span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">Select Time</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={handleClose}></div>
    </div>
  );
};

export default LetsTalkModal;
