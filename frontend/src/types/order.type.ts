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

export type ApiOrderDetailFromServer = {
    id: number;
    order: number; // ID of the parent order
    variant: number; // ID of the ProductVariant
    qty: number;
    total: number; // Line item total (price * qty - line_discount)
    unit: number;  // ID of the Unit
}

export type OrderFromServer = {
    id: number;
    total_amount: number;
    payment_method: 'CASH' | 'TRANSFER';
    order_date: string; // e.g., "2025-06-07"
    status: 'COMPLETE' | 'PENDING' | 'CANCEL';
    customer: number | null;
    coupon: number | null;
    discount: number | null; 
    employee: number | null;
    order_details: ApiOrderDetailFromServer[];
}

// For UI display of order details (enriched with names)
export type OrderDetailDisplayItem = {
    key: string; //
    original_detail_id: number;
    variant_id: number;
    variant_name: string;
    qty: number;
    unit: number;
    unit_name: string;
    price_per_unit: number; // Calculated for display
    total: number; // Original line total from API
}