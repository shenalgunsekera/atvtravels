import { NextRequest, NextResponse } from "next/server";
import { getAllCountries, getCountry } from "@/lib/packages";

// GET /api/packages          → all countries & packages
// GET /api/packages?country= → single country
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");

  if (country) {
    const data = getCountry(country.toLowerCase());
    if (!data) return NextResponse.json({ error: "Country not found" }, { status: 404 });
    return NextResponse.json(data);
  }

  return NextResponse.json(getAllCountries());
}
