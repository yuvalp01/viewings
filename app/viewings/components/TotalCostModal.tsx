"use client";

import { useState, useEffect } from "react";
import { XIcon, ChevronDownIcon, ChevronUpIcon, CurrencyDollarIcon, DocumentIcon } from "@/app/components/icons";

interface ViewingExtraItem {
  id: number;
  viewingId: number;
  extraId: number;
  extra: {
    id: number;
    name: string;
    category: number;
  };
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

interface TotalCostModalProps {
  viewing: Viewing;
  isOpen: boolean;
  onClose: () => void;
}

interface FeeCalculation {
  label: string;
  amount: number;
}

export default function TotalCostModal({
  viewing,
  isOpen,
  onClose,
}: TotalCostModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [extraItems, setExtraItems] = useState<ViewingExtraItem[]>([]);
  const [isFirstSubtotalExpanded, setIsFirstSubtotalExpanded] = useState(false);
  const [isSecondSubtotalExpanded, setIsSecondSubtotalExpanded] = useState(false);

  // Calculate fees
  const calculateFees = (): FeeCalculation[] => {
    const price = viewing.price ?? 0;
    const rent = viewing.expectedMinimalRent ?? 0;

    const purchaseTax = price * 0.0309;
    const lawyerFee = Math.max(price * 0.0124, 1240);
    const notaryFee = Math.max(price * 0.0124, 1240);
    const registrationFee = price * 0.0065;
    const findingTenant = rent;
    const ysFee = Math.max(price * 0.038, 3800) + 500;

    return [
      { label: "Purchase tax", amount: purchaseTax },
      { label: "Lawyer fee", amount: lawyerFee },
      { label: "Notary fee", amount: notaryFee },
      { label: "Registration fee", amount: registrationFee },
      { label: "Finding tenant", amount: findingTenant },
      { label: "Y&S fee", amount: ysFee },
    ];
  };

  const fees = calculateFees();
  const firstSubtotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const secondSubtotal = extraItems.reduce((sum, item) => sum + item.amount, 0);
  const third = viewing.price ?? 0;
  const finalTotal = firstSubtotal + secondSubtotal + third;

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
          setIsLoading(false);
          setExtraItems([]);
        });
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

  const formatAmount = (amount: number): string => {
    return `€${Math.round(amount).toLocaleString("en-US")}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 dark:border-zinc-800">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                <CurrencyDollarIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Total Cost Calculation
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <DocumentIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Viewing ID: {viewing.id}
                    {viewing.address && ` - ${viewing.address}`}
                  </p>
                </div>
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
        <div className="p-6">
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
            <div className="space-y-4">
              {/* Purchase Fees - Collapsed Accordion */}
              <div className="border border-zinc-200 rounded-lg bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
                <button
                  onClick={() => setIsFirstSubtotalExpanded(!isFirstSubtotalExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-zinc-100/50 dark:hover:bg-zinc-800/70 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <CurrencyDollarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      Purchase Fees
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 min-w-[80px] text-right">
                      {formatAmount(firstSubtotal)}
                    </span>
                    {isFirstSubtotalExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    )}
                  </div>
                </button>
                {isFirstSubtotalExpanded && (
                  <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="pt-4 space-y-3">
                      {fees.map((fee, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {fee.label}
                          </span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {formatAmount(fee.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-3 mt-3 border-t-2 border-zinc-300 dark:border-zinc-700">
                        <div className="flex items-center justify-between py-1.5 px-2">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                            Subtotal
                          </span>
                          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                            {formatAmount(firstSubtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Expenses - Expanded Accordion */}
              <div className="border border-zinc-200 rounded-lg bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
                <button
                  onClick={() => setIsSecondSubtotalExpanded(!isSecondSubtotalExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-zinc-100/50 dark:hover:bg-zinc-800/70 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      Extra Expenses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 min-w-[80px] text-right">
                      {formatAmount(secondSubtotal)}
                    </span>
                    {isSecondSubtotalExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    )}
                  </div>
                </button>
                {isSecondSubtotalExpanded && (
                  <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    {extraItems.length === 0 ? (
                      <div className="pt-4 text-sm text-center text-zinc-500 dark:text-zinc-400 py-2">
                        No extra items
                      </div>
                    ) : (
                      <div className="pt-4 space-y-3">
                        {extraItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between py-2 px-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                {item.extra.name}
                              </div>
                              <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                {item.description}
                              </div>
                            </div>
                            <span
                              className={`ml-4 text-sm font-semibold ${
                                item.amount > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : item.amount < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-zinc-900 dark:text-zinc-50"
                              }`}
                            >
                              {formatAmount(item.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-3 mt-3 border-t-2 border-zinc-300 dark:border-zinc-700">
                          <div className="flex items-center justify-between py-1.5 px-2">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                              Subtotal
                            </span>
                            <span className="text-base font-bold text-green-600 dark:text-green-400">
                              {formatAmount(secondSubtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="border border-zinc-200 rounded-lg px-4 py-3.5 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                      <CurrencyDollarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      Price
                    </span>
                  </div>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400 min-w-[80px] text-right">
                    {formatAmount(third)}
                  </span>
                </div>
              </div>

              {/* Final Total */}
              <div className="border-t-2 border-zinc-300 dark:border-zinc-700 pt-5 mt-6">
                <div className="flex items-center justify-between px-2 py-3 rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                      <CurrencyDollarIcon className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      Total Cost
                    </span>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 min-w-[80px] text-right">
                    {formatAmount(finalTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

