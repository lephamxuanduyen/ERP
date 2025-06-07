// --- START OF FILE ViewPurchaseOrderDetail.tsx ---
// (e.g., src/pages/purchase/ViewPurchaseOrderDetail.tsx)
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Spinner, Center, Alert, SimpleGrid, Tag, Table, VStack, HStack, IconButton, Link as ChakraLink, Button, AlertRoot, AlertIndicator } from '@chakra-ui/react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../../api'; // CHECK PATH
import { Row } from '../../../components/Row'; // CHECK PATH
import { Col } from '../../../components/Col';   // CHECK PATH
import Title from '../../../components/Title'; // CHECK PATH
import { AiOutlineRollback, AiOutlineEdit, AiOutlinePrinter } from 'react-icons/ai';
import dayjs from 'dayjs';
import { PurchaseOrder as PurchaseOrderType, PurchaseDetail as PurchaseDetailType } from '../components/PurchaseOrder'; // Assuming types are defined here or import from a central types file
import { toast } from 'sonner';

// Interfaces for fetched related data (if not already in global types)
interface Supplier {
    id: number;
    sup_name: string; // Assuming this is the name field
    // other supplier fields...
}

interface Employee {
    id: number;
    emp_name: string; // Assuming this is the name field
    // other employee fields...
}

interface ProductVariant {
    id: number;
    variant_name: string;
    // other variant fields...
}

interface Unit {
    id: number;
    unit_name: string; // Assuming this is the name field
    // other unit fields...
}

// Enhanced PurchaseDetail for UI, including resolved names
interface EnrichedPurchaseDetail extends PurchaseDetailType {
    variant_name?: string;
    unit_name?: string;
}

// Enhanced PurchaseOrder for UI
interface EnrichedPurchaseOrder extends PurchaseOrderType {
    supplier_name?: string;
    employee_name?: string;
    purchase_details_enriched: EnrichedPurchaseDetail[];
}


const getPurchaseStatusProps = (status?: PurchaseOrderType['status']): { label: string; colorScheme: string } => {
    if (!status) return { label: 'Unknown', colorScheme: 'gray' };
    switch (status) {
        case 'PENDING': return { label: 'Pending', colorScheme: 'yellow' };
        case 'RECEIVE': return { label: 'Received', colorScheme: 'green' };
        case 'CANCELED': return { label: 'Canceled', colorScheme: 'red' };
        default: return { label: status, colorScheme: 'gray' };
    }
};

