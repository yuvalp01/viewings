import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to validate viewing data
function validateViewingData(body: any): { error?: string } {
  // Validate required fields
  if (!body.address || typeof body.address !== "string" || !body.address.trim()) {
    return { error: "Address is required" };
  }

  if (typeof body.size !== "number" || body.size <= 0) {
    return { error: "Size must be a positive number" };
  }

  if (typeof body.price !== "number" || body.price <= 0) {
    return { error: "Price must be a positive number" };
  }

  if (typeof body.bedrooms !== "number" || body.bedrooms <= 0) {
    return { error: "Bedrooms must be a positive number" };
  }

  // Validate optional fields
  if (body.floor !== null && body.floor !== undefined) {
    if (typeof body.floor !== "number") {
      return { error: "Floor must be a number" };
    }
  }

  if (body.constructionYear !== null && body.constructionYear !== undefined) {
    const currentYear = new Date().getFullYear();
    if (
      typeof body.constructionYear !== "number" ||
      body.constructionYear < 1800 ||
      body.constructionYear > currentYear
    ) {
      return { error: `Construction year must be between 1800 and ${currentYear}` };
    }
  }

  if (body.linkAd !== null && body.linkAd !== undefined) {
    if (typeof body.linkAd !== "string") {
      return { error: "Link to ad must be a string" };
    }
    if (body.linkAd.trim()) {
      try {
        new URL(body.linkAd);
      } catch {
        return { error: "Link to ad must be a valid URL" };
      }
    }
  }

  if (body.linkAddress !== null && body.linkAddress !== undefined) {
    if (typeof body.linkAddress !== "string") {
      return { error: "Google Maps link must be a string" };
    }
    if (body.linkAddress.trim()) {
      try {
        new URL(body.linkAddress);
      } catch {
        return { error: "Google Maps link must be a valid URL" };
      }
    }
  }

  return {};
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate viewing data
    const validation = validateViewingData(body);
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Validate agentStakeholderId if provided
    if (body.agentStakeholderId !== null && body.agentStakeholderId !== undefined) {
      if (typeof body.agentStakeholderId !== "number") {
        return NextResponse.json(
          { error: "Agent stakeholder ID must be a number" },
          { status: 400 }
        );
      }

      // Verify stakeholder exists
      const stakeholder = await prisma.stakeholder.findUnique({
        where: { id: body.agentStakeholderId },
      });

      if (!stakeholder || stakeholder.isDeleted) {
        return NextResponse.json(
          { error: "Invalid agent stakeholder" },
          { status: 400 }
        );
      }
    }

    // Create viewing record
    const viewing = await prisma.viewing.create({
      data: {
        address: body.address.trim(),
        size: body.size,
        price: body.price,
        bedrooms: body.bedrooms,
        floor: body.floor ?? null,
        isElevator: body.isElevator ?? false,
        constructionYear: body.constructionYear ?? null,
        linkAd: body.linkAd?.trim() || null,
        linkAddress: body.linkAddress?.trim() || null,
        agentStakeholderId: body.agentStakeholderId ?? null,
      },
    });

    return NextResponse.json(
      {
        message: "Viewing created successfully",
        id: viewing.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating viewing:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A record with this information already exists" },
          { status: 409 }
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid reference to related record" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create viewing" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate viewing ID
    if (!body.id || typeof body.id !== "number") {
      return NextResponse.json(
        { error: "Viewing ID is required" },
        { status: 400 }
      );
    }

    // Validate viewing data
    const validation = validateViewingData(body);
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Validate agentStakeholderId if provided
    if (body.agentStakeholderId !== null && body.agentStakeholderId !== undefined) {
      if (typeof body.agentStakeholderId !== "number") {
        return NextResponse.json(
          { error: "Agent stakeholder ID must be a number" },
          { status: 400 }
        );
      }

      // Verify stakeholder exists
      const stakeholder = await prisma.stakeholder.findUnique({
        where: { id: body.agentStakeholderId },
      });

      if (!stakeholder || stakeholder.isDeleted) {
        return NextResponse.json(
          { error: "Invalid agent stakeholder" },
          { status: 400 }
        );
      }
    }

    // Check if viewing exists and is not deleted
    const existingViewing = await prisma.viewing.findUnique({
      where: { id: body.id },
    });

    if (!existingViewing) {
      return NextResponse.json(
        { error: "Viewing not found" },
        { status: 404 }
      );
    }

    if (existingViewing.isDeleted) {
      return NextResponse.json(
        { error: "Cannot update a deleted viewing" },
        { status: 400 }
      );
    }

    // Update viewing record
    const viewing = await prisma.viewing.update({
      where: { id: body.id },
      data: {
        address: body.address.trim(),
        size: body.size,
        price: body.price,
        bedrooms: body.bedrooms,
        floor: body.floor ?? null,
        isElevator: body.isElevator ?? false,
        constructionYear: body.constructionYear ?? null,
        linkAd: body.linkAd?.trim() || null,
        linkAddress: body.linkAddress?.trim() || null,
        agentStakeholderId: body.agentStakeholderId ?? null,
      },
    });

    return NextResponse.json(
      {
        message: "Viewing updated successfully",
        id: viewing.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating viewing:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Viewing not found" },
          { status: 404 }
        );
      }
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A record with this information already exists" },
          { status: 409 }
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid reference to related record" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update viewing" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Viewing ID is required" },
        { status: 400 }
      );
    }

    const viewingId = parseInt(id, 10);
    if (isNaN(viewingId)) {
      return NextResponse.json(
        { error: "Invalid viewing ID" },
        { status: 400 }
      );
    }

    // Check if viewing exists
    const existingViewing = await prisma.viewing.findUnique({
      where: { id: viewingId },
    });

    if (!existingViewing) {
      return NextResponse.json(
        { error: "Viewing not found" },
        { status: 404 }
      );
    }

    if (existingViewing.isDeleted) {
      return NextResponse.json(
        { error: "Viewing is already deleted" },
        { status: 400 }
      );
    }

    // Logical delete: set isDeleted to true
    await prisma.viewing.update({
      where: { id: viewingId },
      data: { isDeleted: true },
    });

    return NextResponse.json(
      {
        message: "Viewing deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting viewing:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Viewing not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete viewing" },
      { status: 500 }
    );
  }
}

