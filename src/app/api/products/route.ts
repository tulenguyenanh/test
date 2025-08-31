import { NextRequest } from "next/server";
import { ProductQueryEngine } from "@/app/utils/query-engine/products";
import { DataLoader } from "@/app/utils/dataLoader";
import { ProductQuery } from "@/app/types/query-engine/product";

export async function POST(request: NextRequest) {
  try {
    let body: ProductQuery | null = null;

    if (request.headers.get("content-length") === "0") {
      body = null;
    } else {
      body = await request.json();
    }

    const { filter, sort, pagination } = body ?? {};

    const products = DataLoader.getProducts();
    const queryEngine = new ProductQueryEngine(products);
    const result = await queryEngine.query({
      filter,
      sort,
      pagination,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error processing products query:", error);
    return Response.json(
      { error: "Failed to process products query" },
      { status: 500 }
    );
  }
}
