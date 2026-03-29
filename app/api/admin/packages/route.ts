import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "packages.json");

function authenticate(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-secret");
  return token === process.env.ADMIN_SECRET;
}

// GET /api/admin/packages — return current data
export async function GET(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}

// PUT /api/admin/packages — replace entire packages.json (admin use only)
export async function PUT(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    await fs.writeFile(DATA_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin packages update error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// PATCH /api/admin/packages — update a single package field
// Body: { countryId, packageId, updates: Partial<Package> }
export async function PATCH(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { countryId, packageId, updates } = await req.json();

    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    if (!data[countryId]) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    const pkgIndex = data[countryId].packages.findIndex(
      (p: { id: string }) => p.id === packageId
    );

    if (pkgIndex === -1) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    data[countryId].packages[pkgIndex] = {
      ...data[countryId].packages[pkgIndex],
      ...updates,
    };

    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ success: true, updated: data[countryId].packages[pkgIndex] });
  } catch (err) {
    console.error("Admin PATCH error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
