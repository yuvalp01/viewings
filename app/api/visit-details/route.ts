import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to validate visit details data
function validateVisitDetailsData(body: any): { error?: string } {
  // Validate buildingSecurityDoorsPercent if provided
  if (body.buildingSecurityDoorsPercent !== null && body.buildingSecurityDoorsPercent !== undefined) {
    if (typeof body.buildingSecurityDoorsPercent !== "number") {
      return { error: "Building security doors percent must be a number" };
    }
    if (body.buildingSecurityDoorsPercent < 1 || body.buildingSecurityDoorsPercent > 100) {
      return { error: "Building security doors percent must be between 1 and 100" };
    }
  }

  // Validate expectedMinimalRent if provided
  if (body.expectedMinimalRent !== null && body.expectedMinimalRent !== undefined) {
    if (typeof body.expectedMinimalRent !== "number") {
      return { error: "Expected minimal rent must be a number" };
    }
    if (body.expectedMinimalRent < 0) {
      return { error: "Expected minimal rent must be non-negative" };
    }
  }

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

  // Validate quality level IDs if provided
  const qualityLevelFields = [
    "aluminumWindowsLevel",
    "renovationKitchenLevel",
    "renovationBathroomLevel",
    "renovationLevel",
    "viewLevel",
    "balconyLevel",
    "buildingLobbyLevel",
    "buildingMaintenanceLevel",
    "metroStationDistanceLevel",
  ];

  for (const field of qualityLevelFields) {
    if (body[field] !== null && body[field] !== undefined) {
      if (typeof body[field] !== "number") {
        return { error: `${field} must be a number` };
      }
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
        { error: "Cannot access visit details for a deleted viewing" },
        { status: 400 }
      );
    }

    // Fetch viewing with visit details (fields are on the viewing itself)
    const viewingWithDetails = await prisma.viewing.findUnique({
      where: { id: viewingIdNum },
      select: {
        id: true,
        isSecurityDoor: true,
        buildingSecurityDoorsPercent: true,
        aluminumWindowsLevel: true,
        renovationKitchenLevel: true,
        renovationBathroomLevel: true,
        renovationLevel: true,
        viewLevel: true,
        balconyLevel: true,
        buildingLobbyLevel: true,
        buildingMaintenanceLevel: true,
        comments: true,
        expectedMinimalRent: true,
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
    console.error("Error fetching visit details:", error);
    return NextResponse.json(
      { error: "Failed to fetch visit details" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:99',message:'PUT handler entry',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E,F'})}).catch(()=>{});
  // #endregion
  try {
    const body = await request.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:102',message:'Request body parsed',data:{viewingId:body.viewingId,hasQualityLevels:!!body.aluminumWindowsLevel,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D,E'})}).catch(()=>{});
    // #endregion

    // Validate viewing ID
    if (!body.viewingId || typeof body.viewingId !== "number") {
      return NextResponse.json(
        { error: "Viewing ID is required" },
        { status: 400 }
      );
    }

    // Check if viewing exists and is not deleted
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:112',message:'Before viewing lookup',data:{viewingId:body.viewingId,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const viewing = await prisma.viewing.findUnique({
      where: { id: body.viewingId },
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:115',message:'After viewing lookup',data:{viewingFound:!!viewing,isDeleted:viewing?.isDeleted,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    if (!viewing) {
      return NextResponse.json(
        { error: "Viewing not found" },
        { status: 404 }
      );
    }

    if (viewing.isDeleted) {
      return NextResponse.json(
        { error: "Cannot update visit details for a deleted viewing" },
        { status: 400 }
      );
    }

    // Validate visit details data
    const validation = validateVisitDetailsData(body);
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Validate quality level IDs exist in database
    const qualityLevelFields = [
      "aluminumWindowsLevel",
      "renovationKitchenLevel",
      "renovationBathroomLevel",
      "renovationLevel",
      "viewLevel",
      "balconyLevel",
      "buildingLobbyLevel",
      "buildingMaintenanceLevel",
    ];

    const qualityLevelIds = qualityLevelFields
      .map((field) => body[field])
      .filter((id) => id !== null && id !== undefined);

    if (qualityLevelIds.length > 0) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:155',message:'Before qualityLevel lookup',data:{qualityLevelIds,count:qualityLevelIds.length,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
      // #endregion
      const existingLevels = await prisma.qualityLevel.findMany({
        where: {
          id: {
            in: qualityLevelIds,
          },
        },
        select: {
          id: true,
        },
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:165',message:'After qualityLevel lookup',data:{foundCount:existingLevels.length,requestedCount:qualityLevelIds.length,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
      // #endregion

      const existingIds = new Set(existingLevels.map((level: { id: number }) => level.id));
      const invalidIds = qualityLevelIds.filter((id) => !existingIds.has(id));

      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: `Invalid quality level IDs: ${invalidIds.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Build update data object
    const updateData: any = {
      isSecurityDoor: body.isSecurityDoor !== undefined ? body.isSecurityDoor : null,
      buildingSecurityDoorsPercent: body.buildingSecurityDoorsPercent ?? null,
      aluminumWindowsLevel: body.aluminumWindowsLevel ?? null,
      renovationKitchenLevel: body.renovationKitchenLevel ?? null,
      renovationBathroomLevel: body.renovationBathroomLevel ?? null,
      renovationLevel: body.renovationLevel ?? null,
      viewLevel: body.viewLevel ?? null,
      balconyLevel: body.balconyLevel ?? null,
      buildingLobbyLevel: body.buildingLobbyLevel ?? null,
      buildingMaintenanceLevel: body.buildingMaintenanceLevel ?? null,
      comments: body.comments?.trim() || null,
      expectedMinimalRent: body.expectedMinimalRent ?? null,
      linkToPhotos: body.linkToPhotos?.trim() || null,
      metroStationDistanceLevel: body.metroStationDistanceLevel ?? null,
      transportation: body.transportation?.trim() || null,
    };

    // Update viewing record with visit details
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:193',message:'Before viewing update',data:{viewingId:body.viewingId,updateDataKeys:Object.keys(updateData),timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,E'})}).catch(()=>{});
    // #endregion
    const updatedViewing = await prisma.viewing.update({
      where: { id: body.viewingId },
      data: updateData,
      select: {
        id: true,
        isSecurityDoor: true,
        buildingSecurityDoorsPercent: true,
        aluminumWindowsLevel: true,
        renovationKitchenLevel: true,
        renovationBathroomLevel: true,
        renovationLevel: true,
        viewLevel: true,
        balconyLevel: true,
        buildingLobbyLevel: true,
        buildingMaintenanceLevel: true,
        comments: true,
        expectedMinimalRent: true,
        linkToPhotos: true,
        metroStationDistanceLevel: true,
        transportation: true,
      },
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:201',message:'After viewing update success',data:{viewingId:updatedViewing.id,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,E'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(
      {
        success: true,
        message: "Visit details saved successfully",
        data: updatedViewing,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving visit details:", error);
    // #region agent log
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    } : { raw: String(error) };
    const prismaError = error && typeof error === "object" && "code" in error ? {
      code: (error as any).code,
      meta: (error as any).meta,
      clientVersion: (error as any).clientVersion
    } : null;
    fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:235',message:'Error caught',data:{...errorDetails,prismaError,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E,F'})}).catch(()=>{});
    // #endregion

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf41240d-daf1-44a9-bf17-e80cf5156a08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:245',message:'Prisma error detected',data:{prismaCode:(error as any).code,prismaMeta:(error as any).meta,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
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
        error: "Failed to save visit details",
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

