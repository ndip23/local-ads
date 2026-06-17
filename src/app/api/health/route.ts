export const dynamic = "force-dynamic";

export async function GET() {
  // Basic health check - confirms the app is running
  // DB connectivity is checked lazily on actual API calls
  return Response.json({ ok: true, timestamp: new Date().toISOString() });
}
