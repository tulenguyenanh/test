import { Product } from "../types/product";
import { SupplierAttribute } from "../types/attribute";
import productsData from "../mockData/products.json";
import attributesData from "../mockData/attributes.json";

export class DataLoader {
  private static productsCache: Product[] | null = null;
  private static attributesCache: SupplierAttribute[] | null = null;

  static getProducts(): Product[] {
    if (!this.productsCache) {
      this.productsCache = (productsData as { products: Product[] }).products;
    }
    return this.productsCache;
  }

  static getAttributes(): SupplierAttribute[] {
    if (!this.attributesCache) {
      this.attributesCache = (
        attributesData as { attributes: SupplierAttribute[] }
      ).attributes;
    }
    return this.attributesCache;
  }
}
