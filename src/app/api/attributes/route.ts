import { NextRequest, NextResponse } from "next/server";
import { SupplierAttributeQueryEngine } from "@/app/utils/query-engine/attributes";
import { DataLoader } from "@/app/utils/dataLoader";
import { SupplierAttributeQuery } from "@/app/types/query-engine/attribute";

export async function POST(request: NextRequest) {
  try {
    let body: SupplierAttributeQuery | null = null;

    if (request.headers.get("content-length") === "0") {
      body = null;
    } else {
      body = await request.json();
    }

    const { filter, sort, pagination } = body ?? {};

    const attributes = DataLoader.getAttributes();
    const queryEngine = new SupplierAttributeQueryEngine(attributes);
    const result = await queryEngine.query({
      filter,
      sort,
      pagination,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error processing attributes query:", error);
    return NextResponse.json(
      { error: "Failed to process attributes query" },
      { status: 500 }
    );
  }
}
