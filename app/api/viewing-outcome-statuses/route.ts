import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const statuses = await prisma.viewingOutcomeStatus.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Error fetching viewing outcome statuses:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load viewing outcome statuses.",
      },
      { status: 500 }
    );
  }
}

