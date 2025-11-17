"use client";

import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import apiClient from "@/libs/api";
import toast from "react-hot-toast";

interface ClassifyTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClassifyTeamModal = ({ isOpen, onClose }: ClassifyTeamModalProps) => {
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
      });

      toast.success(
        "Request sent successfully! We'll reach out to you ASAP to get started!",
        { duration: 10000 }
      );

      // Reset form and close modal
      setFormData({ email: "", name: "", notes: "" });
      onClose();
    } catch (error) {
      console.error("Error submitting classify team request:", error);
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
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-2">
          Get Classify Pro for your Team
        </h3>
        <p className="text-base-content/70 mb-6">
          Fill out the form below and{" "}
          <span>we&apos;ll reach out to discuss your team&apos;s needs!</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Email <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="input input-bordered w-full"
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
              <span className="label-text">
                Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="Your name"
              className="input input-bordered w-full"
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
              <span className="label-text">Notes</span>
            </label>
            <textarea
              placeholder="Tell us about your team size, needs, or any questions you have..."
              className="textarea textarea-bordered w-full h-32"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-primary hover:bg-primary/80 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
};

export default ClassifyTeamModal;
