// // --- START OF FILE EditOrder.tsx ---
// // (e.g., src/pages/orders/EditOrder.tsx)
// import React, { useEffect, useState, useCallback } from 'react';
// import { Box, Heading, Text, Input, Table, IconButton, Spinner, HStack, VStack, Icon, Button, SimpleGrid, Field, Link as ChakraLink, Alert, Center, AlertRoot, AlertIndicator } from '@chakra-ui/react';
// import { Select, AsyncSelect } from 'chakra-react-select'; // Select from here for consistency
// import { toast } from 'sonner';
// import api from '../../../api';
// import { Row } from '../../../components/Row';
// import { Col } from '../../../components/Col';
// import CustomButton from '../../../components/CustomButton';
// import Title from '../../../components/Title';
// import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
// import { AiOutlineClose, AiOutlineFlag, AiOutlineRollback } from 'react-icons/ai';
// import { FaChevronRight } from "react-icons/fa";
// import CustomInput from "../../../components/CustomInput";
// import { Customer } from "../../../types/customers.type";
// import { ProductVariant } from "../../../types/product.type";
// import { Discount } from "../../../types/discount.type";
// import { OrderDetailItem as OrderDetailItemTypeFromImport } from "../../../types/order.type";
// import { StockInfo } from "../../../types/stock.type";

// // --- Type Definitions (based on your API schema) ---
// interface ApiOrderDetail {
//     id?: number; // Present in fetched data, not in POST/PUT payload from your example
//     order?: number; // Backend usually handles this link
//     variant: number | null; // Changed to allow null for new items
//     qty: number;
//     total: number;
//     unit: number;
// }

// interface OrderType {
//     id: number;
//     total_amount: number;
//     payment_method: 'CASH' | 'TRANSFER';
//     order_date: string; // Assuming this is present from GET /api/orders/{id}/
//     status: 'COMPLETE' | 'PENDING' | 'CANCEL';
//     customer: number | Customer | null; // Can be ID or fetched Customer object
//     coupon: number | null;
//     discount: number | null;
//     employee: number;
//     details: ApiOrderDetail[]; // Use the defined interface
// }

// // Enhanced OrderDetailItem for UI state
// interface OrderDetailItemUi extends OrderDetailItemTypeFromImport { // Assuming OrderDetailItemTypeFromImport has at least variant_id, qty, total
//     key: string;
//     variant_name?: string;
//     price: number;
//     applied_discount_id: number | null;
//     discount_amount: number;
//     stock_balance: number | null;
//     isLoadingStock?: boolean;
//     unit_id?: number; // To store the unit id
//     // id?: number; // Original ID from fetched order_details if different from key
// }


// const paymentMethodOptions = [
//     { value: 'CASH', label: 'Cash' },
//     { value: 'TRANSFER', label: 'Bank Transfer' },
// ];

// const statusOptions = [
//     { value: 'PENDING', label: 'Pending' },
//     { value: 'COMPLETE', label: 'Complete' },
//     { value: 'CANCEL', label: 'Cancelled' },
// ];


// const EditOrder = () => {
//     const navigate = useNavigate();
//     const { id } = useParams<{ id: string }>();

//     // --- State ---
//     const [originalOrder, setOriginalOrder] = useState<OrderType | null>(null);
//     const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
//     const [customerOptions, setCustomerOptions] = useState<{ label: string, value: number, customer: Customer }[]>([]);
//     const [customerPhoneNumberInput, setCustomerPhoneNumberInput] = useState('');

//     const [orderDetails, setOrderDetails] = useState<OrderDetailItemUi[]>([]);
//     const [productVariantOptions, setProductVariantOptions] = useState<{ label: string, value: number, variant: ProductVariant }[]>([]);
//     const [availableDiscounts, setAvailableDiscounts] = useState<Map<number, Discount[]>>(new Map());

//     const [paymentMethod, setPaymentMethod] = useState<OrderType['payment_method']>('CASH');
//     const [orderStatus, setOrderStatus] = useState<OrderType['status']>('PENDING');

//     const [overallDiscountId, setOverallDiscountId] = useState<number | null>(null);
//     const [overallCouponId, setOverallCouponId] = useState<number | null>(null);

//     const [isPageLoading, setIsPageLoading] = useState(true);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isCustomerLoading, setIsCustomerLoading] = useState(false);
//     const [isProductLoading, setIsProductLoading] = useState(false);

//     const MOCKED_EMPLOYEE_ID = 1; // IMPORTANT: Replace

//     // --- Effects ---
//     useEffect(() => {
//         const fetchProductVariants = async () => {
//             setIsProductLoading(true);
//             try {
//                 const productsRes = await api.get('/api/variants/?limit=1000');
//                 const productOpts = productsRes.data.results.map((p: ProductVariant) => ({
//                     label: `${p.variant_name || `Variant ${p.id}`} (ID: ${p.id})`,
//                     value: p.id,
//                     variant: p,
//                 }));
//                 setProductVariantOptions(productOpts);
//             } catch (error) {
//                 toast.error('Failed to load product options.');
//             } finally {
//                 setIsProductLoading(false);
//             }
//         };
//         fetchProductVariants();
//     }, []);

//     useEffect(() => {
//         if (!id) {
//             toast.error("Order ID is missing.");
//             navigate("/orders");
//             return;
//         }
//         setIsPageLoading(true);
//         const fetchOrder = async () => {
//             try {
//                 const orderRes = await api.get(`/api/orders/${id}/`);
//                 const fetchedOrder: OrderType = orderRes.data;
//                 setOriginalOrder(fetchedOrder);
//                 setPaymentMethod(fetchedOrder.payment_method);
//                 setOrderStatus(fetchedOrder.status);
//                 setOverallDiscountId(fetchedOrder.discount);
//                 setOverallCouponId(fetchedOrder.coupon);

//                 if (fetchedOrder.customer && typeof fetchedOrder.customer === 'number') {
//                     try {
//                         const customerRes = await api.get(`/api/customers/${fetchedOrder.customer}/`);
//                         setSelectedCustomer(customerRes.data);
//                         setCustomerPhoneNumberInput(customerRes.data.cus_phone);
//                         setCustomerOptions(prev => {
//                             if (!prev.find(opt => opt.value === customerRes.data.id)) {
//                                 return [...prev, { label: `${customerRes.data.cus_name} (${customerRes.data.cus_phone})`, value: customerRes.data.id, customer: customerRes.data }]
//                             }
//                             return prev;
//                         });
//                     } catch (e) { toast.error("Failed to load customer details for the order."); }
//                 } else if (fetchedOrder.customer && typeof fetchedOrder.customer === 'object') {
//                     setSelectedCustomer(fetchedOrder.customer as Customer);
//                     setCustomerPhoneNumberInput((fetchedOrder.customer as Customer).cus_phone);
//                 }

//                 const initialOrderDetailsPromises = fetchedOrder.order_details.map(async (detail) => {
//                     let variantInfo = productVariantOptions.find(opt => opt.value === detail.variant)?.variant;
//                     if (!variantInfo && detail.variant) {
//                         try {
//                             const variantRes = await api.get(`/api/variants/${detail.variant}/`);
//                             variantInfo = variantRes.data;
//                         } catch (e) { console.error(`Failed to fetch variant ${detail.variant}`, e); }
//                     }
//                     return {
//                         // from ApiOrderDetail
//                         id: detail.id, // original id of order_detail item
//                         variant_id: detail.variant,
//                         qty: detail.qty,
//                         total: detail.total,
//                         unit_id: detail.unit, // Map 'unit' from API to 'unit_id' for UI state
//                         // UI specific
//                         key: detail.id?.toString() || `new-${Date.now()}-${Math.random()}`,
//                         price: variantInfo?.variant_price || 0,
//                         variant_name: variantInfo?.variant_name || `Variant ${detail.variant}`,
//                         applied_discount_id: null, // TODO: Needs logic if line discounts are stored/fetched
//                         discount_amount: 0,      // TODO: Needs logic
//                         stock_balance: null,
//                         isLoadingStock: true,
//                     } as OrderDetailItemUi; // Type assertion
//                 });

