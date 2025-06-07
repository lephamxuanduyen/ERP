import React from 'react'
import { Badge, Box, Table, Text } from "@chakra-ui/react"
import { Link } from 'react-router-dom';
import dayjs from 'dayjs'

interface Discount {
    id: number;
    discount_name: string;
    discount_type: string;
    start_date: string;
    end_date: string;
    usage_limit: number;
    promotion_value: number;
    promotion_value_type: string;
}

interface DiscountTableProps {
    discounts: Discount[];
}

const getDiscountState = (item: Discount): { label: string; color: string } => {
    const now = dayjs();
    const start = dayjs(item.start_date);
    const end = dayjs(item.end_date);

    if (item.usage_limit === 0) {
        return { label: 'Hết số lượng', color: 'red' };
    }

    if (now.isBefore(start)) {
        return { label: 'Chưa kích hoạt', color: 'blue' };
    }

    if (now.isAfter(end)) {
        return { label: 'Hết hạn', color: 'red' };
    }

    return { label: 'Đang hoạt động', color: 'green' };
}

const DiscountTable: React.FC<DiscountTableProps> = ({ discounts }) => {
    if (!discounts || discounts.length === 0) {
        return (
            <Box bg="white" borderRadius="lg" boxShadow="lg" p={4} textAlign="center">
                <Text>No discounts found.</Text>
            </Box>
        );
    }
    return (
        <Box bg="white" borderRadius="lg" boxShadow="lg" p={4}>
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Name</Table.ColumnHeader>
                        <Table.ColumnHeader>Type</Table.ColumnHeader>
                        <Table.ColumnHeader>Start Date</Table.ColumnHeader>
                        <Table.ColumnHeader>End Date</Table.ColumnHeader>
                        <Table.ColumnHeader>State</Table.ColumnHeader>
                        <Table.ColumnHeader>Value</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {discounts.map((item) => {
                        const state = getDiscountState(item);
                        return (
                            <Table.Row key={item.id}>
                                <Table.Cell>
                                    <Link to={`/promotion/discount/edit/${item.id}`}>
                                        <Text fontWeight="medium">{item.discount_name}</Text>
                                    </Link>
                                </Table.Cell>
                                <Table.Cell>{item.discount_type}</Table.Cell>
                                <Table.Cell>{dayjs(item.start_date).format('DD/MM/YYYY')}</Table.Cell>
                                <Table.Cell>{dayjs(item.end_date).format('DD/MM/YYYY')}</Table.Cell>
                                <Table.Cell>
                                    <Badge colorPalette={state.color}>{state.label}</Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    {item.promotion_value}
                                    {item.promotion_value_type === "PERCENTAGE" ? "%" : "₫"}
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}

export default DiscountTable