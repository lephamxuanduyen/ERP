import React from 'react';
import { Badge, Box, Table, Text } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

export interface PurchaseDetail {
    id: number;
    qty: number;
    total: number;
    unit: number;
    variant: number | null;
    expiry_date: Date | null;
}

export interface PurchaseOrder {
    id: number;
    total_amount: number;
    status: 'PENDING' | 'RECEIVE' | 'CANCELED';
    supplier: number;
    employee: number;
    purchase_details: PurchaseDetail[];
    supplier_name?: string;
    employee_name?: string;
}

interface PurchaseTableProps {
    purchaseOrders: PurchaseOrder[];
}

const getPurchaseStatusProps = (status: PurchaseOrder['status']): { label: string; colorScheme: string } => {
    switch (status) {
        case 'PENDING':
            return { label: 'Pending', colorScheme: 'yellow' };
        case 'RECEIVE':
            return { label: 'Received', colorScheme: 'green' };
        case 'CANCELED':
            return { label: 'Canceled', colorScheme: 'red' };
        default:
            return { label: status, colorScheme: 'gray' };
    }
};

const PurchaseTable: React.FC<PurchaseTableProps> = ({ purchaseOrders }) => {
    const navigate = useNavigate()
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    const sortedPurchaseOrders = [...purchaseOrders].sort((a, b) => b.id - a.id);

    if (!purchaseOrders || purchaseOrders.length === 0) {
        return (
            <Box textAlign="center" p={5} bg="white" borderRadius="lg" boxShadow="md">
                <Text>No purchase orders found.</Text>
            </Box>
        );
    }

    return (
        <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
            <Table.Root >
                <Table.Header bg="gray.50">
                    <Table.Row>
                        <Table.ColumnHeader pr={0} width="50px">
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>PO ID</Table.ColumnHeader>
                        <Table.ColumnHeader>Supplier</Table.ColumnHeader> {/* Will display ID if name not available */}
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                        <Table.ColumnHeader>Total Amount</Table.ColumnHeader>
                        <Table.ColumnHeader>Items</Table.ColumnHeader> {/* Number of unique items or total quantity */}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sortedPurchaseOrders.map((po) => {
                        const statusProps = getPurchaseStatusProps(po.status);
                        const itemCount = po.purchase_details?.length || 0;
                        console.log(po.id)

                        return (
                            <Table.Row
                                key={po.id}
                                _hover={{ bg: "gray.100", cursor: "pointer" }}
                                onClick={() => navigate(`/purchase/edit/${po.id}`)} // Example navigation
                            >
                                <Table.Cell pr={0}>
                                </Table.Cell>
                                <Table.Cell>
                                    PO-{String(po.id).padStart(5, '0')}
                                </Table.Cell>
                                <Table.Cell>{po.supplier_name || `Supplier ID: ${po.supplier}`}</Table.Cell>
                                <Table.Cell>
                                    <Badge colorPalette={statusProps.colorScheme} px={2} py={1} borderRadius="md">
                                        {statusProps.label}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>{formatCurrency(po.total_amount)}</Table.Cell>
                                <Table.Cell textAlign="center">{itemCount}</Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};

export default PurchaseTable;