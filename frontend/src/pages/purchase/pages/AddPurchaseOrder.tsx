import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Input, Table, IconButton, HStack, VStack, Button, SimpleGrid, NumberInput, Alert, Link as ChakraLink, Field } from '@chakra-ui/react';
import { Select, AsyncSelect } from 'chakra-react-select';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../../api';
import { Row } from '../../../components/Row';
import { Col } from '../../../components/Col';
import CustomButton from '../../../components/CustomButton';
import Title from '../../../components/Title';
import { AiOutlineClose, AiOutlineRollback } from 'react-icons/ai';
import { ProductVariant } from '../../../types/product.type';
import { Supplier } from '../../../types/supplier.type';
import { toast } from 'sonner';

interface UnitOption {
    id: number;
    unit_name: string;
}

interface PurchaseDetailItem {
    key: string;
    variant_id: number | null;
    variant_name?: string;
    qty: number;
    cost_price: number;
    unit_id: number | null;
    total: number;
}

const AddPurchaseOrder = () => {
    const navigate = useNavigate();

    const [selectedSupplier, setSelectedSupplier] = useState<{ label: string; value: number; supplier: Supplier } | null>(null);
    const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: number; supplier: Supplier }[]>([]);
    const [isSupplierLoading, setIsSupplierLoading] = useState(false);

    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetailItem[]>([]);
    const [productVariantOptions, setProductVariantOptions] = useState<{ label: string; value: number; variant: ProductVariant }[]>([]);
    const [unitOptions, setUnitOptions] = useState<{ label: string; value: number; unit: UnitOption }[]>([]);
    const [isProductLoading, setIsProductLoading] = useState(false);
    const [isUnitLoading, setIsUnitLoading] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchInitialSelectOptions = async () => {
            setIsProductLoading(true);
            setIsUnitLoading(true);
            try {
                const [productsRes, unitsRes, suppliersRes] = await Promise.all([
                    api.get('/api/variants/?limit=1000'),
                    api.get('/api/units/?limit=100'),
                    api.get('/api/suppliers/?limit=1000'),
                ]);

                const productOpts = productsRes.data.results.map((p: ProductVariant) => ({
                    label: `${p.variant_name || `Variant ${p.id}`} (Cost: ${p.variant_cost_price?.toLocaleString() || 'N/A'})`,
                    value: p.id,
                    variant: p,
                }));
                setProductVariantOptions(productOpts);

                const unitOpts = unitsRes.data.results.map((u: UnitOption) => ({
                    label: u.unit_name,
                    value: u.id,
                    unit: u,
                }));
                setUnitOptions(unitOpts);

                const supplierOpts = suppliersRes.data.results.map((s: Supplier) => ({
                    label: s.sup_name || `Supplier ID ${s.id}`,
                    value: s.id,
                    supplier: s,
                }));
                setSupplierOptions(supplierOpts);


            } catch (error) {
                toast.error("Failed to load initial options for products, units, or suppliers.");
                console.error(error);
            } finally {
                setIsProductLoading(false);
                setIsUnitLoading(false);
            }
        };
        fetchInitialSelectOptions();
    }, [toast]);

    const loadSupplierOptions = useCallback(async (inputValue: string) => {
        if (!inputValue || inputValue.trim().length < 2) return supplierOptions.slice(0, 10);
        setIsSupplierLoading(true);
        try {
            const response = await api.get(`/api/suppliers/?sup_name__icontains=${encodeURIComponent(inputValue.trim())}&limit=20`);
            return response.data.results.map((s: Supplier) => ({
                label: s.sup_name || `Supplier ID ${s.id}`,
                value: s.id,
                supplier: s,
            }));
        } catch (error) {
            console.error("Failed to search suppliers:", error);
            return [];
        } finally {
            setIsSupplierLoading(false);
        }
    }, [supplierOptions]);

    const addPurchaseDetailItem = useCallback(() => {
        setPurchaseDetails(prev => [
            ...prev,
            {
                key: Date.now().toString() + Math.random(),
                variant_id: null,
                qty: 1,
                cost_price: 0,
                unit_id: null,
                total: 0,
            }
        ]);
    }, []);

    const removePurchaseDetailItem = useCallback((itemKey: string) => {
        setPurchaseDetails(prev => prev.filter(item => item.key !== itemKey));
    }, []);

    const updatePurchaseDetailItem = useCallback((itemKey: string, field: keyof PurchaseDetailItem, value: any) => {
        setPurchaseDetails(prevDetails =>
            prevDetails.map(item => {
                if (item.key === itemKey) {
                    const updatedItem = { ...item, [field]: value };

                    if (field === 'variant_id' && value) {
                        const selectedProductOption = productVariantOptions.find(opt => opt.value === value);
                        if (selectedProductOption) {
                            updatedItem.cost_price = selectedProductOption.variant.variant_cost_price || 0;
                            updatedItem.variant_name = selectedProductOption.variant.variant_name || `Variant ${value}`;
                        } else {
                            updatedItem.cost_price = 0;
                            updatedItem.variant_name = undefined;
                        }
                    }
                    updatedItem.total = (Number(updatedItem.qty) || 0) * (Number(updatedItem.cost_price) || 0);
                    return updatedItem;
                }
                return item;
            })
        );
    }, [productVariantOptions]);

    const loadProductOptions = useCallback(async (inputValue: string) => {
        if (!inputValue || inputValue.trim().length < 2) return productVariantOptions.slice(0, 10);
        setIsProductLoading(true);
        try {
            const response = await api.get(`/api/variants/?variant_name__icontains=${encodeURIComponent(inputValue.trim())}&limit=20`);
            return response.data.results.map((p: ProductVariant) => ({
                label: `${p.variant_name || `Variant ${p.id}`} (Cost: ${p.variant_cost_price?.toLocaleString() || 'N/A'})`,
                value: p.id,
                variant: p,
            }));
        } catch (error) {
            console.error("Failed to search products:", error);
            return [];
        } finally {
            setIsProductLoading(false);
        }
    }, [productVariantOptions]);


    const overallTotalAmount = purchaseDetails.reduce((acc, item) => acc + item.total, 0);

    const handleSubmitPurchaseOrder = async () => {
        if (!selectedSupplier) {
            toast.error("Please select a supplier.");
            return;
        }
        const validDetails = purchaseDetails.filter(
            item => item.variant_id && Number(item.qty) > 0 && item.unit_id && Number(item.cost_price) >= 0
        );
        if (validDetails.length === 0) {
            toast.error("Please add at least one valid product item with quantity, unit, and cost price.");
            return;
        }

        setIsSubmitting(true);
        const payload = {
            total_amount: overallTotalAmount,
            status: 'PENDING',
            supplier: selectedSupplier.value,
            purchase_details: validDetails.map(item => ({
                variant: item.variant_id,
                qty: Number(item.qty),
                total: item.total,
                unit: item.unit_id,
            })),
        };
        console.log("Submitting Purchase Order Payload:", payload);

        try {
            const response = await api.post('/api/purchases/', payload);
            if (response.status === 201) {
                toast.success("Purchase order created successfully!");
                navigate('/purchase/');
            } else {
                toast.error("Failed to create purchase order.");
            }
        } catch (err: any) {
            console.error("Error creating purchase order:", err.response?.data || err.message);
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                Object.entries(errorData).forEach(([key, value]) => {
                    const messages = Array.isArray(value) ? value.join('; ') : String(value);
                    toast.error(messages);
                });
            } else {
                toast.error("An unknown error occurred.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Col gap="30px" p={{ base: 4, md: 6 }}>
            <Row justifyContent="space-between" alignItems="center" mb={0}>
                <HStack>
                    <IconButton
                        aria-label="Back to Purchase Orders"
                        onClick={() => navigate('/purchase/')}
                        variant="ghost"
                    ><AiOutlineRollback /></IconButton>
                    <Title label="Create New Purchase Order" />
                </HStack>
            </Row>

            <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
                <VStack gap={8} align="stretch">
                    <Field.Root id="supplier-select-group" required>
                        <Field.Label fontWeight="bold">Supplier</Field.Label>
                        <AsyncSelect
                            name="supplier"
                            placeholder="Search or select supplier..."
                            chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "40px" }) }}
                            isClearable
                            cacheOptions
                            defaultOptions={supplierOptions}
                            loadOptions={loadSupplierOptions}
                            onChange={(option: any) => setSelectedSupplier(option)}
                            isLoading={isSupplierLoading}
                            value={selectedSupplier}
                        />
                    </Field.Root>

                    <Box>
                        <Heading size="md" mb={4}>Purchase Items</Heading>
                        <Table.Root size="sm">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Product (Variant)</Table.ColumnHeader>
                                    <Table.ColumnHeader width="100px">Qty</Table.ColumnHeader>
                                    <Table.ColumnHeader width="150px">Cost Price</Table.ColumnHeader>
                                    <Table.ColumnHeader width="150px">Unit</Table.ColumnHeader>
                                    <Table.ColumnHeader>Line Total</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="center" width="60px">Action</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {purchaseDetails.map((item) => (
                                    <Table.Row key={item.key}>
                                        <Table.Cell minW="250px" p={1}>
                                            <AsyncSelect
                                                name={`product-${item.key}`}
                                                placeholder="Select product"
                                                isClearable
                                                defaultOptions={productVariantOptions}
                                                loadOptions={loadProductOptions}
                                                isLoading={isProductLoading}
                                                value={item.variant_id ? productVariantOptions.find(opt => opt.value === item.variant_id) : null}
                                                onChange={(option: any) => updatePurchaseDetailItem(item.key, 'variant_id', option ? option.value : null)}
                                                chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "36px" }) }}
                                                menuPlacement="auto"
                                            />
                                        </Table.Cell>
                                        <Table.Cell p={1}>
                                            <Input
                                                type='number' min={1}
                                                value={item.qty}
                                                onChange={(e) => updatePurchaseDetailItem(item.key, 'qty', parseInt(e.target.value) || 1)} />
                                        </Table.Cell>
                                        <Table.Cell p={1}>
                                            <NumberInput.Root
                                                size="sm"
                                                min={0}
                                            >
                                                <NumberInput.Input
                                                    value={item.cost_price}
                                                    onChange={(e) => {
                                                        const valueString = e.target.value
                                                        const valueNumber = parseFloat(valueString) || 0
                                                        updatePurchaseDetailItem(item.key, 'cost_price', valueNumber)
                                                    }}
                                                />
                                            </NumberInput.Root>
                                        </Table.Cell>
                                        <Table.Cell p={1}>
                                            <Select
                                                name={`unit-${item.key}`}
                                                placeholder="Select unit"
                                                options={unitOptions}
                                                isLoading={isUnitLoading}
                                                value={item.unit_id ? unitOptions.find(opt => opt.value === item.unit_id) : null}
                                                onChange={(option: any) => updatePurchaseDetailItem(item.key, 'unit_id', option ? option.value : null)}
                                                disabled={!item.variant_id}
                                                size="sm"
                                                menuPlacement="auto"
                                            />
                                        </Table.Cell>
                                        <Table.Cell p={1}>{item.total > 0 ? item.total.toLocaleString() : '-'}</Table.Cell>
                                        <Table.Cell textAlign="center" p={1}>
                                            <IconButton
                                                aria-label="Remove item"
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => removePurchaseDetailItem(item.key)}
                                            ><AiOutlineClose /></IconButton>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                        <Button onClick={addPurchaseDetailItem} size="sm" colorScheme="teal" variant="outline" mt={4}>
                            Add Item
                        </Button>
                    </Box>

                    <Row justifyContent="flex-end" alignItems="center" pt={6} borderTopWidth="1px" mt={6}>
                        <Text fontWeight="bold" mr={6} fontSize="xl">
                            Total Amount: {overallTotalAmount.toLocaleString()} đ
                        </Text>
                        <HStack>
                            <CustomButton
                                label="Cancel"
                                variant="outline"
                                onClick={() => navigate('/purchase/')}
                            />
                            <CustomButton
                                label="Create Purchase Order"
                                colorScheme="blue"
                                onClick={handleSubmitPurchaseOrder}
                                disabled={isSubmitting || purchaseDetails.length === 0 || !selectedSupplier}
                                loading={isSubmitting}
                            />
                        </HStack>
                    </Row>
                </VStack>
            </Box>
        </Col>
    );
};

