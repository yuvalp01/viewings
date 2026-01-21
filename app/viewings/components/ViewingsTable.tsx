"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EditIcon, TrashIcon, ExternalLinkIcon, DocumentIcon, XIcon, UserIcon, CalendarIcon, CalendarCheckIcon, ClipboardIcon, ElevatorDoorsIcon, NoElevatorIcon, PhotoIcon, MenuIcon, CurrencyDollarIcon, ChevronUpIcon, ChevronDownIcon, ArchiveIcon } from "@/app/components/icons";
import EditViewingModal from "./EditViewingModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ArchiveConfirmationModal from "./ArchiveConfirmationModal";
import ScheduleVisitModal from "./ScheduleVisitModal";
import VisitDetailsModal from "./VisitDetailsModal";
import AdditionalDetailsModal from "./AdditionalDetailsModal";
import ExtraExpensesModal from "./ExtraExpensesModal";
import VisibilityModal from "./VisibilityModal";
import TotalCostModal from "./TotalCostModal";

interface Stakeholder {
  id: number;
  name: string;
  type: number | null;
}

interface QualityLevel {
  id: number;
  name: string | null;
}

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
  bedrooms: number | null;
  floor: number | null;
  isElevator: boolean;
  constructionYear: number | null;
  linkAd: string | null;
  linkAddress: string | null;
  comments: string | null;
  agentStakeholderId: number | null;
  agentStakeholder: Stakeholder | null;
  viewingDate: Date | string | null;
  viewedByStakeholderId: number | null;
  // Visit details fields
  isSecurityDoor: boolean | null;
  buildingSecurityDoorsPercent: number | null;
  aluminumWindowsLevel: number | null;
  renovationKitchenLevel: number | null;
  renovationBathroomLevel: number | null;
  renovationLevel: number | null;
  viewLevel: number | null;
  balconyLevel: number | null;
  buildingLobbyLevel: number | null;
  buildingMaintenanceLevel: number | null;
  expectedMinimalRent: number | null;
  linkToPhotos: string | null;
  metroStationDistanceLevel: number | null;
  transportation: string | null;
  overallLevel: number | null;
  isArchive: boolean;
}

interface ViewingsTableProps {
  viewings: Viewing[];
  stakeholders: Stakeholder[]; // For agent selection in EditViewingModal
  allStakeholders: Stakeholder[]; // For visibility management
  scheduleStakeholders: Stakeholder[];
  qualityLevels: QualityLevel[];
  extras: ViewingExtra[];
}

// Helper function to safely convert to number
// Values are already serialized from server component, but we keep this for safety
function toNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  // Fallback: try to convert to number (shouldn't happen if serialized correctly)
  const num = Number(value);
  return isNaN(num) ? null : num;
}

// Get border color classes based on overallLevel
// 0-1: no color, 2: light green, 3: darker green
function getOverallLevelBorderColor(overallLevel: number | null, isArchive: boolean): string {
  // Archived items take precedence with orange border
  if (isArchive) {
    return "";
  }
  
  if (overallLevel === null || overallLevel === undefined) {
    return "";
  }
  
  if (overallLevel === 2) {
    return "border-l-2 border-l-green-300 dark:border-l-green-600";
  }
  
  if (overallLevel === 3) {
    return "border-l-2 border-l-green-500 dark:border-l-green-700";
  }
  
  // 0 or 1: no color
  return "";
}

// Get background color classes based on overallLevel
// 2: light green transparent, 3: darker green transparent
function getOverallLevelBgColor(overallLevel: number | null, isArchive: boolean): string {
  // Archived items take precedence with orange background
  if (isArchive) {
    return "";
  }
  
  if (overallLevel === null || overallLevel === undefined) {
    return "";
  }
  
  if (overallLevel === 2) {
    return "bg-green-50/50 dark:bg-green-900/20";
  }
  
  if (overallLevel === 3) {
    return "bg-green-100/60 dark:bg-green-900/30";
  }
  
  // 0 or 1: no background color
  return "";
}

// Calculate total cost for a viewing
function calculateTotalCost(viewing: Viewing, extraItemsTotal: number): number {
  const price = viewing.price ?? 0;
  const rent = viewing.expectedMinimalRent ?? 0;
  
  const purchaseTax = price * 0.0309;
  const lawyerFee = Math.max(price * 0.0124, 1240);
  const notaryFee = Math.max(price * 0.0124, 1240);
  const registrationFee = price * 0.0065;
  const findingTenant = rent;
  const ysFee = Math.max(price * 0.038, 3800) + 500;
  
  const firstSubtotal = purchaseTax + lawyerFee + notaryFee + registrationFee + findingTenant + ysFee;
  const secondSubtotal = extraItemsTotal;
  const third = price;
  
  return firstSubtotal + secondSubtotal + third;
}

// Calculate completion percentage for visit details
// Matches the logic from VisitDetailsModal.tsx
function calculateCompletionPercentage(viewing: Viewing): number {
  const totalFields = 13;
  let filledFields = 0;

  // isSecurityDoor: only count if not null
  if (viewing.isSecurityDoor !== null) {
    filledFields++;
  }

  // String/number fields: count if not empty/null
  const fieldsToCheck = [
    "buildingSecurityDoorsPercent",
    "aluminumWindowsLevel",
    "renovationKitchenLevel",
    "renovationBathroomLevel",
    "renovationLevel",
    "viewLevel",
    "balconyLevel",
    "buildingLobbyLevel",
    "buildingMaintenanceLevel",
    "expectedMinimalRent",
    "comments",
    "overallLevel",
  ];

  fieldsToCheck.forEach((field) => {
    const value = viewing[field as keyof Viewing];
    if (field === "comments") {
      // String fields, check if not empty after trim
      if (typeof value === "string" && value.trim() !== "") {
        filledFields++;
      }
    } else {
      // Other fields are numbers, check if not null
      if (value !== null && value !== undefined) {
        filledFields++;
      }
    }
  });

  return Math.round((filledFields / totalFields) * 100);
}

