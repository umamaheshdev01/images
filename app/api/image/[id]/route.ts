import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "images";

// Streams image bytes only to the authenticated owner. No shareable Supabase
// URL is ever exposed — requests without a valid session cookie get 401, and
// RLS guarantees a user can only ever read their own rows/files.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data: row, error } = await supabase
    .from("images")
    .select("storage_path")
    .eq("id", params.id)
    .single();
  if (error || !row) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { data: blob, error: dlError } = await supabase.storage
    .from(BUCKET)
    .download(row.storage_path);
  if (dlError || !blob) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(blob.stream(), {
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
      // Private: only this user's browser may cache it, never a shared proxy.
      "Cache-Control": "private, max-age=3600, must-revalidate",
    },
  });
}
