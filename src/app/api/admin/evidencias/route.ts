import { NextResponse } from "next/server";
import { adminEvidenceRows } from "@/lib/admin/mock";

export async function GET() {
  return NextResponse.json({ data: adminEvidenceRows });
}