export default AddPurchaseOrder;

// // --- START OF FILE CreateOrder.tsx (Corrected) ---
// import React, { useEffect, useState, useCallback } from 'react';
// import { Box, Heading, Text, Input, Table, IconButton, Spinner, HStack, VStack, Icon, Button, SimpleGrid, Link as ChakraLink, Flex, Field } from '@chakra-ui/react';
// import { Select, AsyncSelect } from 'chakra-react-select';
// import { toast } from 'sonner';
// import api from '../../../api'; // CHECK PATH
// import { Row } from '../../../components/Row'; // CHECK PATH
// import { Col } from '../../../components/Col';   // CHECK PATH
// import CustomButton from '../../../components/CustomButton'; // CHECK PATH
// import Title from '../../../components/Title'; // CHECK PATH
// import { useNavigate } from 'react-router-dom';
// import { AiOutlineClose, AiOutlineFlag } from 'react-icons/ai';
// import { FaChevronRight } from "react-icons/fa";
// import CustomInput from "../../../components/CustomInput"; // CHECK PATH & ensure compatibility
// import { Customer } from "../../../types/customers.type"; // CHECK PATH
// import { ProductVariant } from "../../../types/product.type"; // CHECK PATH
// import { Discount } from "../../../types/discount.type"; // CHECK PATH
// import { OrderDetailItem as OrderDetailItemTypeImport } from "../../../types/order.type"; // CHECK PATH
// import { StockInfo } from "../../../types/stock.type"; // CHECK PATH

