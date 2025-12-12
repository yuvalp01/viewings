"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XIcon, CheckIcon, CalendarIcon } from "@/app/components/icons";
import Button from "@/app/components/Button";

interface Stakeholder {
  id: number;
  name: string;
}

interface Viewing {
  id: number;
  address: string | null;
  viewingDate: Date | string | null;
  viewedByStakeholderId: number | null;
}

interface ScheduleVisitModalProps {
  viewing: Viewing;
  stakeholders: Stakeholder[];
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  date: string;
  time: string;
  viewedByStakeholderId: string;
}

interface FormErrors {
  date?: string;
  time?: string;
  viewedByStakeholderId?: string;
}

const generateGoogleCalendarLink = (
  viewingId: number,
  address: string,
  dateTime: Date,
  agentName: string | null,
  linkAd: string | null,
  comments: string | null
): string => {
  const startDate = dateTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endDate = new Date(dateTime.getTime() + 60 * 60 * 1000) // +1 hour
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0] + "Z";

  // Build title: "Viewing #<id>: <Address> (<Agent>)" - only include agent if available
  const title = agentName
    ? `Viewing #${viewingId}: ${address} (${agentName})`
    : `Viewing #${viewingId}: ${address}`;

  // Build description with conditional sections
  let description = `Viewing for: ${address}`;
  if (linkAd && linkAd.trim()) {
    description += `\nLink to the ad: <a href="${linkAd}">${linkAd}</a>`;
  }
  if (comments && comments.trim()) {
    description += `\nComments: ${comments}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startDate}/${endDate}`,
    details: description,
    location: address || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export default function ScheduleVisitModal({
  viewing,
  stakeholders,
  isOpen,
  onClose,
}: ScheduleVisitModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    date: "",
    time: "",
    viewedByStakeholderId: "",
  });

  // Populate form with existing viewing data
  useEffect(() => {
    if (isOpen && viewing) {
      if (viewing.viewingDate) {
        // Parse the date string directly (format: YYYY-MM-DDTHH:mm:ss)
        // Extract components without timezone conversion
        const dateString = typeof viewing.viewingDate === 'string' 
          ? viewing.viewingDate 
          : viewing.viewingDate instanceof Date 
            ? viewing.viewingDate.toISOString().replace(/\.\d{3}Z$/, '')
            : String(viewing.viewingDate);
        const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (match) {
          const [, year, month, day, hour, minute] = match;
          const dateStr = `${year}-${month}-${day}`;
          const timeStr = `${hour}:${minute}`;
          setFormData({
            date: dateStr,
            time: timeStr,
            viewedByStakeholderId: viewing.viewedByStakeholderId
              ? viewing.viewedByStakeholderId.toString()
              : "",
          });
        } else {
          // Fallback: try parsing as Date if format doesn't match
          const date = new Date(dateString);
          const dateStr = date.toISOString().split("T")[0];
          const hours = String(date.getUTCHours()).padStart(2, "0");
          const minutes = String(date.getUTCMinutes()).padStart(2, "0");
          const timeStr = `${hours}:${minutes}`;
          setFormData({
            date: dateStr,
            time: timeStr,
            viewedByStakeholderId: viewing.viewedByStakeholderId
              ? viewing.viewedByStakeholderId.toString()
              : "",
          });
        }
      } else {
        setFormData({
          date: "",
          time: "",
          viewedByStakeholderId: viewing.viewedByStakeholderId
            ? viewing.viewedByStakeholderId.toString()
            : "",
        });
      }
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

    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
    }

    if (!formData.time.trim()) {
      newErrors.time = "Time is required";
    } else {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.time)) {
        newErrors.time = "Please enter a valid time (HH:mm)";
      }
    }

    if (!formData.viewedByStakeholderId.trim()) {
      newErrors.viewedByStakeholderId = "Stakeholder is required";
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
      // Combine date and time directly - format as YYYY-MM-DDTHH:mm:ss
      // This preserves the exact time the user selected without timezone conversion
      // SQL Server DateTime2 stores local time, so we send it as-is
      const localDateTimeString = `${formData.date}T${formData.time}:00`;

      const response = await fetch("/api/viewings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: viewing.id,
          viewingDate: localDateTimeString,
          viewedByStakeholderId: parseInt(formData.viewedByStakeholderId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to schedule visit");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const canGenerateCalendarLink =
    formData.date.trim() && formData.time.trim() && viewing.address;
  const calendarLink = canGenerateCalendarLink
    ? generateGoogleCalendarLink(
        viewing.id,
        viewing.address || "",
        new Date(`${formData.date}T${formData.time}`),
        (viewing as any).agentStakeholder?.name || null,
        (viewing as any).linkAd || null,
        (viewing as any).comments || null
      )
    : null;

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
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Schedule Visit
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
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Visit scheduled successfully!
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
                  htmlFor="schedule-date"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="schedule-date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
                    errors.date
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.date}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="schedule-time"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="schedule-time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
                    errors.time
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.time}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="schedule-viewedByStakeholderId"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Viewed By <span className="text-red-500">*</span>
                </label>
                <select
                  id="schedule-viewedByStakeholderId"
                  name="viewedByStakeholderId"
                  value={formData.viewedByStakeholderId}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
                    errors.viewedByStakeholderId
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                >
                  <option value="">Select stakeholder...</option>
                  {stakeholders.map((stakeholder) => (
                    <option key={stakeholder.id} value={stakeholder.id}>
                      {stakeholder.name}
                    </option>
                  ))}
                </select>
                {errors.viewedByStakeholderId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.viewedByStakeholderId}
                  </p>
                )}
              </div>

              {calendarLink && (
                <div>
                  <a
                    href={calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Add to Google Calendar
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting}
                icon={
                  isSubmitting ? (
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
                  ) : (
                    <CheckIcon className="h-5 w-5" />
                  )
                }
                tooltip={
                  isSubmitting
                    ? "Scheduling visit..."
                    : "Schedule visit"
                }
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

