"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XIcon, BriefcaseIcon, UserSearchIcon, LightBulbIcon, BadgeIcon } from "@/app/components/icons";

interface Stakeholder {
  id: number;
  name: string;
  type: number | null;
}

interface Viewing {
  id: number;
  address: string | null;
}

interface VisibilityModalProps {
  viewing: Viewing;
  stakeholders: Stakeholder[];
  isOpen: boolean;
  onClose: () => void;
}

export default function VisibilityModal({
  viewing,
  stakeholders,
  isOpen,
  onClose,
}: VisibilityModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedStakeholderIds, setSelectedStakeholderIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<Set<number>>(new Set([2, 3])); // Default: Prospect and Potential

  // Load visibility assignments when modal opens
  useEffect(() => {
    if (isOpen && viewing) {
      setIsLoading(true);
      fetch(`/api/viewing-visibility?viewingId=${viewing.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            // Set selected stakeholders from API response
            setSelectedStakeholderIds(new Set(data.data));
          } else {
            // If no records exist, all stakeholders are visible by default (opt-out model)
            // So we show all as selected initially
            setSelectedStakeholderIds(new Set(stakeholders.map((s) => s.id)));
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading visibility:", err);
          setError("Failed to load visibility assignments");
          setIsLoading(false);
        });
      setError(null);
      setSuccess(false);
      setSearchQuery(""); // Reset search when modal opens
      setSelectedTypes(new Set([2, 3])); // Reset to default types (Prospect and Potential)
    }
  }, [isOpen, viewing, stakeholders]);

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

  const handleToggleStakeholder = (stakeholderId: number) => {
    setSelectedStakeholderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stakeholderId)) {
        newSet.delete(stakeholderId);
      } else {
        newSet.add(stakeholderId);
      }
      return newSet;
    });
    if (error) {
      setError(null);
    }
  };

  // Calculate counts per type
  const typeCounts: Record<number, number> = {};
  stakeholders.forEach((stakeholder) => {
    if (stakeholder.type !== null) {
      typeCounts[stakeholder.type] = (typeCounts[stakeholder.type] || 0) + 1;
    }
  });

  // Filter stakeholders based on search query AND selected types
  const filteredStakeholders = stakeholders.filter((stakeholder) => {
    const matchesSearch = stakeholder.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      stakeholder.type !== null && selectedTypes.has(stakeholder.type);
    return matchesSearch && matchesType;
  });

  // Type definitions
  const typeLabels: Record<number, string> = {
    1: "Investor",
    2: "Prospect",
    3: "Potential",
    4: "Agent",
  };

  // Type icons
  const typeIcons: Record<number, React.ComponentType<{ className?: string }>> = {
    1: BriefcaseIcon,
    2: UserSearchIcon,
    3: LightBulbIcon,
    4: BadgeIcon,
  };

  const handleToggleType = (type: number) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    // Select all filtered stakeholders
    const newSelected = new Set(selectedStakeholderIds);
    filteredStakeholders.forEach((s) => newSelected.add(s.id));
    setSelectedStakeholderIds(newSelected);
    if (error) {
      setError(null);
    }
  };

  const handleDeselectAllFiltered = () => {
    // Deselect all filtered stakeholders (respects both search and type filter)
    const newSelected = new Set(selectedStakeholderIds);
    if (searchQuery || selectedTypes.size < 4) {
      // Only deselect filtered stakeholders
      filteredStakeholders.forEach((s) => newSelected.delete(s.id));
    } else {
      // Deselect all stakeholders
      newSelected.clear();
    }
    setSelectedStakeholderIds(newSelected);
    if (error) {
      setError(null);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/viewing-visibility", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewingId: viewing.id,
          stakeholderIds: Array.from(selectedStakeholderIds),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update visibility");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate counts for filtered stakeholders
  const filteredSelectedCount = filteredStakeholders.filter((s) =>
    selectedStakeholderIds.has(s.id)
  ).length;
  const filteredCount = filteredStakeholders.length;
  const allFilteredSelected =
    filteredCount > 0 && filteredSelectedCount === filteredCount;
  const noneFilteredSelected = filteredSelectedCount === 0;

  // Total counts (all stakeholders)
  const selectedCount = selectedStakeholderIds.size;
  const totalCount = stakeholders.length;

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
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Manage Visibility
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Viewing ID: {viewing.id}
                {viewing.address && ` - ${viewing.address}`}
              </p>
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
            <>
              {success && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Visibility updated successfully!
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Type Filter Toggles */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                  Filter by Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((type) => {
                    const isSelected = selectedTypes.has(type);
                    const count = typeCounts[type] || 0;
                    const label = typeLabels[type] || `Type ${type}`;
                    const IconComponent = typeIcons[type];
                    return (
                      <button
                        key={type}
                        onClick={() => handleToggleType(type)}
                        disabled={isSubmitting}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          isSelected
                            ? "bg-zinc-900 text-white border-2 border-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50 dark:hover:bg-zinc-100"
                            : "bg-zinc-100 text-zinc-900 border-2 border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
                        }`}
                        title={`Toggle ${label} filter`}
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span>{label}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            isSelected
                              ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
                              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search stakeholders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
                />
              </div>

              {/* Selection Controls */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {searchQuery || selectedTypes.size < 4
                    ? `${filteredSelectedCount} of ${filteredCount} shown selected (${selectedCount} total)`
                    : `${selectedCount} of ${totalCount} stakeholders selected`}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    disabled={allFilteredSelected || isSubmitting || filteredCount === 0}
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    Select All{searchQuery ? " (Filtered)" : ""}
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <button
                    onClick={handleDeselectAllFiltered}
                    disabled={noneFilteredSelected || isSubmitting || filteredCount === 0}
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    Deselect All{searchQuery ? " (Filtered)" : ""}
                  </button>
                </div>
              </div>

              {/* Stakeholders List */}
              <div className="space-y-2 mb-6">
                {filteredStakeholders.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
                    <p>
                      {searchQuery || selectedTypes.size < 4
                        ? `No stakeholders found matching the current filters${
                            searchQuery ? ` and "${searchQuery}"` : ""
                          }`
                        : "No stakeholders available."}
                    </p>
                  </div>
                ) : (
                  filteredStakeholders.map((stakeholder) => {
                    const isSelected = selectedStakeholderIds.has(stakeholder.id);
                    return (
                      <label
                        key={stakeholder.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          isSelected
                            ? "border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-800"
                            : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleStakeholder(stakeholder.id)}
                          disabled={isSubmitting}
                          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800"
                        />
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {stakeholder.name}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