// interface UnitOption {
//     id: number;
//     unit_name: string;
//     // Add other unit properties if needed
// }

// // Enhanced OrderDetailItem
// interface OrderDetailItem extends OrderDetailItemTypeImport { // Assuming OrderDetailItemTypeImport might have unit_id
//     isLoadingStock?: boolean;
// }

// const CreateOrder = () => {
//     const navigate = useNavigate();

//     // --- State ---
//     const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
//     const [customerOptions, setCustomerOptions] = useState<{ label: string, value: number, customer: Customer }[]>([]);
//     const [customerPhoneNumberInput, setCustomerPhoneNumberInput] = useState('');

//     const [orderDetails, setOrderDetails] = useState<OrderDetailItem[]>([]);
//     const [productVariantOptions, setProductVariantOptions] = useState<{ label: string, value: number, variant: ProductVariant }[]>([]);
//     const [availableDiscounts, setAvailableDiscounts] = useState<Map<number, Discount[]>>(new Map());
//     const [unitOptions, setUnitOptions] = useState<{ label: string; value: number; unit: UnitOption }[]>([]); // Correctly typed

//     const [overallDiscount, setOverallDiscount] = useState<Discount | null>(null);
//     const [overallCoupon, setOverallCoupon] = useState<any | null>(null);

