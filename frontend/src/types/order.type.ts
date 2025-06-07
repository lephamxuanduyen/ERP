export type OrderDetailItem = {
    key: string; // For React list key
    variant_id: number | null;
    variant_name?: string;
    qty: number | string;
    price: number; // Original variant price
    applied_discount_id: number | null;
    discount_amount: number; // Calculated discount amount
    total: number; // qty * price - discount_amount
    stock_balance: number | null; // To show flag
    unit_id?: number; // If required by backend
}