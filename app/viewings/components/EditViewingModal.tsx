"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XIcon, CheckIcon, MapPinIcon, ExternalLinkIcon, CheckCircleIcon, SparklesIcon } from "@/app/components/icons";
import Button from "@/app/components/Button";

interface Stakeholder {
  id: number;
  name: string;
}

interface Viewing {
  id: number;
  address: string | null;
  size: number | null;
  price: number | null;
  bedrooms: number | null;
  floor: number | null;
  isElevator: boolean;
  constructionYear: number | null;
  linkAd: string | null;
  linkAddress: string | null;
  comments: string | null;
  agentStakeholderId: number | null;
}

interface EditViewingModalProps {
  viewing: Viewing;
  stakeholders: Stakeholder[];
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  address: string;
  size: string;
  price: string;
  bedrooms: string;
  floor: string;
  isElevator: boolean;
  constructionYear: string;
  linkAd: string;
  linkAddress: string;
  comments: string;
  agentStakeholderId: string;
}

interface FormErrors {
  address?: string;
  size?: string;
  price?: string;
  bedrooms?: string;
  floor?: string;
  constructionYear?: string;
  linkAd?: string;
  linkAddress?: string;
}

export default function EditViewingModal({
  viewing,
  stakeholders,
  isOpen,
  onClose,
}: EditViewingModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    address: "",
    size: "",
    price: "",
    bedrooms: "",
    floor: "",
    isElevator: false,
    constructionYear: "",
    linkAd: "",
    linkAddress: "",
    comments: "",
    agentStakeholderId: "",
  });

  // Helper function to safely convert number to string
  // Values are already serialized from server component
  const numberToString = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return "";
    }
    return value.toString();
  };

  // Populate form with viewing data when modal opens
  useEffect(() => {
    if (isOpen && viewing) {
      setFormData({
        address: viewing.address || "",
        size: numberToString(viewing.size),
        price: numberToString(viewing.price),
        bedrooms: numberToString(viewing.bedrooms),
        floor: numberToString(viewing.floor),
        isElevator: viewing.isElevator,
        constructionYear: viewing.constructionYear
          ? viewing.constructionYear.toString()
          : "",
        linkAd: viewing.linkAd || "",
        linkAddress: viewing.linkAddress || "",
        comments: viewing.comments || "",
        agentStakeholderId: viewing.agentStakeholderId
          ? viewing.agentStakeholderId.toString()
          : "",
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

  const generateGoogleMapsLink = (address: string): string => {
    if (!address.trim()) {
      return "";
    }
    const encodedAddress = encodeURIComponent(address.trim());
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  const handleGenerateMapsLink = () => {
    if (formData.address.trim()) {
      const mapsLink = generateGoogleMapsLink(formData.address);
      setFormData((prev) => ({
        ...prev,
        linkAddress: mapsLink,
      }));
      if (errors.linkAddress) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.linkAddress;
          return newErrors;
        });
      }
    }
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const handleExtractAdData = async () => {
    if (!formData.linkAd.trim() || !isValidUrl(formData.linkAd.trim())) {
      setExtractionError("Please enter a valid URL first");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setExtractionSuccess(false);

    try {
      const response = await fetch("/api/extract-ad-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formData.linkAd.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract ad data");
      }

      if (data.success && data.data) {
        const extracted = data.data;

        setFormData((prev) => ({
          ...prev,
          size: extracted.size ? extracted.size.toString() : prev.size,
          price: extracted.price ? extracted.price.toString() : prev.price,
          bedrooms: extracted.bedrooms ? extracted.bedrooms.toString() : prev.bedrooms,
          floor: extracted.floor ? extracted.floor.toString() : prev.floor,
          constructionYear: extracted.constructionYear
            ? extracted.constructionYear.toString()
            : prev.constructionYear,
          isElevator: extracted.isElevator ?? prev.isElevator,
        }));

        setErrors((prev) => {
          const newErrors = { ...prev };
          if (extracted.size) delete newErrors.size;
          if (extracted.price) delete newErrors.price;
          if (extracted.bedrooms) delete newErrors.bedrooms;
          if (extracted.floor) delete newErrors.floor;
          if (extracted.constructionYear) delete newErrors.constructionYear;
          return newErrors;
        });

        setExtractionSuccess(true);
        setTimeout(() => setExtractionSuccess(false), 3000);
      }
    } catch (err) {
      setExtractionError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.size.trim()) {
      newErrors.size = "Size is required";
    } else {
      const sizeNum = parseInt(formData.size);
      if (isNaN(sizeNum) || sizeNum <= 0) {
        newErrors.size = "Size must be a positive number";
      }
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "Price must be a positive number";
      }
    }

    if (!formData.bedrooms.trim()) {
      newErrors.bedrooms = "Bedrooms is required";
    } else {
      const bedroomsNum = parseInt(formData.bedrooms);
      if (isNaN(bedroomsNum) || bedroomsNum <= 0) {
        newErrors.bedrooms = "Bedrooms must be a positive number";
      }
    }

    if (formData.floor.trim()) {
      const floorNum = parseInt(formData.floor);
      if (isNaN(floorNum)) {
        newErrors.floor = "Floor must be a number";
      }
    }

    if (formData.constructionYear.trim()) {
      const yearNum = parseInt(formData.constructionYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1800 || yearNum > currentYear) {
        newErrors.constructionYear = `Year must be between 1800 and ${currentYear}`;
      }
    }

    if (formData.linkAd.trim()) {
      try {
        new URL(formData.linkAd);
      } catch {
        newErrors.linkAd = "Please enter a valid URL";
      }
    }

    if (formData.linkAddress.trim()) {
      try {
        new URL(formData.linkAddress);
      } catch {
        newErrors.linkAddress = "Please enter a valid URL";
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
      const response = await fetch("/api/viewings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: viewing.id,
          address: formData.address.trim(),
          size: parseFloat(formData.size),
          price: parseFloat(formData.price),
          bedrooms: parseFloat(formData.bedrooms),
          floor: formData.floor.trim() ? parseFloat(formData.floor) : null,
          isElevator: formData.isElevator,
          constructionYear: formData.constructionYear.trim()
            ? parseInt(formData.constructionYear)
            : null,
          linkAd: formData.linkAd.trim() || null,
          linkAddress: formData.linkAddress.trim() || null,
          comments: formData.comments.trim() || null,
          agentStakeholderId: formData.agentStakeholderId
            ? parseInt(formData.agentStakeholderId)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update viewing");
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
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Edit Viewing
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
                  Viewing updated successfully!
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

            {extractionSuccess && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Data extracted successfully! Please review and edit the fields as needed.
                </p>
              </div>
            )}

            {extractionError && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {extractionError}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-linkAd"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Link to Ad
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="edit-linkAd"
                    name="linkAd"
                    value={formData.linkAd}
                    onChange={handleChange}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                      errors.linkAd
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                        : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                    } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={handleExtractAdData}
                    disabled={
                      !formData.linkAd.trim() ||
                      !isValidUrl(formData.linkAd.trim()) ||
                      isExtracting
                    }
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    title="Extract viewing details using AI"
                  >
                    {isExtracting ? (
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
                      <SparklesIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.linkAd && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.linkAd}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-address"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="edit-address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                      errors.address
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                        : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                    } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                    placeholder="Enter apartment address"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateMapsLink}
                    disabled={!formData.address.trim()}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    title="Generate Google Maps link from address"
                  >
                    <MapPinIcon className="h-5 w-5" />
                  </button>
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-linkAddress"
                  className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Google Maps Link
                  {formData.linkAddress.trim() && (
                    <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="edit-linkAddress"
                    name="linkAddress"
                    value={formData.linkAddress}
                    onChange={handleChange}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                      errors.linkAddress
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                        : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                    } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                    placeholder="https://www.google.com/maps/..."
                  />
                  {formData.linkAddress.trim() && (
                    <a
                      href={formData.linkAddress}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                      title="Open in Google Maps"
                    >
                      <ExternalLinkIcon className="h-5 w-5" />
                    </a>
                  )}
                </div>
                {errors.linkAddress && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.linkAddress}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-size"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Size (sqm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="edit-size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  min="1"
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
                    errors.size
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                  placeholder="e.g., 75"
                />
                {errors.size && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.size}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-price"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="edit-price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
                    errors.price
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                  placeholder="e.g., 250000"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-bedrooms"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Bedrooms <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="edit-bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="1"
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
                    errors.bedrooms
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                  placeholder="e.g., 2"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.bedrooms}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-floor"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Floor
                </label>
                <input
                  type="number"
                  id="edit-floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
                    errors.floor
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                  placeholder="e.g., 3"
                />
                {errors.floor && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.floor}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-constructionYear"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Construction Year
                </label>
                <input
                  type="number"
                  id="edit-constructionYear"
                  name="constructionYear"
                  value={formData.constructionYear}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
                    errors.constructionYear
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                  placeholder="e.g., 2010"
                />
                {errors.constructionYear && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.constructionYear}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-agentStakeholderId"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Agent
                </label>
                <select
                  id="edit-agentStakeholderId"
                  name="agentStakeholderId"
                  value={formData.agentStakeholderId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 transition-colors placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
                >
                  <option value="">Select an agent...</option>
                  {stakeholders.map((stakeholder) => (
                    <option key={stakeholder.id} value={stakeholder.id}>
                      {stakeholder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-isElevator"
                    name="isElevator"
                    checked={formData.isElevator}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <label
                    htmlFor="edit-isElevator"
                    className="ml-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                  >
                    Has Elevator
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-comments"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
                >
                  Comments
                </label>
                <textarea
                  id="edit-comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
                    errors.comments
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
                  placeholder="Enter any additional comments or notes..."
                />
                {errors.comments && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.comments}
                  </p>
                )}
              </div>
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
                    ? "Updating viewing..."
                    : "Save changes"
                }
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

