"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XIcon, CheckIcon } from "@/app/components/icons";

interface QualityLevel {
  id: number;
  name: string | null;
}

interface Viewing {
  id: number;
  address: string | null;
}

interface VisitDetailsModalProps {
  viewing: Viewing;
  qualityLevels: QualityLevel[];
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  isSecurityDoor: boolean;
  buildingSecurityDoorsPercent: string;
  aluminumWindowsLevel: string;
  renovationKitchenLevel: string;
  renovationBathroomLevel: string;
  renovationLevel: string;
  viewLevel: string;
  balconyLevel: string;
  buildingLobbyLevel: string;
  buildingMaintenanceLevel: string;
  comments: string;
}

interface FormErrors {
  buildingSecurityDoorsPercent?: string;
  aluminumWindowsLevel?: string;
  renovationKitchenLevel?: string;
  renovationBathroomLevel?: string;
  renovationLevel?: string;
  viewLevel?: string;
  balconyLevel?: string;
  buildingLobbyLevel?: string;
  buildingMaintenanceLevel?: string;
}

export default function VisitDetailsModal({
  viewing,
  qualityLevels,
  isOpen,
  onClose,
}: VisitDetailsModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeTab, setActiveTab] = useState<string>("building");

  const [formData, setFormData] = useState<FormData>({
    isSecurityDoor: false,
    buildingSecurityDoorsPercent: "",
    aluminumWindowsLevel: "",
    renovationKitchenLevel: "",
    renovationBathroomLevel: "",
    renovationLevel: "",
    viewLevel: "",
    balconyLevel: "",
    buildingLobbyLevel: "",
    buildingMaintenanceLevel: "",
    comments: "",
  });

  // Load existing visit details when modal opens
  useEffect(() => {
    if (isOpen && viewing) {
      setActiveTab("building");
      setIsLoading(true);
      fetch(`/api/visit-details?viewingId=${viewing.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const details = data.data;
            setFormData({
              isSecurityDoor: details.isSecurityDoor ?? false,
              buildingSecurityDoorsPercent: details.buildingSecurityDoorsPercent
                ? details.buildingSecurityDoorsPercent.toString()
                : "",
              aluminumWindowsLevel: details.aluminumWindowsLevel
                ? details.aluminumWindowsLevel.toString()
                : "",
              renovationKitchenLevel: details.renovationKitchenLevel
                ? details.renovationKitchenLevel.toString()
                : "",
              renovationBathroomLevel: details.renovationBathroomLevel
                ? details.renovationBathroomLevel.toString()
                : "",
              renovationLevel: details.renovationLevel
                ? details.renovationLevel.toString()
                : "",
              viewLevel: details.viewLevel ? details.viewLevel.toString() : "",
              balconyLevel: details.balconyLevel
                ? details.balconyLevel.toString()
                : "",
              buildingLobbyLevel: details.buildingLobbyLevel
                ? details.buildingLobbyLevel.toString()
                : "",
              buildingMaintenanceLevel: details.buildingMaintenanceLevel
                ? details.buildingMaintenanceLevel.toString()
                : "",
              comments: details.comments || "",
            });
          } else {
            // Reset to empty form
            setFormData({
              isSecurityDoor: false,
              buildingSecurityDoorsPercent: "",
              aluminumWindowsLevel: "",
              renovationKitchenLevel: "",
              renovationBathroomLevel: "",
              renovationLevel: "",
              viewLevel: "",
              balconyLevel: "",
              buildingLobbyLevel: "",
              buildingMaintenanceLevel: "",
              comments: "",
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading visit details:", err);
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

    if (formData.buildingSecurityDoorsPercent.trim()) {
      const percent = parseInt(formData.buildingSecurityDoorsPercent);
      if (isNaN(percent) || percent < 1 || percent > 100) {
        newErrors.buildingSecurityDoorsPercent =
          "Percentage must be between 1 and 100";
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
      const response = await fetch("/api/visit-details", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewingId: viewing.id,
          isSecurityDoor: formData.isSecurityDoor,
          buildingSecurityDoorsPercent: formData.buildingSecurityDoorsPercent
            ? parseInt(formData.buildingSecurityDoorsPercent)
            : null,
          aluminumWindowsLevel: formData.aluminumWindowsLevel
            ? parseInt(formData.aluminumWindowsLevel)
            : null,
          renovationKitchenLevel: formData.renovationKitchenLevel
            ? parseInt(formData.renovationKitchenLevel)
            : null,
          renovationBathroomLevel: formData.renovationBathroomLevel
            ? parseInt(formData.renovationBathroomLevel)
            : null,
          renovationLevel: formData.renovationLevel
            ? parseInt(formData.renovationLevel)
            : null,
          viewLevel: formData.viewLevel ? parseInt(formData.viewLevel) : null,
          balconyLevel: formData.balconyLevel
            ? parseInt(formData.balconyLevel)
            : null,
          buildingLobbyLevel: formData.buildingLobbyLevel
            ? parseInt(formData.buildingLobbyLevel)
            : null,
          buildingMaintenanceLevel: formData.buildingMaintenanceLevel
            ? parseInt(formData.buildingMaintenanceLevel)
            : null,
          comments: formData.comments.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisitDetailsModal.tsx:232',message:'API error response',data:{status:response.status,error:data.error,details:data.details,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E,F'})}).catch(()=>{});
        // #endregion
        const errorMsg = data.error || "Failed to save visit details";
        const detailsMsg = data.details ? ` (${JSON.stringify(data.details)})` : "";
        throw new Error(errorMsg + detailsMsg);
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "number" ? value : value,
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
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Visit Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-label="Close modal"
          >
            <XIcon className="h-5 w-5" />
          </button>
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
                    Visit details saved successfully!
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

              {/* Tabs */}
              <div className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="overflow-x-auto -mb-px">
                  <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs">
                    {[
                      { id: "building", label: "Building" },
                      { id: "security", label: "Security" },
                      { id: "features", label: "Features" },
                      { id: "renovation", label: "Renovation" },
                      { id: "comments", label: "Comments" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {/* Building Tab */}
                {activeTab === "building" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="buildingLobbyLevel"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Building Lobby Level
                      </label>
                      <select
                        id="buildingLobbyLevel"
                        name="buildingLobbyLevel"
                        value={formData.buildingLobbyLevel}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="">Select level...</option>
                        {qualityLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name || `Level ${level.id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="buildingMaintenanceLevel"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Building Maintenance Level
                      </label>
                      <select
                        id="buildingMaintenanceLevel"
                        name="buildingMaintenanceLevel"
                        value={formData.buildingMaintenanceLevel}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="">Select level...</option>
                        {qualityLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name || `Level ${level.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isSecurityDoor"
                        name="isSecurityDoor"
                        checked={formData.isSecurityDoor}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                      <label
                        htmlFor="isSecurityDoor"
                        className="ml-3 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                      >
                        Security Door
                      </label>
                    </div>

                    <div>
                      <label
                        htmlFor="buildingSecurityDoorsPercent"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Building Security Doors Percent (1-100)
                      </label>
                      <input
                        type="number"
                        id="buildingSecurityDoorsPercent"
                        name="buildingSecurityDoorsPercent"
                        value={formData.buildingSecurityDoorsPercent}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        className={`w-full rounded-lg border px-4 py-3 text-sm transition-colors ${
                          errors.buildingSecurityDoorsPercent
                            ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                            : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                        } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                        placeholder="Enter percentage (1-100)"
                      />
                      {errors.buildingSecurityDoorsPercent && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.buildingSecurityDoorsPercent}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Features Tab */}
                {activeTab === "features" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="aluminumWindowsLevel"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Aluminum Windows Level
                      </label>
                      <select
                        id="aluminumWindowsLevel"
                        name="aluminumWindowsLevel"
                        value={formData.aluminumWindowsLevel}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="">Select level...</option>
                        {qualityLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name || `Level ${level.id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="viewLevel"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        View Level
                      </label>
                      <select
                        id="viewLevel"
                        name="viewLevel"
                        value={formData.viewLevel}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="">Select level...</option>
                        {qualityLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name || `Level ${level.id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="balconyLevel"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Balcony Level
                      </label>
                      <select
                        id="balconyLevel"
                        name="balconyLevel"
                        value={formData.balconyLevel}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="">Select level...</option>
                        {qualityLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name || `Level ${level.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Renovation Tab */}
                {activeTab === "renovation" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="renovationKitchenLevel"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Renovation Kitchen Level
                      </label>
                      <select
                        id="renovationKitchenLevel"
                        name="renovationKitchenLevel"
                        value={formData.renovationKitchenLevel}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="">Select level...</option>
                        {qualityLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name || `Level ${level.id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="renovationBathroomLevel"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Renovation Bathroom Level
                      </label>
                      <select
                        id="renovationBathroomLevel"
                        name="renovationBathroomLevel"
                        value={formData.renovationBathroomLevel}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="">Select level...</option>
                        {qualityLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name || `Level ${level.id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="renovationLevel"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Renovation Level
                      </label>
                      <select
                        id="renovationLevel"
                        name="renovationLevel"
                        value={formData.renovationLevel}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="">Select level...</option>
                        {qualityLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name || `Level ${level.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === "comments" && (
                  <div>
                    <label
                      htmlFor="comments"
                      className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                    >
                      Comments
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      rows={6}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm transition-colors text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
                      placeholder="Enter any additional comments or notes..."
                    />
                  </div>
                )}
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

