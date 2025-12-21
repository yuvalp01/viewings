import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to validate extra item data
function validateExtraItemData(body: any): { error?: string } {
  if (body.viewingId !== undefined && typeof body.viewingId !== "number") {
    return { error: "Viewing ID must be a number" };
  }

  if (body.extraId !== undefined && typeof body.extraId !== "number") {
    return { error: "Extra ID must be a number" };
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return { error: "Description must be a string" };
    }
    if (body.description.trim().length === 0) {
      return { error: "Description cannot be empty" };
    }
  }

  if (body.amount !== undefined) {
    if (typeof body.amount !== "number") {
      return { error: "Amount must be a number" };
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
        { error: "Cannot access extra items for a deleted viewing" },
        { status: 400 }
      );
    }

    // Fetch extra items for the viewing
    const extraItems = await prisma.viewingExtraItem.findMany({
      where: {
        viewingId: viewingIdNum,
      },
      include: {
        extra: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Serialize Decimal values to numbers
    const serializedItems = extraItems.map((item) => ({
      id: item.id,
      viewingId: item.viewingId,
      extraId: item.extraId,
      extra: item.extra,
      description: item.description,
      amount: Number(item.amount),
      createdAt: item.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: serializedItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching viewing extra items:", error);
    return NextResponse.json(
      { error: "Failed to fetch viewing extra items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate viewing ID
    if (!body.viewingId || typeof body.viewingId !== "number") {
      return NextResponse.json(
        { error: "Viewing ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.extraId || typeof body.extraId !== "number") {
      return NextResponse.json(
        { error: "Extra ID is required" },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== "string" || body.description.trim().length === 0) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (body.amount === undefined || typeof body.amount !== "number") {
      return NextResponse.json(
        { error: "Amount is required" },
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
        { error: "Cannot add extra items to a deleted viewing" },
        { status: 400 }
      );
    }

    // Check if extra exists
    const extra = await prisma.viewingExtra.findUnique({
      where: { id: body.extraId },
    });

    if (!extra) {
      return NextResponse.json(
        { error: "Extra not found" },
        { status: 404 }
      );
    }

    // Create extra item
    const extraItem = await prisma.viewingExtraItem.create({
      data: {
        viewingId: body.viewingId,
        extraId: body.extraId,
        description: body.description.trim(),
        amount: body.amount,
      },
      include: {
        extra: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Extra item created successfully",
        data: {
          id: extraItem.id,
          viewingId: extraItem.viewingId,
          extraId: extraItem.extraId,
          extra: extraItem.extra,
          description: extraItem.description,
          amount: Number(extraItem.amount),
          createdAt: extraItem.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating viewing extra item:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid reference to viewing or extra" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create viewing extra item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate extra item ID
    if (!body.id || typeof body.id !== "number") {
      return NextResponse.json(
        { error: "Extra item ID is required" },
        { status: 400 }
      );
    }

    // Validate input data
    const validation = validateExtraItemData(body);
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if extra item exists
    const existingItem = await prisma.viewingExtraItem.findUnique({
      where: { id: body.id },
      include: {
        viewing: {
          select: {
            isDeleted: true,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Extra item not found" },
        { status: 404 }
      );
    }

    if (existingItem.viewing.isDeleted) {
      return NextResponse.json(
        { error: "Cannot update extra item for a deleted viewing" },
        { status: 400 }
      );
    }

    // If extraId is being updated, validate it
    if (body.extraId !== undefined) {
      const extra = await prisma.viewingExtra.findUnique({
        where: { id: body.extraId },
      });

      if (!extra) {
        return NextResponse.json(
          { error: "Extra not found" },
          { status: 404 }
        );
      }
    }

    // Build update data object
    const updateData: any = {};
    if (body.extraId !== undefined) {
      updateData.extraId = body.extraId;
    }
    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }
    if (body.amount !== undefined) {
      updateData.amount = body.amount;
    }

    // Update extra item
    const updatedItem = await prisma.viewingExtraItem.update({
      where: { id: body.id },
      data: updateData,
      include: {
        extra: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Extra item updated successfully",
        data: {
          id: updatedItem.id,
          viewingId: updatedItem.viewingId,
          extraId: updatedItem.extraId,
          extra: updatedItem.extra,
          description: updatedItem.description,
          amount: Number(updatedItem.amount),
          createdAt: updatedItem.createdAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating viewing extra item:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Extra item not found" },
          { status: 404 }
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid reference to extra" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update viewing extra item" },
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
        { error: "Extra item ID is required" },
        { status: 400 }
      );
    }

    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: "Invalid extra item ID" },
        { status: 400 }
      );
    }

    // Check if extra item exists
    const existingItem = await prisma.viewingExtraItem.findUnique({
      where: { id: idNum },
      include: {
        viewing: {
          select: {
            isDeleted: true,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Extra item not found" },
        { status: 404 }
      );
    }

    if (existingItem.viewing.isDeleted) {
      return NextResponse.json(
        { error: "Cannot delete extra item for a deleted viewing" },
        { status: 400 }
      );
    }

    // Delete extra item
    await prisma.viewingExtraItem.delete({
      where: { id: idNum },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Extra item deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting viewing extra item:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Extra item not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete viewing extra item" },
      { status: 500 }
    );
  }
}