const ViewPurchaseOrderDetail = () => {
    const { purchaseId } = useParams<{ purchaseId: string }>();
    const navigate = useNavigate();

    const [purchaseOrder, setPurchaseOrder] = useState<EnrichedPurchaseOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const fetchDataAndEnrich = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const poRes = await api.get(`/api/purchases/${id}/`);
            const rawPO: PurchaseOrderType = poRes.data;

            // --- Enrichment ---
            let supplierName = `Supplier ID: ${rawPO.supplier}`;
            let employeeName = `Employee ID: ${rawPO.employee}`;

            const enrichmentPromises = [];

            // Fetch Supplier Name
            enrichmentPromises.push(
                api.get(`/api/suppliers/${rawPO.supplier}/`).then(res => {
                    supplierName = (res.data as Supplier).sup_name || supplierName;
                }).catch(e => console.warn(`Failed to fetch supplier ${rawPO.supplier}`, e))
            );

            // Fetch Employee Name
            enrichmentPromises.push(
                api.get(`/api/employees/${rawPO.employee}/`).then(res => {
                    employeeName = (res.data as Employee).emp_name || employeeName;
                }).catch(e => console.warn(`Failed to fetch employee ${rawPO.employee}`, e))
            );

            // Enrich Purchase Details (Variant Name, Unit Name)
            const enrichedDetailsPromises = rawPO.purchase_details.map(async (detail) => {
                let variantName = `Variant ID: ${detail.variant}`;
                let unitName = `Unit ID: ${detail.unit}`;

                const detailEnrichment = [];
                if (detail.variant) {
                    detailEnrichment.push(
                        api.get(`/api/variants/${detail.variant}/`).then(res => {
                            variantName = (res.data as ProductVariant).variant_name || variantName;
                        }).catch(e => console.warn(`Failed to fetch variant ${detail.variant}`, e))
                    );
                }
                // Assuming you have a /api/units/{id}/ endpoint
                detailEnrichment.push(
                    api.get(`/api/units/${detail.unit}/`).then(res => { // Replace with your actual unit API endpoint
                        unitName = (res.data as Unit).unit_name || unitName;
                    }).catch(e => console.warn(`Failed to fetch unit ${detail.unit}`, e))
                );

                await Promise.allSettled(detailEnrichment); // Wait for variant and unit names for this detail
                return { ...detail, variant_name: variantName, unit_name: unitName };
            });

            // Wait for supplier and employee name fetches
            await Promise.allSettled(enrichmentPromises);
            const purchase_details_enriched = await Promise.all(enrichedDetailsPromises);

            setPurchaseOrder({
                ...rawPO,
                supplier_name: supplierName,
                employee_name: employeeName,
                purchase_details_enriched,
            });

        } catch (err: any) {
            console.error("Failed to fetch purchase order:", err);
            setError("Could not load purchase order details. It might not exist or an error occurred.");
            toast.error("Failed to load purchase order.");
        } finally {
            setIsLoading(false);
        }
    }, [toast]); // toast is stable

    useEffect(() => {
        if (purchaseId) {
            fetchDataAndEnrich(purchaseId);
        } else {
            setError("No Purchase Order ID provided.");
            setIsLoading(false);
        }
    }, [purchaseId, fetchDataAndEnrich]);

    if (isLoading) {
        return (
            <Center h="70vh">
                <Spinner size="xl" speed="0.65s" emptyColor="gray.200" color="blue.500" />
                <Text ml={4} fontSize="lg">Loading Purchase Order Details...</Text>
            </Center>
        );
    }

    if (error) {
        return (
            <Center h="70vh">
                <AlertRoot status="error" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" p={6} borderRadius="md">
                    <AlertIndicator boxSize="40px" mr={0} />
                    <Text mt={4} mb={2} fontSize="xl" fontWeight="bold">Error Loading Data</Text>
                    <Text>{error}</Text>
                    <Button as={RouterLink} to="/purchases" colorScheme="blue" mt={4}>
                        Back to Purchase List
                    </Button>
                </AlertRoot>
            </Center>
        );
    }

    if (!purchaseOrder) {
        return (
            <Center h="70vh">
                <Text fontSize="xl">Purchase Order not found.</Text>
            </Center>
        );
    }

    const statusProps = getPurchaseStatusProps(purchaseOrder.status);

    return (
        <Col gap="30px" p={{ base: 4, md: 6 }}>
            <Row justifyContent="space-between" alignItems="center" mb={0}>
                <HStack gap={3}>
                    <IconButton
                        aria-label="Back to Purchase Orders"
                        onClick={() => navigate('/purchases')} // Navigate to purchase list
                        variant="ghost"
                        size="lg"
                    >
                        <AiOutlineRollback />
                    </IconButton>
                    <Title label={`Purchase Order Details: PO-${String(purchaseOrder.id).padStart(5, '0')}`} />
                </HStack>
                <HStack gap={3}>
                    <Button colorScheme="gray" variant="outline" onClick={() => toast.info("Print PO - Not implemented")}>
                        <AiOutlinePrinter />
                        Print
                    </Button>
                    {purchaseOrder.status === 'PENDING' && ( // Only allow edit if PENDING
                        <Button as={RouterLink} to={`/purchases/edit/${purchaseOrder.id}`} leftIcon={<AiOutlineEdit />} colorScheme="blue">
                            Edit PO
                        </Button>
                    )}
                </HStack>
            </Row>

            <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
                <VStack gap={6} align="stretch">
                    {/* PO Summary */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5} py={4} borderBottomWidth="1px" borderColor="gray.200">
                        <Box>
                            <Text fontSize="sm" color="gray.500">Supplier</Text>
                            <Text fontSize="lg" fontWeight="medium">{purchaseOrder.supplier_name || `ID: ${purchaseOrder.supplier}`}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Employee</Text>
                            <Text fontSize="lg" fontWeight="medium">{purchaseOrder.employee_name || `ID: ${purchaseOrder.employee}`}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Status</Text>
                            <Tag.Root size="lg" colorScheme={statusProps.colorScheme} variant="solid" borderRadius="full">
                                <Tag.Label>{statusProps.label}</Tag.Label>
                            </Tag.Root>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Total Amount</Text>
                            <Text fontSize="xl" fontWeight="bold" color="blue.600">
                                {formatCurrency(purchaseOrder.total_amount)}
                            </Text>
                        </Box>
                        {/* Add created_at or other dates if available in purchaseOrder */}
                        {/* Example:
                        <Box>
                            <Text fontSize="sm" color="gray.500">Created Date</Text>
                            <Text fontSize="lg" fontWeight="medium">{dayjs(purchaseOrder.created_at).format('DD/MM/YYYY HH:mm')}</Text>
                        </Box>
                        */}
                    </SimpleGrid>

                    <Box divideY={'2px'}>
                        {/* Purchase Details Table */}
                        <Box mt={4}>
                            <Heading size="md" mb={4}>Items in this Purchase Order</Heading>
                            <Table.Root size="md">
                                <Table.Header bg="gray.50">
                                    <Table.Row>
                                        <Table.ColumnHeader>Product (Variant)</Table.ColumnHeader>
                                        <Table.ColumnHeader>Unit</Table.ColumnHeader>
                                        <Table.ColumnHeader>Quantity</Table.ColumnHeader>
                                        <Table.ColumnHeader>Expiry Date</Table.ColumnHeader>
                                        <Table.ColumnHeader>Line Total</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {purchaseOrder.purchase_details_enriched.map((detail) => (
                                        <Table.Row key={detail.id}>
                                            <Table.Cell fontWeight="medium">{detail.variant_name || `Variant ID: ${detail.variant}`}</Table.Cell>
                                            <Table.Cell>{detail.unit_name || `Unit ID: ${detail.unit}`}</Table.Cell>
                                            <Table.Cell>{detail.qty}</Table.Cell>
                                            <Table.Cell>{dayjs(detail.expiry_date).format('DD/MM/YYYY')}</Table.Cell>
                                            <Table.Cell color="gray.700" fontWeight="medium">{formatCurrency(detail.total)}</Table.Cell>
                                        </Table.Row>
                                    ))}
                                    {purchaseOrder.purchase_details_enriched.length === 0 && (
                                        <Table.Row>
                                            <Table.Cell colSpan={5} textAlign="center" py={10}>
                                                <Text color="gray.500">No items in this purchase order.</Text>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                        {/* Actions or further details can go here */}
                        <Row justifyContent="flex-end" mt={4}>
                            <Text fontWeight="bold" fontSize="xl">Grand Total: {formatCurrency(purchaseOrder.total_amount)}</Text>
                        </Row>
                    </Box>
                </VStack>
            </Box>
        </Col>
    );
};

export default ViewPurchaseOrderDetail;
// --- END OF FILE ViewPurchaseOrderDetail.tsx ---