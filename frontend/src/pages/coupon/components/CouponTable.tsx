import { Badge, Box, Table, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import React from 'react'
import { Link } from 'react-router-dom';
import { Coupon } from '../../../types/coupon.type';

interface CouponTableProps {
    coupons: Coupon[];
}

// Function to determine the state of the coupon
const getCouponState = (item: Coupon): { label: string; color: string } => {
    const now = dayjs();

    // Handle potentially null dates
    const start = item.start_date ? dayjs(item.start_date) : null;
    const end = item.end_date ? dayjs(item.end_date) : null;

    if (item.usage_limit !== null && item.usage_limit === 0) {
        return { label: 'Hết lượt sử dụng', color: 'red' };
    }

    if (start && now.isBefore(start)) {
        return { label: 'Chưa bắt đầu', color: 'blue' };
    }

    if (end && now.isAfter(end)) {
        return { label: 'Đã hết hạn', color: 'red' };
    }

    // If no specific limiting conditions are met, consider it active
    // (or you might want a "Không giới hạn" state if dates/usage are null)
    return { label: 'Đang hoạt động', color: 'green' };
};

export const CouponTable: React.FC<CouponTableProps> = ({ coupons }) => {
    if (!coupons || coupons.length === 0) {
        return (
            <Box bg="white" borderRadius="lg" boxShadow="lg" p={4} textAlign="center">
                <Text>No coupons found.</Text>
            </Box>
        );
    }
    return (
        <Box bg="white" borderRadius="lg" boxShadow="lg" p={4} overflowX="auto">
            <Table.Root> {/* Using variant="simple" or "outline" for Chakra Table */}
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Code</Table.ColumnHeader>
                        <Table.ColumnHeader>Start Date</Table.ColumnHeader>
                        <Table.ColumnHeader>End Date</Table.ColumnHeader>
                        <Table.ColumnHeader>Usage Limit</Table.ColumnHeader>
                        <Table.ColumnHeader>State</Table.ColumnHeader>
                        <Table.ColumnHeader>Value</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {coupons.map((item) => {
                        const state = getCouponState(item);
                        return (
                            <Table.Row key={item.id}>
                                <Table.Cell>
                                    {/* Assuming you'll have an edit page for coupons similar to discounts */}
                                    <Link to={`/promotion/coupon/edit/${item.id}`}>
                                        <Text fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                                            {item.code}
                                        </Text>
                                    </Link>
                                </Table.Cell>
                                <Table.Cell>
                                    {item.start_date ? dayjs(item.start_date).format('DD/MM/YYYY') : 'N/A'}
                                </Table.Cell>
                                <Table.Cell>
                                    {item.end_date ? dayjs(item.end_date).format('DD/MM/YYYY HH:mm') : 'N/A'}
                                </Table.Cell>
                                <Table.Cell>
                                    {item.usage_limit !== null ? item.usage_limit : 'Unlimited'}
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge colorPalette={state.color}>{state.label}</Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    {item.promotion_value !== null ? item.promotion_value : ''}
                                    {item.promotion_value_type === "PERCENTAGE" && item.promotion_value !== null ? "%" : ""}
                                    {item.promotion_value_type === "FIX" && item.promotion_value !== null ? "₫" : ""}
                                    {item.promotion_value === null && 'N/A'}
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}
