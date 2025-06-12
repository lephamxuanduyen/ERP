// --- START OF FILE CreateOrder.tsx ---
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Input, Table, IconButton, Spinner, HStack, VStack, Icon, Button, SimpleGrid, Field, Link as ChakraLink, Flex } from '@chakra-ui/react';
import { Select, AsyncSelect } from 'chakra-react-select';
import { toast } from 'sonner';
import api from '../../../api'; // CHECK PATH
import { Row } from '../../../components/Row'; // CHECK PATH
import { Col } from '../../../components/Col';   // CHECK PATH
import CustomButton from '../../../components/CustomButton'; // CHECK PATH
import Title from '../../../components/Title'; // CHECK PATH
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose, AiOutlineFlag } from 'react-icons/ai';
import { FaChevronRight } from "react-icons/fa";
import CustomInput from "../../../components/CustomInput"; // CHECK PATH & ensure compatibility
import { Customer } from "../../../types/customers.type"; // CHECK PATH
import { ProductVariant } from "../../../types/product.type"; // CHECK PATH
import { Discount } from "../../../types/discount.type"; // CHECK PATH
import { OrderDetailItem as OrderDetailItemType } from "../../../types/order.type"; // CHECK PATH, Renamed to avoid conflict
import { StockInfo } from "../../../types/stock.type"; // CHECK PATH

interface UnitOption {
    id: number;
    unit_name: string;
}

// Enhanced OrderDetailItem to include loading state for stock and potentially unit_id
interface OrderDetailItem extends OrderDetailItemType {
    key: string; // For React list key
    variant_name?: string;
    price: number;
    applied_discount_id: number | null;
    discount_amount: number;
    stock_balance: number | null;
    isLoadingStock?: boolean;
    // unit_id might already be in OrderDetailItemType, if not, add it:
    unit_id?: number;
}


