export type Coupon = {
    id: number;
    code: string;
    start_date: string | null; // Can be null
    end_date: string | null;   // Can be null
    usage_limit: number | null; // Can be null
    promotion_value: number | null; // Can be null
    promotion_value_type: 'FIX' | 'PERCENTAGE' | null; // Can be null
}