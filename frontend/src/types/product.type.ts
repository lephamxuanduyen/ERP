export type Attribute = {
    id?: number | undefined;
    value: string;
    default_extra_price: number;
    color: string;
    attribute_id: number | null;
}

export type Product = {
    id: number
    prod_name: string;
    unit: string;
    prod_type: string;
    category: string;
    prod_price: number;
    prod_cost_price: number;
    taxes: number;
    barcode: number;
    attributes?: Attribute[];
    attributes_display?: Attribute[];
}

export type ProductVariant = {
    id: number;
    variant_name: string;
    variant_price: number;
    variant_cost_price?: number;
    product_name?:string;
    sku?: string;
    image?: string;
    // other fields if needed
}