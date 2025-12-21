import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const viewingId = searchParams.get("viewingId");

    if (!viewingId) {
      return NextResponse.json(
        { error: "Viewing ID is required" },
        { status: 400 }
      );
    }

    const viewingIdNum = parseInt(viewingId, 10);
    if (isNaN(viewingIdNum)) {
      return NextResponse.json(
        { error: "Invalid viewing ID" },
        { status: 400 }
      );
    }

    // Check if viewing exists and is not deleted
    const viewing = await prisma.viewing.findUnique({
      where: { id: viewingIdNum },
    });

    if (!viewing) {
      return NextResponse.json(
        { error: "Viewing not found" },
        { status: 404 }
      );
    }

    if (viewing.isDeleted) {
      return NextResponse.json(
        { error: "Cannot access visibility for a deleted viewing" },
        { status: 400 }
      );
    }

    // Fetch visibility assignments for the viewing
    const visibilityRecords = await prisma.viewingsVisibility.findMany({
      where: {
        viewingId: viewingIdNum,
      },
      select: {
        stakeholderId: true,
      },
    });

    // Return array of stakeholder IDs
    const stakeholderIds = visibilityRecords.map((record) => record.stakeholderId);

    return NextResponse.json(
      {
        success: true,
        data: stakeholderIds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching viewing visibility:", error);
    return NextResponse.json(
      { error: "Failed to fetch viewing visibility" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate viewing ID
    if (!body.viewingId || typeof body.viewingId !== "number") {
      return NextResponse.json(
        { error: "Viewing ID is required" },
        { status: 400 }
      );
    }

    // Validate stakeholderIds array
    if (!Array.isArray(body.stakeholderIds)) {
      return NextResponse.json(
        { error: "Stakeholder IDs must be an array" },
        { status: 400 }
      );
    }

    // Validate all stakeholder IDs are numbers
    if (!body.stakeholderIds.every((id: any) => typeof id === "number")) {
      return NextResponse.json(
        { error: "All stakeholder IDs must be numbers" },
        { status: 400 }
      );
    }

    // Check if viewing exists and is not deleted
    const viewing = await prisma.viewing.findUnique({
      where: { id: body.viewingId },
    });

    if (!viewing) {
      return NextResponse.json(
        { error: "Viewing not found" },
        { status: 404 }
      );
    }

    if (viewing.isDeleted) {
      return NextResponse.json(
        { error: "Cannot update visibility for a deleted viewing" },
        { status: 400 }
      );
    }

    // Validate all stakeholder IDs exist and are not deleted
    if (body.stakeholderIds.length > 0) {
      const stakeholders = await prisma.stakeholder.findMany({
        where: {
          id: { in: body.stakeholderIds },
        },
        select: {
          id: true,
          isDeleted: true,
        },
      });

      const foundIds = stakeholders.map((s) => s.id);
      const missingIds = body.stakeholderIds.filter((id: number) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        return NextResponse.json(
          { error: `Invalid stakeholder IDs: ${missingIds.join(", ")}` },
          { status: 400 }
        );
      }

      const deletedStakeholders = stakeholders.filter((s) => s.isDeleted);
      if (deletedStakeholders.length > 0) {
        return NextResponse.json(
          { error: `Cannot assign visibility to deleted stakeholders: ${deletedStakeholders.map((s) => s.id).join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Use a transaction to replace all existing assignments
    await prisma.$transaction(async (tx) => {
      // Delete all existing visibility records for this viewing
      await tx.viewingsVisibility.deleteMany({
        where: {
          viewingId: body.viewingId,
        },
      });

      // Insert new visibility records if any
      if (body.stakeholderIds.length > 0) {
        await tx.viewingsVisibility.createMany({
          data: body.stakeholderIds.map((stakeholderId: number) => ({
            viewingId: body.viewingId,
            stakeholderId,
          })),
        });
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Visibility updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating viewing visibility:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid reference to viewing or stakeholder" },
          { status: 400 }
        );
      }
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Duplicate visibility assignment" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update viewing visibility" },
      { status: 500 }
    );
  }
}

