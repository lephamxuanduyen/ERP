// --- START OF FILE OrderTable.tsx ---
import React, { useEffect, useState } from 'react';
import { Badge, Box, Checkbox, Input, Table, Text } from "@chakra-ui/react";
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../../api';
import { toast } from 'sonner';

export interface CustomerInfo {
    id: number;
    name?: string;
    phone?: string;
}

export interface Order {
    id: number;
    total_amount: number;
    payment_method: 'CASH' | 'TRANSFER';
    order_date: string;
    status: 'COMPLETE' | 'PENDING' | 'CANCEL';
    customer: number | CustomerInfo | null;
    coupon: number | null;
    discount: number | null;
    employee: number;
}

interface OrderTableProps {
    orders: Order[];
}

const getOrderStatusProps = (status: Order['status']): { label: string; colorScheme: string } => {
    switch (status) {
        case 'COMPLETE':
            return { label: 'Completed', colorScheme: 'green' };
        case 'PENDING':
            return { label: 'Pending', colorScheme: 'yellow' };
        case 'CANCEL':
            return { label: 'Cancelled', colorScheme: 'orange' };
        default:
            return { label: status, colorScheme: 'gray' };
    }
};

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
    const [customerMap, setCustomerMap] = useState<Record<number, CustomerInfo>>({});

    const fetchCustomer = async (customerId: number) => {
        if (customerMap[customerId]) return;

        try {
            const res = await api.get(`/api/customers/${customerId}`);
            const data = res.data;
            setCustomerMap(prev => ({
                ...prev,
                [customerId]: {
                    id: data.id,
                    name: data.cus_name,
                    phone: data.phone
                }
            }));
        } catch (error) {
            toast.error(`Failed to fetch customer ${customerId}`);
            setCustomerMap(prev => ({
                ...prev,
                [customerId]: { id: customerId, name: 'Unknown', phone: 'N/A' }
            }));
        }
    };

    useEffect(() => {
        const customerIdsToFetch = orders
            .map(order => order.customer)
            .filter((cus): cus is number => typeof cus === 'number');

        customerIdsToFetch.forEach(id => fetchCustomer(id));
    }, [orders]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        }).format(amount);
    };

    if (!orders || orders.length === 0) {
        return (
            <Box textAlign="center" p={5}>
                <Text>No orders found.</Text>
            </Box>
        );
    }

    return (
        <Box overflowX="auto">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader pr={0} width="50px">
                            <Checkbox.Root>
                                <Checkbox.Control />
                                <Checkbox.HiddenInput />
                            </Checkbox.Root>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Customer</Table.ColumnHeader>
                        <Table.ColumnHeader>Phone</Table.ColumnHeader>
                        <Table.ColumnHeader>Order Date</Table.ColumnHeader>
                        <Table.ColumnHeader>Amount</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {orders.map((order) => {
                        const statusProps = getOrderStatusProps(order.status);

                        let customerName = 'N/A';
                        let customerPhone = 'N/A';

                        if (typeof order.customer === 'object' && order.customer !== null) {
                            customerName = order.customer.name || 'N/A';
                            customerPhone = order.customer.phone || 'N/A';
                        } else if (typeof order.customer === 'number') {
                            const customerInfo = customerMap[order.customer];
                            if (customerInfo) {
                                customerName = customerInfo.name || 'Unknown';
                                customerPhone = customerInfo.phone || 'N/A';
                            } else {
                                customerName = 'Loading...';
                                customerPhone = 'Loading...';
                            }
                        }

                        return (
                            <Table.Row
                                key={order.id}
                                _hover={{ bg: "gray.50", cursor: "pointer" }}
                                onClick={() => {
                                    console.log(`Navigate to order ${order.id}`);
                                }}
                            >
                                <Table.Cell pr={0}>
                                    <Checkbox.Root>
                                        <Checkbox.Control />
                                        <Checkbox.HiddenInput />
                                    </Checkbox.Root>
                                </Table.Cell>
                                <Table.Cell>
                                    <RouterLink to={`/orders/payment/${order.id}`}>
                                        <Text fontWeight="medium" color="blue.600">
                                            {customerName}
                                        </Text>
                                    </RouterLink>
                                </Table.Cell>
                                <Table.Cell>{customerPhone}</Table.Cell>
                                <Table.Cell>{dayjs(order.order_date).format('MMMM D, YYYY')}</Table.Cell>
                                <Table.Cell>{formatCurrency(order.total_amount)}</Table.Cell>
                                <Table.Cell>
                                    <Badge
                                        colorPalette={statusProps.colorScheme}
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                    >
                                        {statusProps.label}
                                    </Badge>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};

export default OrderTable;