//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isCustomerLoading, setIsCustomerLoading] = useState(false);
//     const [isProductLoading, setIsProductLoading] = useState(false);
//     const [isUnitLoading, setIsUnitLoading] = useState(false); // Added for unit loading

//     const MOCKED_EMPLOYEE_ID = 1;

//     // --- Effects ---
//     useEffect(() => {
//         const fetchInitialData = async () => {
//             setIsCustomerLoading(true);
//             setIsProductLoading(true);
//             setIsUnitLoading(true); // Set unit loading true
//             try {
//                 const [customersRes, productsRes, unitsRes] = await Promise.all([
//                     api.get('/api/customers/?limit=1000'),
//                     api.get('/api/variants/?limit=1000'),
//                     api.get('/api/units/?limit=100') // Assuming this is your unit API
//                 ]);

//                 const customerOpts = customersRes.data.results.map((c: Customer) => ({
//                     label: `${c.cus_name} (${c.cus_phone})`, value: c.id, customer: c,
//                 }));
//                 setCustomerOptions(customerOpts);

//                 const productOpts = productsRes.data.results.map((p: ProductVariant) => ({
//                     label: `${p.variant_name || `Variant ${p.id}`} (ID: ${p.id})`, value: p.id, variant: p,
//                 }));
//                 setProductVariantOptions(productOpts);

//                 // Process unit options
//                 const unitData = unitsRes.data.results.map((u: UnitOption) => ({ // Use UnitOption type
//                     label: u.unit_name || `Unit ${u.id}`,
//                     value: u.id,
//                     unit: u,
//                 }));
//                 setUnitOptions(unitData); // Set the fetched unit options

//             } catch (error) {
//                 toast.error('Failed to load initial data (customers, products, or units).');
//                 console.error(error);
//             } finally {
//                 setIsCustomerLoading(false);
//                 setIsProductLoading(false);
//                 setIsUnitLoading(false); // Set unit loading false
//             }
//         };
//         fetchInitialData();
//     }, []);


