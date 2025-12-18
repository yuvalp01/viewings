"use client";

import { useState, useEffect } from "react";
import { EditIcon, TrashIcon, ExternalLinkIcon, DocumentIcon, XIcon, UserIcon, CalendarIcon, CalendarCheckIcon, ClipboardIcon, ElevatorDoorsIcon, NoElevatorIcon, PhotoIcon, MenuIcon } from "@/app/components/icons";
import EditViewingModal from "./EditViewingModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ScheduleVisitModal from "./ScheduleVisitModal";
import VisitDetailsModal from "./VisitDetailsModal";
import AdditionalDetailsModal from "./AdditionalDetailsModal";

interface Stakeholder {
  id: number;
  name: string;
}

interface QualityLevel {
  id: number;
  name: string | null;
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
}

interface ViewingsTableProps {
  viewings: Viewing[];
  stakeholders: Stakeholder[];
  scheduleStakeholders: Stakeholder[];
  qualityLevels: QualityLevel[];
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

// Calculate completion percentage for visit details
// Matches the logic from VisitDetailsModal.tsx
function calculateCompletionPercentage(viewing: Viewing): number {
  const totalFields = 12;
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
  scheduleStakeholders,
  qualityLevels,
}: ViewingsTableProps) {
  const [editingViewing, setEditingViewing] = useState<Viewing | null>(null);
  const [deletingViewingId, setDeletingViewingId] = useState<number | null>(
    null
  );
  const [deletingViewingAddress, setDeletingViewingAddress] = useState<
    string | null
  >(null);
  const [viewingComments, setViewingComments] = useState<string | null>(null);
  const [schedulingViewing, setSchedulingViewing] = useState<Viewing | null>(null);
  const [visitDetailsViewing, setVisitDetailsViewing] = useState<Viewing | null>(null);
  const [additionalDetailsViewing, setAdditionalDetailsViewing] = useState<Viewing | null>(null);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);

  const handleEditClick = (viewing: Viewing) => {
    setEditingViewing(viewing);
    setOpenMenuRowId(null);
  };

  const handleDeleteClick = (viewing: Viewing) => {
    setDeletingViewingId(viewing.id);
    setDeletingViewingAddress(viewing.address);
    setOpenMenuRowId(null);
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

  const handleMenuToggle = (viewingId: number) => {
    setOpenMenuRowId(openMenuRowId === viewingId ? null : viewingId);
  };

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
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-zinc-200 dark:divide-zinc-800" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="sticky left-0 z-20 w-10 border-r border-zinc-200 bg-zinc-50 px-1 py-2 text-left text-xs font-medium tracking-wider text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 sm:px-1.5">
                  ID
                </th>
                <th className="sticky left-10 z-20 w-[120px] max-w-[120px] border-r border-zinc-200 bg-zinc-50 px-1 py-2 text-left text-xs font-medium tracking-wider text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 sm:left-10 sm:px-1.5" style={{ boxSizing: 'border-box' }}>
                  Address
                </th>
                <th className="relative z-10 w-8 px-0.5 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Ad
                </th>
                <th className="w-12 px-1 py-2 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Size
                </th>
                <th className="w-16 px-1 py-2 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Price
                </th>
                <th className="w-14 px-1 py-2 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  €/m²
                </th>
                <th className="w-10 px-0.5 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Beds
                </th>
                <th className="hidden w-14 px-1 py-2 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 md:table-cell">
                  Floor
                </th>
                <th className="w-16 px-1 py-2 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Rent
                </th>
                <th className="w-20 px-1 py-2 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Agent
                </th>
                <th className="w-8 px-0.5 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                   
                </th>
                <th className="w-8 px-0.5 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Visit
                </th>
                <th className="w-8 px-0.5 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Schedule
                </th>
                <th className="w-8 px-0.5 py-2 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  ⋮
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {viewings.map((viewing) => (
                <tr
                  key={viewing.id}
                  className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="sticky left-0 z-10 w-10 whitespace-nowrap border-r border-zinc-200 bg-white px-1 py-2 text-xs font-medium text-zinc-900 transition-colors group-hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:group-hover:bg-zinc-800/50 sm:px-1.5">
                    {viewing.id}
                  </td>
                  <td className="sticky left-10 z-10 w-[120px] max-w-[120px] border-r border-zinc-200 bg-white px-1 py-2 text-xs text-zinc-900 transition-colors group-hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:group-hover:bg-zinc-800/50 sm:left-10 sm:px-1.5" style={{ boxSizing: 'border-box' }}>
                    <div className="truncate">
                      {viewing.linkAddress ? (
                        <a
                          href={viewing.linkAddress}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          title={viewing.address || undefined}
                        >
                          {viewing.address}
                        </a>
                      ) : (
                        <span title={viewing.address || undefined}>{viewing.address}</span>
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
                  <td className="whitespace-nowrap px-1 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {(() => {
                      const size = toNumber(viewing.size);
                      return size !== null ? `${size} m²` : "-";
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    {(() => {
                      const price = toNumber(viewing.price);
                      return price !== null
                        ? `€${price.toLocaleString()}`
                        : "-";
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
                  <td className="hidden whitespace-nowrap px-1 py-2 text-xs text-zinc-600 dark:text-zinc-400 md:table-cell">
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
                      const rent = toNumber(viewing.expectedMinimalRent);
                      return rent !== null
                        ? `€${rent.toLocaleString()}`
                        : "-";
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
    </>
  );
}

