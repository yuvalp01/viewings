"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { XIcon, CheckIcon, CheckCircleIcon } from "@/app/components/icons";

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
  isSecurityDoor: boolean | null;
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
  expectedMinimalRent: string;
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
  expectedMinimalRent?: string;
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
    isSecurityDoor: null,
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
    expectedMinimalRent: "",
  });

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const totalFields = 12;
    let filledFields = 0;

    // isSecurityDoor: only count if not null
    if (formData.isSecurityDoor !== null) {
      filledFields++;
    }

    // String fields: count if not empty after trim
    const stringFields = [
      "buildingSecurityDoorsPercent",
      "aluminumWindowsLevel",
      "renovationKitchenLevel",
      "renovationBathroomLevel",
      "renovationLevel",
      "viewLevel",
      "balconyLevel",
      "buildingLobbyLevel",
      "buildingMaintenanceLevel",
      "comments",
      "expectedMinimalRent",
    ];

    stringFields.forEach((field) => {
      const value = formData[field as keyof FormData];
      if (typeof value === "string" && value.trim() !== "") {
        filledFields++;
      }
    });

    return Math.round((filledFields / totalFields) * 100);
  }, [formData]);

  // Ref for three-state checkbox
  const securityDoorCheckboxRef = useRef<HTMLInputElement>(null);

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

  // Check if a tab is complete
  const isTabComplete = useMemo(() => {
    const tabFields: Record<string, (keyof FormData)[]> = {
      building: ["buildingLobbyLevel", "buildingMaintenanceLevel", "buildingSecurityDoorsPercent"],
      features: ["aluminumWindowsLevel", "viewLevel", "balconyLevel", "isSecurityDoor"],
      renovation: [
        "renovationKitchenLevel",
        "renovationBathroomLevel",
        "renovationLevel",
      ],
      comments: ["expectedMinimalRent", "comments"],
    };

    const result: Record<string, boolean> = {};

    Object.entries(tabFields).forEach(([tabId, fields]) => {
      const allFieldsFilled = fields.every((field) => {
        const value = formData[field];
        if (field === "isSecurityDoor") {
          return value !== null;
        }
        return typeof value === "string" && value.trim() !== "";
      });
      result[tabId] = allFieldsFilled;
    });

    return result;
  }, [formData]);

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
              isSecurityDoor: details.isSecurityDoor ?? null,
              buildingSecurityDoorsPercent: details.buildingSecurityDoorsPercent
                ? details.buildingSecurityDoorsPercent.toString()
                : "",
              aluminumWindowsLevel: details.aluminumWindowsLevel !== null && details.aluminumWindowsLevel !== undefined
                ? details.aluminumWindowsLevel.toString()
                : "",
              renovationKitchenLevel: details.renovationKitchenLevel !== null && details.renovationKitchenLevel !== undefined
                ? details.renovationKitchenLevel.toString()
                : "",
              renovationBathroomLevel: details.renovationBathroomLevel !== null && details.renovationBathroomLevel !== undefined
                ? details.renovationBathroomLevel.toString()
                : "",
              renovationLevel: details.renovationLevel !== null && details.renovationLevel !== undefined
                ? details.renovationLevel.toString()
                : "",
              viewLevel: details.viewLevel !== null && details.viewLevel !== undefined ? details.viewLevel.toString() : "",
              balconyLevel: details.balconyLevel !== null && details.balconyLevel !== undefined
                ? details.balconyLevel.toString()
                : "",
              buildingLobbyLevel: details.buildingLobbyLevel !== null && details.buildingLobbyLevel !== undefined
                ? details.buildingLobbyLevel.toString()
                : "",
              buildingMaintenanceLevel: details.buildingMaintenanceLevel !== null && details.buildingMaintenanceLevel !== undefined
                ? details.buildingMaintenanceLevel.toString()
                : "",
              comments: details.comments || "",
              expectedMinimalRent: details.expectedMinimalRent
                ? details.expectedMinimalRent.toString()
                : "",
            });
          } else {
            // Reset to empty form
            setFormData({
              isSecurityDoor: null,
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
              expectedMinimalRent: "",
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

    if (formData.expectedMinimalRent.trim()) {
      const rentNum = parseFloat(formData.expectedMinimalRent);
      if (isNaN(rentNum) || rentNum < 0) {
        newErrors.expectedMinimalRent = "Expected minimal rent must be a non-negative number";
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
          isSecurityDoor: formData.isSecurityDoor ?? null,
          buildingSecurityDoorsPercent: formData.buildingSecurityDoorsPercent
            ? parseInt(formData.buildingSecurityDoorsPercent)
            : null,
          aluminumWindowsLevel: formData.aluminumWindowsLevel !== ""
            ? parseInt(formData.aluminumWindowsLevel)
            : null,
          renovationKitchenLevel: formData.renovationKitchenLevel !== ""
            ? parseInt(formData.renovationKitchenLevel)
            : null,
          renovationBathroomLevel: formData.renovationBathroomLevel !== ""
            ? parseInt(formData.renovationBathroomLevel)
            : null,
          renovationLevel: formData.renovationLevel !== ""
            ? parseInt(formData.renovationLevel)
            : null,
          viewLevel: formData.viewLevel !== "" ? parseInt(formData.viewLevel) : null,
          balconyLevel: formData.balconyLevel !== ""
            ? parseInt(formData.balconyLevel)
            : null,
          buildingLobbyLevel: formData.buildingLobbyLevel !== ""
            ? parseInt(formData.buildingLobbyLevel)
            : null,
          buildingMaintenanceLevel: formData.buildingMaintenanceLevel !== ""
            ? parseInt(formData.buildingMaintenanceLevel)
            : null,
          comments: formData.comments.trim() || null,
          expectedMinimalRent: formData.expectedMinimalRent.trim()
            ? parseFloat(formData.expectedMinimalRent)
            : null,
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

  const handleSecurityDoorChange = () => {
    setFormData((prev) => {
      // Cycle through states: null → true → false → null
      let nextValue: boolean | null;
      if (prev.isSecurityDoor === null) {
        nextValue = true;
      } else if (prev.isSecurityDoor === true) {
        nextValue = false;
      } else {
        nextValue = null;
      }

      return {
        ...prev,
        isSecurityDoor: nextValue,
      };
    });

    if (success) {
      setSuccess(false);
    }
  };

  // Update checkbox indeterminate state when formData changes
  useEffect(() => {
    if (securityDoorCheckboxRef.current) {
      securityDoorCheckboxRef.current.indeterminate =
        formData.isSecurityDoor === null;
      securityDoorCheckboxRef.current.checked =
        formData.isSecurityDoor === true;
    }
  }, [formData.isSecurityDoor]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Skip default checkbox handling for isSecurityDoor
    if (name === "isSecurityDoor") {
      return;
    }

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
        <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                Visit Details
              </h2>
              {/* Progress Bar */}
              <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xs">
                <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden dark:bg-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300 ease-out dark:from-green-400 dark:to-green-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400 whitespace-nowrap tabular-nums">
                  {completionPercentage}%
                </span>
              </div>
            </div>
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
                      { id: "features", label: "Features" },
                      { id: "renovation", label: "Renovation" },
                      { id: "comments", label: "Comments" },
                    ].map((tab) => {
                      const isComplete = isTabComplete[tab.id];
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                            isActive
                              ? isComplete
                                ? "border-green-600 text-green-700 dark:border-green-400 dark:text-green-300"
                                : "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                              : isComplete
                              ? "border-transparent text-green-600 hover:text-green-700 hover:border-green-300 dark:text-green-400 dark:hover:text-green-300"
                              : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300"
                          }`}
                        >
                          <span>{tab.label}</span>
                          {isComplete && (
                            <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
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
                        className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:text-zinc-50 ${getQualityLevelBgColor(formData.buildingLobbyLevel)}`}
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
                        className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:text-zinc-50 ${getQualityLevelBgColor(formData.buildingMaintenanceLevel)}`}
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
                    <div className="flex items-center">
                      <input
                        ref={securityDoorCheckboxRef}
                        type="checkbox"
                        id="isSecurityDoor"
                        name="isSecurityDoor"
                        checked={formData.isSecurityDoor === true}
                        onChange={handleSecurityDoorChange}
                        className="h-5 w-5 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                      <label
                        htmlFor="isSecurityDoor"
                        className="ml-3 block text-sm font-medium text-zinc-900 dark:text-zinc-50 cursor-pointer"
                        onClick={handleSecurityDoorChange}
                      >
                        Security Door
                        {formData.isSecurityDoor === null && (
                          <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                            (Not specified)
                          </span>
                        )}
                        {formData.isSecurityDoor === false && (
                          <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                            (No)
                          </span>
                        )}
                        {formData.isSecurityDoor === true && (
                          <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                            (Yes)
                          </span>
                        )}
                      </label>
                    </div>

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
                        className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:text-zinc-50 ${getQualityLevelBgColor(formData.aluminumWindowsLevel)}`}
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
                        className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:text-zinc-50 ${getQualityLevelBgColor(formData.viewLevel)}`}
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
                        className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:text-zinc-50 ${getQualityLevelBgColor(formData.balconyLevel)}`}
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
                        className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:text-zinc-50 ${getQualityLevelBgColor(formData.renovationKitchenLevel)}`}
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
                        className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:text-zinc-50 ${getQualityLevelBgColor(formData.renovationBathroomLevel)}`}
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
                        className={`w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:text-zinc-50 ${getQualityLevelBgColor(formData.renovationLevel)}`}
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
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="expectedMinimalRent"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Expected Minimal Rent
                      </label>
                      <input
                        type="number"
                        id="expectedMinimalRent"
                        name="expectedMinimalRent"
                        value={formData.expectedMinimalRent}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={`w-full rounded-lg border px-4 py-3 text-sm transition-colors ${
                          errors.expectedMinimalRent
                            ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                            : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                        } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                        placeholder="e.g., 1200"
                      />
                      {errors.expectedMinimalRent && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.expectedMinimalRent}
                        </p>
                      )}
                    </div>
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