//     // --- Customer Handlers (Keep as is) ---
//     const loadCustomerOptionsByName = useCallback( /* ... */ async (inputValue: string) => {
//         if (!inputValue || inputValue.trim().length < 2) return [];
//         setIsCustomerLoading(true);
//         try {
//             const response = await api.get(`/api/customers/?cus_name__icontains=${encodeURIComponent(inputValue.trim())}&limit=20`);
//             return response.data.results.map((c: Customer) => ({ label: `${c.cus_name} (${c.cus_phone})`, value: c.id, customer: c, }));
//         } catch (error) { console.error("Failed to search customers by name:", error); return []; }
//         finally { setIsCustomerLoading(false); }
//     }, []);
//     const handleCustomerSelectChange = useCallback( /* ... */(selectedOption: any) => {
//         if (selectedOption?.customer) {
//             setSelectedCustomer(selectedOption.customer); setCustomerPhoneNumberInput(selectedOption.customer.cus_phone);
//         } else { setSelectedCustomer(null); setCustomerPhoneNumberInput(''); }
//     }, []);
//     const fetchCustomerByPhone = useCallback( /* ... */ async (phone: string) => {
//         const trimmedPhone = phone.trim(); if (!trimmedPhone || trimmedPhone.length < 7) return;
//         setIsCustomerLoading(true);
//         try {
//             const response = await api.get(`/api/customers/?cus_phone=${encodeURIComponent(trimmedPhone)}`);
//             const customersFound: Customer[] = response.data.results;
//             if (customersFound && customersFound.length > 0) {
//                 const customerToSelect = customersFound[0]; setSelectedCustomer(customerToSelect); setCustomerPhoneNumberInput(customerToSelect.cus_phone); toast.success(`Customer '${customerToSelect.cus_name}' selected.`);
//             } else { toast.info(`No customer found with phone: ${trimmedPhone}.`); }
//         } catch (error) { console.error("Failed to fetch customer by phone:", error); toast.error("Error fetching customer by phone."); }
//         finally { setIsCustomerLoading(false); }
//     }, []);
//     const handlePhoneInputChange = useCallback( /* ... */(e: React.ChangeEvent<HTMLInputElement>) => {
//         const newPhone = e.target.value; setCustomerPhoneNumberInput(newPhone);
//         if (selectedCustomer && selectedCustomer.cus_phone !== newPhone) { setSelectedCustomer(null); }
//     }, [selectedCustomer]);
//     const handlePhoneInputConfirm = useCallback( /* ... */() => {
//         if (customerPhoneNumberInput.trim() && (!selectedCustomer || selectedCustomer.cus_phone !== customerPhoneNumberInput.trim())) { fetchCustomerByPhone(customerPhoneNumberInput); }
//     }, [customerPhoneNumberInput, selectedCustomer, fetchCustomerByPhone]);


//     // --- Handlers for Product Table ---
//     const addProductToOrder = useCallback(() => {
//         setOrderDetails(prev => [
//             ...prev,
//             {
//                 key: Date.now().toString(), variant_id: null, qty: 1, price: 0,
//                 applied_discount_id: null, discount_amount: 0, total: 0,
//                 stock_balance: null, isLoadingStock: false,
//                 unit_id: 0, // Initialize unit_id as null
//             }
//         ]);
//     }, []);

//     const removeProductFromOrder = useCallback((itemKey: string) => {
//         setOrderDetails(prev => prev.filter(item => item.key !== itemKey));
//     }, []);

//     const fetchStockAndDiscounts = useCallback(async (itemKey: string, variantId: number) => {
//         // ... (Implementation from previous correct version using Promise.allSettled or individual try-catch)
//         if (!variantId) return;
//         setOrderDetails(prev => prev.map(item => item.key === itemKey ? { ...item, isLoadingStock: true, stock_balance: null, applied_discount_id: null } : item));
//         let newStockBalance = 0; let fetchedDiscounts: Discount[] = [];
//         // Using Promise.allSettled for robustness
//         const results = await Promise.allSettled([
//             api.get(`/api/quantity_by_attribute/?variant_id=${variantId}`),
//             api.get(`/api/discounts/?prod_id=${variantId}&limit=100`)
//         ]);
//         const stockResult = results[0];
//         if (stockResult.status === 'fulfilled') {
//             const stockData: StockInfo | undefined = stockResult.value.data.results?.[0]; // Adjusted to match your API
//             newStockBalance = stockData?.balance ?? 0;
//         } else { console.error(`Stock fetch error for ${variantId}:`, stockResult.reason); toast.error(`Failed to fetch stock for variant ${variantId}.`); }
//         const discountResult = results[1];
//         if (discountResult.status === 'fulfilled') {
//             fetchedDiscounts = discountResult.value.data.results || [];
//             setAvailableDiscounts(prevMap => new Map(prevMap).set(variantId, fetchedDiscounts));
//         } else { console.error(`Discount fetch error for ${variantId}:`, discountResult.reason); toast.error(`Failed to fetch discounts for variant ${variantId}.`); setAvailableDiscounts(prevMap => new Map(prevMap).set(variantId, [])); }
//         setOrderDetails(prevDetails => prevDetails.map(item => {
//             if (item.key === itemKey) {
//                 let newAppliedDiscountId = item.applied_discount_id; let newDiscountAmount = item.discount_amount;
//                 if (fetchedDiscounts.length === 0 || !fetchedDiscounts.some(d => d.id === newAppliedDiscountId)) { newAppliedDiscountId = null; newDiscountAmount = 0; }
//                 const newTotal = (Number(item.qty) * item.price) - newDiscountAmount;
//                 return { ...item, stock_balance: newStockBalance, isLoadingStock: false, applied_discount_id: newAppliedDiscountId, discount_amount: newDiscountAmount, total: Math.max(0, newTotal) };
//             } return item;
//         }));
//     }, []); // Removed setAvailableDiscounts from deps as it's stable

