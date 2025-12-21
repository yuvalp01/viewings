"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "@/app/components/icons";

interface ViewingExtra {
  id: number;
  name: string;
  description: string;
  estimation: number | null;
  category: number;
}

interface EditViewingExtraModalProps {
  extra: ViewingExtra | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  estimation: string;
  category: string;
}

export default function EditViewingExtraModal({
  extra,
  isOpen,
  onClose,
  onSuccess,
}: EditViewingExtraModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    estimation: "",
    category: "",
  });

  useEffect(() => {
    if (extra) {
      setFormData({
        name: extra.name,
        description: extra.description,
        estimation: extra.estimation !== null && extra.estimation !== undefined ? extra.estimation.toString() : "",
        category: extra.category !== undefined && extra.category !== null ? extra.category.toString() : "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        estimation: "",
        category: "",
      });
    }
    setError(null);
  }, [extra, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const estimationNum = formData.estimation.trim() ? parseFloat(formData.estimation) : null;
    const categoryNum = parseInt(formData.category, 10);

    if (!formData.name.trim()) {
      setError("Name is required");
      setIsSubmitting(false);
      return;
    }

    if (formData.name.trim().length > 20) {
      setError("Name cannot exceed 20 characters");
      setIsSubmitting(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.category || isNaN(categoryNum)) {
      setError("Category is required");
      setIsSubmitting(false);
      return;
    }

    if (![1, 2, 3].includes(categoryNum)) {
      setError("Category must be Basic, Essential, or Extra");
      setIsSubmitting(false);
      return;
    }

    if (formData.estimation.trim() && isNaN(estimationNum!)) {
      setError("Estimation must be a valid number");
      setIsSubmitting(false);
      return;
    }

    try {
      const url = "/api/viewing-extras";
      const method = extra ? "PUT" : "POST";
      const body = extra
        ? {
            id: extra.id,
            name: formData.name.trim(),
            description: formData.description.trim(),
            estimation: estimationNum,
            category: categoryNum,
          }
        : {
            name: formData.name.trim(),
            description: formData.description.trim(),
            estimation: estimationNum,
            category: categoryNum,
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
        throw new Error(data.error || `Failed to ${extra ? "update" : "create"} viewing extra`);
      }

      onSuccess();
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError(null);
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
              {extra ? "Edit Viewing Extra" : "Add Viewing Extra"}
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
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
              >
                Name <span className="text-red-500">*</span>
                <span className="text-xs text-zinc-500 ml-1">(max 20 characters)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={20}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Enter description"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Select category...</option>
                <option value="1">Basic</option>
                <option value="2">Essential</option>
                <option value="3">Extra</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="estimation"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
              >
                Estimation (€)
                <span className="text-xs text-zinc-500 ml-1">(positive for expense, negative for saving)</span>
              </label>
              <input
                type="number"
                id="estimation"
                name="estimation"
                value={formData.estimation}
                onChange={handleChange}
                step="0.01"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Enter estimation amount (optional)"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                {isSubmitting ? "Saving..." : extra ? "Update" : "Create"}
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
        </div>
      </div>
    </div>
  );
}



