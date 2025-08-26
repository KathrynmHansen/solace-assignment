import { seedAdvocates } from "../../services/advocateService";

export async function POST() {
  try {
    const result = await seedAdvocates();
    return Response.json({ success: true, ...result });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}