// ProgressClipboardIcon component with circular progress ring
interface ProgressClipboardIconProps {
  completionPercentage: number;
  className?: string;
}

function ProgressClipboardIcon({
  completionPercentage,
  className = "h-5 w-5",
}: ProgressClipboardIconProps) {
  // SVG dimensions for the progress ring
  const size = 24; // SVG viewBox size
  const center = size / 2;
  const radius = 10; // Radius of the progress ring
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 1.5; // Ring thickness
  
  // Calculate stroke-dashoffset for progress
  const offset = circumference * (1 - completionPercentage / 100);
  
  // Icon color: green when 100% complete, blue otherwise
  const iconColor = completionPercentage === 100 
    ? "text-green-600 dark:text-green-400" 
    : "text-blue-600 dark:text-blue-400";

  // Clipboard icon without checkmark (for < 100%)
  const ClipboardIconWithoutCheck = () => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Progress ring SVG */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-200 dark:text-zinc-700"
        />
        {/* Progress arc */}
        {completionPercentage > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-green-500 dark:text-green-400 transition-all duration-300"
          />
        )}
      </svg>
      {/* Clipboard icon - with checkmark when 100%, without when < 100% */}
      {completionPercentage === 100 ? (
        <ClipboardIcon className={`${className} relative z-10 ${iconColor} transition-colors duration-300`} />
      ) : (
        <div className={`relative z-10 ${iconColor} transition-colors duration-300`}>
          <ClipboardIconWithoutCheck />
        </div>
      )}
    </div>
  );
}

