import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Input, Table, IconButton, Spinner, HStack, VStack, SimpleGrid, NumberInput, Alert, Link as ChakraLink, Tag, Center, AlertIndicator, Field, Button } from '@chakra-ui/react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import api from '../../../api';
import { Row } from '../../../components/Row';
import { Col } from '../../../components/Col';
import CustomButton from '../../../components/CustomButton';
import Title from '../../../components/Title';
import { AiOutlineRollback, AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { ProductVariant } from '../../../types/product.type';
import { Supplier } from '../../../types/supplier.type';
import { PurchaseOrder as PurchaseOrderType, PurchaseDetail as ApiPurchaseDetail } from '../components/PurchaseOrder';
import CustomInput from '../../../components/CustomInput';
import { toast } from 'sonner';

interface UnitOption {
    id: number;
    unit_name: string;
}

interface PurchaseDetailItemUi extends ApiPurchaseDetail {
    key: string;
    variant_name?: string;
    unit_name?: string;
    cost_price: number;
    qty: number;
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


const EditPurchaseOrder = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [originalPO, setOriginalPO] = useState<PurchaseOrderType | null>(null);
    const [supplierInfo, setSupplierInfo] = useState<Supplier | null>(null);
    const [employeeName, setEmployeeName] = useState<string>('');
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetailItemUi[]>([]);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmittingReceive, setIsSubmittingReceive] = useState(false);
    const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

    useEffect(() => {
        if (!id) {
            toast.error("Purchase Order ID is missing.");
            navigate('/purchase');
            return;
        }
        setIsPageLoading(true);
        const fetchPurchaseOrder = async () => {
            try {
                const poRes = await api.get(`/api/purchases/${id}/`);
                const fetchedPO: PurchaseOrderType = poRes.data;
                setOriginalPO(fetchedPO);

                if (fetchedPO.supplier) {
                    try {
                        const supplierRes = await api.get(`/api/suppliers/${fetchedPO.supplier}/`);
                        setSupplierInfo(supplierRes.data);
                    } catch (e) { console.warn("Could not fetch supplier details", e); }
                }
                if (fetchedPO.employee) {
                    try {
                        const empRes = await api.get(`/api/employees/${fetchedPO.employee}/`);
                        setEmployeeName(empRes.data.emp_name || `Employee ID: ${fetchedPO.employee}`);
                    } catch (e) { console.warn("Could not fetch employee details", e); }
                }

                const enrichedDetailsPromises = fetchedPO.purchase_details.map(async (detail) => {
                    let variantName = `Variant ID: ${detail.variant}`;
                    let unitName = `Unit ID: ${detail.unit}`;
                    let costPrice = detail.qty > 0 ? detail.total / detail.qty : 0;

                    const detailEnrichment: Promise<void>[] = [];
                    if (detail.variant) {
                        detailEnrichment.push(
                            api.get(`/api/variants/${detail.variant}/`).then(res => {
                                const variantData = res.data as ProductVariant;
                                variantName = variantData.variant_name || variantName;
                            }).catch(e => console.warn(`Failed to fetch variant ${detail.variant}`, e))
                        );
                    }
                    if (detail.unit) {
                        detailEnrichment.push(
                            api.get(`/api/units/${detail.unit}/`).then(res => {
                                unitName = (res.data as UnitOption).unit_name || unitName;
                            }).catch(e => console.warn(`Failed to fetch unit ${detail.unit}`, e))
                        );
                    }
                    await Promise.allSettled(detailEnrichment);

                    return {
                        ...detail,
                        key: detail.id.toString(),
                        variant_name: variantName,
                        unit_name: unitName,
                        cost_price: costPrice,
                        expiry_date_obj: detail.expiry_date ? dayjs(detail.expiry_date).toDate() : null,
                    } as PurchaseDetailItemUi;
                });

                const allEnrichedDetails = await Promise.all(enrichedDetailsPromises);
                setPurchaseDetails(allEnrichedDetails);

            } catch (error) {
                toast.error("Failed to load purchase order.");
                console.error(error);
                navigate('/purchase');
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchPurchaseOrder();
    }, [id, navigate, toast]);

    const updatePurchaseDetailItem = useCallback((itemKey: string, field: 'qty' | 'expiry_date', value: any) => {
        setPurchaseDetails(prevDetails =>
            prevDetails.map(item => {
                if (item.key === itemKey) {
                    const updatedItem = { ...item, [field]: value };
                    if (field === 'qty') {
                        updatedItem.total = (Number(value) || 0) * (Number(updatedItem.cost_price) || 0);
                    }
                    return updatedItem;
                }
                return item;
            })
        );
    }, []);

    const overallTotalAmount = purchaseDetails.reduce((acc, item) => acc + item.total, 0);

    const handleReceivePurchaseOrder = async () => {
        if (!originalPO || !id) return;

        const validDetails = purchaseDetails.filter(
            item => item.variant && Number(item.qty) > 0 && item.unit && Number(item.cost_price) >= 0
        );
        if (validDetails.length === 0) {
            toast.error("No valid items to receive.");
            return;
        }

        setIsSubmittingReceive(true);
        const payload = {
            status: 'RECEIVE',
            total_amount: overallTotalAmount,
            supplier: originalPO.supplier,
            employee: originalPO.employee,
            purchase_details: validDetails.map(item => ({
                id: item.id,
                variant: item.variant,
                qty: Number(item.qty),
                total: item.total,
                unit: item.unit,
                expiry_date: item.expiry_date ? dayjs(item.expiry_date).format('YYYY-MM-DD') : item.expiry_date, // Send original string if obj is null
            })),
        };
        console.log("Submitting PO Receive Payload:", payload);

        try {
            const response = await api.put(`/api/purchases/update/${id}/`, payload);
            if (response.status === 200) {
                toast.success("Purchase order marked as Received!");
                setOriginalPO(prev => prev ? { ...prev, status: 'RECEIVE', total_amount: response.data.total_amount || overallTotalAmount } : null);
                navigate(`/purchase`);
            } else {
                toast.error(response.data?.message || "Failed to update purchase order status.");
            }
        } catch (err: any) {
            console.error("Error receiving purchase order:", err.response?.data || err.message);
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                Object.entries(errorData).forEach(([key, value]) => {
                    const messages = Array.isArray(value) ? value.join('; ') : String(value);
                    toast.error(messages);
                });
            } else { toast.error(err.message || "An unknown error occurred."); }
        } finally {
            setIsSubmittingReceive(false);
        }
    };

    const handleCancelPurchaseOrder = async () => {
        if (!originalPO || !id) return;

        setIsSubmittingCancel(true);
        const payload = {
            status: 'CANCELED',
            total_amount: overallTotalAmount,
            supplier: originalPO.supplier,
            employee: originalPO.employee,
            purchase_details: []
        };
        console.log("Submitting PO Cancel Payload:", payload);

        try {
            const response = await api.put(`/api/purchases/update/${id}/`, payload);
            if (response.status === 200) {
                toast.success("Purchase order has been canceled.");
                setOriginalPO(prev => prev ? { ...prev, status: 'CANCELED' } : null);
                navigate('/purchase')
            } else {
                toast.error(response.data?.message || "Failed to cancel purchase order.");
            }
        } catch (err: any) {
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                Object.entries(errorData).forEach(([key, value]) => { const messages = Array.isArray(value) ? value.join('; ') : String(value); toast.error(messages); });
            } else { toast.error(err.message || "An unknown error occurred."); }
        } finally {
            setIsSubmittingCancel(false);
        }
    };

    if (isPageLoading) {
        return <Center h="70vh"><Spinner size="xl" /><Text ml={4}>Loading Purchase Order...</Text></Center>;
    }
    if (!originalPO) {
        return (
            <Center h="70vh">
                <Alert.Root status="error">
                    <AlertIndicator />
                    <Alert.Title>Purchase Order not found or failed to load.</Alert.Title>
                    <ChakraLink as={RouterLink} href="/purchases" ml={2} color="blue.500" fontWeight="bold">Back to List</ChakraLink>
                </Alert.Root>
            </Center>
        );
    }

    const statusProps = getPurchaseStatusProps(originalPO.status);
    const canEditDetails = originalPO.status === 'PENDING';

    return (
        <Col gap="30px" p={{ base: 4, md: 6 }} divideY={'2px'}>
            <Row justifyContent="space-between" alignItems="center" mb={0}>
                <HStack>
                    <IconButton aria-label="Back" onClick={() => navigate('/purchase')} variant="ghost"> <AiOutlineRollback /></IconButton>
                    <Title label={`Edit Purchase Order: PO-${String(originalPO.id).padStart(5, '0')}`} />
                </HStack>
                <Tag.Root size="lg" colorPalette={statusProps.colorScheme} borderRadius="full">
                    <Tag.Label>{statusProps.label}</Tag.Label>
                </Tag.Root>
            </Row>

            <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
                <VStack gap={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={4}>
                        <Field.Root id="supplier-display">
                            <Field.Label fontWeight="bold">Supplier</Field.Label>
                            <CustomInput value={supplierInfo?.sup_name || `ID: ${originalPO.supplier}`} readOnly bg="gray.50" />
                        </Field.Root>
                        <Field.Root id="employee-display">
                            <Field.Label fontWeight="bold">Employee</Field.Label>
                            <CustomInput value={employeeName || `ID: ${originalPO.employee}`} readOnly bg="gray.50" />
                        </Field.Root>
                        <Field.Root id="po-total-display">
                            <Field.Label fontWeight="bold">Original Total</Field.Label>
                            <CustomInput value={originalPO.total_amount.toLocaleString() + ' đ'} readOnly bg="gray.50" />
                        </Field.Root>
                        <Field.Root id="po-status-display">
                            <Field.Label fontWeight="bold">Current Status</Field.Label>
                            <CustomInput value={statusProps.label} readOnly bg="gray.50" />
                        </Field.Root>
                    </SimpleGrid>

                    <Box>
                        <Heading size="md" mb={4}>Edit Purchase Items (Quantity & Expiry)</Heading>
                        <Table.Root size="sm">
                            <Table.Header><Table.Row>
                                <Table.ColumnHeader>Product (Variant)</Table.ColumnHeader>
                                <Table.ColumnHeader>Unit</Table.ColumnHeader>
                                <Table.ColumnHeader width="120px">Qty</Table.ColumnHeader>
                                <Table.ColumnHeader>Cost Price</Table.ColumnHeader>
                                <Table.ColumnHeader width="180px">Expiry Date</Table.ColumnHeader>
                                <Table.ColumnHeader>Line Total</Table.ColumnHeader>
                            </Table.Row></Table.Header>
                            <Table.Body>
                                {purchaseDetails.map((item) => (
                                    <Table.Row key={item.key}>
                                        <Table.Cell>{item.variant_name || `Variant ID: ${item.variant}`}</Table.Cell>
                                        <Table.Cell>{item.unit_name || `Unit ID: ${item.unit}`}</Table.Cell>
                                        <Table.Cell p={1}>
                                            <NumberInput.Root size="sm"
                                                disabled={!canEditDetails}
                                            >
                                                <NumberInput.Input
                                                    onChange={(e) => updatePurchaseDetailItem(item.key, 'qty', parseInt(e.target.value) || 0)}
                                                    value={item.qty} min={0} textAlign="right" />
                                            </NumberInput.Root>
                                        </Table.Cell>
                                        <Table.Cell>{item.cost_price.toLocaleString()}</Table.Cell>
                                        <Table.Cell p={1}>
                                            <Box d="inline-block" w="full">
                                                <DatePicker
                                                    selected={item.expiry_date}
                                                    onChange={(date: Date | null) => updatePurchaseDetailItem(item.key, 'expiry_date', date)}
                                                    dateFormat="yyyy-MM-dd"
                                                    showYearDropdown
                                                    scrollableYearDropdown
                                                    yearDropdownItemNumber={30}
                                                    placeholderText="YYYY-MM-DD"
                                                    className="chakra-input"
                                                    wrapperClassName="date-picker-full-width"
                                                    minDate={dayjs().toDate()}
                                                    disabled={!canEditDetails}
                                                />
                                            </Box>
                                        </Table.Cell>
                                        <Table.Cell>{item.total > 0 ? item.total.toLocaleString() : '-'}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                    <Row justifyContent="space-between" alignItems="center" pt={4} mt={0}>
                        <Text fontWeight="bold" fontSize="xl">
                            New Total: {overallTotalAmount.toLocaleString()} đ
                        </Text>
                        <HStack>
                            <CustomButton background='gray.300' color='blue.900' label="Cancel View" onClick={() => navigate('/purchase')} />
                            {canEditDetails && (
                                <>
                                    <CustomButton
                                        background='red'
                                        label="Cancel"
                                        onClick={handleCancelPurchaseOrder}
                                        disabled={isSubmittingReceive || isSubmittingCancel}
                                        loading={isSubmittingCancel}
                                    ><AiOutlineCloseCircle /></CustomButton>
                                    <CustomButton
                                        label="Received"
                                        onClick={handleReceivePurchaseOrder}
                                        disabled={isSubmittingReceive}
                                        loading={isSubmittingReceive}
                                    ><AiOutlineCheckCircle /></CustomButton>
                                </>
                            )}
                        </HStack>
                    </Row>
                </VStack>
            </Box>
            <style>{`
                .date-picker-full-width, .date-picker-full-width > div { width: 100%; }
                .chakra-input.react-datepicker-ignore-onclickoutside, 
                .chakra-input.react-datepicker__input-container input { /* ... same styles ... */ }
            `}</style>
        </Col>
    );
};

export default EditPurchaseOrder;