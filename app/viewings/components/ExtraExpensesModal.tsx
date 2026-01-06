"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XIcon, PlusIcon, EditIcon, TrashIcon } from "@/app/components/icons";
import BulkAddBasicsModal from "./BulkAddBasicsModal";
import { calculateExtraAmount } from "../utils/calculateExtraAmount";

interface ViewingExtra {
  id: number;
  name: string;
  description: string;
  estimation: number | null;
}

interface ViewingExtraItem {
  id: number;
  viewingId: number;
  extraId: number;
  extra: ViewingExtra;
  description: string;
  amount: number;
  createdAt: string;
}

interface Viewing {
  id: number;
  address: string | null;
  size: number | null;
  price: number | null;
  expectedMinimalRent: number | null;
}

interface ExtraExpensesModalProps {
  viewing: Viewing;
  extras: ViewingExtra[];
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  extraId: string;
  description: string;
  amount: string;
  units: string;
}

export default function ExtraExpensesModal({
  viewing,
  extras,
  isOpen,
  onClose,
}: ExtraExpensesModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [extraItems, setExtraItems] = useState<ViewingExtraItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkAddBasics, setShowBulkAddBasics] = useState(false);
  const [baseAmount, setBaseAmount] = useState<number | null>(null);

  // Filter basic extras (for bulk add - keeping this for now but may need to adjust)
  const basicExtras = extras; // No longer filtering by category
  const [formData, setFormData] = useState<FormData>({
    extraId: "",
    description: "",
    amount: "",
    units: "1",
  });

  // Calculate total amount
  const totalAmount = extraItems.reduce((sum, item) => sum + item.amount, 0);

  // Load extra items when modal opens
  useEffect(() => {
    if (isOpen && viewing) {
      setIsLoading(true);
      fetch(`/api/viewing-extra-items?viewingId=${viewing.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setExtraItems(data.data);
          } else {
            setExtraItems([]);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading extra items:", err);
          setError("Failed to load extra items");
          setIsLoading(false);
        });
      setError(null);
      setSuccess(false);
      setEditingId(null);
      setShowAddForm(false);
      setBaseAmount(null);
      setFormData({
        extraId: "",
        description: "",
        amount: "",
        units: "1",
      });
    }
  }, [isOpen, viewing]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (editingId !== null || showAddForm) {
          setEditingId(null);
          setShowAddForm(false);
          setBaseAmount(null);
          setFormData({
            extraId: "",
            description: "",
            amount: "",
            units: "1",
          });
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, editingId, showAddForm]);

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

  const handleAddClick = () => {
    setShowAddForm(true);
    setEditingId(null);
    setBaseAmount(null);
    setFormData({
      extraId: "",
      description: "",
      amount: "",
      units: "1",
    });
    setError(null);
  };

  const handleEditClick = (item: ViewingExtraItem) => {
    setEditingId(item.id);
    setShowAddForm(false);
    
    // Extract units from description (pattern: ". X units" at the end)
    const unitsMatch = item.description.match(/\.\s*(\d+(?:\.\d+)?)\s*units?$/i);
    const extractedUnits = unitsMatch ? unitsMatch[1] : "1";
    
    // Remove units suffix from description for display
    const descriptionWithoutUnits = unitsMatch 
      ? item.description.substring(0, unitsMatch.index).trim()
      : item.description;
    
    // Calculate base amount by dividing current amount by units
    const unitsNum = parseFloat(extractedUnits) || 1;
    const calculatedBaseAmount = item.amount / unitsNum;
    setBaseAmount(calculatedBaseAmount);
    
    setFormData({
      extraId: item.extraId.toString(),
      description: descriptionWithoutUnits,
      amount: item.amount.toString(),
      units: extractedUnits,
    });
    setError(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setBaseAmount(null);
    setFormData({
      extraId: "",
      description: "",
      amount: "",
      units: "1",
    });
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this extra item?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/viewing-extra-items?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete extra item");
      }

      // Reload extra items
      const itemsResponse = await fetch(`/api/viewing-extra-items?viewingId=${viewing.id}`);
      const itemsData = await itemsResponse.json();
      if (itemsData.success && itemsData.data) {
        setExtraItems(itemsData.data);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const extraIdNum = parseInt(formData.extraId, 10);
    const amountNum = parseFloat(formData.amount);

    if (isNaN(extraIdNum)) {
      setError("Please select an expense type");
      setIsSubmitting(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      setIsSubmitting(false);
      return;
    }

    if (isNaN(amountNum)) {
      setError("Amount must be a valid number");
      setIsSubmitting(false);
      return;
    }

    const unitsNum = parseFloat(formData.units) || 1;
    if (isNaN(unitsNum) || unitsNum <= 0) {
      setError("Units must be a positive number");
      setIsSubmitting(false);
      return;
    }

    // Ensure description has units suffix (it should already have it from handleChange, but ensure it)
    const baseDescription = stripUnitsSuffix(formData.description);
    const descriptionWithUnits = `${baseDescription.trim()}. ${unitsNum} units`;

    try {
      const url = "/api/viewing-extra-items";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? {
            id: editingId,
            extraId: extraIdNum,
            description: descriptionWithUnits,
            amount: amountNum,
          }
        : {
            viewingId: viewing.id,
            extraId: extraIdNum,
            description: descriptionWithUnits,
            amount: amountNum,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save extra item");
      }

      // Reload extra items
      const itemsResponse = await fetch(`/api/viewing-extra-items?viewingId=${viewing.id}`);
      const itemsData = await itemsResponse.json();
      if (itemsData.success && itemsData.data) {
        setExtraItems(itemsData.data);
      }

      setSuccess(true);
      setShowAddForm(false);
      setEditingId(null);
      setBaseAmount(null);
      setFormData({
        extraId: "",
        description: "",
        amount: "",
        units: "1",
      });

      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to calculate amount based on extra and viewing data
  const calculateAmount = (
    extra: ViewingExtra,
    viewing: Viewing
  ): number | null => {
    return calculateExtraAmount(extra, viewing.expectedMinimalRent);
  };

  // Helper function to strip units suffix from description
  const stripUnitsSuffix = (description: string): string => {
    const unitsMatch = description.match(/\.\s*(\d+(?:\.\d+)?)\s*units?$/i);
    if (unitsMatch && unitsMatch.index !== undefined) {
      return description.substring(0, unitsMatch.index).trim();
    }
    return description;
  };

  // Helper function to append units suffix to description
  const appendUnitsSuffix = (description: string, units: string): string => {
    const baseDescription = stripUnitsSuffix(description);
    const unitsNum = parseFloat(units) || 1;
    return `${baseDescription}. ${unitsNum} units`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // If expense type (extraId) is selected, auto-populate description and amount
    if (name === "extraId" && value) {
      const selectedExtra = extras.find((extra) => extra.id === parseInt(value, 10));
      if (selectedExtra) {
        const calculatedBaseAmount = calculateAmount(selectedExtra, viewing);
        setBaseAmount(calculatedBaseAmount);
        
        // Get current units or default to 1
        const currentUnits = parseFloat(formData.units) || 1;
        const calculatedAmount = calculatedBaseAmount !== null 
          ? calculatedBaseAmount * currentUnits 
          : null;
        
        // Append units suffix to description
        const descriptionWithUnits = appendUnitsSuffix(selectedExtra.description, formData.units);
        
        setFormData((prev) => ({
          ...prev,
          extraId: value,
          description: descriptionWithUnits,
          amount: calculatedAmount !== null ? calculatedAmount.toString() : "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (name === "units") {
      // When units change, recalculate amount and update description suffix
      const unitsNum = parseFloat(value) || 1;
      const updatedDescription = appendUnitsSuffix(formData.description, value);
      
      if (baseAmount !== null) {
        const recalculatedAmount = baseAmount * unitsNum;
        setFormData((prev) => ({
          ...prev,
          units: value,
          description: updatedDescription,
          amount: recalculatedAmount.toString(),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          units: value,
          description: updatedDescription,
        }));
      }
    } else if (name === "description") {
      // When description changes, strip any existing units suffix
      // The units suffix will be reappended when units change or on submit
      const baseDescription = stripUnitsSuffix(value);
      setFormData((prev) => ({
        ...prev,
        description: baseDescription,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    if (error) {
      setError(null);
    }
  };

  const formatAmount = (amount: number): string => {
    return `€${Math.round(amount).toLocaleString("en-US")}`;
  };

  const getAmountColorClass = (amount: number): string => {
    if (amount > 0) {
      return "text-green-600 dark:text-green-400";
    } else if (amount < 0) {
      return "text-red-600 dark:text-red-400";
    }
    return "text-zinc-900 dark:text-zinc-50";
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
                Extra Expenses
              </h2>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Viewing ID: {viewing.id}
                  {viewing.address && ` - ${viewing.address}`}
                </p>
                {(viewing.price !== null || viewing.size !== null) && (
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
                    Extra item saved successfully!
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

              {/* Add Buttons */}
              {!showAddForm && editingId === null && (
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={handleAddClick}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Expense Item
                  </button>
                  {basicExtras.length > 0 && (
                    <button
                      onClick={() => setShowBulkAddBasics(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Basics
                    </button>
                  )}
                </div>
              )}

              {/* Add/Edit Form */}
              {(showAddForm || editingId !== null) && (
                <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {editingId ? "Edit Expense Item" : "Add Expense Item"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="extraId"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Expense Type
                      </label>
                      <select
                        id="extraId"
                        name="extraId"
                        value={formData.extraId}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="">Select expense type...</option>
                        {extras.map((extra) => (
                          <option key={extra.id} value={extra.id}>
                            {extra.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="units"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Units
                      </label>
                      <input
                        type="number"
                        id="units"
                        name="units"
                        value={formData.units}
                        onChange={handleChange}
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        placeholder="Enter units"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Description
                      </label>
                      <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        placeholder="Enter description"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                      >
                        Amount
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        step="0.01"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        placeholder="Enter amount (positive for expense, negative for saving)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                      >
                        {isSubmitting ? "Saving..." : editingId ? "Update" : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Items List */}
              {extraItems.length === 0 && !showAddForm && editingId === null ? (
                <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
                  <p>No expense items yet. Click "Add Expense Item" to add one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                          Expense Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                      {extraItems.map((item) => (
                        <tr
                          key={item.id}
                          className={`transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                            editingId === item.id ? "bg-zinc-100 dark:bg-zinc-800" : ""
                          }`}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                            {item.extra.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                            {item.description}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                            <span className={getAmountColorClass(item.amount)}>
                              {formatAmount(item.amount)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(item)}
                                disabled={isSubmitting || editingId !== null || showAddForm}
                                className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                title="Edit"
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={isSubmitting || editingId !== null || showAddForm}
                                className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary */}
              {extraItems.length > 0 && (
                <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      Total:
                    </span>
                    <span
                      className={`text-lg font-semibold ${getAmountColorClass(totalAmount)}`}
                    >
                      {formatAmount(totalAmount)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bulk Add Basics Modal */}
      {showBulkAddBasics && (
        <BulkAddBasicsModal
          isOpen={showBulkAddBasics}
          onClose={() => setShowBulkAddBasics(false)}
          viewing={viewing}
          basicExtras={basicExtras}
          onSuccess={async () => {
            // Reload extra items
            const itemsResponse = await fetch(`/api/viewing-extra-items?viewingId=${viewing.id}`);
            const itemsData = await itemsResponse.json();
            if (itemsData.success && itemsData.data) {
              setExtraItems(itemsData.data);
            }
            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
              router.refresh();
            }, 1000);
          }}
        />
      )}
    </div>
  );
}

