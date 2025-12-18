"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XIcon, CheckIcon, ExternalLinkIcon } from "@/app/components/icons";

interface QualityLevel {
  id: number;
  name: string | null;
}

interface Viewing {
  id: number;
  address: string | null;
}

interface AdditionalDetailsModalProps {
  viewing: Viewing;
  qualityLevels: QualityLevel[];
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  linkToPhotos: string;
  metroStationDistanceLevel: string;
  transportation: string;
}

interface FormErrors {
  linkToPhotos?: string;
}

export default function AdditionalDetailsModal({
  viewing,
  qualityLevels,
  isOpen,
  onClose,
}: AdditionalDetailsModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    linkToPhotos: "",
    metroStationDistanceLevel: "",
    transportation: "",
  });

  // Get background color class for quality level selects
  const getQualityLevelBgColor = (value: string): string => {
    if (!value || value === "") {
      return "bg-zinc-100 dark:bg-zinc-800";
    }

    const selectedId = parseInt(value);
    if (isNaN(selectedId)) {
      return "bg-zinc-100 dark:bg-zinc-800";
    }

    // Find the selected quality level by ID
    const selectedLevel = qualityLevels.find((level) => level.id === selectedId);

    if (!selectedLevel || !selectedLevel.name) {
      return "bg-zinc-100 dark:bg-zinc-800";
    }

    // Map quality level names to colors (case-insensitive, handle variations)
    const levelName = selectedLevel.name.toLowerCase().trim();

    // Bad - light orange
    if (levelName === "bad" || levelName.includes("bad")) {
      return "bg-orange-200 dark:bg-orange-900/40";
    }
    // Basic - light yellow
    if (levelName === "basic" || levelName.includes("basic")) {
      return "bg-yellow-200 dark:bg-yellow-900/40";
    }
    // Good - very light green
    if (levelName === "good" || levelName.includes("good")) {
      return "bg-green-100 dark:bg-green-900/30";
    }
    // Superb - light green
    if (levelName === "superb" || levelName.includes("superb")) {
      return "bg-green-200 dark:bg-green-900/40";
    }

    // Default to gray if name doesn't match
    return "bg-zinc-100 dark:bg-zinc-800";
  };

  // Load existing additional details when modal opens
  useEffect(() => {
    if (isOpen && viewing) {
      setIsLoading(true);
      fetch(`/api/additional-details?viewingId=${viewing.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const details = data.data;
            setFormData({
              linkToPhotos: details.linkToPhotos || "",
              metroStationDistanceLevel: details.metroStationDistanceLevel
                ? details.metroStationDistanceLevel.toString()
                : "",
              transportation: details.transportation || "",
            });
          } else {
            // Reset to empty form
            setFormData({
              linkToPhotos: "",
              metroStationDistanceLevel: "",
              transportation: "",
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading additional details:", err);
          setIsLoading(false);
        });
      setError(null);
      setSuccess(false);
      setErrors({});
    }
  }, [isOpen, viewing]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.linkToPhotos.trim()) {
      try {
        new URL(formData.linkToPhotos.trim());
      } catch {
        newErrors.linkToPhotos = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/additional-details", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewingId: viewing.id,
          linkToPhotos: formData.linkToPhotos.trim() || null,
          metroStationDistanceLevel: formData.metroStationDistanceLevel
            ? parseInt(formData.metroStationDistanceLevel)
            : null,
          transportation: formData.transportation.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save additional details");
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }

    if (success) {
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-zinc-900 sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Additional Details
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 flex-shrink-0"
              aria-label="Close modal"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="h-8 w-8 animate-spin text-zinc-600 dark:text-zinc-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Additional details saved successfully!
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="linkToPhotos"
                    className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                  >
                    Link to Photos
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      id="linkToPhotos"
                      name="linkToPhotos"
                      value={formData.linkToPhotos}
                      onChange={handleChange}
                      className={`flex-1 rounded-lg border px-4 py-3 text-sm transition-colors ${
                        errors.linkToPhotos
                          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                          : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                      } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                      placeholder="https://..."
                    />
                    {formData.linkToPhotos.trim() && (
                      <a
                        href={formData.linkToPhotos.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-3 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                        title="Open link in new tab"
                      >
                        <ExternalLinkIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                  {errors.linkToPhotos && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.linkToPhotos}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="metroStationDistanceLevel"
                    className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                  >
                    Metro Station Distance Level
                  </label>
                  <select
                    id="metroStationDistanceLevel"
                    name="metroStationDistanceLevel"
                    value={formData.metroStationDistanceLevel}
                    onChange={handleChange}
                    className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:text-zinc-50 ${getQualityLevelBgColor(formData.metroStationDistanceLevel)}`}
                  >
                    <option value="">Select level...</option>
                    {qualityLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name || `Level ${level.id}`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    None/Bad: 15+ minutes • Basic: 10-15 minutes • Good: 5-10 minutes • Superb: less than 5 minutes
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="transportation"
                    className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                  >
                    Transportation
                  </label>
                  <textarea
                    id="transportation"
                    name="transportation"
                    value={formData.transportation}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm transition-colors text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
                    placeholder="Enter transportation details..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

