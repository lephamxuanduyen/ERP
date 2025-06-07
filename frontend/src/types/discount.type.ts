export type Discount = {
    id: number;
    discount_name: string;
    discount_type: 'DISCOUNT' | 'BUY_X_GET_Y'; // Assuming 'DISCOUNT' is the relevant one here
    promotion_value: number;
    promotion_value_type: 'FIX' | 'PERCENTAGE';
    variant?: number;
    qty?: number;
    conditions?: number;
    gift_product?: number
    // other fields if needed
}