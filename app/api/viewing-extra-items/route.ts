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

    // Check if this is a bulk operation (array of items)
    if (Array.isArray(body.items)) {
      return handleBulkCreate(body.items);
    }

    // Single item creation (existing behavior)
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
        type: body.extraId, // Type appears to be the same as ExtraId based on DB structure
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

// Bulk create handler
async function handleBulkCreate(items: any[]) {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate all items first
    const errors: string[] = [];
    const viewingIds = new Set<number>();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.viewingId || typeof item.viewingId !== "number") {
        errors.push(`Item ${i + 1}: Viewing ID is required`);
        continue;
      }

      if (!item.extraId || typeof item.extraId !== "number") {
        errors.push(`Item ${i + 1}: Extra ID is required`);
        continue;
      }

      if (!item.description || typeof item.description !== "string" || item.description.trim().length === 0) {
        errors.push(`Item ${i + 1}: Description is required`);
        continue;
      }

      if (item.amount === undefined || typeof item.amount !== "number") {
        errors.push(`Item ${i + 1}: Amount is required`);
        continue;
      }

      viewingIds.add(item.viewingId);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation errors", details: errors },
        { status: 400 }
      );
    }

    // All items must have the same viewingId
    if (viewingIds.size !== 1) {
      return NextResponse.json(
        { error: "All items must belong to the same viewing" },
        { status: 400 }
      );
    }

    const viewingId = Array.from(viewingIds)[0];

    // Check if viewing exists and is not deleted
    const viewing = await prisma.viewing.findUnique({
      where: { id: viewingId },
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

    // Verify all extras exist
    const extraIds = items.map(item => item.extraId);
    const extras = await prisma.viewingExtra.findMany({
      where: {
        id: { in: extraIds },
      },
    });

    if (extras.length !== extraIds.length) {
      const foundIds = new Set(extras.map(e => e.id));
      const missingIds = extraIds.filter(id => !foundIds.has(id));
      return NextResponse.json(
        { error: `Some extras not found: ${missingIds.join(", ")}` },
        { status: 404 }
      );
    }

    // Create all items in a transaction
    const createdItems = await prisma.$transaction(
      items.map(item => {
        const extra = extras.find(e => e.id === item.extraId);
        if (!extra) {
          throw new Error(`Extra with id ${item.extraId} not found`);
        }
        return prisma.viewingExtraItem.create({
          data: {
            viewingId: item.viewingId,
            extraId: item.extraId,
            type: item.extraId, // Type appears to be the same as ExtraId based on DB structure
            description: item.description.trim(),
            amount: item.amount,
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
      })
    );

    // Serialize Decimal values to numbers
    const serializedItems = createdItems.map((item) => ({
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
        message: `Successfully created ${serializedItems.length} extra item(s)`,
        data: serializedItems,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bulk viewing extra items:", error);

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
      { error: "Failed to create viewing extra items" },
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

    // If extraId is being updated, validate it and get extra data
    let extra = null;
    if (body.extraId !== undefined) {
      extra = await prisma.viewingExtra.findUnique({
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
      updateData.type = body.extraId; // Type is the same as ExtraId
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

