import { getAllEntries } from "@/lib/data";

export async function GET() {
  return Response.json(getAllEntries(), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