//     const updateOrderDetail = useCallback(async (itemKey: string, field: keyof OrderDetailItem, value: any) => {
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
//                             unit_id: (variant as any).default_unit_id || null, // TRY TO GET DEFAULT UNIT ID FROM VARIANT
//                         } : item
//                     );
//                     setOrderDetails(intermediateDetails);
//                     await fetchStockAndDiscounts(itemKey, value);
//                     return;
//                 }
//             } else {
//                 intermediateDetails = intermediateDetails.map(item =>
//                     item.key === itemKey ? { ...item, variant_id: null, price: 0, variant_name: undefined, qty: 1, applied_discount_id: null, discount_amount: 0, total: 0, stock_balance: null, isLoadingStock: false, unit_id: 0 } : item
//                 );
//             }
//         }

//         // Recalculate totals always after any relevant change
//         const finalDetails = intermediateDetails.map(item => {
//             if (item.key === itemKey) { // Recalculate for the current item
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

//     const loadProductOptions = useCallback( /* ... */ async (inputValue: string) => {
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
//             item.variant_id &&
//             Number(item.qty) > 0 &&
//             item.unit_id !== null && // <<<< VALIDATE UNIT_ID IS SELECTED
//             (item.isLoadingStock === false && item.stock_balance !== null && item.stock_balance >= Number(item.qty))
//         );

//     const handleSaveOrder = async (status: 'PENDING' | 'COMPLETE' = 'PENDING') => {
//         if (!selectedCustomer) { toast.error("Please select a customer."); return; }
//         const validOrderDetails = orderDetails.filter(item => item.variant_id && Number(item.qty) > 0 && item.unit_id /* << Validate unit_id */);
//         if (validOrderDetails.length === 0 || validOrderDetails.length !== orderDetails.filter(i => i.variant_id).length) { // Check if all items with variant have unit
//             toast.error("Please add products with valid quantity and select a unit for each.");
//             return;
//         }
//         // ... (rest of the validation as before)
//         const outOfStockItems = validOrderDetails.filter(item => item.stock_balance !== null && !item.isLoadingStock && item.stock_balance < Number(item.qty));
//         if (outOfStockItems.length > 0) { toast.error(`Insufficient stock for: ${outOfStockItems.map(item => item.variant_name || `Variant ID ${item.variant_id}`).join(', ')}.`); return; }
//         if (orderDetails.some(item => item.isLoadingStock)) { toast.info("Stock information is still loading."); return; }


//         setIsSubmitting(true);
//         const payload = {
//             total_amount: grandTotal, payment_method: 'CASH', status: status,
//             customer: selectedCustomer.id,
//             coupon: overallCoupon ? overallCoupon.id : null,
//             discount: overallDiscount ? overallDiscount.id : null,
//             employee: MOCKED_EMPLOYEE_ID, // Add employee if API requires
//             order_details: validOrderDetails.map(item => ({
//                 variant: item.variant_id,
//                 qty: Number(item.qty),
//                 total: item.total,
//                 unit: item.unit_id, // Send the selected unit_id
//             })),
//         };
//         console.log("Submitting Order Payload:", payload);
//         try {
//             const response = await api.post('/api/orders/', payload);
//             if (response.status === 201) { toast.success('Order created!'); navigate('/orders'); }
//             else { toast.error(response.data?.message || 'Failed to create order.'); }
//         } catch (err: any) { /* ... error handling ... */ }
//         finally { setIsSubmitting(false); }
//     };

//     return (
//         <Col gap="30px" p={{ base: 4, md: 6 }}>
//             <Row justifyContent="space-between" alignItems="center" mb={6}>
//                 <Title label="CREATE NEW ORDER" />
//                 <Button colorScheme="gray" variant="outline" onClick={() => toast.info("Go to Payment - Not implemented yet")}>
//                     <FaChevronRight />
//                     Go to Payment
//                 </Button>
//             </Row>

