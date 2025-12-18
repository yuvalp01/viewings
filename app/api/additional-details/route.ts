import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to validate additional details data
function validateAdditionalDetailsData(body: any): { error?: string } {
  // Validate linkToPhotos URL if provided
  if (body.linkToPhotos !== null && body.linkToPhotos !== undefined && body.linkToPhotos !== "") {
    if (typeof body.linkToPhotos !== "string") {
      return { error: "Link to photos must be a string" };
    }
    try {
      new URL(body.linkToPhotos.trim());
    } catch {
      return { error: "Link to photos must be a valid URL" };
    }
  }

  // Validate metroStationDistanceLevel if provided
  if (body.metroStationDistanceLevel !== null && body.metroStationDistanceLevel !== undefined) {
    if (typeof body.metroStationDistanceLevel !== "number") {
      return { error: "Metro station distance level must be a number" };
    }
  }

  return {};
}

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
        { error: "Cannot access additional details for a deleted viewing" },
        { status: 400 }
      );
    }

    // Fetch viewing with additional details fields
    const viewingWithDetails = await prisma.viewing.findUnique({
      where: { id: viewingIdNum },
      select: {
        id: true,
        linkToPhotos: true,
        metroStationDistanceLevel: true,
        transportation: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: viewingWithDetails,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching additional details:", error);
    return NextResponse.json(
      { error: "Failed to fetch additional details" },
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
        { error: "Cannot update additional details for a deleted viewing" },
        { status: 400 }
      );
    }

    // Validate additional details data
    const validation = validateAdditionalDetailsData(body);
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Validate metroStationDistanceLevel exists in qualityLevels if provided
    if (body.metroStationDistanceLevel !== null && body.metroStationDistanceLevel !== undefined) {
      const existingLevel = await prisma.qualityLevel.findUnique({
        where: { id: body.metroStationDistanceLevel },
        select: { id: true },
      });

      if (!existingLevel) {
        return NextResponse.json(
          { error: `Invalid quality level ID: ${body.metroStationDistanceLevel}` },
          { status: 400 }
        );
      }
    }

    // Build update data object
    const updateData: any = {
      linkToPhotos: body.linkToPhotos?.trim() || null,
      metroStationDistanceLevel: body.metroStationDistanceLevel ?? null,
      transportation: body.transportation?.trim() || null,
    };

    // Update viewing record with additional details
    const updatedViewing = await prisma.viewing.update({
      where: { id: body.viewingId },
      data: updateData,
      select: {
        id: true,
        linkToPhotos: true,
        metroStationDistanceLevel: true,
        transportation: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Additional details saved successfully",
        data: updatedViewing,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving additional details:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Viewing not found" },
          { status: 404 }
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid reference to related record" },
          { status: 400 }
        );
      }
    }

    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorCode = error && typeof error === "object" && "code" in error ? (error as any).code : null;
    
    return NextResponse.json(
      { 
        error: "Failed to save additional details",
        details: process.env.NODE_ENV === "development" ? {
          message: errorMessage,
          code: errorCode,
          type: error instanceof Error ? error.name : typeof error
        } : undefined
      },
      { status: 500 }
    );
  }
}

