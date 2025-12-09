"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import {
  CheckIcon,
  MapPinIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
} from "@/app/components/icons";

interface Stakeholder {
  id: number;
  name: string;
}

interface ApartmentViewingFormProps {
  stakeholders: Stakeholder[];
}

interface FormData {
  address: string;
  size: string;
  priceAsked: string;
  bedrooms: string;
  floor: string;
  isElevator: boolean;
  constructionYear: string;
  linkAd: string;
  linkAddress: string;
  agentStakeholderId: string;
}

interface FormErrors {
  address?: string;
  size?: string;
  priceAsked?: string;
  bedrooms?: string;
  floor?: string;
  constructionYear?: string;
  linkAd?: string;
  linkAddress?: string;
}

export default function ApartmentViewingForm({
  stakeholders,
}: ApartmentViewingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    address: "",
    size: "",
    priceAsked: "",
    bedrooms: "",
    floor: "",
    isElevator: false,
    constructionYear: "",
    linkAd: "",
    linkAddress: "",
    agentStakeholderId: "",
  });

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
      // Clear any error for linkAddress
      if (errors.linkAddress) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.linkAddress;
          return newErrors;
        });
      }
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

    if (!formData.priceAsked.trim()) {
      newErrors.priceAsked = "Price asked is required";
    } else {
      const priceNum = parseFloat(formData.priceAsked);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.priceAsked = "Price must be a positive number";
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
      const response = await fetch("/api/apartment-viewings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: formData.address.trim(),
          size: parseFloat(formData.size),
          priceAsked: parseFloat(formData.priceAsked),
          bedrooms: parseFloat(formData.bedrooms),
          floor: formData.floor.trim() ? parseFloat(formData.floor) : null,
          isElevator: formData.isElevator,
          constructionYear: formData.constructionYear.trim()
            ? parseInt(formData.constructionYear)
            : null,
          linkAd: formData.linkAd.trim() || null,
          linkAddress: formData.linkAddress.trim() || null,
          agentStakeholderId: formData.agentStakeholderId
            ? parseInt(formData.agentStakeholderId)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create apartment viewing");
      }

      setSuccess(true);
      setFormData({
        address: "",
        size: "",
        priceAsked: "",
        bedrooms: "",
        floor: "",
        isElevator: false,
        constructionYear: "",
        linkAd: "",
        linkAddress: "",
        agentStakeholderId: "",
      });
      setErrors({});

      // Redirect to list page after 1.5 seconds
      setTimeout(() => {
        router.push("/apartment-viewings");
      }, 1500);
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

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }

    // Clear success message when user starts editing
    if (success) {
      setSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Apartment viewing created successfully! Redirecting to viewings list...
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
          >
            Address <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="address"
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
            htmlFor="linkAddress"
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
              id="linkAddress"
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
            htmlFor="size"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
          >
            Size (sqm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="size"
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
            htmlFor="priceAsked"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
          >
            Price Asked <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="priceAsked"
            name="priceAsked"
            value={formData.priceAsked}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
              errors.priceAsked
                ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
            placeholder="e.g., 250000"
          />
          {errors.priceAsked && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.priceAsked}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="bedrooms"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
          >
            Bedrooms <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="bedrooms"
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
            htmlFor="floor"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
          >
            Floor
          </label>
          <input
            type="number"
            id="floor"
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
            htmlFor="constructionYear"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
          >
            Construction Year
          </label>
          <input
            type="number"
            id="constructionYear"
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
            htmlFor="linkAd"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
          >
            Link to Ad
          </label>
          <input
            type="url"
            id="linkAd"
            name="linkAd"
            value={formData.linkAd}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
              errors.linkAd
                ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            } text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:text-zinc-50 dark:placeholder-zinc-500`}
            placeholder="https://..."
          />
          {errors.linkAd && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.linkAd}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="agentStakeholderId"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2"
          >
            Agent Stakeholder
          </label>
          <select
            id="agentStakeholderId"
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
              id="isElevator"
              name="isElevator"
              checked={formData.isElevator}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <label
              htmlFor="isElevator"
              className="ml-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Has Elevator
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
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
              ? "Creating apartment viewing..."
              : "Save and create the apartment viewing record"
          }
        />
      </div>
    </form>
  );
}