//             <Box bg="white" p={6} borderRadius="xl" boxShadow="0 4px 12px 0 rgba(0,0,0,0.07)">
//                 <VStack gap={6} align="stretch"> {/* Changed from align="stretch" */}
//                     {/* Customer Information */}
//                     <Box>
//                         <Heading size="md" mb={4}>Customer Information</Heading>
//                         <SimpleGrid columns={{ base: 1, md: 3 }} alignItems="flex-end" gap={4}> {/* Changed gap to spacing */}
//                             <Field.Root id="customer-id-display-group"> {/* Using Field.Root */}
//                                 <Field.Label>ID:</Field.Label> {/* Using Field.Label */}
//                                 <CustomInput value={selectedCustomer ? `#${String(selectedCustomer.id).padStart(5, '0')}` : ''} readOnly tabIndex={-1} bg="gray.50" />
//                             </Field.Root>
//                             <Field.Root id="customer-name-select-group">
//                                 <Field.Label>Name (Search or Select):</Field.Label>
//                                 <AsyncSelect name="customerName" placeholder="Type to search by name..."
//                                     chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "40px" }) }}
//                                     isClearable cacheOptions defaultOptions={customerOptions}
//                                     loadOptions={loadCustomerOptionsByName} onChange={handleCustomerSelectChange}
//                                     isLoading={isCustomerLoading && !customerPhoneNumberInput}
//                                     value={selectedCustomer ? { label: `${selectedCustomer.cus_name} (${selectedCustomer.cus_phone})`, value: selectedCustomer.id, customer: selectedCustomer } : null}
//                                     onInputChange={(inputValue, { action }) => { if (action === 'clear' && !customerPhoneNumberInput.trim()) { setSelectedCustomer(null); } }}
//                                 />
//                             </Field.Root>
//                             <Field.Root id="customer-phone-input-group">
//                                 <Field.Label>Phone (Enter to find):</Field.Label>
//                                 <HStack>
//                                     <CustomInput placeholder="Enter exact phone number" value={customerPhoneNumberInput}
//                                         onChange={handlePhoneInputChange} onBlur={handlePhoneInputConfirm}
//                                         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePhoneInputConfirm(); } }}
//                                     />
//                                     {isCustomerLoading && !!customerPhoneNumberInput.trim() && <Spinner size="sm" />}
//                                 </HStack>
//                             </Field.Root>
//                         </SimpleGrid>
//                     </Box>

