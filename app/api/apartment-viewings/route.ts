import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.address || typeof body.address !== "string" || !body.address.trim()) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (typeof body.size !== "number" || body.size <= 0) {
      return NextResponse.json(
        { error: "Size must be a positive number" },
        { status: 400 }
      );
    }

    if (typeof body.priceAsked !== "number" || body.priceAsked <= 0) {
      return NextResponse.json(
        { error: "Price asked must be a positive number" },
        { status: 400 }
      );
    }

    if (typeof body.bedrooms !== "number" || body.bedrooms <= 0) {
      return NextResponse.json(
        { error: "Bedrooms must be a positive number" },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (body.floor !== null && body.floor !== undefined) {
      if (typeof body.floor !== "number") {
        return NextResponse.json(
          { error: "Floor must be a number" },
          { status: 400 }
        );
      }
    }

    if (body.constructionYear !== null && body.constructionYear !== undefined) {
      const currentYear = new Date().getFullYear();
      if (
        typeof body.constructionYear !== "number" ||
        body.constructionYear < 1800 ||
        body.constructionYear > currentYear
      ) {
        return NextResponse.json(
          { error: `Construction year must be between 1800 and ${currentYear}` },
          { status: 400 }
        );
      }
    }

    if (body.linkAd !== null && body.linkAd !== undefined) {
      if (typeof body.linkAd !== "string") {
        return NextResponse.json(
          { error: "Link to ad must be a string" },
          { status: 400 }
        );
      }
      if (body.linkAd.trim()) {
        try {
          new URL(body.linkAd);
        } catch {
          return NextResponse.json(
            { error: "Link to ad must be a valid URL" },
            { status: 400 }
          );
        }
      }
    }

    if (body.linkAddress !== null && body.linkAddress !== undefined) {
      if (typeof body.linkAddress !== "string") {
        return NextResponse.json(
          { error: "Google Maps link must be a string" },
          { status: 400 }
        );
      }
      if (body.linkAddress.trim()) {
        try {
          new URL(body.linkAddress);
        } catch {
          return NextResponse.json(
            { error: "Google Maps link must be a valid URL" },
            { status: 400 }
          );
        }
      }
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

    // Create apartment viewing record
    const apartmentViewing = await prisma.apartmentViewing.create({
      data: {
        address: body.address.trim(),
        size: body.size,
        priceAsked: body.priceAsked,
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
        message: "Apartment viewing created successfully",
        id: apartmentViewing.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating apartment viewing:", error);

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
      { error: "Failed to create apartment viewing" },
      { status: 500 }
    );
  }
}

