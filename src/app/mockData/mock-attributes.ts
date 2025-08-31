// src/app/data/mockAttributes.ts
import { SupplierAttribute } from "@/app/types/attribute";
import { AttributeFieldType, AttributeGroup } from "@/app/enums/attribute";

export const mockAttributes: SupplierAttribute[] = [
  {
    id: "3",
    key: "_basicInfoGeneralCategory",
    name: "Category",
    type: AttributeFieldType.DROPDOWN,
    group: AttributeGroup.BASIC_INFO,
    description: "Product category classification",
    placeHolder: "Select category",
    createdAt: Date.now(),
    updatedAt: Date.now() - 259200000,
  },
  {
    id: "4",
    key: "_basicInfoProductNameColor",
    name: "Available Colors",
    type: AttributeFieldType.MULTI_SELECT,
    group: AttributeGroup.VARIANTS,
    description: "Available color options",
    placeHolder: "Select colors",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "5",
    key: "_basicInfoNetQuantity",
    name: "Weight",
    type: AttributeFieldType.MEASURE,
    group: AttributeGroup.SPECIFICATIONS,
    description: "Product weight with unit",
    placeHolder: "Enter weight",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "6",
    key: "_basicInfoActive",
    name: "In Stock",
    type: AttributeFieldType.DROPDOWN,
    group: AttributeGroup.PRICING_AND_INVENTORY,
    description: "Current stock availability",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
