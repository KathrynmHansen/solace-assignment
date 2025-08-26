import { getAllAdvocates } from "../../services/advocateService";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // Extract query parameters
    const keyword = url.searchParams.get("keyword") || undefined;
    const sortBy = url.searchParams.get("sortBy") || undefined;
    const sortDirParam = (url.searchParams.get("sortDir") || "asc").toLowerCase();

    // Validate sort direction
    const sortDir = sortDirParam === "desc" ? "desc" : "asc";

    // Call service
    const data = await getAllAdvocates({ keyword, sortBy, sortDir });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET /api/advocates failed:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}