//                 const populatedDetails = await Promise.all(initialOrderDetailsPromises);
//                 setOrderDetails(populatedDetails);

//                 for (const detail of populatedDetails) {
//                     if (detail.variant_id) {
//                         await fetchStockAndDiscounts(detail.key, detail.variant_id);
//                     }
//                 }
//             } catch (error) {
//                 toast.error("Failed to load order details.");
//                 // navigate("/orders");
//             } finally {
//                 setIsPageLoading(false);
//             }
//         };
//         fetchOrder();
//     }, [id, navigate, productVariantOptions]); // productVariantOptions is needed here

//     // --- Customer Handlers ---
//     const loadCustomerOptionsByName = useCallback( /* ... same ... */ async (inputValue: string) => {
//         if (!inputValue || inputValue.trim().length < 2) return [];
//         setIsCustomerLoading(true);
//         try {
//             const response = await api.get(`/api/customers/?cus_name__icontains=${encodeURIComponent(inputValue.trim())}&limit=20`);
//             return response.data.results.map((c: Customer) => ({ label: `${c.cus_name} (${c.cus_phone})`, value: c.id, customer: c, }));
//         } catch (error) { console.error("Failed to search customers by name:", error); return []; }
//         finally { setIsCustomerLoading(false); }
//     }, []);
//     const handleCustomerSelectChange = useCallback( /* ... same ... */(selectedOption: any) => {
//         if (selectedOption?.customer) {
//             setSelectedCustomer(selectedOption.customer);
//             setCustomerPhoneNumberInput(selectedOption.customer.cus_phone);
//         } else { setSelectedCustomer(null); setCustomerPhoneNumberInput(''); }
//     }, []);
//     const fetchCustomerByPhone = useCallback( /* ... same ... */ async (phone: string) => {
//         const trimmedPhone = phone.trim();
//         if (!trimmedPhone || trimmedPhone.length < 7) return;
//         setIsCustomerLoading(true);
//         try {
//             const response = await api.get(`/api/customers/?cus_phone=${encodeURIComponent(trimmedPhone)}`);
//             const customersFound: Customer[] = response.data.results;
//             if (customersFound && customersFound.length > 0) {
//                 const customerToSelect = customersFound[0];
//                 setSelectedCustomer(customerToSelect);
//                 setCustomerPhoneNumberInput(customerToSelect.cus_phone);
//                 toast.success(`Customer '${customerToSelect.cus_name}' selected.`);
//             } else { toast.info(`No customer found with phone: ${trimmedPhone}.`); }
//         } catch (error) { console.error("Failed to fetch customer by phone:", error); toast.error("Error fetching customer by phone."); }
//         finally { setIsCustomerLoading(false); }
//     }, []);
//     const handlePhoneInputChange = useCallback( /* ... same ... */(e: React.ChangeEvent<HTMLInputElement>) => {
//         const newPhone = e.target.value;
//         setCustomerPhoneNumberInput(newPhone);
//         if (selectedCustomer && selectedCustomer.cus_phone !== newPhone) { setSelectedCustomer(null); }
//     }, [selectedCustomer]);
//     const handlePhoneInputConfirm = useCallback( /* ... same ... */() => {
//         if (customerPhoneNumberInput.trim() && (!selectedCustomer || selectedCustomer.cus_phone !== customerPhoneNumberInput.trim())) {
//             fetchCustomerByPhone(customerPhoneNumberInput);
//         }
//     }, [customerPhoneNumberInput, selectedCustomer, fetchCustomerByPhone]);

//     // --- Product Table Handlers ---
//     const addProductToOrder = useCallback( /* ... same ... */() => {
//         setOrderDetails(prev => [...prev, { key: `new-${Date.now()}-${Math.random()}`, variant_id: null, qty: 1, price: 0, applied_discount_id: null, discount_amount: 0, total: 0, stock_balance: null, isLoadingStock: false, unit_id: undefined }]);
//     }, []);
//     const removeProductFromOrder = useCallback( /* ... same ... */(itemKey: string) => {
//         setOrderDetails(prev => prev.filter(item => item.key !== itemKey));
//     }, []);

//     const fetchStockAndDiscounts = useCallback(async (itemKey: string, variantId: number) => {
//         if (!variantId) return;
//         setOrderDetails(prev => prev.map(item => item.key === itemKey ? { ...item, isLoadingStock: true, stock_balance: null } : item));
//         const results = await Promise.allSettled([
//             api.get(`/api/quantity_by_attribute/?variant_id=${variantId}`),
//             api.get(`/api/discounts/?prod_id=${variantId}&limit=100`)
//         ]);
//         let newStockBalance = 0; let fetchedDiscounts: Discount[] = [];
//         const stockResult = results[0];
//         if (stockResult.status === 'fulfilled') {
//             const stockData: StockInfo | undefined = stockResult.value.data.results?.[0];
//             newStockBalance = stockData?.balance ?? 0;
//             // TODO: if (stockData?.unit_id) { /* update item.unit_id for itemKey */ }
//         } else { console.error(`Stock fetch error for ${variantId}:`, stockResult.reason); toast.error(`Failed to fetch stock for variant ${variantId}.`); }
//         const discountResult = results[1];
//         if (discountResult.status === 'fulfilled') {
//             fetchedDiscounts = discountResult.value.data.results || [];
//             setAvailableDiscounts(prevMap => new Map(prevMap).set(variantId, fetchedDiscounts));
//         } else { console.error(`Discount fetch error for ${variantId}:`, discountResult.reason); toast.error(`Failed to fetch discounts for variant ${variantId}.`); setAvailableDiscounts(prevMap => new Map(prevMap).set(variantId, [])); }
//         setOrderDetails(prevDetails => prevDetails.map(item => {
//             if (item.key === itemKey) {
//                 const wasDiscountApplied = !!item.applied_discount_id;
//                 const isNewDiscountListEmpty = fetchedDiscounts.length === 0;
//                 const currentAppliedDiscountStillExists = fetchedDiscounts.some(d => d.id === item.applied_discount_id);
//                 let newAppliedDiscountId = item.applied_discount_id;
//                 if (isNewDiscountListEmpty || (wasDiscountApplied && !currentAppliedDiscountStillExists)) { newAppliedDiscountId = null; }
//                 return { ...item, stock_balance: newStockBalance, isLoadingStock: false, applied_discount_id: newAppliedDiscountId };
//             } return item;
//         }));
//     }, []); // Removed setOrderDetails, setAvailableDiscounts as they are stable

//     const updateOrderDetail = useCallback(async (itemKey: string, field: keyof OrderDetailItemUi, value: any) => {
//         let intermediateDetails = orderDetails.map(item => {
//             if (item.key === itemKey) { return { ...item, [field]: value }; }
//             return item;
//         });
//         const currentItem = intermediateDetails.find(i => i.key === itemKey);
//         if (!currentItem) return;

