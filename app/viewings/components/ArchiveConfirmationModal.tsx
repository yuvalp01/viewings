"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XIcon, ArchiveIcon } from "@/app/components/icons";

interface ArchiveConfirmationModalProps {
  viewingId: number;
  viewingAddress: string | null;
  isArchive: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchiveConfirmationModal({
  viewingId,
  viewingAddress,
  isArchive,
  isOpen,
  onClose,
}: ArchiveConfirmationModalProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleArchive = async () => {
    setIsArchiving(true);
    setError(null);

    try {
      const response = await fetch("/api/viewings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: viewingId,
          isArchive: !isArchive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isArchive ? 'unarchive' : 'archive'} viewing`);
      }

      // Refresh the page and close modal
      router.refresh();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setIsArchiving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <ArchiveIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {isArchive ? "Unarchive Viewing" : "Archive Viewing"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isArchiving}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-label="Close modal"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              {isArchive
                ? "Are you sure you want to unarchive this viewing? It will be visible in the main list again."
                : "Are you sure you want to archive this viewing? It will be hidden from the main list but can be shown using the archive filter."}
            </p>
            {viewingAddress && (
              <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 dark:bg-zinc-800/50 dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {viewingAddress}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isArchiving}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={isArchiving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-600"
            >
              {isArchiving ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
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
                  {isArchive ? "Unarchiving..." : "Archiving..."}
                </>
              ) : (
                <>
                  <ArchiveIcon className="h-4 w-4" />
                  {isArchive ? "Unarchive Viewing" : "Archive Viewing"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

