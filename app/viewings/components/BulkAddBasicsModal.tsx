"use client";

import { useState, useEffect } from "react";
import { XIcon } from "@/app/components/icons";
import { calculateExtraAmount } from "../utils/calculateExtraAmount";

interface ViewingExtra {
  id: number;
  name: string;
  description: string;
  estimation: number | null;
}

interface Viewing {
  id: number;
  address: string | null;
  size: number | null;
  price: number | null;
  expectedMinimalRent: number | null;
}

interface BulkAddBasicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewing: Viewing;
  basicExtras: ViewingExtra[];
  onSuccess: () => void;
}

interface BulkItemFormData {
  extraId: number;
  description: string;
  amount: string;
}

export default function BulkAddBasicsModal({
  isOpen,
  onClose,
  viewing,
  basicExtras,
  onSuccess,
}: BulkAddBasicsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BulkItemFormData[]>([]);
  const [existingItems, setExistingItems] = useState<Map<number, number>>(new Map()); // Map<extraId, itemId>

  // Helper function to calculate amount based on extra and viewing data
  const calculateAmount = (
    extra: ViewingExtra,
    viewing: Viewing
  ): number | null => {
    return calculateExtraAmount(extra, viewing.expectedMinimalRent);
  };

  // Load existing items and initialize form data
  useEffect(() => {
    if (isOpen && basicExtras.length > 0) {
      // Load existing extra items for this viewing
      fetch(`/api/viewing-extra-items?viewingId=${viewing.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            // Create a map of extraId -> itemId for existing items
            const existingMap = new Map<number, number>();
            data.data.forEach((item: any) => {
              existingMap.set(item.extraId, item.id);
            });
            setExistingItems(existingMap);

            // Initialize form data with existing values or defaults
            const sortedExtras = [...basicExtras].sort((a, b) => a.id - b.id);
            setFormData(
              sortedExtras.map((extra) => {
                const existingItem = data.data.find((item: any) => item.extraId === extra.id);
                if (existingItem) {
                  // Use existing values
                  return {
                    extraId: extra.id,
                    description: existingItem.description,
                    amount: existingItem.amount.toString(),
                  };
                } else {
                  // Use calculated defaults
                  const calculatedAmount = calculateAmount(extra, viewing);
                  return {
                    extraId: extra.id,
                    description: extra.description,
                    amount: calculatedAmount !== null ? calculatedAmount.toString() : "",
                  };
                }
              })
            );
          } else {
            // No existing items, use defaults
            const sortedExtras = [...basicExtras].sort((a, b) => a.id - b.id);
            setFormData(
              sortedExtras.map((extra) => {
                const calculatedAmount = calculateAmount(extra, viewing);
                return {
                  extraId: extra.id,
                  description: extra.description,
                  amount: calculatedAmount !== null ? calculatedAmount.toString() : "",
                };
              })
            );
          }
          setError(null);
        })
        .catch((err) => {
          console.error("Error loading existing items:", err);
          // Fallback to defaults if loading fails
          const sortedExtras = [...basicExtras].sort((a, b) => a.id - b.id);
          setFormData(
            sortedExtras.map((extra) => {
              const calculatedAmount = calculateAmount(extra, viewing);
              return {
                extraId: extra.id,
                description: extra.description,
                amount: calculatedAmount !== null ? calculatedAmount.toString() : "",
              };
            })
          );
        });
    }
  }, [isOpen, basicExtras, viewing]);

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

  const handleChange = (
    index: number,
    field: "description" | "amount",
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate all items
    const validationErrors: string[] = [];
    formData.forEach((item, index) => {
      if (!item.description.trim()) {
        validationErrors.push(`Item ${index + 1}: Description is required`);
      }
      const amountNum = parseFloat(item.amount);
      if (isNaN(amountNum)) {
        validationErrors.push(`Item ${index + 1}: Amount must be a valid number`);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join("; "));
      setIsSubmitting(false);
      return;
    }

    try {
      // Separate items into updates and creates
      const itemsToUpdate: Array<{ id: number; extraId: number; description: string; amount: number }> = [];
      const itemsToCreate: Array<{ viewingId: number; extraId: number; description: string; amount: number }> = [];

      formData.forEach((item) => {
        const itemId = existingItems.get(item.extraId);
        if (itemId) {
          // Item exists, add to update list
          itemsToUpdate.push({
            id: itemId,
            extraId: item.extraId,
            description: item.description.trim(),
            amount: parseFloat(item.amount),
          });
        } else {
          // New item, add to create list
          itemsToCreate.push({
            viewingId: viewing.id,
            extraId: item.extraId,
            description: item.description.trim(),
            amount: parseFloat(item.amount),
          });
        }
      });

      // Perform updates and creates in parallel
      const promises: Promise<Response>[] = [];

      // Update existing items
      itemsToUpdate.forEach((item) => {
        promises.push(
          fetch("/api/viewing-extra-items", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          })
        );
      });

      // Create new items (if any)
      if (itemsToCreate.length > 0) {
        promises.push(
          fetch("/api/viewing-extra-items", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: itemsToCreate }),
          })
        );
      }

      const responses = await Promise.all(promises);
      
      // Check if any request failed
      for (const response of responses) {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to save basic extras");
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (amount: number): string => {
    return `€${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-zinc-900 sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Add Basic Extras
              </h2>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Viewing ID: {viewing.id}
                  {viewing.address && ` - ${viewing.address}`}
                </p>
                {(viewing.price !== null || viewing.size !== null || viewing.expectedMinimalRent !== null) && (
                  <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {viewing.price !== null && (
                      <span className="font-medium">
                        Price: {formatAmount(viewing.price)}
                      </span>
                    )}
                    {viewing.size !== null && (
                      <span className="font-medium">
                        Size: {viewing.size.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} m²
                      </span>
                    )}
                    {viewing.expectedMinimalRent !== null && (
                      <span className="font-medium">
                        Rent: {formatAmount(viewing.expectedMinimalRent)}
                      </span>
                    )}
                  </div>
                )}
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
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          {formData.length === 0 ? (
            <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
              <p>No basic extras available to add.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Review and edit the values for each basic extra before adding them all at once.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                          Expense Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                      {formData.map((item, index) => {
                        const extra = basicExtras.find((e) => e.id === item.extraId);
                        return (
                          <tr
                            key={item.extraId}
                            className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                              {item.extraId}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                              {extra?.name || "Unknown"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) =>
                                  handleChange(index, "description", e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                placeholder="Enter description"
                              />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) =>
                                  handleChange(index, "amount", e.target.value)
                                }
                                required
                                step="0.01"
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 text-right transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                placeholder="Enter amount"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {isSubmitting ? "Adding..." : `Add All (${formData.length})`}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