//         if (field === 'variant_id') {
//             if (value) {
//                 const selectedProductOption = productVariantOptions.find(opt => opt.value === value);
//                 if (selectedProductOption) {
//                     const variant = selectedProductOption.variant;
//                     intermediateDetails = intermediateDetails.map(item =>
//                         item.key === itemKey ? {
//                             ...item, price: variant.variant_price, variant_name: variant.variant_name || `Variant ${variant.id}`,
//                             applied_discount_id: null, discount_amount: 0, stock_balance: null, isLoadingStock: true,
//                             // unit_id: variant.unit_id // Placeholder
//                         } : item
//                     );
//                     setOrderDetails(intermediateDetails);
//                     await fetchStockAndDiscounts(itemKey, value);
//                     return; // Let re-render handle final calculation after stock/discount fetch
//                 }
//             } else {
//                 intermediateDetails = intermediateDetails.map(item =>
//                     item.key === itemKey ? { ...item, variant_id: null, price: 0, variant_name: undefined, qty: 1, applied_discount_id: null, discount_amount: 0, total: 0, stock_balance: null, isLoadingStock: false } : item
//                 );
//             }
//         }

//         const finalDetails = intermediateDetails.map(item => {
//             if (item.key === itemKey) {
//                 let itemDiscountAmount = 0; const qtyNum = Number(item.qty) || 0;
//                 if (item.applied_discount_id && item.variant_id && item.price > 0 && qtyNum > 0) {
//                     const discountsForVariant = availableDiscounts.get(item.variant_id);
//                     const chosenDiscount = discountsForVariant?.find(d => d.id === item.applied_discount_id);
//                     if (chosenDiscount) {
//                         if (chosenDiscount.promotion_value_type === 'PERCENTAGE') {
//                             itemDiscountAmount = (item.price * qtyNum) * (chosenDiscount.promotion_value / 100);
//                         } else if (chosenDiscount.promotion_value_type === 'FIX') { itemDiscountAmount = chosenDiscount.promotion_value; }
//                     }
//                 }
//                 const itemTotal = (qtyNum * item.price) - itemDiscountAmount;
//                 return { ...item, discount_amount: itemDiscountAmount, total: Math.max(0, itemTotal) };
//             } return item;
//         });
//         setOrderDetails(finalDetails);
//     }, [orderDetails, productVariantOptions, availableDiscounts, fetchStockAndDiscounts]);

//     const loadProductOptions = useCallback( /* ... same ... */ async (inputValue: string) => {
//         if (!inputValue || inputValue.trim().length < 2) return productVariantOptions.slice(0, 10);
//         setIsProductLoading(true);
//         try {
//             const response = await api.get(`/api/variants/?variant_name__icontains=${encodeURIComponent(inputValue.trim())}&limit=20`);
//             return response.data.results.map((p: ProductVariant) => ({ label: `${p.variant_name || `Variant ${p.id}`} (ID: ${p.id})`, value: p.id, variant: p, }));
//         } catch (error) { console.error("Failed to search products:", error); return []; }
//         finally { setIsProductLoading(false); }
//     }, [productVariantOptions]);

//     // --- Totals Calculation ---
//     const grandTotal = orderDetails.reduce((acc, item) => acc + (item.total || 0), 0);

//     // --- Form Submission ---
//     const canSaveOrder =
//         selectedCustomer &&
//         orderDetails.length > 0 &&
//         orderDetails.every(item =>
//             item.variant_id && Number(item.qty) > 0 &&
//             (!item.isLoadingStock && item.stock_balance !== null && item.stock_balance >= Number(item.qty))
//         ) && !isPageLoading;

//     const handleUpdateOrder = async () => {
//         if (!id || !originalOrder) return;
//         // ... (Thêm các validation tương tự như CreateOrder.tsx)
//         if (!selectedCustomer) { toast.error("Please select a customer."); return; }
//         const validOrderDetails = orderDetails.filter(item => item.variant_id && Number(item.qty) > 0);
//         if (validOrderDetails.length === 0) { toast.error("Please add at least one product."); return; }
//         const outOfStockItems = validOrderDetails.filter(item => !item.isLoadingStock && item.stock_balance !== null && item.stock_balance < Number(item.qty));
//         if (outOfStockItems.length > 0) { toast.error(`Insufficient stock for: ${outOfStockItems.map(i => i.variant_name || `ID ${i.variant_id}`).join(', ')}.`); return; }
//         if (orderDetails.some(item => item.isLoadingStock)) { toast.info("Stock is loading. Please wait."); return; }


//         setIsSubmitting(true);
//         const payload = {
//             total_amount: grandTotal,
//             payment_method: paymentMethod,
//             status: orderStatus,
//             customer: selectedCustomer.id,
//             coupon: overallCouponId,
//             discount: overallDiscountId,
//             employee: originalOrder.employee, // Employee không nên thay đổi khi edit
//             order_details: validOrderDetails.map(item => ({
//                 variant: item.variant_id,
//                 qty: Number(item.qty),
//                 total: item.total,
//                 unit: item.unit_id || 1, // CRITICAL: Replace '1' with actual unit_id
//             })),
//         };
//         console.log("Submitting Order Update Payload:", payload);

//         try {
//             // API PUT /api/order/update/{id}
//             const response = await api.put(`/api/order/update/${id}/`, payload);
//             if (response.status === 200) {
//                 toast.success('Order updated successfully!');
//                 navigate('/orders');
//             } else {
//                 toast.error(response.data?.message || 'Failed to update order.');
//             }
//         } catch (err: any) {
//             console.error("Error updating order:", err.response?.data || err.message);
//             // ... (error handling similar to CreateOrder) ...
//             const errorData = err.response?.data;
//             if (errorData && typeof errorData === 'object') {
//                 Object.entries(errorData).forEach(([key, value]) => {
//                     const messages = Array.isArray(value) ? value.join('; ') : String(value);
//                     toast.error(`${key === 'detail' ? '' : key + ': '}${messages}`);
//                 });
//             } else if (err.message) {
//                 toast.error(err.message);
//             } else { toast.error('An unknown error occurred.'); }
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (isPageLoading) { /* ... same loading UI ... */ return <Center h="70vh"><Spinner size="xl" /><Text ml={4}>Loading order...</Text></Center>; }
//     if (!originalOrder) { /* ... same error UI ... */ return <Center h="70vh"><AlertRoot status="error"><AlertIndicator /> Order not found.<ChakraLink as={RouterLink} href="/orders" ml={2} color="blue.500">Back</ChakraLink></AlertRoot></Center>; }

//     const isOrderEditable = originalOrder.status === 'PENDING'; // Example editability rule

//     return (
//         <Col gap="30px" p={{ base: 4, md: 6 }}>
//             <Row justifyContent="space-between" alignItems="center" mb={6}>
//                 <HStack>
//                     <IconButton aria-label="Back to orders" onClick={() => navigate('/orders')} variant="ghost" >
//                         <AiOutlineRollback />
//                     </IconButton>
//                     <Title label={`EDIT ORDER #${originalOrder.id}`} />
//                 </HStack>
//                 <Button colorScheme="gray" variant="outline" onClick={() => toast.info("Payment - Not implemented")} disabled={!isOrderEditable}>
//                     <FaChevronRight />
//                     Go to Payment
//                 </Button>
//             </Row>
//             {!isOrderEditable && (<AlertRoot status="warning" mb={4}><AlertIndicator />Order status is '{originalOrder.status}', editing may be limited.</AlertRoot>)}

