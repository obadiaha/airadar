import { NextResponse } from "next/server";
import { getDemoResults } from "@/lib/demo-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brand, competitors = [], keyword } = body;

    if (!brand || !keyword) {
      return NextResponse.json(
        { error: "Brand and keyword are required" },
        { status: 400 }
      );
    }

    // Simulate a brief delay for realism
    await new Promise((resolve) => setTimeout(resolve, 800));

    const results = getDemoResults(brand, competitors, keyword);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Demo scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