const CreateOrder = () => {
    const navigate = useNavigate();

    // --- State ---
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
    const [orderSuccessfullySaved, setOrderSuccessfullySaved] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerOptions, setCustomerOptions] = useState<{ label: string, value: number, customer: Customer }[]>([]);
    const [customerPhoneNumberInput, setCustomerPhoneNumberInput] = useState('');

    const [orderDetails, setOrderDetails] = useState<OrderDetailItem[]>([]);
    const [productVariantOptions, setProductVariantOptions] = useState<{ label: string, value: number, variant: ProductVariant }[]>([]);
    const [availableDiscounts, setAvailableDiscounts] = useState<Map<number, Discount[]>>(new Map());
    const [unitOptions, setUnitOptions] = useState<{ label: string; value: number; unit: UnitOption }[]>([]);
    const [isUnitLoading, setIsUnitLoading] = useState(false);

    const [overallDiscount, setOverallDiscount] = useState<Discount | null>(null);
    const [overallCoupon, setOverallCoupon] = useState<any | null>(null); // Define type for coupon if available

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomerLoading, setIsCustomerLoading] = useState(false);
    const [isProductLoading, setIsProductLoading] = useState(false);

    const MOCKED_EMPLOYEE_ID = 1; // IMPORTANT: Replace with actual logged-in employee ID logic

    // --- Effects ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsCustomerLoading(true);
            setIsProductLoading(true);
            setIsUnitLoading(true)
            try {
                const [customersRes, productsRes, unitsRes] = await Promise.all([
                    api.get('/api/customers/?limit=1000'),
                    api.get('/api/variants/?limit=1000'),
                    api.get('/api/units/?limit=100')
                ]);

                const customerOpts = customersRes.data.results.map((c: Customer) => ({
                    label: `${c.cus_name} (${c.cus_phone})`,
                    value: c.id,
                    customer: c,
                }));
                setCustomerOptions(customerOpts);

                const productOpts = productsRes.data.results.map((p: ProductVariant) => ({
                    label: `${p.variant_name || `Variant ${p.id}`} (ID: ${p.id})`, // Fallback for variant_name
                    value: p.id,
                    variant: p,
                }));
                setProductVariantOptions(productOpts);

                const unitData = unitsRes.data.results.map((u: any) => ({ // Thay 'any' bằng UnitOption interface
                    label: u.unit_name || `Unit ${u.id}`, // Giả sử unit có unit_name
                    value: u.id,
                    unit: u,
                }));
                setUnitOptions(unitData);

            } catch (error) {
                toast.error('Failed to load initial data.');
                console.error(error);
            } finally {
                setIsCustomerLoading(false);
                setIsProductLoading(false);
                setIsUnitLoading(false)
            }
        };
        fetchInitialData();
    }, []);


    // --- Handlers for Customer Selection ---
    const loadCustomerOptionsByName = useCallback(async (inputValue: string) => {
        if (!inputValue || inputValue.trim().length < 2) return [];
        setIsCustomerLoading(true);
        try {
            const response = await api.get(`/api/customers/?cus_name__icontains=${encodeURIComponent(inputValue.trim())}&limit=20`);
            return response.data.results.map((c: Customer) => ({
                label: `${c.cus_name} (${c.cus_phone})`,
                value: c.id,
                customer: c,
            }));
        } catch (error) {
            console.error("Failed to search customers by name:", error);
            return [];
        } finally {
            setIsCustomerLoading(false);
        }
    }, []);

    const handleCustomerSelectChange = useCallback((selectedOption: any) => {
        if (selectedOption?.customer) {
            setSelectedCustomer(selectedOption.customer);
            setCustomerPhoneNumberInput(selectedOption.customer.cus_phone);
        } else {
            setSelectedCustomer(null);
            setCustomerPhoneNumberInput('');
        }
    }, []);

    const fetchCustomerByPhone = useCallback(async (phone: string) => {
        const trimmedPhone = phone.trim();
        if (!trimmedPhone || trimmedPhone.length < 7) return;
        setIsCustomerLoading(true);
        try {
            const response = await api.get(`/api/customers/?cus_phone=${encodeURIComponent(trimmedPhone)}`);
            const customersFound: Customer[] = response.data.results;
            if (customersFound && customersFound.length > 0) {
                const customerToSelect = customersFound[0];
                setSelectedCustomer(customerToSelect);
                setCustomerPhoneNumberInput(customerToSelect.cus_phone);
                toast.success(`Customer '${customerToSelect.cus_name}' selected.`);
            } else {
                toast.info(`No customer found with phone: ${trimmedPhone}.`);
                // setSelectedCustomer(null); // Optional: clear if no match, current behavior keeps old selection
            }
        } catch (error) {
            console.error("Failed to fetch customer by phone:", error);
            toast.error("Error fetching customer by phone.");
        } finally {
            setIsCustomerLoading(false);
        }
    }, []);

    const handlePhoneInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value;
        setCustomerPhoneNumberInput(newPhone);
        if (selectedCustomer && selectedCustomer.cus_phone !== newPhone) {
            setSelectedCustomer(null);
        }
    }, [selectedCustomer]);

    const handlePhoneInputConfirm = useCallback(() => {
        if (customerPhoneNumberInput.trim() && (!selectedCustomer || selectedCustomer.cus_phone !== customerPhoneNumberInput.trim())) {
            fetchCustomerByPhone(customerPhoneNumberInput);
        }
    }, [customerPhoneNumberInput, selectedCustomer, fetchCustomerByPhone]);

    // --- Handlers for Product Table ---
    const addProductToOrder = useCallback(() => {
        setOrderDetails(prev => [
            ...prev,
            {
                key: Date.now().toString(),
                variant_id: null,
                qty: 1,
                price: 0,
                applied_discount_id: null,
                discount_amount: 0,
                total: 0,
                stock_balance: null,
                isLoadingStock: false,
                unit_id: 0,
                // unit_id: undefined, // Initialize if needed
            }
        ]);
    }, []);

    const removeProductFromOrder = useCallback((itemKey: string) => {
        setOrderDetails(prev => prev.filter(item => item.key !== itemKey));
    }, []);

    const fetchStockAndDiscounts = useCallback(async (itemKey: string, variantId: number) => {
        console.log(variantId)
        if (!variantId) return;
        setOrderDetails(prev => prev.map(item => item.key === itemKey ? { ...item, isLoadingStock: true, stock_balance: null, applied_discount_id: null } : item));

        let newStockBalance = 0;
        let fetchedDiscounts: Discount[] = [];
        let unitIdFromStock = undefined;

        // Fetch Stock
        try {
            const stockRes = await api.get(`/api/quantity_by_attribute/?variant_id=${variantId}`);
            const stockData: StockInfo | undefined = stockRes.data?.[0];
            newStockBalance = stockData?.balance ?? 0;
            // unitIdFromStock = stockData?.unit_id;
            console.log(`Stock for variant ${variantId}:`, stockData);
        } catch (error) {
            console.error(`Failed to fetch stock for variant ${variantId}:`, error);
            toast.error(`Failed to fetch stock for variant ${variantId}.`);
            // newStockBalance vẫn là 0
        }

        // Fetch Discounts (vẫn chạy dù stock có lỗi hay không)
        try {
            const discountRes = await api.get(`/api/discounts/?prod_id=${variantId}&limit=100`);
            fetchedDiscounts = discountRes.data.results || [];
            console.log(`Discounts for variant ${variantId}:`, fetchedDiscounts);
            setAvailableDiscounts(prevMap => new Map(prevMap).set(variantId, fetchedDiscounts));
        } catch (error) {
            console.error(`Failed to fetch discounts for variant ${variantId}:`, error);
            toast.error(`Failed to fetch discounts for variant ${variantId}.`);
            // fetchedDiscounts vẫn là mảng rỗng
            setAvailableDiscounts(prevMap => new Map(prevMap).set(variantId, []));
        }

        // Cập nhật orderDetails
        setOrderDetails(prevDetails => prevDetails.map(item => {
            if (item.key === itemKey) {
                let newAppliedDiscountId = item.applied_discount_id;
                let newDiscountAmount = item.discount_amount;

                // Nếu discount API lỗi hoặc không có discount, xóa lựa chọn discount hiện tại
                if (fetchedDiscounts.length === 0) {
                    newAppliedDiscountId = null;
                    newDiscountAmount = 0;
                } else {
                    // Kiểm tra xem discount đã chọn có còn trong danh sách mới không
                    const currentAppliedDiscountStillExists = fetchedDiscounts.some(d => d.id === newAppliedDiscountId);
                    if (!currentAppliedDiscountStillExists) {
                        newAppliedDiscountId = null; // Nếu không còn, xóa lựa chọn
                        newDiscountAmount = 0;
                    }
                }

                const newTotal = (Number(item.qty) * item.price) - newDiscountAmount; // Cần tính lại total nếu discount thay đổi

                return {
                    ...item,
                    stock_balance: newStockBalance,
                    isLoadingStock: false,
                    // unit_id: unitIdFromStock || item.unit_id || 1,
                    applied_discount_id: newAppliedDiscountId,
                    discount_amount: newDiscountAmount,
                    total: Math.max(0, newTotal)
                };
            }
            return item;
        }));

    }, []); // Thêm dependencies

    const handleGoToPayment = () => {
        if (!createdOrderId) {
            toast.error("Order has not been saved yet or ID is missing.");
            return;
        }
        if (!selectedCustomer) { // Kiểm tra thêm khách hàng nếu cần thiết cho trang payment
            toast.error("Customer information is missing for payment.");
            return;
        }
        // Điều hướng đến trang thanh toán với ID đơn hàng
        navigate(`/orders/payment/${createdOrderId}`, {
            state: { // Truyền dữ liệu cần thiết cho trang PaymentPage
                orderId: createdOrderId,
                totalAmount: grandTotal, // Gửi tổng tiền hiện tại
                customerName: selectedCustomer?.cus_name, // Tên khách hàng (tùy chọn)
                orderCode: `ORDER-${createdOrderId}` // Mã đơn hàng ví dụ
                // Bạn có thể truyền thêm payment_method mặc định nếu cần
            }
        });
    };

    const updateOrderDetail = useCallback(async (itemKey: string, field: keyof OrderDetailItem, value: any) => {
        let needsRecalculate = false;
        let newOrderDetails = orderDetails.map(item => {
            if (item.key === itemKey) {
                needsRecalculate = true;
                return { ...item, [field]: value };
            }
            return item;
        });

        const currentItem = newOrderDetails.find(i => i.key === itemKey);
        if (!currentItem) return;

        if (field === 'variant_id') {
            if (value) { // A variant was selected
                const selectedProductOption = productVariantOptions.find(opt => opt.value === value);
                if (selectedProductOption) {
                    const variant = selectedProductOption.variant;
                    newOrderDetails = newOrderDetails.map(item =>
                        item.key === itemKey ? {
                            ...item,
                            price: variant.variant_price,
                            variant_name: variant.variant_name || `Variant ${variant.id}`,
                            applied_discount_id: null,
                            discount_amount: 0,
                            stock_balance: null,
                            isLoadingStock: true,
                            // unit_id: variant.unit_id // If variant has unit_id
                        } : item
                    );
                    setOrderDetails(newOrderDetails); // Update UI to show loading for stock
                    await fetchStockAndDiscounts(itemKey, value);
                    // After fetch, orderDetails is updated again, so we need to re-get it or merge carefully
                    // For now, the final calculation step will use the latest orderDetails from state
                    return; // Exit early, final recalculation will happen due to state change from fetchStockAndDiscounts
                }
            } else { // Variant was cleared
                newOrderDetails = newOrderDetails.map(item =>
                    item.key === itemKey ? {
                        ...item,
                        price: 0,
                        variant_name: undefined,
                        qty: 1, // Reset qty
                        applied_discount_id: null,
                        discount_amount: 0,
                        total: 0,
                        stock_balance: null,
                        isLoadingStock: false,
                    } : item
                );
            }
        } else if (field === 'qty' && currentItem.variant_id) {
            // If qty changes, we might need to re-evaluate stock or quantity-based discounts.
            // For stock, the `canSaveOrder` check handles it at submission.
            // If discounts depend on quantity, that logic would be in the recalculation step.
            // Currently, fetchStockAndDiscounts is not recalled here for performance,
            // assuming stock doesn't change *that* fast during order creation for the same item.
        }

        // Recalculate totals if a relevant field changed
        if (needsRecalculate || field === 'applied_discount_id' || field === 'qty') {
            const finalDetails = newOrderDetails.map(item => {
                if (item.key === itemKey) { // Only recalculate the changed item or all items if needed
                    let itemDiscountAmount = 0;
                    const qtyNum = Number(item.qty) || 0;
                    if (item.applied_discount_id && item.variant_id && item.price > 0 && qtyNum > 0) {
                        const discountsForVariant = availableDiscounts.get(item.variant_id);
                        const chosenDiscount = discountsForVariant?.find(d => d.id === item.applied_discount_id);
                        if (chosenDiscount) {
                            if (chosenDiscount.promotion_value_type === 'PERCENTAGE') {
                                itemDiscountAmount = (item.price * qtyNum) * (chosenDiscount.promotion_value / 100);
                            } else if (chosenDiscount.promotion_value_type === 'FIX') {
                                itemDiscountAmount = chosenDiscount.promotion_value; // Assuming per line item
                            }
                        }
                    }
                    const itemTotal = (qtyNum * item.price) - itemDiscountAmount;
                    return { ...item, discount_amount: itemDiscountAmount, total: Math.max(0, itemTotal) };
                }
                return item;
            });
            setOrderDetails(finalDetails);
        } else {
            setOrderDetails(newOrderDetails); // If no recalculation needed, just set the direct field update
        }
    }, [orderDetails, productVariantOptions, availableDiscounts, fetchStockAndDiscounts]);

    const loadProductOptions = useCallback(async (inputValue: string) => {
        if (!inputValue || inputValue.trim().length < 2) return productVariantOptions.slice(0, 10);
        setIsProductLoading(true);
        try {
            const response = await api.get(`/api/variants/?variant_name__icontains=${encodeURIComponent(inputValue.trim())}&limit=20`);
            return response.data.results.map((p: ProductVariant) => ({
                label: `${p.variant_name || `Variant ${p.id}`} (ID: ${p.id})`,
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

    // --- Totals Calculation ---
    const grandTotal = orderDetails.reduce((acc, item) => acc + (item.total || 0), 0);

    // --- Form Submission ---
    const canSaveOrder =
        selectedCustomer &&
        orderDetails.length > 0 &&
        orderDetails.every(item =>
            item.variant_id &&
            Number(item.qty) > 0 &&
            (item.isLoadingStock === false && item.stock_balance !== null && item.stock_balance >= Number(item.qty))
        );

    const handleSaveOrder = async (status: 'PENDING' | 'COMPLETE' = 'PENDING') => {
        if (!selectedCustomer) {
            toast.error("Please select a customer.");
            return;
        }
        const validOrderDetails = orderDetails.filter(item => item.variant_id && Number(item.qty) > 0);
        if (validOrderDetails.length === 0) {
            toast.error("Please add at least one product with a valid quantity.");
            return;
        }

        const outOfStockItems = validOrderDetails.filter(
            item => item.stock_balance !== null && !item.isLoadingStock && item.stock_balance < Number(item.qty)
        );
        if (outOfStockItems.length > 0) {
            const itemNames = outOfStockItems.map(item => item.variant_name || `Variant ID ${item.variant_id}`).join(', ');
            toast.error(`Insufficient stock for: ${itemNames}. Please adjust quantities.`);
            return;
        }

        // Check for items still loading stock
        if (orderDetails.some(item => item.isLoadingStock)) {
            toast.info("Stock information is still loading for some items. Please wait.");
            return;
        }

        setIsSubmitting(true);
        const payload = {
            total_amount: grandTotal,
            // payment_method: 'CASH', // Default
            // status: status,
            customer: selectedCustomer.id,
            coupon: overallCoupon ? overallCoupon.id : null,
            discount: overallDiscount ? overallDiscount.id : null, // Order-level discount
            order_details: validOrderDetails.map(item => ({
                variant: item.variant_id,
                qty: Number(item.qty),
                total: item.total,
                unit: item.unit_id || 1, // CRITICAL: Replace '1' with actual unit_id logic
            })),
        };
        console.log("Submitting Order Payload:", payload);

        try {
            const response = await api.post('/api/orders/', payload);
            if (response.status === 201) {
                toast.success('Order created successfully!');
                setCreatedOrderId(response.data.id)
                setOrderSuccessfullySaved(true)
            } else {
                toast.error(response.data?.message || 'Failed to create order.');
            }
        } catch (err: any) {
            console.error("Error creating order:", err.response?.data || err.message);
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                Object.entries(errorData).forEach(([key, value]) => {
                    const messages = Array.isArray(value) ? value.join('; ') : String(value);
                    toast.error(`${key === 'detail' ? '' : key + ': '}${messages}`);
                });
            } else if (err.message) {
                toast.error(err.message);
            } else {
                toast.error('An unknown error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Col gap="30px" p={{ base: 4, md: 6 }}>
            <Row justifyContent="space-between" alignItems="center" mb={6}>
                <Title label="CREATE NEW ORDER" />
                <CustomButton
                    label='Go to Payment'
                    onClick={handleGoToPayment}
                    leftIcon={<FaChevronRight />}
                    disabled={!createdOrderId || isSubmitting}
                />
            </Row>

            <Box bg="white" p={6} borderRadius="xl" boxShadow="0 4px 12px 0 rgba(0,0,0,0.07)">
                <VStack align="stretch">
                    {/* Customer Information */}
                    <Box>
                        <Heading size="md" mb={4}>Customer Information</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} alignItems="flex-end" gap={30}>
                            <Field.Root id="customer-id-display-group">
                                <Field.Label>ID:</Field.Label>
                                <CustomInput
                                    value={selectedCustomer ? `#${String(selectedCustomer.id).padStart(5, '0')}` : ''}
                                    readOnly
                                    tabIndex={-1}
                                    bg="gray.50"
                                />
                            </Field.Root>
                            <Field.Root id="customer-name-select-group">
                                <Field.Label>Name (Search or Select):</Field.Label>
                                <AsyncSelect
                                    name="customerName"
                                    placeholder="Type to search by name..."
                                    chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "40px" }) }}
                                    isClearable
                                    cacheOptions
                                    defaultOptions={customerOptions}
                                    loadOptions={loadCustomerOptionsByName}
                                    onChange={handleCustomerSelectChange}
                                    isLoading={isCustomerLoading && !customerPhoneNumberInput}
                                    value={selectedCustomer ? { label: `${selectedCustomer.cus_name} (${selectedCustomer.cus_phone})`, value: selectedCustomer.id, customer: selectedCustomer } : null}
                                    onInputChange={(inputValue, { action }) => {
                                        if (action === 'clear' && !customerPhoneNumberInput.trim()) {
                                            setSelectedCustomer(null);
                                        }
                                    }}
                                />
                            </Field.Root>
                            <Field.Root id="customer-phone-input-group">
                                <Field.Label>Phone (Enter to find):</Field.Label>
                                <HStack>
                                    <CustomInput
                                        placeholder="Enter exact phone number"
                                        value={customerPhoneNumberInput}
                                        onChange={handlePhoneInputChange}
                                        onBlur={handlePhoneInputConfirm}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handlePhoneInputConfirm();
                                            }
                                        }}
                                    />
                                    {isCustomerLoading && !!customerPhoneNumberInput.trim() && <Spinner size="sm" />}
                                </HStack>
                            </Field.Root>
                        </SimpleGrid>
                    </Box>

                    {/* Products */}
                    <Box>
                        <Heading size="md" mb={4}>Products</Heading>
                        <Table.Root size="sm">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Product</Table.ColumnHeader>
                                    <Table.ColumnHeader width="80px">Qty</Table.ColumnHeader>
                                    <Table.ColumnHeader>Price</Table.ColumnHeader>
                                    <Table.ColumnHeader>Unit</Table.ColumnHeader>
                                    <Table.ColumnHeader>Discount</Table.ColumnHeader>
                                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="center" width="60px">Stock</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="center" width="60px">Action</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {orderDetails.map((item) => (
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
                                                onChange={(option: any) => updateOrderDetail(item.key, 'variant_id', option ? option.value : null)}
                                                chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "36px" }) }}
                                                menuPlacement="auto"
                                            />
                                        </Table.Cell>
                                        <Table.Cell p={1}>
                                            <Input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => updateOrderDetail(item.key, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                                                min={1}
                                                size="sm"
                                                textAlign="right"
                                            />
                                        </Table.Cell>
                                        <Table.Cell p={1}>{item.price > 0 ? item.price.toLocaleString() : '-'}</Table.Cell>
                                        <Table.Cell>
                                            <Select // Sử dụng Select từ chakra-react-select
                                                name={`unit-${item.key}`}
                                                placeholder="Unit"
                                                options={unitOptions} // Danh sách unit đã fetch
                                                value={item.unit_id ? unitOptions.find(opt => opt.value === item.unit_id) : null}
                                                onChange={(option: any) => updateOrderDetail(item.key, 'unit_id', option ? option.value : null)}
                                                isDisabled={!item.variant_id} // Chỉ enable khi đã chọn sản phẩm
                                                size="sm"
                                                chakraStyles={{ control: (provided) => ({ ...provided, minHeight: "36px" }) }}
                                                menuPlacement="auto"
                                            />
                                        </Table.Cell>
                                        <Table.Cell minW="200px" p={1}>
                                            <Select
                                                name={`discount-${item.key}`}
                                                placeholder={availableDiscounts ? "Select a discount" : "No discount"}
                                                isClearable
                                                options={item.variant_id ? (availableDiscounts.get(item.variant_id) || []).map(d => ({ label: d.discount_name, value: d.id })) : []}
                                                value={item.applied_discount_id && item.variant_id && (availableDiscounts.get(item.variant_id) || []).length > 0 ?
                                                    (availableDiscounts.get(item.variant_id) || []).map(d => ({ label: d.discount_name, value: d.id })).find(opt => opt.value === item.applied_discount_id)
                                                    : null
                                                }
                                                onChange={(option: any) => updateOrderDetail(item.key, 'applied_discount_id', option ? option.value : null)}
                                                isDisabled={!item.variant_id || (availableDiscounts.get(item.variant_id || 0)?.length || 0) === 0}
                                                size="sm"
                                                menuPlacement="auto"
                                            />
                                        </Table.Cell>
                                        <Table.Cell p={1}>{item.total > 0 ? item.total.toLocaleString() : '-'}</Table.Cell>
                                        <Table.Cell textAlign="center" p={1}>
                                            {item.isLoadingStock ? <Spinner size="xs" /> :
                                                item.variant_id && item.stock_balance !== null && (
                                                    <Flex>
                                                        <Icon
                                                            as={AiOutlineFlag}
                                                            color={item.stock_balance >= Number(item.qty) ? 'green.500' : 'red.500'}
                                                            boxSize={5} />
                                                        <Text>{item.stock_balance}</Text>
                                                    </Flex>
                                                )
                                            }
                                        </Table.Cell>
                                        <Table.Cell textAlign="center" p={1}>
                                            <IconButton
                                                aria-label="Remove product"
                                                fontSize="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => removeProductFromOrder(item.key)}
                                            >
                                                <AiOutlineClose />
                                            </IconButton>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                        <HStack mt={4} >
                            <Text onClick={addProductToOrder} fontSize="sm" color="green" textDecor={'underline'}>
                                Add a Product
                            </Text>
                        </HStack>
                    </Box>

                    {/* Order Summary & Actions */}
                    <Row justifyContent="flex-end" alignItems="center" pt={6} borderTopWidth="1px" mt={6}>
                        <Text fontWeight="bold" mr={6} fontSize="lg">Total: {grandTotal.toLocaleString()}</Text>
                        <HStack>
                            <CustomButton
                                label="Cancel"
                                variant="outline"
                                onClick={() => navigate('/orders')}
                            />
                            <CustomButton
                                label="Save Order"
                                colorScheme="blue" // Or your primary color
                                onClick={() => handleSaveOrder('PENDING')}
                                disabled={!canSaveOrder || isSubmitting || orderSuccessfullySaved}
                                loading={isSubmitting}
                            />
                        </HStack>
                    </Row>
                </VStack>
            </Box >
        </Col >
    );
}

export default CreateOrder;
// --- END OF FILE CreateOrder.tsx ---