//             <Box bg="white" p={6} borderRadius="xl" boxShadow="0 4px 12px 0 rgba(0,0,0,0.07)">
//                 <VStack align="stretch" gap={4}>
//                     {/* Customer Info */}
//                     <Box>
//                         <Heading size="md" mb={4}>Customer Information</Heading>
//                         <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} alignItems="flex-end">
//                             <Field.Root id="customer-id-edit">
//                                 <Field.Label>ID:</Field.Label>
//                                 <CustomInput value={selectedCustomer ? `#${String(selectedCustomer.id).padStart(5, '0')}` : ''} readOnly tabIndex={-1} bg="gray.50" />
//                             </Field.Root>
//                             <Field.Root id="customer-name-edit">
//                                 <Field.Label>Name:</Field.Label>
//                                 <AsyncSelect name="customerNameEdit" placeholder="Search..."
//                                     chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "40px" }) }}
//                                     isClearable cacheOptions defaultOptions={customerOptions}
//                                     loadOptions={loadCustomerOptionsByName} onChange={handleCustomerSelectChange}
//                                     isLoading={isCustomerLoading && !customerPhoneNumberInput}
//                                     value={selectedCustomer ? { label: `${selectedCustomer.cus_name} (${selectedCustomer.cus_phone})`, value: selectedCustomer.id, customer: selectedCustomer } : null}
//                                     isDisabled={!isOrderEditable} />
//                             </Field.Root>
//                             <Field.Root id="customer-phone-edit">
//                                 <Field.Label>Phone:</Field.Label>
//                                 <HStack>
//                                     <CustomInput placeholder="Enter phone..." value={customerPhoneNumberInput}
//                                         onChange={handlePhoneInputChange} onBlur={handlePhoneInputConfirm}
//                                         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePhoneInputConfirm(); } }}
//                                         disabled={!isOrderEditable} />
//                                     {isCustomerLoading && !!customerPhoneNumberInput.trim() && <Spinner size="sm" />}
//                                 </HStack>
//                             </Field.Root>
//                         </SimpleGrid>
//                     </Box>

//                     {/* Order Status and Payment Method */}
//                     <Box>
//                         <Heading size="md" mb={4}>Order Settings</Heading>
//                         <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
//                             <Field.Root id="payment-method-edit">
//                                 <Field.Label>Payment Method:</Field.Label>
//                                 <Select // Using chakra-react-select's Select
//                                     options={paymentMethodOptions}
//                                     value={paymentMethodOptions.find(opt => opt.value === paymentMethod)}
//                                     onChange={(option: any) => setPaymentMethod(option.value)}
//                                     isDisabled={!isOrderEditable}
//                                     placeholder="Select payment method"
//                                 />
//                             </Field.Root>
//                             <Field.Root id="order-status-edit">
//                                 <Field.Label>Status:</Field.Label>
//                                 <Select // Using chakra-react-select's Select
//                                     options={statusOptions}
//                                     value={statusOptions.find(opt => opt.value === orderStatus)}
//                                     onChange={(option: any) => setOrderStatus(option.value)}
//                                     // Potentially disable if status cannot be manually changed back from COMPLETE/CANCEL
//                                     // isDisabled={!isOrderEditable || orderStatus === 'COMPLETE' || orderStatus === 'CANCEL'}
//                                     isDisabled={!isOrderEditable}
//                                     placeholder="Select status"
//                                 />
//                             </Field.Root>
//                         </SimpleGrid>
//                     </Box>

//                     {/* Products Table */}
//                     <Box>
//                         <Heading size="sm" mb={3}>Line Items</Heading>
//                         <Table.Root size="sm" >
//                             <Table.Header><Table.Row>
//                                 <Table.ColumnHeader>Product</Table.ColumnHeader>
//                                 <Table.ColumnHeader width="80px">Qty</Table.ColumnHeader>
//                                 <Table.ColumnHeader>Price</Table.ColumnHeader>
//                                 <Table.ColumnHeader>Discount</Table.ColumnHeader>
//                                 <Table.ColumnHeader>Amount</Table.ColumnHeader>
//                                 <Table.ColumnHeader textAlign="center" width="60px">Stock</Table.ColumnHeader>
//                                 <Table.ColumnHeader textAlign="center" width="60px">Action</Table.ColumnHeader>
//                             </Table.Row></Table.Header>
//                             <Table.Body>
//                                 {orderDetails.map((item) => (
//                                     <Table.Row key={item.key}>
//                                         <Table.Cell minW="250px" p={1}>
//                                             <AsyncSelect name={`product-edit-${item.key}`} placeholder="Select product" isClearable
//                                                 defaultOptions={productVariantOptions} loadOptions={loadProductOptions}
//                                                 isLoading={isProductLoading}
//                                                 value={item.variant_id ? productVariantOptions.find(opt => opt.value === item.variant_id) : null}
//                                                 onChange={(option: any) => updateOrderDetail(item.key, 'variant_id', option ? option.value : null)}
//                                                 chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "36px" }) }}
//                                                 menuPlacement="auto" isDisabled={!isOrderEditable} />
//                                         </Table.Cell>
//                                         <Table.Cell p={1}>
//                                             <Input type="number" value={item.qty}
//                                                 onChange={(e) => updateOrderDetail(item.key, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
//                                                 min={1} size="sm" textAlign="right" disabled={!isOrderEditable} />
//                                         </Table.Cell>
//                                         <Table.Cell p={1}>{item.price > 0 ? item.price.toLocaleString() : '-'}</Table.Cell>
//                                         <Table.Cell minW="200px" p={1}>
//                                             <Select name={`discount-edit-${item.key}`} placeholder="No discount" isClearable
//                                                 options={item.variant_id ? (availableDiscounts.get(item.variant_id) || []).map(d => ({ label: d.discount_name, value: d.id })) : []}
//                                                 value={item.applied_discount_id && item.variant_id && (availableDiscounts.get(item.variant_id) || []).length > 0 ?
//                                                     (availableDiscounts.get(item.variant_id) || []).map(d => ({ label: d.discount_name, value: d.id })).find(opt => opt.value === item.applied_discount_id) : null}
//                                                 onChange={(option: any) => updateOrderDetail(item.key, 'applied_discount_id', option ? option.value : null)}
//                                                 isDisabled={!item.variant_id || (availableDiscounts.get(item.variant_id || 0)?.length || 0) === 0 || !isOrderEditable}
//                                                 size="sm" menuPlacement="auto" />
//                                         </Table.Cell>
//                                         <Table.Cell p={1}>{item.total > 0 ? item.total.toLocaleString() : '-'}</Table.Cell>
//                                         <Table.Cell textAlign="center" p={1}>
//                                             {item.isLoadingStock ? <Spinner size="xs" /> :
//                                                 item.variant_id && item.stock_balance !== null && (
//                                                     <Icon as={AiOutlineFlag} color={item.stock_balance >= Number(item.qty) ? 'green.500' : 'red.500'}
//                                                         boxSize={5}>{`Stock: ${item.stock_balance}`}</Icon>)}
//                                         </Table.Cell>
//                                         <Table.Cell textAlign="center" p={1}>
//                                             {isOrderEditable && (<IconButton aria-label="Remove product" size="sm" colorScheme="red" variant="ghost" onClick={() => removeProductFromOrder(item.key)}><AiOutlineClose /></IconButton>)}
//                                         </Table.Cell>
//                                     </Table.Row>
//                                 ))}
//                             </Table.Body>
//                         </Table.Root>
//                         {isOrderEditable && (
//                             <HStack mt={4}>
//                                 <Button onClick={addProductToOrder} size="sm" colorScheme="green" variant="outline">Add Product</Button>
//                                 <ChakraLink as="button" _hover={{ textDecoration: "underline" }} color="green.600" fontSize="sm" onClick={() => toast.info("Catalog - Not implemented")}>Catalog</ChakraLink>
//                             </HStack>
//                         )}
//                     </Box>