//                     {/* Products */}
//                     <Box>
//                         <Heading size="md" mb={4}>Products</Heading>
//                         <Table.Root size="sm"> {/* Using Chakra Table */}
//                             <Table.Header>
//                                 <Table.Row>
//                                     <Table.ColumnHeader>Product</Table.ColumnHeader>
//                                     <Table.ColumnHeader width="130px">Unit</Table.ColumnHeader> {/* Adjusted width for Unit */}
//                                     <Table.ColumnHeader width="80px">Qty</Table.ColumnHeader>
//                                     <Table.ColumnHeader>Price</Table.ColumnHeader>
//                                     <Table.ColumnHeader width="180px">Discount</Table.ColumnHeader> {/* Adjusted width for Discount */}
//                                     <Table.ColumnHeader>Amount</Table.ColumnHeader>
//                                     <Table.ColumnHeader textAlign="center" width="80px">Stock</Table.ColumnHeader>
//                                     <Table.ColumnHeader textAlign="center" width="60px">Action</Table.ColumnHeader>
//                                 </Table.Row>
//                             </Table.Header>
//                             <Table.Body>
//                                 {orderDetails.map((item) => (
//                                     <Table.Row key={item.key}>
//                                         <Table.Cell minW="250px" p={1}>
//                                             <AsyncSelect name={`product-${item.key}`} placeholder="Select product" isClearable
//                                                 defaultOptions={productVariantOptions} loadOptions={loadProductOptions}
//                                                 isLoading={isProductLoading}
//                                                 value={item.variant_id ? productVariantOptions.find(opt => opt.value === item.variant_id) : null}
//                                                 onChange={(option: any) => updateOrderDetail(item.key, 'variant_id', option ? option.value : null)}
//                                                 chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "36px" }) }} menuPlacement="auto" />
//                                         </Table.Cell>
//                                         <Table.Cell width="130px" p={1}> {/* CELL FOR UNIT SELECT */}
//                                             <Select
//                                                 name={`unit-${item.key}`}
//                                                 placeholder="Unit"
//                                                 options={unitOptions}
//                                                 isLoading={isUnitLoading} // Use unit loading state
//                                                 value={item.unit_id ? unitOptions.find(opt => opt.value === item.unit_id) : null}
//                                                 onChange={(option: any) => updateOrderDetail(item.key, 'unit_id', option ? option.value : null)}
//                                                 isDisabled={!item.variant_id}
//                                                 size="sm"
//                                                 chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "36px" }) }}
//                                                 menuPlacement="auto"
//                                             />
//                                         </Table.Cell>
//                                         <Table.Cell p={1}>
//                                             <Input type="number" value={item.qty}
//                                                 onChange={(e) => updateOrderDetail(item.key, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
//                                                 min={1} size="sm" textAlign="right" />
//                                         </Table.Cell>
//                                         <Table.Cell p={1}>{item.price > 0 ? item.price.toLocaleString() : '-'}</Table.Cell>
//                                         <Table.Cell minW="180px" p={1}> {/* Adjusted minW */}
//                                             <Select name={`discount-${item.key}`}
//                                                 placeholder={"No discount"} // Simpler placeholder
//                                                 isClearable
//                                                 options={item.variant_id ? (availableDiscounts.get(item.variant_id) || []).map(d => ({ label: d.discount_name, value: d.id })) : []}
//                                                 value={item.applied_discount_id && item.variant_id && (availableDiscounts.get(item.variant_id) || []).length > 0 ?
//                                                     (availableDiscounts.get(item.variant_id) || []).map(d => ({ label: d.discount_name, value: d.id })).find(opt => opt.value === item.applied_discount_id) : null}
//                                                 onChange={(option: any) => updateOrderDetail(item.key, 'applied_discount_id', option ? option.value : null)}
//                                                 isDisabled={!item.variant_id || (availableDiscounts.get(item.variant_id || 0)?.length || 0) === 0}
//                                                 size="sm" menuPlacement="auto" />
//                                         </Table.Cell>
//                                         <Table.Cell p={1}>{item.total > 0 ? item.total.toLocaleString() : '-'}</Table.Cell>
//                                         <Table.Cell textAlign="center" p={1}>
//                                             {item.isLoadingStock ? <Spinner size="xs" /> :
//                                                 item.variant_id && item.stock_balance !== null && (
//                                                     <Flex alignItems="center" justifyContent="center">
//                                                         <Icon as={AiOutlineFlag} color={item.stock_balance >= Number(item.qty) ? 'green.500' : 'red.500'} boxSize={5} mr={1} />
//                                                         <Text fontSize="xs">{item.stock_balance}</Text>
//                                                     </Flex>
//                                                 )}
//                                         </Table.Cell>
//                                         <Table.Cell textAlign="center" p={1}>
//                                             <IconButton aria-label="Remove product" as={AiOutlineClose} size="sm" colorScheme="red" variant="ghost" onClick={() => removeProductFromOrder(item.key)} />
//                                         </Table.Cell>
//                                     </Table.Row>
//                                 ))}
//                             </Table.Body>
//                         </Table.Root>
//                         <HStack mt={4} gap={4}> {/* Added spacing */}
//                             <Button onClick={addProductToOrder} size="sm" colorScheme="green" variant="outline"> {/* Changed Text to Button */}
//                                 Add a Product
//                             </Button>
//                             {/* Catalog Link (optional) */}
//                             {/* <ChakraLink as="button" _hover={{textDecoration: "underline"}} color="green.600" fontSize="sm" onClick={() => toast.info("Catalog - Not implemented")}>Catalog</ChakraLink> */}
//                         </HStack>
//                     </Box>

//                     {/* Order Summary & Actions */}
//                     <Row justifyContent="flex-end" alignItems="center" pt={6} borderTopWidth="1px" mt={6}>
//                         <Text fontWeight="bold" mr={6} fontSize="lg">Total: {grandTotal.toLocaleString()}</Text>
//                         <HStack>
//                             <CustomButton label="Cancel" variant="outline" onClick={() => navigate('/orders')} />
//                             <CustomButton label="Save Order" colorScheme="blue"
//                                 onClick={() => handleSaveOrder('PENDING')}
//                                 disabled={!canSaveOrder || isSubmitting}
//                                 loading={isSubmitting} />
//                         </HStack>
//                     </Row>
//                 </VStack>
//             </Box >
//         </Col >
//     );
// }

// export default CreateOrder;
// // --- END OF FILE CreateOrder.tsx (Corrected) ---