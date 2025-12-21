import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to validate viewing extra data
function validateViewingExtraData(body: any): { error?: string } {
  if (body.name !== undefined) {
    if (typeof body.name !== "string") {
      return { error: "Name must be a string" };
    }
    if (body.name.trim().length === 0) {
      return { error: "Name cannot be empty" };
    }
    if (body.name.length > 20) {
      return { error: "Name cannot exceed 20 characters" };
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return { error: "Description must be a string" };
    }
    if (body.description.trim().length === 0) {
      return { error: "Description cannot be empty" };
    }
  }

  if (body.estimation !== undefined) {
    if (typeof body.estimation !== "number") {
      return { error: "Estimation must be a number" };
    }
  }

  return {};
}

export async function GET(request: NextRequest) {
  try {
    const viewingExtras = await prisma.viewingExtra.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Serialize Decimal values to numbers
    const serializedExtras = viewingExtras.map((extra) => ({
      id: extra.id,
      name: extra.name,
      description: extra.description,
      estimation: Number(extra.estimation),
    }));

    return NextResponse.json(
      {
        success: true,
        data: serializedExtras,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching viewing extras:", error);
    return NextResponse.json(
      { error: "Failed to fetch viewing extras" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (body.name.length > 20) {
      return NextResponse.json(
        { error: "Name cannot exceed 20 characters" },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== "string" || body.description.trim().length === 0) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (body.estimation === undefined || typeof body.estimation !== "number") {
      return NextResponse.json(
        { error: "Estimation is required and must be a number" },
        { status: 400 }
      );
    }

    // Check if name already exists
    const existingExtra = await prisma.viewingExtra.findFirst({
      where: {
        name: body.name.trim(),
      },
    });

    if (existingExtra) {
      return NextResponse.json(
        { error: "A viewing extra with this name already exists" },
        { status: 400 }
      );
    }

    // Create viewing extra
    const viewingExtra = await prisma.viewingExtra.create({
      data: {
        name: body.name.trim(),
        description: body.description.trim(),
        estimation: body.estimation,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Viewing extra created successfully",
        data: {
          id: viewingExtra.id,
          name: viewingExtra.name,
          description: viewingExtra.description,
          estimation: Number(viewingExtra.estimation),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating viewing extra:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A viewing extra with this name already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create viewing extra" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate extra ID
    if (!body.id || typeof body.id !== "number") {
      return NextResponse.json(
        { error: "Viewing extra ID is required" },
        { status: 400 }
      );
    }

    // Validate input data
    const validation = validateViewingExtraData(body);
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if extra exists
    const existingExtra = await prisma.viewingExtra.findUnique({
      where: { id: body.id },
    });

    if (!existingExtra) {
      return NextResponse.json(
        { error: "Viewing extra not found" },
        { status: 404 }
      );
    }

    // If name is being updated, check for duplicates
    if (body.name !== undefined && body.name.trim() !== existingExtra.name) {
      const duplicateExtra = await prisma.viewingExtra.findFirst({
        where: {
          name: body.name.trim(),
          id: {
            not: body.id,
          },
        },
      });

      if (duplicateExtra) {
        return NextResponse.json(
          { error: "A viewing extra with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Build update data object
    const updateData: any = {};
    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    }
    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }
    if (body.estimation !== undefined) {
      updateData.estimation = body.estimation;
    }

    // Update viewing extra
    const updatedExtra = await prisma.viewingExtra.update({
      where: { id: body.id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Viewing extra updated successfully",
        data: {
          id: updatedExtra.id,
          name: updatedExtra.name,
          description: updatedExtra.description,
          estimation: Number(updatedExtra.estimation),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating viewing extra:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Viewing extra not found" },
          { status: 404 }
        );
      }
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A viewing extra with this name already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update viewing extra" },
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
        { error: "Viewing extra ID is required" },
        { status: 400 }
      );
    }

    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: "Invalid viewing extra ID" },
        { status: 400 }
      );
    }

    // Check if extra exists
    const existingExtra = await prisma.viewingExtra.findUnique({
      where: { id: idNum },
      include: {
        viewingExtraItems: {
          take: 1,
        },
      },
    });

    if (!existingExtra) {
      return NextResponse.json(
        { error: "Viewing extra not found" },
        { status: 404 }
      );
    }

    // Check if extra is being used
    if (existingExtra.viewingExtraItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete viewing extra that is being used in viewing extra items" },
        { status: 400 }
      );
    }

    // Delete viewing extra
    await prisma.viewingExtra.delete({
      where: { id: idNum },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Viewing extra deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting viewing extra:", error);

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Viewing extra not found" },
          { status: 404 }
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Cannot delete viewing extra that is being used" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete viewing extra" },
      { status: 500 }
    );
  }
}


