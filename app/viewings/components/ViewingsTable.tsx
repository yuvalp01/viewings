"use client";

import { useState, useEffect } from "react";
import { EditIcon, TrashIcon, ExternalLinkIcon, DocumentIcon, XIcon, UserIcon, CalendarIcon, CalendarCheckIcon, ClipboardIcon } from "@/app/components/icons";
import EditViewingModal from "./EditViewingModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ScheduleVisitModal from "./ScheduleVisitModal";
import VisitDetailsModal from "./VisitDetailsModal";

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
}

interface ViewingsTableProps {
  viewings: Viewing[];
  stakeholders: Stakeholder[];
  scheduleStakeholders: Stakeholder[];
  qualityLevels: QualityLevel[];
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

  const handleEditClick = (viewing: Viewing) => {
    setEditingViewing(viewing);
  };

  const handleDeleteClick = (viewing: Viewing) => {
    setDeletingViewingId(viewing.id);
    setDeletingViewingAddress(viewing.address);
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
  };

  const handleCloseSchedule = () => {
    setSchedulingViewing(null);
  };

  const handleVisitDetailsClick = (viewing: Viewing) => {
    setVisitDetailsViewing(viewing);
  };

  const handleCloseVisitDetails = () => {
    setVisitDetailsViewing(null);
  };

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
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="sticky left-0 z-20 border-r border-zinc-200 bg-zinc-50 px-3 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 sm:px-6">
                  Id
                </th>
                <th className="sticky left-[80px] z-20 border-r border-zinc-200 bg-zinc-50 px-3 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 sm:left-[100px] sm:px-6">
                  Address
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
                  Ad
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
                  Size
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
                  Price
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
                  Price/m
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
                  Bedrooms
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6 md:table-cell">
                  Floor
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6 lg:table-cell">
                  Elevator
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
                  Details
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {viewings.map((viewing) => (
                <tr
                  key={viewing.id}
                  className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="sticky left-0 z-10 whitespace-nowrap border-r border-zinc-200 bg-white px-3 py-4 text-sm font-medium text-zinc-900 transition-colors group-hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:group-hover:bg-zinc-800/50 sm:px-6">
                    {viewing.id}
                  </td>
                  <td className="sticky left-[80px] z-10 border-r border-zinc-200 bg-white px-3 py-4 text-sm text-zinc-900 transition-colors group-hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:group-hover:bg-zinc-800/50 sm:left-[100px] sm:px-6">
                    {viewing.linkAddress ? (
                      <a
                        href={viewing.linkAddress}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {viewing.address}
                      </a>
                    ) : (
                      viewing.address
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-sm sm:px-6">
                    {viewing.linkAd ? (
                      <a
                        href={viewing.linkAd}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center text-zinc-600 hover:text-blue-600 transition-colors dark:text-zinc-400 dark:hover:text-blue-400"
                        title="Open ad link"
                      >
                        <ExternalLinkIcon className="h-5 w-5" />
                      </a>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-600 dark:text-zinc-400 sm:px-6">
                    {(() => {
                      const size = toNumber(viewing.size);
                      return size !== null ? `${size} m²` : "-";
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50 sm:px-6">
                    {(() => {
                      const price = toNumber(viewing.price);
                      return price !== null
                        ? `€${price.toLocaleString()}`
                        : "-";
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50 sm:px-6">
                    {(() => {
                      const price = toNumber(viewing.price);
                      const size = toNumber(viewing.size);
                      if (price !== null && size !== null && size > 0) {
                        const pricePerM = price / size;
                        return `€${Math.round(pricePerM).toLocaleString()}/m²`;
                      }
                      return "-";
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-600 dark:text-zinc-400 sm:px-6">
                    {(() => {
                      const bedrooms = toNumber(viewing.bedrooms);
                      return bedrooms !== null ? bedrooms : "-";
                    })()}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-zinc-600 dark:text-zinc-400 sm:px-6 md:table-cell">
                    {(() => {
                      const floor = toNumber(viewing.floor);
                      return floor !== null ? floor : "-";
                    })()}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm sm:px-6 lg:table-cell">
                    {viewing.isElevator ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Yes
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">
                        No
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-sm sm:px-6">
                    <div className="flex items-center justify-center gap-2">
                      {viewing.comments && viewing.comments.trim() ? (
                        <button
                          onClick={() => handleViewComments(viewing.comments)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          title="View comments"
                          aria-label="View comments"
                        >
                          <DocumentIcon className="h-5 w-5" />
                        </button>
                      ) : null}
                      {viewing.agentStakeholder ? (
                        <span
                          className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 dark:text-zinc-400"
                          title={`Agent: ${viewing.agentStakeholder.name}`}
                          aria-label={`Agent: ${viewing.agentStakeholder.name}`}
                        >
                          <UserIcon className="h-5 w-5" />
                        </span>
                      ) : null}
                      {!viewing.comments?.trim() && !viewing.agentStakeholder && (
                        <span className="text-zinc-300 dark:text-zinc-700">-</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm sm:px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleVisitDetailsClick(viewing)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        title="Visit details"
                        aria-label="Visit details"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleScheduleVisit(viewing)}
                        className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                          viewing.viewingDate
                            ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            : "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        }`}
                        title={viewing.viewingDate ? "View/edit scheduled visit" : "Schedule visit"}
                        aria-label={viewing.viewingDate ? "View/edit scheduled visit" : "Schedule visit"}
                      >
                        {viewing.viewingDate ? (
                          <CalendarCheckIcon className="h-5 w-5" />
                        ) : (
                          <CalendarIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditClick(viewing)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        title="Edit viewing"
                        aria-label="Edit viewing"
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(viewing)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        title="Delete viewing"
                        aria-label="Delete viewing"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
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
    </>
  );
}