export default function ViewingsTable({
  viewings,
  stakeholders,
  allStakeholders,
  scheduleStakeholders,
  qualityLevels,
  extras,
}: ViewingsTableProps) {
  const router = useRouter();
  const [editingViewing, setEditingViewing] = useState<Viewing | null>(null);
  const [localViewings, setLocalViewings] = useState<Viewing[]>(viewings);
  const [deletingViewingId, setDeletingViewingId] = useState<number | null>(
    null
  );
  const [deletingViewingAddress, setDeletingViewingAddress] = useState<
    string | null
  >(null);
  const [archivingViewing, setArchivingViewing] = useState<Viewing | null>(null);
  const [viewingComments, setViewingComments] = useState<string | null>(null);
  const [schedulingViewing, setSchedulingViewing] = useState<Viewing | null>(null);
  const [visitDetailsViewing, setVisitDetailsViewing] = useState<Viewing | null>(null);
  const [additionalDetailsViewing, setAdditionalDetailsViewing] = useState<Viewing | null>(null);
  const [extraExpensesViewing, setExtraExpensesViewing] = useState<Viewing | null>(null);
  const [visibilityViewing, setVisibilityViewing] = useState<Viewing | null>(null);
  const [totalCostViewing, setTotalCostViewing] = useState<Viewing | null>(null);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [expenseTotals, setExpenseTotals] = useState<Record<number, number>>({});
  const [editingCell, setEditingCell] = useState<{ viewingId: number; field: 'price' | 'rent' } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isSavingCell, setIsSavingCell] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const handleEditClick = (viewing: Viewing) => {
    setEditingViewing(viewing);
    setOpenMenuRowId(null);
  };

  const handleDeleteClick = (viewing: Viewing) => {
    setDeletingViewingId(viewing.id);
    setDeletingViewingAddress(viewing.address);
    setOpenMenuRowId(null);
  };

  const handleArchiveClick = (viewing: Viewing) => {
    setArchivingViewing(viewing);
    setOpenMenuRowId(null);
  };

  const handleCloseArchive = () => {
    setArchivingViewing(null);
  };

  const handleCloseEdit = () => {
    setEditingViewing(null);
  };

  const handleCloseDelete = () => {
    setDeletingViewingId(null);
    setDeletingViewingAddress(null);
  };

  const handleViewComments = (comments: string | null) => {
    setViewingComments(comments);
  };

  const handleCloseComments = () => {
    setViewingComments(null);
  };

  const handleScheduleVisit = (viewing: Viewing) => {
    setSchedulingViewing(viewing);
    setOpenMenuRowId(null);
  };

  const handleCloseSchedule = () => {
    setSchedulingViewing(null);
  };

  const handleVisitDetailsClick = (viewing: Viewing) => {
    setVisitDetailsViewing(viewing);
    setOpenMenuRowId(null);
  };

  const handleCloseVisitDetails = () => {
    setVisitDetailsViewing(null);
  };

  const handleAdditionalDetailsClick = (viewing: Viewing) => {
    setAdditionalDetailsViewing(viewing);
    setOpenMenuRowId(null);
  };

  const handleCloseAdditionalDetails = () => {
    setAdditionalDetailsViewing(null);
  };

  const handleExtraExpensesClick = (viewing: Viewing) => {
    setExtraExpensesViewing(viewing);
    setOpenMenuRowId(null);
  };

  const handleCloseExtraExpenses = () => {
    setExtraExpensesViewing(null);
    // Refresh expense totals after modal closes
    const fetchExpenseTotals = async () => {
      const totals: Record<number, number> = {};
      const promises = localViewings.map(async (viewing) => {
        try {
          const response = await fetch(`/api/viewing-extra-items?viewingId=${viewing.id}`);
          const data = await response.json();
          if (data.success && data.data) {
            const total = data.data.reduce((sum: number, item: any) => sum + item.amount, 0);
            totals[viewing.id] = total;
          } else {
            totals[viewing.id] = 0;
          }
        } catch (error) {
          console.error(`Error fetching expenses for viewing ${viewing.id}:`, error);
          totals[viewing.id] = 0;
        }
      });
      await Promise.all(promises);
      setExpenseTotals(totals);
    };
    fetchExpenseTotals();
  };

  const handleVisibilityClick = (viewing: Viewing) => {
    setVisibilityViewing(viewing);
    setOpenMenuRowId(null);
  };

  const handleCloseVisibility = () => {
    setVisibilityViewing(null);
  };

  const handleTotalCostClick = (viewing: Viewing) => {
    setTotalCostViewing(viewing);
    setOpenMenuRowId(null);
  };

  const handleCloseTotalCost = () => {
    setTotalCostViewing(null);
  };

  const handleMenuToggle = (viewingId: number) => {
    setOpenMenuRowId(openMenuRowId === viewingId ? null : viewingId);
  };

  const handleCardToggle = (viewingId: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(viewingId)) {
        newSet.delete(viewingId);
      } else {
        newSet.add(viewingId);
      }
      return newSet;
    });
  };

  const handleCellEditStart = (viewingId: number, field: 'price' | 'rent', currentValue: number | null) => {
    setEditingCell({ viewingId, field });
    setEditingValue(currentValue !== null ? currentValue.toString() : "");
  };

  const handleCellEditCancel = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  const handleCellEditSave = async (viewingId: number, field: 'price' | 'rent') => {
    const value = parseFloat(editingValue.trim());
    if (isNaN(value) || value < 0) {
      return; // Invalid value, don't save
    }

    setIsSavingCell(true);

    try {
      if (field === 'price') {
        // Update price via viewings API
        const response = await fetch("/api/viewings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: viewingId,
            price: value,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to update price");
        }
      } else {
        // Update rent via visit-details API
        const response = await fetch("/api/visit-details", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            viewingId: viewingId,
            expectedMinimalRent: value,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to update rent");
        }
      }

      // Update local state immediately for instant UI feedback
      setLocalViewings((prev) =>
        prev.map((v) =>
          v.id === viewingId
            ? {
                ...v,
                ...(field === 'price' ? { price: value } : { expectedMinimalRent: value }),
              }
            : v
        )
      );

      // Refresh server component data without full page reload
      router.refresh();
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      alert(err instanceof Error ? err.message : `Failed to update ${field}`);
    } finally {
      setIsSavingCell(false);
      setEditingCell(null);
      setEditingValue("");
    }
  };

  // Fetch expense totals for all viewings
  useEffect(() => {
    const fetchExpenseTotals = async () => {
      const totals: Record<number, number> = {};
      const promises = localViewings.map(async (viewing) => {
        try {
          const response = await fetch(`/api/viewing-extra-items?viewingId=${viewing.id}`);
          const data = await response.json();
          if (data.success && data.data) {
            const total = data.data.reduce((sum: number, item: any) => sum + item.amount, 0);
            totals[viewing.id] = total;
          } else {
            totals[viewing.id] = 0;
          }
        } catch (error) {
          console.error(`Error fetching expenses for viewing ${viewing.id}:`, error);
          totals[viewing.id] = 0;
        }
      });
      await Promise.all(promises);
      setExpenseTotals(totals);
    };

    if (localViewings.length > 0) {
      fetchExpenseTotals();
    }
  }, [localViewings]);

  // Sync localViewings with viewings prop when it changes (e.g., from router.refresh())
  useEffect(() => {
    setLocalViewings(viewings);
  }, [viewings]);

  // Handle column header click for sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort viewings based on current sort column and direction
  const sortedViewings = [...localViewings].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'address':
        aValue = a.address || '';
        bValue = b.address || '';
        break;
      case 'size':
        aValue = toNumber(a.size);
        bValue = toNumber(b.size);
        break;
      case 'price':
        aValue = toNumber(a.price);
        bValue = toNumber(b.price);
        break;
      case 'pricePerM':
        const aPrice = toNumber(a.price);
        const aSize = toNumber(a.size);
        const bPrice = toNumber(b.price);
        const bSize = toNumber(b.size);
        aValue = (aPrice !== null && aSize !== null && aSize > 0) ? aPrice / aSize : null;
        bValue = (bPrice !== null && bSize !== null && bSize > 0) ? bPrice / bSize : null;
        break;
      case 'bedrooms':
        aValue = toNumber(a.bedrooms);
        bValue = toNumber(b.bedrooms);
        break;
      case 'floor':
        aValue = toNumber(a.floor);
        bValue = toNumber(b.floor);
        break;
      case 'rent':
        aValue = toNumber(a.expectedMinimalRent);
        bValue = toNumber(b.expectedMinimalRent);
        break;
      case 'extra':
        aValue = expenseTotals[a.id] ?? 0;
        bValue = expenseTotals[b.id] ?? 0;
        break;
      case 'totalCost':
        const aExtraTotal = expenseTotals[a.id] ?? 0;
        const bExtraTotal = expenseTotals[b.id] ?? 0;
        aValue = calculateTotalCost(a, aExtraTotal);
        bValue = calculateTotalCost(b, bExtraTotal);
        break;
      case 'agent':
        aValue = a.agentStakeholder?.name || '';
        bValue = b.agentStakeholder?.name || '';
        break;
      case 'comments':
        aValue = a.comments ? 1 : 0;
        bValue = b.comments ? 1 : 0;
        break;
      case 'visit':
        aValue = calculateCompletionPercentage(a);
        bValue = calculateCompletionPercentage(b);
        break;
      case 'schedule':
        aValue = a.viewingDate ? new Date(a.viewingDate).getTime() : null;
        bValue = b.viewingDate ? new Date(b.viewingDate).getTime() : null;
        break;
      default:
        return 0;
    }

    // Handle null values - nulls go to the end when ascending, beginning when descending
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === null) return sortDirection === 'asc' ? -1 : 1;

    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = (aValue as number) - (bValue as number);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuRowId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-container')) {
          setOpenMenuRowId(null);
        }
      }
    };

    if (openMenuRowId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuRowId]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openMenuRowId !== null) {
        setOpenMenuRowId(null);
      }
    };

    if (openMenuRowId !== null) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [openMenuRowId]);

  // Handle escape key for comments modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && viewingComments !== null) {
        handleCloseComments();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [viewingComments]);

  // Helper component for sortable column headers
  const SortableHeader = ({ 
    column, 
    children, 
    className = "",
    align = "left",
    style
  }: { 
    column: string; 
    children: React.ReactNode; 
    className?: string;
    align?: "left" | "center" | "right";
    style?: React.CSSProperties;
  }) => {
    const isSorted = sortColumn === column;
    const textAlign = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
    
    return (
      <th 
        className={`${className} ${textAlign} cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors`}
        onClick={() => handleSort(column)}
        style={style}
      >
        <div className="flex items-center gap-1">
          <span>{children}</span>
          <div className="flex flex-col">
            <ChevronUpIcon 
              className={`h-3 w-3 ${
                isSorted && sortDirection === 'asc' 
                  ? 'text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-300 dark:text-zinc-600'
              }`} 
            />
            <ChevronDownIcon 
              className={`h-3 w-3 -mt-1 ${
                isSorted && sortDirection === 'desc' 
                  ? 'text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-300 dark:text-zinc-600'
              }`} 
            />
          </div>
        </div>
      </th>
    );
  };

  // Prevent body scroll when comments modal is open
  useEffect(() => {
    if (viewingComments !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [viewingComments]);

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-zinc-200 dark:divide-zinc-800" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <SortableHeader 
                  column="id"
                  className="sticky left-0 z-20 w-10 border-r border-zinc-200 bg-zinc-50 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 sm:px-1.5"
                >
                  ID
                </SortableHeader>
                <SortableHeader 
                  column="address"
                  className="sticky left-10 z-20 w-[120px] max-w-[120px] border-r border-zinc-200 bg-zinc-50 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 sm:left-10 sm:px-1.5"
                  style={{ boxSizing: 'border-box' }}
                >
                  Address
                </SortableHeader>
                <th className="relative z-10 w-8 px-0.5 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Ad
                </th>
                <th className="w-12 min-w-[48px] px-1 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Photos
                </th>
                <SortableHeader 
                  column="size"
                  className="w-12 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Size
                </SortableHeader>
                <SortableHeader 
                  column="price"
                  className="w-16 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Price
                </SortableHeader>
                <SortableHeader 
                  column="pricePerM"
                  className="w-14 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  €/m²
                </SortableHeader>
                <SortableHeader 
                  column="bedrooms"
                  className="w-10 px-0.5 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                  align="center"
                >
                  Beds
                </SortableHeader>
                <SortableHeader 
                  column="floor"
                  className="w-14 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Floor
                </SortableHeader>
                <SortableHeader 
                  column="rent"
                  className="w-16 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Rent
                </SortableHeader>
                <SortableHeader 
                  column="extra"
                  className="w-20 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Extra
                </SortableHeader>
                <SortableHeader 
                  column="totalCost"
                  className="w-24 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Total Cost
                </SortableHeader>
                <SortableHeader 
                  column="agent"
                  className="w-20 px-1 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Agent
                </SortableHeader>
                <th className="w-8 px-0.5 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                   
                </th>
                <SortableHeader 
                  column="visit"
                  className="w-8 px-0.5 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                  align="center"
                >
                  Visit
                </SortableHeader>
                <SortableHeader 
                  column="schedule"
                  className="w-8 px-0.5 py-2 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400"
                  align="center"
                >
                  Schedule
                </SortableHeader>
                <th className="w-8 px-0.5 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  ⋮
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {sortedViewings.map((viewing) => (
                <tr
                  key={viewing.id}
                  className={`group transition-colors ${
                    viewing.isArchive 
                      ? "opacity-75 bg-orange-50/30 dark:bg-orange-900/10 border-l-2 border-l-orange-400" 
                      : `${getOverallLevelBorderColor(viewing.overallLevel, viewing.isArchive)} ${getOverallLevelBgColor(viewing.overallLevel, viewing.isArchive)}`
                  } hover:bg-zinc-50 dark:hover:bg-zinc-800/50`}
                >
                  <td className={`sticky left-0 z-10 w-10 whitespace-nowrap border-r border-zinc-200 px-1 py-2 text-xs font-medium text-zinc-900 transition-colors dark:border-zinc-700 dark:text-zinc-50 sm:px-1.5 ${
                    viewing.isArchive 
                      ? "bg-orange-50/30 dark:bg-orange-900/10 group-hover:bg-orange-100/40 dark:group-hover:bg-orange-900/20" 
                      : `${getOverallLevelBgColor(viewing.overallLevel, viewing.isArchive) || "bg-white dark:bg-zinc-900"} group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50`
                  }`}>
                    <div className="flex items-center gap-1">
                      {viewing.isArchive && (
                        <span title="Archived">
                          <ArchiveIcon className="h-3 w-3 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                        </span>
                      )}
                      <span className={viewing.isArchive ? "line-through decoration-orange-400" : ""}>
                        {viewing.id}
                      </span>
                    </div>
                  </td>
                  <td className={`sticky left-10 z-10 w-[120px] max-w-[120px] border-r border-zinc-200 px-1 py-2 text-xs text-zinc-900 transition-colors dark:border-zinc-700 dark:text-zinc-50 sm:left-10 sm:px-1.5 ${
                    viewing.isArchive 
                      ? "bg-orange-50/30 dark:bg-orange-900/10 group-hover:bg-orange-100/40 dark:group-hover:bg-orange-900/20" 
                      : `${getOverallLevelBgColor(viewing.overallLevel, viewing.isArchive) || "bg-white dark:bg-zinc-900"} group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50`
                  }`} style={{ boxSizing: 'border-box' }}>
                    <div className="truncate">
                      {viewing.linkAddress ? (
                        <a
                          href={viewing.linkAddress}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`hover:underline ${
                            viewing.isArchive 
                              ? "text-blue-500 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 line-through decoration-orange-400" 
                              : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          }`}
                          title={viewing.address || undefined}
                        >
                          {viewing.address}
                        </a>
                      ) : (
                        <span 
                          className={viewing.isArchive ? "line-through decoration-orange-400" : ""}
                          title={viewing.address || undefined}
                        >
                          {viewing.address}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="relative z-10 w-8 whitespace-nowrap px-0.5 py-2 text-center text-xs">
                    {viewing.linkAd ? (
                      <a
                        href={viewing.linkAd}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center text-zinc-600 hover:text-blue-600 transition-colors dark:text-zinc-400 dark:hover:text-blue-400"
                        title="Open ad link"
                      >
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">-</span>
                    )}
                  </td>
                  <td className="w-12 min-w-[48px] whitespace-nowrap px-1 py-2 text-center text-xs">
                    {viewing.linkToPhotos ? (
                      <a
                        href={viewing.linkToPhotos}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center text-zinc-600 hover:text-blue-600 transition-colors dark:text-zinc-400 dark:hover:text-blue-400"
                        title="Open photos link"
                      >
                        <PhotoIcon className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {(() => {
                      const size = toNumber(viewing.size);
                      return size !== null ? `${size} m²` : "-";
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    {(() => {
                      const isEditing = editingCell?.viewingId === viewing.id && editingCell?.field === 'price';
                      const price = toNumber(viewing.price);
                      
                      if (isEditing) {
                        return (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => {
                                const value = parseFloat(editingValue.trim());
                                if (!isNaN(value) && value >= 0) {
                                  handleCellEditSave(viewing.id, 'price');
                                } else {
                                  handleCellEditCancel();
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const value = parseFloat(editingValue.trim());
                                  if (!isNaN(value) && value >= 0) {
                                    handleCellEditSave(viewing.id, 'price');
                                  }
                                } else if (e.key === 'Escape') {
                                  handleCellEditCancel();
                                }
                              }}
                              autoFocus
                              className="w-20 rounded border border-zinc-300 px-1 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                              disabled={isSavingCell}
                            />
                          </div>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => handleCellEditStart(viewing.id, 'price', price)}
                          className="hover:underline cursor-pointer"
                          title="Click to edit price"
                        >
                          {price !== null ? `€${price.toLocaleString()}` : "-"}
                        </button>
                      );
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    {(() => {
                      const price = toNumber(viewing.price);
                      const size = toNumber(viewing.size);
                      if (price !== null && size !== null && size > 0) {
                        const pricePerM = price / size;
                        return `€${Math.round(pricePerM).toLocaleString()}`;
                      }
                      return "-";
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-0.5 py-2 text-center text-xs text-zinc-600 dark:text-zinc-400">
                    {(() => {
                      const bedrooms = toNumber(viewing.bedrooms);
                      return bedrooms !== null ? bedrooms : "-";
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-0.5">
                      {(() => {
                        const floor = toNumber(viewing.floor);
                        return floor !== null ? floor : "-";
                      })()}
                      {viewing.isElevator ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-0.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300" title="Elevator available">
                          <ElevatorDoorsIcon className="h-2.5 w-2.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-0.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300" title="No elevator">
                          <NoElevatorIcon className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    {(() => {
                      const isEditing = editingCell?.viewingId === viewing.id && editingCell?.field === 'rent';
                      const rent = toNumber(viewing.expectedMinimalRent);
                      
                      if (isEditing) {
                        return (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => {
                                const value = parseFloat(editingValue.trim());
                                if (!isNaN(value) && value >= 0) {
                                  handleCellEditSave(viewing.id, 'rent');
                                } else {
                                  handleCellEditCancel();
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const value = parseFloat(editingValue.trim());
                                  if (!isNaN(value) && value >= 0) {
                                    handleCellEditSave(viewing.id, 'rent');
                                  }
                                } else if (e.key === 'Escape') {
                                  handleCellEditCancel();
                                }
                              }}
                              autoFocus
                              className="w-20 rounded border border-zinc-300 px-1 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                              disabled={isSavingCell}
                            />
                          </div>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => handleCellEditStart(viewing.id, 'rent', rent)}
                          className="hover:underline cursor-pointer"
                          title="Click to edit rent"
                        >
                          {rent !== null ? `€${rent.toLocaleString()}` : "-"}
                        </button>
                      );
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    {(() => {
                      const total = expenseTotals[viewing.id] ?? null;
                      
                      if (total === null) {
                        return <span className="text-zinc-300 dark:text-zinc-700">-</span>;
                      }
                      return (
                        <button
                          onClick={() => handleExtraExpensesClick(viewing)}
                          className="transition-colors hover:underline cursor-pointer"
                          title="Click to manage extra expenses"
                        >
                          {total !== 0 ? `€${Math.round(total).toLocaleString("en-US")}` : "€0"}
                        </button>
                      );
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    {(() => {
                      const extraTotal = expenseTotals[viewing.id] ?? 0;
                      const totalCost = calculateTotalCost(viewing, extraTotal);
                      return (
                        <button
                          onClick={() => handleTotalCostClick(viewing)}
                          className="hover:underline cursor-pointer"
                          title="Click to view total cost breakdown"
                        >
                          {totalCost > 0 ? `€${Math.round(totalCost).toLocaleString("en-US")}` : "-"}
                        </button>
                      );
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {viewing.agentStakeholder ? (
                      <span
                        className="truncate"
                        title={viewing.agentStakeholder.name}
                      >
                        {viewing.agentStakeholder.name}
                      </span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-0.5 py-2 text-center text-xs">
                    {viewing.comments && viewing.comments.trim() ? (
                      <button
                        onClick={() => handleViewComments(viewing.comments)}
                        className="inline-flex items-center justify-center rounded-lg p-0.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        title="View comments"
                        aria-label="View comments"
                      >
                        <DocumentIcon className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-0.5 py-2 text-center text-xs">
                    <button
                      onClick={() => handleVisitDetailsClick(viewing)}
                      className="inline-flex items-center justify-center rounded-lg p-0.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                      title={`Visit details (${calculateCompletionPercentage(viewing)}% complete)`}
                      aria-label={`Visit details (${calculateCompletionPercentage(viewing)}% complete)`}
                    >
                      <ProgressClipboardIcon completionPercentage={calculateCompletionPercentage(viewing)} />
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-0.5 py-2 text-center text-xs">
                    <button
                      onClick={() => handleScheduleVisit(viewing)}
                      className={`inline-flex items-center justify-center rounded-lg p-0.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                        viewing.viewingDate
                          ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          : "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      }`}
                      title={viewing.viewingDate ? "View/edit scheduled visit" : "Schedule visit"}
                      aria-label={viewing.viewingDate ? "View/edit scheduled visit" : "Schedule visit"}
                    >
                      {viewing.viewingDate ? (
                        <CalendarCheckIcon className="h-3.5 w-3.5" />
                      ) : (
                        <CalendarIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-0.5 py-2 text-xs">
                    <div className="menu-container relative flex items-center justify-center">
                      <button
                        onClick={() => handleMenuToggle(viewing.id)}
                        className="inline-flex items-center justify-center rounded-lg p-0.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        title="Actions"
                        aria-label="Actions"
                      >
                        <MenuIcon className="h-3.5 w-3.5" />
                      </button>
                      
                      {openMenuRowId === viewing.id && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                          <div className="py-0.5">
                            {/* Additional Details */}
                            <button
                              onClick={() => handleAdditionalDetailsClick(viewing)}
                              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            >
                              <PhotoIcon className="h-3.5 w-3.5" />
                              <span>Additional Details</span>
                            </button>
                            
                            {/* Extra Expenses */}
                            <button
                              onClick={() => handleExtraExpensesClick(viewing)}
                              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            >
                              <CurrencyDollarIcon className="h-3.5 w-3.5" />
                              <span>Extra Expenses</span>
                            </button>
                            
                            {/* Manage Visibility */}
                            <button
                              onClick={() => handleVisibilityClick(viewing)}
                              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            >
                              <UserIcon className="h-3.5 w-3.5" />
                              <span>Manage Visibility</span>
                            </button>
                            
                            {/* Divider */}
                            <div className="my-0.5 border-t border-zinc-200 dark:border-zinc-700" />
                            
                            {/* Edit */}
                            <button
                              onClick={() => handleEditClick(viewing)}
                              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            >
                              <EditIcon className="h-3.5 w-3.5" />
                              <span>Edit Basic Details</span>
                            </button>
                            
                            {/* Archive/Unarchive */}
                            <button
                              onClick={() => handleArchiveClick(viewing)}
                              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-300"
                            >
                              <ArchiveIcon className="h-3.5 w-3.5" />
                              <span>{viewing.isArchive ? 'Unarchive' : 'Archive'}</span>
                            </button>
                            
                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteClick(viewing)}
                              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {sortedViewings.map((viewing) => {
          const isExpanded = expandedCards.has(viewing.id);
          const isEditingPrice = editingCell?.viewingId === viewing.id && editingCell?.field === 'price';
          const isEditingRent = editingCell?.viewingId === viewing.id && editingCell?.field === 'rent';
          const price = toNumber(viewing.price);
          const rent = toNumber(viewing.expectedMinimalRent);
          const size = toNumber(viewing.size);
          const bedrooms = toNumber(viewing.bedrooms);
          const floor = toNumber(viewing.floor);
          const extraTotal = expenseTotals[viewing.id] ?? 0;
          const totalCost = calculateTotalCost(viewing, extraTotal);
          const pricePerM = price !== null && size !== null && size > 0 ? price / size : null;

          return (
            <div
              key={viewing.id}
              className={`rounded-lg border ${
                viewing.isArchive
                  ? "border-orange-300 bg-orange-50/30 dark:border-orange-700 dark:bg-orange-900/10 border-l-2 border-l-orange-400"
                  : `border-zinc-200 dark:border-zinc-800 ${getOverallLevelBorderColor(viewing.overallLevel, viewing.isArchive)} ${getOverallLevelBgColor(viewing.overallLevel, viewing.isArchive) || "bg-white dark:bg-zinc-900"}`
              } shadow-sm transition-colors`}
            >
              {/* Card Header */}
              <div className={`px-4 py-3 ${
                viewing.isArchive
                  ? "bg-orange-50/50 dark:bg-orange-900/20"
                  : `${getOverallLevelBgColor(viewing.overallLevel, viewing.isArchive) || "bg-zinc-50 dark:bg-zinc-800/50"}`
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {viewing.isArchive && (
                      <ArchiveIcon className="h-4 w-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-semibold text-zinc-900 dark:text-zinc-50 ${
                      viewing.isArchive ? "line-through decoration-orange-400" : ""
                    }`}>
                      #{viewing.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      {viewing.linkAddress ? (
                        <a
                          href={viewing.linkAddress}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm font-medium truncate block hover:underline ${
                            viewing.isArchive
                              ? "text-blue-500 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 line-through decoration-orange-400"
                              : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          }`}
                          title={viewing.address || undefined}
                        >
                          {viewing.address}
                        </a>
                      ) : (
                        <span
                          className={`text-sm font-medium truncate block ${
                            viewing.isArchive ? "line-through decoration-orange-400" : "text-zinc-900 dark:text-zinc-50"
                          }`}
                          title={viewing.address || undefined}
                        >
                          {viewing.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Row */}
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {/* Price */}
                  <div className="flex-1 min-w-[100px]">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Price</div>
                    {isEditingPrice ? (
                      <input
                        type="number"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => {
                          const value = parseFloat(editingValue.trim());
                          if (!isNaN(value) && value >= 0) {
                            handleCellEditSave(viewing.id, 'price');
                          } else {
                            handleCellEditCancel();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = parseFloat(editingValue.trim());
                            if (!isNaN(value) && value >= 0) {
                              handleCellEditSave(viewing.id, 'price');
                            }
                          } else if (e.key === 'Escape') {
                            handleCellEditCancel();
                          }
                        }}
                        autoFocus
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        disabled={isSavingCell}
                      />
                    ) : (
                      <button
                        onClick={() => handleCellEditStart(viewing.id, 'price', price)}
                        className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:underline"
                        title="Click to edit price"
                      >
                        {price !== null ? `€${price.toLocaleString()}` : "-"}
                      </button>
                    )}
                  </div>

                  {/* Size */}
                  <div className="flex-1 min-w-[80px]">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Size</div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {size !== null ? `${size} m²` : "-"}
                    </div>
                  </div>

                  {/* Floor */}
                  <div className="flex-1 min-w-[80px]">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Floor</div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {floor !== null ? floor : "-"}
                      </span>
                      {viewing.isElevator ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-1 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300" title="Elevator available">
                          <ElevatorDoorsIcon className="h-2.5 w-2.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-1 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300" title="No elevator">
                          <NoElevatorIcon className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price/m² */}
                  <div className="flex-1 min-w-[80px]">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">€/m²</div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {pricePerM !== null ? `€${Math.round(pricePerM).toLocaleString()}` : "-"}
                    </div>
                  </div>
                </div>

                {/* Visit Date/Time and Agent Row */}
                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-wrap items-start gap-4">
                    {/* Agent - Always Visible */}
                    <div className="flex-1 min-w-[120px]">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Agent</div>
                      <div className="text-sm text-zinc-900 dark:text-zinc-50">
                        {viewing.agentStakeholder ? (
                          <span title={viewing.agentStakeholder.name}>
                            {viewing.agentStakeholder.name}
                          </span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-700">-</span>
                        )}
                      </div>
                    </div>

                    {/* Visit Date/Time */}
                    {viewing.viewingDate && (
                      <div className="flex-1 min-w-[120px]">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Visit Scheduled</div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {new Date(viewing.viewingDate).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Ad Link */}
                    {viewing.linkAd && (
                      <a
                        href={viewing.linkAd}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                        title="Open ad link"
                      >
                        <ExternalLinkIcon className="h-5 w-5" />
                      </a>
                    )}

                    {/* Photos Link */}
                    {viewing.linkToPhotos && (
                      <a
                        href={viewing.linkToPhotos}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                        title="Open photos link"
                      >
                        <PhotoIcon className="h-5 w-5" />
                      </a>
                    )}

                    {/* Visit Details */}
                    <button
                      onClick={() => handleVisitDetailsClick(viewing)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                      title={`Visit details (${calculateCompletionPercentage(viewing)}% complete)`}
                    >
                      <ProgressClipboardIcon completionPercentage={calculateCompletionPercentage(viewing)} className="h-5 w-5" />
                    </button>

                    {/* Schedule Visit */}
                    <button
                      onClick={() => handleScheduleVisit(viewing)}
                      className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                        viewing.viewingDate
                          ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          : "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      }`}
                      title={viewing.viewingDate ? "View/edit scheduled visit" : "Schedule visit"}
                    >
                      {viewing.viewingDate ? (
                        <CalendarCheckIcon className="h-5 w-5" />
                      ) : (
                        <CalendarIcon className="h-5 w-5" />
                      )}
                    </button>

                    {/* Comments */}
                    {viewing.comments && viewing.comments.trim() && (
                      <button
                        onClick={() => handleViewComments(viewing.comments)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        title="View comments"
                      >
                        <DocumentIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Menu Button */}
                  <div className="menu-container relative">
                    <button
                      onClick={() => handleMenuToggle(viewing.id)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                      title="Actions"
                    >
                      <MenuIcon className="h-5 w-5" />
                    </button>

                    {openMenuRowId === viewing.id && (
                      <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                        <div className="py-0.5">
                          <button
                            onClick={() => handleAdditionalDetailsClick(viewing)}
                            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          >
                            <PhotoIcon className="h-3.5 w-3.5" />
                            <span>Additional Details</span>
                          </button>
                          <button
                            onClick={() => handleExtraExpensesClick(viewing)}
                            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          >
                            <CurrencyDollarIcon className="h-3.5 w-3.5" />
                            <span>Extra Expenses</span>
                          </button>
                          <button
                            onClick={() => handleVisibilityClick(viewing)}
                            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          >
                            <UserIcon className="h-3.5 w-3.5" />
                            <span>Manage Visibility</span>
                          </button>
                          <div className="my-0.5 border-t border-zinc-200 dark:border-zinc-700" />
                          <button
                            onClick={() => handleEditClick(viewing)}
                            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          >
                            <EditIcon className="h-3.5 w-3.5" />
                            <span>Edit Basic Details</span>
                          </button>
                          <button
                            onClick={() => handleArchiveClick(viewing)}
                            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-300"
                          >
                            <ArchiveIcon className="h-3.5 w-3.5" />
                            <span>{viewing.isArchive ? 'Unarchive' : 'Archive'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(viewing)}
                            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Section Toggle */}
              <button
                onClick={() => handleCardToggle(viewing.id)}
                className="w-full px-4 py-2 flex items-center justify-between text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <span>More Details</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="px-4 py-3 border-t border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30 space-y-3">
                  {/* Property Details */}
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                      Property Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Bedrooms</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                          {bedrooms !== null ? bedrooms : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Rent</span>
                        {isEditingRent ? (
                          <input
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => {
                              const value = parseFloat(editingValue.trim());
                              if (!isNaN(value) && value >= 0) {
                                handleCellEditSave(viewing.id, 'rent');
                              } else {
                                handleCellEditCancel();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const value = parseFloat(editingValue.trim());
                                if (!isNaN(value) && value >= 0) {
                                  handleCellEditSave(viewing.id, 'rent');
                                }
                              } else if (e.key === 'Escape') {
                                handleCellEditCancel();
                              }
                            }}
                            autoFocus
                            className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                            disabled={isSavingCell}
                          />
                        ) : (
                          <button
                            onClick={() => handleCellEditStart(viewing.id, 'rent', rent)}
                            className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
                            title="Click to edit rent"
                          >
                            {rent !== null ? `€${rent.toLocaleString()}` : "-"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                      Financial Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Extra Expenses</span>
                        <button
                          onClick={() => handleExtraExpensesClick(viewing)}
                          className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
                        >
                          {extraTotal !== 0 ? `€${Math.round(extraTotal).toLocaleString("en-US")}` : "€0"}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Total Cost</span>
                        <button
                          onClick={() => handleTotalCostClick(viewing)}
                          className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
                        >
                          {totalCost > 0 ? `€${Math.round(totalCost).toLocaleString("en-US")}` : "-"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingViewing && (
        <EditViewingModal
          viewing={editingViewing}
          stakeholders={stakeholders}
          isOpen={!!editingViewing}
          onClose={handleCloseEdit}
        />
      )}

      {deletingViewingId !== null && (
        <DeleteConfirmationModal
          viewingId={deletingViewingId}
          viewingAddress={deletingViewingAddress}
          isOpen={deletingViewingId !== null}
          onClose={handleCloseDelete}
        />
      )}

      {archivingViewing && (
        <ArchiveConfirmationModal
          viewingId={archivingViewing.id}
          viewingAddress={archivingViewing.address}
          isArchive={archivingViewing.isArchive}
          isOpen={!!archivingViewing}
          onClose={handleCloseArchive}
        />
      )}

      {viewingComments !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleCloseComments}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Details
              </h2>
              <button
                onClick={handleCloseComments}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="Close modal"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-50">
                {viewingComments}
              </div>
            </div>
          </div>
        </div>
      )}

      {schedulingViewing && (
        <ScheduleVisitModal
          viewing={schedulingViewing}
          stakeholders={scheduleStakeholders}
          isOpen={!!schedulingViewing}
          onClose={handleCloseSchedule}
        />
      )}

      {visitDetailsViewing && (
        <VisitDetailsModal
          viewing={visitDetailsViewing}
          qualityLevels={qualityLevels}
          isOpen={!!visitDetailsViewing}
          onClose={handleCloseVisitDetails}
        />
      )}

      {additionalDetailsViewing && (
        <AdditionalDetailsModal
          viewing={additionalDetailsViewing}
          qualityLevels={qualityLevels}
          isOpen={!!additionalDetailsViewing}
          onClose={handleCloseAdditionalDetails}
        />
      )}

      {extraExpensesViewing && (
        <ExtraExpensesModal
          viewing={extraExpensesViewing}
          extras={extras}
          isOpen={!!extraExpensesViewing}
          onClose={handleCloseExtraExpenses}
        />
      )}

      {visibilityViewing && (
        <VisibilityModal
          viewing={visibilityViewing}
          stakeholders={allStakeholders}
          isOpen={!!visibilityViewing}
          onClose={handleCloseVisibility}
        />
      )}

      {totalCostViewing && (
        <TotalCostModal
          viewing={totalCostViewing}
          isOpen={!!totalCostViewing}
          onClose={handleCloseTotalCost}
        />
      )}
    </>
  );
}

