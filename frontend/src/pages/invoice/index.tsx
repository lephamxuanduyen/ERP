// --- START OF FILE index.tsx ---
// (e.g., src/pages/payment/index.tsx)
import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Input, Button, VStack, HStack, Spinner, Alert, Stat, StatLabel, StatHelpText, SimpleGrid, Center, AlertRoot, AlertContent, Link as ChakraLink, IconButton, Field, AlertIndicator } from '@chakra-ui/react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../../api';
import { Row } from '../../components/Row';
import { Col } from '../../components/Col';
import CustomButton from '../../components/CustomButton';
import Title from '../../components/Title';
import { AiOutlineRollback } from 'react-icons/ai';
import { FaPrint, FaRegSave } from 'react-icons/fa';
import { toast } from 'sonner';

interface PaymentLocationState {
    orderId: number;
    totalAmount: number;
    customerName?: string; // Optional, for display
    orderCode?: string; // Optional, for display
}

interface InvoiceResponse {
    id: number;
    order: number;
    payment_status: 'UNPAID' | 'PAID' | 'PARTIALLY_PAID';
    create_at: string;
    total_amount: number;
    amount_received: number;
    amount_change: number;
}

const index = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as PaymentLocationState | null;

    const [orderId, setOrderId] = useState<number | null>(state?.orderId || null);
    const [totalAmount, setTotalAmount] = useState<number>(state?.totalAmount || 0);
    const [customerName, setCustomerName] = useState<string | undefined>(state?.customerName);
    const [orderCode, setOrderCode] = useState<string | undefined>(state?.orderCode);


    const [amountReceivedInput, setAmountReceivedInput] = useState<string>('');
    const [calculatedAmountReceived, setCalculatedAmountReceived] = useState<number>(0);

    const [isLoading, setIsLoading] = useState(false);
    const [paymentResult, setPaymentResult] = useState<InvoiceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!state?.orderId || state?.totalAmount === undefined) {
            toast.error("Order ID or total amount is missing. Redirecting...");
            navigate('/orders'); // Navigate back to orders list or a safe page
        } else {
            // Set initial amount received to total amount for convenience
            setAmountReceivedInput(state.totalAmount.toString());
            setCalculatedAmountReceived(state.totalAmount);
        }
    }, [state, navigate, toast]);


    const handleAmountReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmountReceivedInput(value);
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setCalculatedAmountReceived(numValue);
        } else if (value === '') {
            setCalculatedAmountReceived(0);
        }
    };

    const quickCashOptions = [50000, 100000, 200000, 500000];
    const handleQuickCash = (amount: number) => {
        const currentVal = parseFloat(amountReceivedInput) || 0;
        const newVal = currentVal + amount;
        setAmountReceivedInput(newVal.toString());
        setCalculatedAmountReceived(newVal);
    };
    const handleExactCash = () => {
        setAmountReceivedInput(totalAmount.toString());
        setCalculatedAmountReceived(totalAmount);
    };


    const handleSubmitPayment = async () => {
        if (orderId === null || totalAmount === undefined) {
            toast.error("Missing order information.");
            return;
        }
        if (calculatedAmountReceived < 0) {
            toast.error("Amount received cannot be negative.");
            return;
        }
        // Optional: check if amount received is less than total for PARTIALLY_PAID,
        // but API might handle this payment_status logic.
        // For now, we just post what's received.

        setIsLoading(true);
        setError(null);
        setPaymentResult(null);

        const payload = {
            order: orderId,
            total_amount: totalAmount, // API model doesn't mark this as required for POST, but good to send
            amount_received: calculatedAmountReceived,
        };

        console.log("Submitting Invoice Payload:", payload);

        try {
            const response = await api.post<InvoiceResponse>('/api/invoices/', payload);
            if (response.status === 201 || response.status === 200) { // POST usually 201, but can be 200
                setPaymentResult(response.data);
                toast.success(`Invoice #${response.data.id} created. Status: ${response.data.payment_status}`);
                // Optionally navigate or offer further actions (e.g., print receipt)
            } else {
                throw new Error(response.data?.message || `Failed to process payment. Status: ${response.status}`);
            }
        } catch (err: any) {
            console.error("Payment error:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.detail ||
                (typeof err.response?.data === 'object' ? Object.values(err.response.data).join('; ') : null) ||
                err.message ||
                'An unknown error occurred during payment.';
            setError(errorMsg);
            toast.error("Payment Failed");
        } finally {
            setIsLoading(false);
        }
    };

    const amountChange = calculatedAmountReceived - totalAmount;

    if (orderId === null || totalAmount === undefined) {
        // This case should be handled by useEffect redirecting, but good to have a fallback UI
        return (
            <Center h="70vh">
                <AlertRoot status="error">
                    <AlertContent />
                    Missing order information to proceed with payment.
                    <ChakraLink as={RouterLink} href="/orders" ml={2} color="blue.500" fontWeight="bold">
                        Return to Orders
                    </ChakraLink>
                </AlertRoot>
            </Center>
        );
    }


    return (
        <Col gap="30px" p={{ base: 4, md: 6 }} maxW="container.md" mx="auto">
            <Row justifyContent="space-between" alignItems="center" mb={0}>
                <HStack>
                    <IconButton
                        aria-label="Back to Order"
                        onClick={() => navigate(state?.orderCode ? `/orders/edit/${orderId}` : '/orders')} // Go back to edit or list
                        variant="ghost"
                    ><AiOutlineRollback /></IconButton>
                    <Title label="Process Payment" />
                </HStack>
            </Row>

            <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
                <VStack align="stretch">
                    <Box divideY={'2px'}>
                        <Box textAlign="center">
                            <Heading size="lg" mb={1}>Order Payment</Heading>
                            {orderCode && <Text fontSize="md" color="gray.600">Order Code: {orderCode}</Text>}
                            {customerName && <Text fontSize="md" color="gray.600">Customer: {customerName}</Text>}
                        </Box>

                        <Stat.Root textAlign="center" py={4}>
                            <Stat.Label fontSize="xl">Total Amount Due</Stat.Label>
                            <Stat.ValueText fontSize="4xl" color="blue.600" fontWeight="bold">
                                {totalAmount.toLocaleString()} đ
                            </Stat.ValueText>
                        </Stat.Root>

                        {!paymentResult ? (
                            <VStack as="form" onSubmit={(e) => { e.preventDefault(); handleSubmitPayment(); }}>
                                <Field.Root id="amountReceived" required>
                                    <Field.Label fontSize="lg" fontWeight="semibold">Amount Received from Customer:</Field.Label>
                                    <Input
                                        type="number"
                                        value={amountReceivedInput}
                                        onChange={handleAmountReceivedChange}
                                        placeholder="Enter amount customer paid"
                                        size="lg"
                                        fontSize="2xl"
                                        textAlign="right"
                                        autoFocus
                                        min={0}
                                    />
                                </Field.Root>

                                <Text fontSize="sm" color="gray.500">Quick cash input:</Text>
                                <SimpleGrid columns={{ base: 2, sm: 4 }} gap={2} w="full">
                                    {quickCashOptions.map(cash => (
                                        <Button key={cash} onClick={() => handleQuickCash(cash)} variant="outline" size="md">
                                            +{cash.toLocaleString()}
                                        </Button>
                                    ))}
                                </SimpleGrid>
                                <Button onClick={handleExactCash} colorScheme="green" variant="solid" w="full" size="md">
                                    Exact Amount ({totalAmount.toLocaleString()} đ)
                                </Button>


                                {amountReceivedInput && calculatedAmountReceived >= totalAmount && (
                                    <Stat.Root textAlign="right" w="full" mt={2}>
                                        <Stat.Label color="green.600">Change to Return:</Stat.Label>
                                        <Stat.ValueText color="green.700" fontWeight="bold" fontSize="2xl">
                                            {Math.max(0, amountChange).toLocaleString()} đ
                                        </Stat.ValueText>
                                    </Stat.Root>
                                )}
                                {amountReceivedInput && calculatedAmountReceived < totalAmount && calculatedAmountReceived > 0 && (
                                    <Stat.Root textAlign="right" w="full" mt={2}>
                                        <Stat.Label color="orange.600">Remaining Due:</Stat.Label>
                                        <Stat.ValueText color="orange.700" fontWeight="bold" fontSize="xl">
                                            {Math.abs(amountChange).toLocaleString()} đ
                                        </Stat.ValueText>
                                    </Stat.Root>
                                )}


                                {error && (
                                    <AlertRoot status="error" mt={4}>
                                        <AlertIndicator />
                                        {error}
                                    </AlertRoot>
                                )}

                                <CustomButton
                                    type="submit"
                                    label={isLoading ? "Processing..." : "Confirm Payment"}
                                    colorScheme="blue"
                                    size="lg"
                                    w="full"
                                    mt={4}
                                    loading={isLoading}
                                    disabled={isLoading || paymentResult !== null}
                                >
                                    <FaRegSave />
                                </CustomButton>
                            </VStack>
                        ) : (
                            <Box textAlign="center" py={6}>
                                <VStack>
                                    <Icon as={paymentResult.payment_status === 'PAID' ? FaPrint : AlertIcon}
                                        w={16} h={16}
                                        color={paymentResult.payment_status === 'PAID' ? "green.500" : (paymentResult.payment_status === 'PARTIALLY_PAID' ? "orange.500" : "red.500")} />
                                    <Heading size="lg">Payment {paymentResult.payment_status.replace('_', ' ').toLowerCase()}</Heading>
                                    <Text>Invoice ID: #{paymentResult.id}</Text>
                                    <Text>Total Paid: {paymentResult.amount_received.toLocaleString()} đ</Text>
                                    {paymentResult.payment_status === 'PAID' && (
                                        <Text fontWeight="bold" color="green.600">Change Given: {paymentResult.amount_change.toLocaleString()} đ</Text>
                                    )}
                                    {paymentResult.payment_status === 'PARTIALLY_PAID' && (
                                        <Text fontWeight="bold" color="orange.600">Amount Remaining: {(paymentResult.total_amount - paymentResult.amount_received).toLocaleString()} đ</Text>
                                    )}
                                    <HStack mt={6}>
                                        <Button
                                            colorScheme="teal"
                                            variant="outline"
                                            onClick={() => toast.info("Print receipt - Not implemented")}
                                        >
                                            <FaPrint />
                                            Print Receipt
                                        </Button>
                                        <CustomButton
                                            label="New Sale"
                                            colorScheme="blue"
                                            onClick={() => navigate('/orders/create')} // Or wherever new sale starts
                                        />
                                    </HStack>
                                </VStack>
                            </Box>
                        )}
                    </Box>
                </VStack>
            </Box>
        </Col>
    );
};

export default index;
// --- END OF FILE index.tsx ---