//                     {/* Summary & Actions */}
//                     <Row justifyContent="flex-end" alignItems="center" pt={6} borderTopWidth="1px" mt={6}>
//                         <Text fontWeight="bold" mr={6} fontSize="lg">Total: {grandTotal.toLocaleString()}</Text>
//                         <HStack>
//                             <CustomButton label="Cancel" variant="outline" onClick={() => navigate('/orders')} />
//                             <CustomButton label="Save Changes" colorScheme="blue"
//                                 onClick={handleUpdateOrder}
//                                 disabled={!canSaveOrder || isSubmitting || !isOrderEditable}
//                                 loading={isSubmitting} />
//                         </HStack>
//                     </Row>
//                 </VStack>
//             </Box>
//         </Col>
//     );
// }

// export default EditOrder;
// // --- END OF FILE EditOrder.tsx ---

// --- START OF FILE EditOrder.tsx (Corrected for API data structure) ---
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Input, Table, IconButton, Spinner, HStack, VStack, Icon, Button, SimpleGrid, Field, Alert, Center, Tag, Link as ChakraLink, Flex } from '@chakra-ui/react';
import { Select, AsyncSelect } from 'chakra-react-select';
import { toast } from 'sonner';
import api from '../../../api';
import { Row } from '../../../components/Row';
import { Col } from '../../../components/Col';
import CustomButton from '../../../components/CustomButton';
import Title from '../../../components/Title';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { AiOutlineClose, AiOutlineFlag, AiOutlineRollback, AiOutlineEdit, AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { FaChevronRight } from "react-icons/fa";
import CustomInput from "../../../components/CustomInput";
import { Customer } from "../../../types/customers.type";
import { ProductVariant } from "../../../types/product.type";
import { Discount } from "../../../types/discount.type";
import { OrderDetailItem as OrderDetailItemTypeFromImport } from "../../../types/order.type";
import { StockInfo } from "../../../types/stock.type";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';


// --- Type Definitions (Matching your API Sample) ---
interface ApiOrderDetail {
    id: number; // Assuming id is always present in fetched details
    order?: number;
    variant: number | null;
    qty: number;
    total: number;
    unit: number;
    expiry_date?: string; // From PurchaseOrder, not Order, but good to have consistency if needed
}

interface OrderType {
    id: number;
    total_amount: number;
    payment_method: 'CASH' | 'TRANSFER';
    order_date: string;
    status: 'COMPLETE' | 'PENDING' | 'CANCEL';
    customer: number | Customer | null; // Can be ID or fetched Customer object
    coupon: number | null;
    discount: number | null;
    employee: number | null; // <<<< CORRECTED: employee can be null
    details: ApiOrderDetail[]; // <<<< CORRECTED: from 'order_details' to 'details'
}

// Enhanced OrderDetailItem for UI state
interface OrderDetailItemUi extends OrderDetailItemTypeFromImport { // Make sure this base type matches
    isLoadingStock?: boolean;
    original_detail_id?: number; // To store the original DB ID of the detail line
    expiry_date_obj?: Date | null; // For DatePicker if orders have expiry, usually for purchases
}

interface UnitOption {
    id: number;
    unit_name: string;
}

const paymentMethodOptions = [ /* ... as before ... */];
const statusOptions = [ /* ... as before ... */];
const getPurchaseStatusProps = (status?: OrderType['status']): { label: string; colorScheme: string } => { /* ... as before, but for Order status ... */
    if (!status) return { label: 'Unknown', colorScheme: 'gray' };
    switch (status) {
        case 'PENDING': return { label: 'Pending', colorScheme: 'yellow' };
        case 'COMPLETE': return { label: 'Completed', colorScheme: 'green' }; // Changed from RECEIVE
        case 'CANCEL': return { label: 'Canceled', colorScheme: 'red' };    // Changed from CANCELED
        default: return { label: status, colorScheme: 'gray' };
    }
};


const EditOrder = () => {
    const navigate = useNavigate();
    const { id: orderId } = useParams<{ id: string }>(); // Use orderId for clarity

    const [originalOrder, setOriginalOrder] = useState<OrderType | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerOptions, setCustomerOptions] = useState<{ label: string, value: number, customer: Customer }[]>([]);
    const [customerPhoneNumberInput, setCustomerPhoneNumberInput] = useState('');

    const [orderDetails, setOrderDetails] = useState<OrderDetailItemUi[]>([]);
    const [productVariantOptions, setProductVariantOptions] = useState<{ label: string, value: number, variant: ProductVariant }[]>([]);
    const [availableDiscounts, setAvailableDiscounts] = useState<Map<number, Discount[]>>(new Map());
    const [unitOptions, setUnitOptions] = useState<{ label: string; value: number; unit: UnitOption }[]>([]);


    const [paymentMethod, setPaymentMethod] = useState<OrderType['payment_method']>('CASH');
    const [orderStatus, setOrderStatus] = useState<OrderType['status']>('PENDING');

    const [overallDiscountId, setOverallDiscountId] = useState<number | null>(null);
    const [overallCouponId, setOverallCouponId] = useState<number | null>(null);

    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomerLoading, setIsCustomerLoading] = useState(false);
    const [isProductLoading, setIsProductLoading] = useState(false);
    const [isUnitLoading, setIsUnitLoading] = useState(false);


    const MOCKED_EMPLOYEE_ID = 1;

    // --- Effects ---
    useEffect(() => {
        // Fetch product variants and units initially for dropdowns
        const fetchSupportingData = async () => {
            setIsProductLoading(true);
            setIsUnitLoading(true);
            try {
                const [productsRes, unitsRes] = await Promise.all([
                    api.get('/api/variants/?limit=1000'),
                    api.get('/api/units/?limit=100') // Ensure this API exists
                ]);
                const productOpts = productsRes.data.results.map((p: ProductVariant) => ({
                    label: `${p.variant_name || `Variant ${p.id}`} (ID: ${p.id})`, value: p.id, variant: p,
                }));
                setProductVariantOptions(productOpts);

                const unitOpts = unitsRes.data.results.map((u: UnitOption) => ({
                    label: u.unit_name || `Unit ${u.id}`, value: u.id, unit: u,
                }));
                setUnitOptions(unitOpts);

            } catch (error) {
                toast.error("Failed to load product variants or units.");
            } finally {
                setIsProductLoading(false);
                setIsUnitLoading(false);
            }
        };
        fetchSupportingData();
    }, [toast]);

    useEffect(() => {
        if (!orderId) {
            toast.error("Order ID is missing.");
            navigate("/orders");
            return;
        }
        if (productVariantOptions.length === 0) { // Wait for product options to load
            // console.log("Waiting for productVariantOptions to load...");
            return;
        }

        setIsPageLoading(true);
        const fetchOrder = async () => {
            try {
                const orderRes = await api.get(`/api/orders/${orderId}/`);
                const fetchedOrder: OrderType = orderRes.data;
                console.log("Fetched Order Data:", fetchedOrder); // DEBUG: Check fetched data
                setOriginalOrder(fetchedOrder);
                setPaymentMethod(fetchedOrder.payment_method);
                setOrderStatus(fetchedOrder.status);
                setOverallDiscountId(fetchedOrder.discount);
                setOverallCouponId(fetchedOrder.coupon);

                if (fetchedOrder.customer && typeof fetchedOrder.customer === 'number') {
                    try {
                        const customerRes = await api.get(`/api/customers/${fetchedOrder.customer}/`);
                        setSelectedCustomer(customerRes.data);
                        setCustomerPhoneNumberInput(customerRes.data.cus_phone);
                        setCustomerOptions(prev => {
                            if (!prev.find(opt => opt.value === customerRes.data.id)) {
                                return [...prev, { label: `${customerRes.data.cus_name} (${customerRes.data.cus_phone})`, value: customerRes.data.id, customer: customerRes.data }]
                            } return prev;
                        });
                    } catch (e) { toast.warning("Failed to load full customer details."); }
                } else if (fetchedOrder.customer && typeof fetchedOrder.customer === 'object') {
                    setSelectedCustomer(fetchedOrder.customer as Customer);
                    setCustomerPhoneNumberInput((fetchedOrder.customer as Customer).cus_phone);
                }

                // Use 'details' from API response
                const initialOrderDetailsPromises = (fetchedOrder.details || []).map(async (detail) => {
                    let variantInfo = productVariantOptions.find(opt => opt.value === detail.variant)?.variant;
                    // No need to re-fetch variant if productVariantOptions is comprehensive and loaded first
                    // if (!variantInfo && detail.variant) { /* ... fetch variant ... */ }

                    let unitName = unitOptions.find(opt => opt.value === detail.unit)?.label || `Unit ID ${detail.unit}`;

                    return {
                        original_detail_id: detail.id, // Store original DB ID
                        variant_id: detail.variant,
                        qty: detail.qty,
                        total: detail.total,
                        unit_id: detail.unit,
                        key: detail.id?.toString() || `new-${Date.now()}-${Math.random()}`,
                        price: variantInfo?.variant_price || (detail.qty > 0 ? detail.total / detail.qty : 0), // Calculate price if not in variantInfo
                        variant_name: variantInfo?.variant_name || `Variant ${detail.variant}`,
                        unit_name: unitName,
                        applied_discount_id: null, // Reset for edit, or fetch applied line discount
                        discount_amount: 0,      // Reset for edit
                        stock_balance: null,     // Will be fetched
                        isLoadingStock: true,
                    } as OrderDetailItemUi;
                });

                const populatedDetails = await Promise.all(initialOrderDetailsPromises);
                setOrderDetails(populatedDetails);
                console.log("Populated Order Details for UI:", populatedDetails); // DEBUG

                // Fetch stock/discounts for each item AFTER details are populated
                for (const detail of populatedDetails) {
                    if (detail.variant_id) {
                        await fetchStockAndDiscounts(detail.key, detail.variant_id);
                    }
                }

            } catch (error: any) { // Catch specific error
                console.error("Error in fetchOrder:", error);
                toast.error(`Failed to load order details: ${error.message || 'Unknown error'}`);
                // navigate("/orders"); // Comment out to see error on page
            } finally {
                setIsPageLoading(false);
            }
        };

        if (productVariantOptions.length > 0 && unitOptions.length > 0) { // Ensure options are loaded
            fetchOrder();
        }

    }, [orderId, navigate, productVariantOptions, unitOptions, toast]); // Add unitOptions

    // --- Customer Handlers (keep as is, ensure they are wrapped in useCallback) ---
    const loadCustomerOptionsByName = useCallback( /* ... */ async (inputValue: string) => {
        if (!inputValue || inputValue.trim().length < 2) return customerOptions.slice(0, 10); // Use loaded customerOptions
        setIsCustomerLoading(true);
        try {
            const response = await api.get(`/api/customers/?cus_name__icontains=${encodeURIComponent(inputValue.trim())}&limit=20`);
            return response.data.results.map((c: Customer) => ({ label: `${c.cus_name} (${c.cus_phone})`, value: c.id, customer: c, }));
        } catch (error) { console.error("Failed to search customers by name:", error); return []; }
        finally { setIsCustomerLoading(false); }
    }, [customerOptions]); // Add customerOptions dependency

    const handleCustomerSelectChange = useCallback( /* ... */(selectedOption: any) => {
        if (selectedOption?.customer) {
            setSelectedCustomer(selectedOption.customer); setCustomerPhoneNumberInput(selectedOption.customer.cus_phone);
        } else { setSelectedCustomer(null); setCustomerPhoneNumberInput(''); }
    }, []);
    const fetchCustomerByPhone = useCallback( /* ... */ async (phone: string) => {
        const trimmedPhone = phone.trim(); if (!trimmedPhone || trimmedPhone.length < 7) return;
        setIsCustomerLoading(true);
        try {
            const response = await api.get(`/api/customers/?cus_phone=${encodeURIComponent(trimmedPhone)}`);
            const customersFound: Customer[] = response.data.results;
            if (customersFound && customersFound.length > 0) {
                const customerToSelect = customersFound[0]; setSelectedCustomer(customerToSelect); setCustomerPhoneNumberInput(customerToSelect.cus_phone); toast.success(`Customer '${customerToSelect.cus_name}' selected.`);
            } else { toast.info(`No customer found with phone: ${trimmedPhone}.`); }
        } catch (error) { console.error("Failed to fetch customer by phone:", error); toast.error("Error fetching customer by phone."); }
        finally { setIsCustomerLoading(false); }
    }, [toast]);
    const handlePhoneInputChange = useCallback( /* ... */(e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value; setCustomerPhoneNumberInput(newPhone);
        if (selectedCustomer && selectedCustomer.cus_phone !== newPhone) { setSelectedCustomer(null); }
    }, [selectedCustomer]);
    const handlePhoneInputConfirm = useCallback( /* ... */() => {
        if (customerPhoneNumberInput.trim() && (!selectedCustomer || selectedCustomer.cus_phone !== customerPhoneNumberInput.trim())) { fetchCustomerByPhone(customerPhoneNumberInput); }
    }, [customerPhoneNumberInput, selectedCustomer, fetchCustomerByPhone]);


    // --- Product Table Handlers (keep fetchStockAndDiscounts, updateOrderDetail, loadProductOptions as is) ---
    const addProductToOrder = useCallback( /* ... */() => {
        setOrderDetails(prev => [...prev, { key: `new-${Date.now()}-${Math.random()}`, variant_id: null, qty: 1, price: 0, applied_discount_id: null, discount_amount: 0, total: 0, stock_balance: null, isLoadingStock: false, unit_id: 0 }]);
    }, []);
    const removeProductFromOrder = useCallback( /* ... */(itemKey: string) => {
        setOrderDetails(prev => prev.filter(item => item.key !== itemKey));
    }, []);
    const fetchStockAndDiscounts = useCallback(async (itemKey: string, variantId: number) => {
        if (!variantId) return;
        setOrderDetails(prev => prev.map(item => item.key === itemKey ? { ...item, isLoadingStock: true, stock_balance: null, applied_discount_id: null } : item));
        const results = await Promise.allSettled([
            api.get(`/api/quantity_by_attribute/?variant_id=${variantId}`),
            api.get(`/api/discounts/?prod_id=${variantId}&limit=100`)
        ]);
        let newStockBalance = 0; let fetchedDiscounts: Discount[] = [];
        const stockResult = results[0];
        if (stockResult.status === 'fulfilled') { const stockData: StockInfo | undefined = stockResult.value.data.results?.[0]; newStockBalance = stockData?.balance ?? 0; }
        else {
            console.error(`Stock fetch error for ${variantId}:`, stockResult.reason); toast.error(`Failed to fetch stock for variant ${variantId}.`

            );
        }
        const discountResult = results[1];
        if (discountResult.status === 'fulfilled') { fetchedDiscounts = discountResult.value.data.results || []; setAvailableDiscounts(prevMap => new Map(prevMap).set(variantId, fetchedDiscounts)); }
        else {
            console.error(`Discount fetch error for ${variantId}:`, discountResult.reason); toast.error(`Failed to fetch discounts for variant ${variantId}.`

            ); setAvailableDiscounts(prevMap => new Map(prevMap).set(variantId, []));
        }
        setOrderDetails(prevDetails => prevDetails.map(item => {
            if (item.key === itemKey) {
                let newAppliedDiscountId = item.applied_discount_id;
                if (fetchedDiscounts.length === 0 || !fetchedDiscounts.some(d => d.id === newAppliedDiscountId)) { newAppliedDiscountId = null; }
                return { ...item, stock_balance: newStockBalance, isLoadingStock: false, applied_discount_id: newAppliedDiscountId };
            } return item;
        }));
    }, [toast]); // Added toast

    const updateOrderDetail = useCallback(async (itemKey: string, field: keyof OrderDetailItemUi, value: any) => {
        let intermediateDetails = orderDetails.map(item => { if (item.key === itemKey) { return { ...item, [field]: value }; } return item; });
        const currentItem = intermediateDetails.find(i => i.key === itemKey); if (!currentItem) return;
        if (field === 'variant_id') {
            if (value) {
                const selectedProductOption = productVariantOptions.find(opt => opt.value === value);
                if (selectedProductOption) {
                    const variant = selectedProductOption.variant;
                    intermediateDetails = intermediateDetails.map(item => item.key === itemKey ? { ...item, price: variant.variant_price, variant_name: variant.variant_name || `Variant ${variant.id}`, applied_discount_id: null, discount_amount: 0, stock_balance: null, isLoadingStock: true, unit_id: (variant as any).default_unit_id || currentItem.unit_id || null, } : item);
                    setOrderDetails(intermediateDetails); await fetchStockAndDiscounts(itemKey, value); return;
                }
            } else { intermediateDetails = intermediateDetails.map(item => item.key === itemKey ? { ...item, variant_id: null, price: 0, variant_name: undefined, qty: 1, applied_discount_id: null, discount_amount: 0, total: 0, stock_balance: null, isLoadingStock: false, unit_id: 0 } : item); }
        }
        const finalDetails = intermediateDetails.map(item => {
            if (item.key === itemKey) {
                let itemDiscountAmount = 0; const qtyNum = Number(item.qty) || 0;
                if (item.applied_discount_id && item.variant_id && item.price > 0 && qtyNum > 0) {
                    const discountsForVariant = availableDiscounts.get(item.variant_id);
                    const chosenDiscount = discountsForVariant?.find(d => d.id === item.applied_discount_id);
                    if (chosenDiscount) {
                        if (chosenDiscount.promotion_value_type === 'PERCENTAGE') {
                            itemDiscountAmount = (item.price * qtyNum) * (chosenDiscount.promotion_value / 100);
                        } else if (chosenDiscount.promotion_value_type === 'FIX') { itemDiscountAmount = chosenDiscount.promotion_value; }
                    }
                }
                const itemTotal = (qtyNum * item.price) - itemDiscountAmount;
                return { ...item, discount_amount: itemDiscountAmount, total: Math.max(0, itemTotal) };
            } return item;
        });
        setOrderDetails(finalDetails);
    }, [orderDetails, productVariantOptions, availableDiscounts, fetchStockAndDiscounts]);

    const loadProductOptions = useCallback( /* ... */ async (inputValue: string) => {
        if (!inputValue || inputValue.trim().length < 2) return productVariantOptions.slice(0, 10);
        setIsProductLoading(true);
        try {
            const response = await api.get(`/api/variants/?variant_name__icontains=${encodeURIComponent(inputValue.trim())}&limit=20`);
            return response.data.results.map((p: ProductVariant) => ({ label: `${p.variant_name || `Variant ${p.id}`} (ID: ${p.id})`, value: p.id, variant: p, }));
        } catch (error) { console.error("Failed to search products:", error); return []; }
        finally { setIsProductLoading(false); }
    }, [productVariantOptions]);

    // --- Totals Calculation ---
    const grandTotal = orderDetails.reduce((acc, item) => acc + (item.total || 0), 0);

    // --- Form Submission ---
    const canSaveOrder = /* ... same ... */ selectedCustomer && orderDetails.length > 0 && orderDetails.every(item => item.variant_id && Number(item.qty) > 0 && item.unit_id !== null && (!item.isLoadingStock && item.stock_balance !== null && item.stock_balance >= Number(item.qty))) && !isPageLoading;

    const handleUpdateOrder = async () => {
        if (!orderId || !originalOrder) return;
        // ... (validations for customer, items, stock) ...
        if (!selectedCustomer) { toast.error("Please select a customer."); return; }
        const validOrderDetails = orderDetails.filter(item => item.variant_id && Number(item.qty) > 0 && item.unit_id);
        if (validOrderDetails.length === 0 || validOrderDetails.length !== orderDetails.filter(i => i.variant_id).length) { toast("All products must have a selected unit."); return; }
        const outOfStockItems = validOrderDetails.filter(item => !item.isLoadingStock && item.stock_balance !== null && item.stock_balance < Number(item.qty));
        if (outOfStockItems.length > 0) { toast.error(`Insufficient stock for: ${outOfStockItems.map(i => i.variant_name || `ID ${i.variant_id}`).join(', ')}.`); return; }
        if (orderDetails.some(item => item.isLoadingStock)) { toast.info("Stock is loading. Please wait."); return; }

        setIsSubmitting(true);
        const payload = {
            total_amount: grandTotal, payment_method: paymentMethod, status: orderStatus,
            customer: selectedCustomer.id, coupon: overallCouponId, discount: overallDiscountId,
            employee: originalOrder.employee, // Use original employee from fetched order
            order_details: validOrderDetails.map(item => ({
                // If backend expects existing detail IDs for updates:
                // id: item.original_detail_id, // Send original ID if item is not new
                variant: item.variant_id, qty: Number(item.qty), total: item.total, unit: item.unit_id,
            })),
        };
        console.log("Submitting Order Update Payload:", payload);
        try {
            const response = await api.put(`/api/order/update/${orderId}/`, payload);
            if (response.status === 200) { toast.success('Order updated successfully!'); navigate('/orders'); }
            else { toast.error(response.data?.message || 'Failed to update order.'); }
        } catch (err: any) { console.error("Error updating order:", err.response?.data || err.message); /* ... error handling ... */ }
        finally { setIsSubmitting(false); }
    };


    if (isPageLoading) { return <Center h="70vh"><Spinner size="xl" /><Text ml={4}>Loading order details...</Text></Center>; }
    if (!originalOrder) {
        return (
            <Center h="70vh">
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                        Order not found or failed to load.
                        <ChakraLink as={RouterLink} href="/orders" ml={2} color="blue.500" fontWeight="bold">
                            Back to Orders
                        </ChakraLink>
                    </Alert.Content>
                </Alert.Root>
            </Center>
        );
    }

    const isOrderEditable = originalOrder.status === 'PENDING';
    const currentStatusProps = getPurchaseStatusProps(originalOrder.status);


    return (
        <Col gap="30px" p={{ base: 4, md: 6 }}>
            <Row justifyContent="space-between" alignItems="center" mb={6}>
                <HStack>
                    <IconButton aria-label="Back to orders" onClick={() => navigate('/orders')} variant="ghost">
                        <AiOutlineRollback size="24px" />
                    </IconButton>
                    <Title label={`EDIT ORDER #${originalOrder.id}`} />
                </HStack>
                <Tag.Root size="lg" colorPalette={currentStatusProps.colorScheme} variant="solid" borderRadius="full">
                    <Tag.Label>{currentStatusProps.label}</Tag.Label>
                </Tag.Root>
            </Row>
            {!isOrderEditable && (<Alert.Root status="warning" mb={4}>
                <Alert.Indicator />
                <Alert.Content>This order is in '{originalOrder?.status}' status and cannot be fully edited.</Alert.Content>
            </Alert.Root>)}

            <Box bg="white" p={6} borderRadius="xl" boxShadow="0 4px 12px 0 rgba(0,0,0,0.07)">
                <VStack gap={8} align="stretch">
                    {/* Customer Info */}
                    <Box>
                        <Heading size="md" mb={4}>Customer Information</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} alignItems="flex-end">
                            <Field.Root id="customer-id-edit"> <Field.Label>ID:</Field.Label> <CustomInput value={selectedCustomer ? `#${String(selectedCustomer.id).padStart(5, '0')}` : ''} isReadOnly tabIndex={-1} bg="gray.100" /> </Field.Root>
                            <Field.Root id="customer-name-edit"> <Field.Label>Name:</Field.Label>
                                <AsyncSelect name="customerNameEdit" placeholder="Search..." chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "40px" }) }} isClearable cacheOptions defaultOptions={customerOptions} loadOptions={loadCustomerOptionsByName} onChange={handleCustomerSelectChange} isLoading={isCustomerLoading && !customerPhoneNumberInput} value={selectedCustomer ? { label: `${selectedCustomer.cus_name} (${selectedCustomer.cus_phone})`, value: selectedCustomer.id, customer: selectedCustomer } : null} isDisabled={!isOrderEditable || !!originalOrder.customer /* Disable if customer already set and not allowing change */} />
                            </Field.Root>
                            <Field.Root id="customer-phone-edit"> <Field.Label>Phone:</Field.Label> <HStack> <CustomInput placeholder="Enter phone..." value={customerPhoneNumberInput} onChange={handlePhoneInputChange} onBlur={handlePhoneInputConfirm} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePhoneInputConfirm(); } }} isDisabled={!isOrderEditable || !!originalOrder.customer} /> {isCustomerLoading && !!customerPhoneNumberInput.trim() && <Spinner size="sm" />} </HStack> </Field.Root>
                        </SimpleGrid>
                    </Box>

                    {/* Order Settings */}
                    <Box>
                        <Heading size="md" mb={4}>Order Settings</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                            <Field.Root id="payment-method-edit"> <Field.Label>Payment Method:</Field.Label>
                                <Select options={paymentMethodOptions} value={paymentMethodOptions.find(opt => opt.value === paymentMethod)} onChange={(option: any) => setPaymentMethod(option.value)} isDisabled={!isOrderEditable} placeholder="Select payment method" />
                            </Field.Root>
                            <Field.Root id="order-status-edit"> <Field.Label>Status:</Field.Label>
                                <Select options={statusOptions} value={statusOptions.find(opt => opt.value === orderStatus)} onChange={(option: any) => setOrderStatus(option.value)} isDisabled={originalOrder.status === 'COMPLETE' || originalOrder.status === 'CANCEL' /* More restrictive status change */} placeholder="Select status" />
                            </Field.Root>
                        </SimpleGrid>
                    </Box>

                    {/* Line Items */}
                    <Box>
                        <Heading size="sm" mb={3}>Line Items</Heading>
                        <Table.Root size="sm">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Product</Table.ColumnHeader>
                                    <Table.ColumnHeader width="130px">Unit</Table.ColumnHeader>
                                    <Table.ColumnHeader width="80px">Qty</Table.ColumnHeader>
                                    <Table.ColumnHeader>Price</Table.ColumnHeader>
                                    <Table.ColumnHeader width="180px">Discount</Table.ColumnHeader>
                                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="center" width="60px">Action</Table.ColumnHeader> </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {orderDetails.map((item) => (
                                    <Table.Row key={item.key}>
                                        <Table.Cell minW="250px" p={1}>
                                            <AsyncSelect name={`product-edit-${item.key}`} placeholder="Select product" isClearable defaultOptions={productVariantOptions} loadOptions={loadProductOptions} isLoading={isProductLoading} value={item.variant_id ? productVariantOptions.find(opt => opt.value === item.variant_id) : null} onChange={(option: any) => updateOrderDetail(item.key, 'variant_id', option ? option.value : null)} chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "36px" }) }} menuPlacement="auto" isDisabled={!isOrderEditable || !!item.original_detail_id /* Disable changing existing product */} />
                                        </Table.Cell>
                                        <Table.Cell width="130px" p={1}>
                                            <Select name={`unit-edit-${item.key}`} placeholder="Unit" options={unitOptions} isLoading={isUnitLoading} value={item.unit_id ? unitOptions.find(opt => opt.value === item.unit_id) : null} onChange={(option: any) => updateOrderDetail(item.key, 'unit_id', option ? option.value : null)} isDisabled={!isOrderEditable || !item.variant_id || !!item.original_detail_id} size="sm" chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "36px" }) }} menuPlacement="auto" />
                                        </Table.Cell>
                                        <Table.Cell p={1}> <Input type="number" value={item.qty} onChange={(e) => updateOrderDetail(item.key, 'qty', Math.max(1, parseInt(e.target.value) || 1))} min={1} size="sm" textAlign="right" disabled={!isOrderEditable} /> </Table.Cell>
                                        <Table.Cell p={1}>{item.price > 0 ? item.price.toLocaleString() : '-'}</Table.Cell>
                                        <Table.Cell minW="180px" p={1}>
                                            <Select name={`discount-edit-${item.key}`} placeholder={"No discount"} isClearable options={item.variant_id ? (availableDiscounts.get(item.variant_id) || []).map(d => ({ label: d.discount_name, value: d.id })) : []} value={item.applied_discount_id && item.variant_id && (availableDiscounts.get(item.variant_id) || []).length > 0 ? (availableDiscounts.get(item.variant_id) || []).map(d => ({ label: d.discount_name, value: d.id })).find(opt => opt.value === item.applied_discount_id) : null} onChange={(option: any) => updateOrderDetail(item.key, 'applied_discount_id', option ? option.value : null)} isDisabled={!isOrderEditable || !item.variant_id || (availableDiscounts.get(item.variant_id || 0)?.length || 0) === 0} size="sm" menuPlacement="auto" />
                                        </Table.Cell>
                                        <Table.Cell p={1}>{item.total > 0 ? item.total.toLocaleString() : '-'}</Table.Cell>
                                        <Table.Cell textAlign="center" p={1}> {isOrderEditable && (<IconButton aria-label="Remove product" size="sm" colorScheme="red" variant="ghost" onClick={() => removeProductFromOrder(item.key)}><AiOutlineClose /></IconButton>)} </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                        {isOrderEditable && (<HStack mt={4} gap={4}> <Button onClick={addProductToOrder} size="sm" colorScheme="green" variant="outline">Add Product</Button> <ChakraLink as="button" _hover={{ textDecoration: "underline" }} color="green.600" fontSize="sm" onClick={() => toast({ title: "Info", description: "Catalog - Not implemented" })}>Catalog</ChakraLink> </HStack>)}
                    </Box>

                    {/* Summary & Actions */}
                    <Row justifyContent="space-between" alignItems="center" pt={6} borderTopWidth="1px" mt={6}>
                        <Text fontWeight="bold" mr={6} fontSize="lg">Updated Total: {grandTotal.toLocaleString()} đ</Text>
                        <HStack>
                            <CustomButton label="Cancel" variant="outline" onClick={() => navigate('/orders')} />
                            <CustomButton label="Save Changes" colorScheme="blue" onClick={handleUpdateOrder} disabled={!canSaveOrder || isSubmitting || !isOrderEditable} loading={isSubmitting} />
                        </HStack>
                    </Row>
                </VStack>
            </Box>
        </Col>
    );
}

export default EditOrder;
// --- END OF FILE EditOrder.tsx (Corrected for API data structure) ---