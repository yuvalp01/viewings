"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EditIcon, TrashIcon, PlusIcon, XIcon } from "@/app/components/icons";
import EditViewingExtraModal from "./EditViewingExtraModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface ViewingExtra {
  id: number;
  name: string;
  description: string;
  estimation: number | null;
  category: number;
}

export default function ViewingExtrasTable() {
  const router = useRouter();
  const [viewingExtras, setViewingExtras] = useState<ViewingExtra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExtra, setEditingExtra] = useState<ViewingExtra | null>(null);
  const [deletingExtraId, setDeletingExtraId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadViewingExtras();
  }, []);

  const loadViewingExtras = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/viewing-extras");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load viewing extras");
      }

      if (data.success && data.data) {
        setViewingExtras(data.data);
      }
    } catch (err) {
      console.error("Error loading viewing extras:", err);
      setError(err instanceof Error ? err.message : "Failed to load viewing extras");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (extra: ViewingExtra) => {
    setEditingExtra(extra);
    setShowAddForm(false);
  };

  const handleAdd = () => {
    setShowAddForm(true);
    setEditingExtra(null);
  };

  const handleCloseEdit = () => {
    setEditingExtra(null);
    setShowAddForm(false);
  };

  const handleDelete = (id: number) => {
    setDeletingExtraId(id);
  };

  const handleCloseDelete = () => {
    setDeletingExtraId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExtraId) return;

    try {
      const response = await fetch(`/api/viewing-extras?id=${deletingExtraId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete viewing extra");
      }

      await loadViewingExtras();
      router.refresh();
    } catch (err) {
      console.error("Error deleting viewing extra:", err);
      setError(err instanceof Error ? err.message : "Failed to delete viewing extra");
    } finally {
      setDeletingExtraId(null);
    }
  };

  const formatAmount = (amount: number): string => {
    return `€${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getAmountColorClass = (amount: number): string => {
    if (amount > 0) {
      return "text-green-600 dark:text-green-400";
    } else if (amount < 0) {
      return "text-red-600 dark:text-red-400";
    }
    return "text-zinc-900 dark:text-zinc-50";
  };

  const getCategoryLabel = (category: number): string => {
    switch (category) {
      case 1:
        return "Basic";
      case 2:
        return "Essential";
      case 3:
        return "Extra";
      default:
        return "Unknown";
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          <PlusIcon className="h-4 w-4" />
          Add Viewing Extra
        </button>
      </div>

      {viewingExtras.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            No viewing extras found. Click "Add Viewing Extra" to create one.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Estimation
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {viewingExtras.map((extra) => (
                <tr
                  key={extra.id}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {extra.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                    {extra.description}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                    {getCategoryLabel(extra.category)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                    {extra.estimation !== null ? (
                      <span className={getAmountColorClass(extra.estimation)}>
                        {formatAmount(extra.estimation)}
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(extra)}
                        className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        title="Edit"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(extra.id)}
                        className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
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

      {(editingExtra || showAddForm) && (
        <EditViewingExtraModal
          extra={editingExtra}
          isOpen={true}
          onClose={handleCloseEdit}
          onSuccess={loadViewingExtras}
        />
      )}

      {deletingExtraId && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={handleCloseDelete}
          onConfirm={handleDeleteConfirm}
          title="Delete Viewing Extra"
          message="Are you sure you want to delete this viewing extra? This action cannot be undone."
        />
      )}
    </>
  );
}



