import React, { useCallback, useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import Title from '../../../components/Title'
import { Box, Button, Center, Field, Spinner, Stack, Table, Text } from '@chakra-ui/react'
import CustomInput from '../../../components/CustomInput'
import CustomButton from '../../../components/CustomButton'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { AiOutlineClose } from "react-icons/ai";
import { CreatableSelect, Select } from 'chakra-react-select'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../../api'
import { toast } from 'sonner'
import { AxiosResponse } from 'axios';

const discountTypeOptions = [
    { value: 'DISCOUNT', label: 'Discount' },
    { value: 'BUY_X_GET_Y', label: 'Buy X Get Y' }
];

const promotionValueTypeOptions = [
    { value: 'FIX', label: 'Fixed Amount' },
    { value: 'PERCENTAGE', label: 'Percentage' }
];

interface Condition {
    id?: number; // Optional: only present for existing conditions
    min_purchase_qty: string | number;
    min_purchase_amount: string | number;
    discount: string | number; // Added based on PromotionCondition model
}

interface GiftProduct {
    id?: number; // Not typically part of GiftProduct for POST/PUT on discount, but good for local key
    variant_id: string | number;
    qty: string | number;
}

interface FormData {
    discount_name: string;
    discount_type: 'DISCOUNT' | 'BUY_X_GET_Y';
    start_date: string | null;
    end_date: string | null;
    usage_limit: string | number;
    promotion_value: string | number;
    promotion_value_type: 'FIX' | 'PERCENTAGE';
}

export const EditDiscount = () => {
    const navigate = useNavigate();
    const { id: discountId } = useParams<{ id: string }>(); // Get discount ID from URL

    const [formData, setFormData] = useState<FormData>({
        discount_name: '',
        discount_type: 'DISCOUNT',
        start_date: null,
        end_date: null,
        usage_limit: '',
        promotion_value: '',
        promotion_value_type: 'PERCENTAGE'
    });

    const [variants, setVariants] = useState<{ value: number, label: string }[]>([]);
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [initialConditions, setInitialConditions] = useState<Condition[]>([]); // To track deletions
    const [giftProducts, setGiftProducts] = useState<GiftProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getVariantOptions = useCallback(() => {
        api.get('/api/variants/?limit=10000')
            .then(res => res.data.results)
            .then(data => {
                const options = data.map((variant: any) => ({
                    value: variant.id,
                    label: variant.variant_name || variant.name // Handle potential naming difference
                }));
                setVariants(options);
            })
            .catch(err => {
                console.error("Error fetching variants:", err)
                toast.error('Failed to fetch product variants.');
            });
    }, []);

    const searchVariants = (name: string) => {
        api.get(`/api/variants/?name=${name}&limit=10000`) // Corrected query param
            .then(res => res.data.results)
            .then(data => {
                const options = data.map((variant: any) => ({
                    value: variant.id,
                    label: variant.variant_name || variant.name
                }));
                setVariants(options); // This might overwrite if not careful, ideally merge or use a different state for search results
            })
            .catch(err => {
                console.error("Error searching variants:", err)
                toast.error('Failed to search product variants.');
            });
    };

    useEffect(() => {
        getVariantOptions();
    }, [getVariantOptions]);

    useEffect(() => {
        if (!discountId) {
            toast.error("Discount ID is missing.");
            setIsLoading(false);
            navigate('/promotion/discount');
            return;
        }

        setIsLoading(true);
        Promise.all([
            api.get(`/api/discounts/${discountId}/`),
            api.get(`/api/condition/?discount=${discountId}&limit=10000`) // Assuming API supports filtering by discount_id
        ])
            .then(([discountRes, conditionsRes]) => {
                const discountData = discountRes.data;
                setFormData({
                    discount_name: discountData.discount_name || '',
                    discount_type: discountData.discount_type || 'DISCOUNT',
                    start_date: discountData.start_date ? new Date(discountData.start_date).toISOString() : null,
                    end_date: discountData.end_date ? new Date(discountData.end_date).toISOString() : null,
                    usage_limit: discountData.usage_limit || '',
                    promotion_value: discountData.promotion_value || '',
                    promotion_value_type: discountData.promotion_value_type || 'PERCENTAGE'
                });

                if (discountData.discount_type === 'BUY_X_GET_Y' && discountData.gift_products) {
                    setGiftProducts(discountData.gift_products.map((gp: any) => ({
                        variant_id: gp.variant_id || gp.variant, // API model shows 'variant' for gift_product
                        qty: gp.qty || ''
                    })));
                } else {
                    setGiftProducts([]);
                }

                const fetchedConditions = conditionsRes.data.results.map((c: any) => ({
                    id: c.id,
                    min_purchase_qty: c.min_purchase_qty || '',
                    min_purchase_amount: c.min_purchase_amount || '',
                    discount: c.discount || '' // Added discount field
                }));

                if (fetchedConditions.length > 0) {
                    setConditions(fetchedConditions);
                    setInitialConditions(JSON.parse(JSON.stringify(fetchedConditions))); // Deep copy for comparison
                } else {
                    // If no conditions, show one empty row
                    const emptyCondition = { min_purchase_qty: '', min_purchase_amount: '', discount: '' };
                    setConditions([emptyCondition]);
                    setInitialConditions([]);
                }
            })
            .catch(err => {
                console.error("Error fetching discount details:", err);
                toast.error('Failed to load discount details.');
                navigate('/promotion/discount');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [discountId, navigate, getVariantOptions]);


    const handleChange = (name: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGiftChange = (index: number, name: keyof GiftProduct, value: any) => {
        const newGifts = [...giftProducts];
        newGifts[index][name] = value;
        setGiftProducts(newGifts);
    };

    const handleConditionChange = (index: number, name: keyof Condition, value: any) => {
        const newConditions = [...conditions];
        newConditions[index][name] = value;
        setConditions(newConditions);
    };

    const addGiftProduct = () => {
        setGiftProducts([...giftProducts, { variant_id: '', qty: '' }]);
    };

    const removeGiftProduct = (index: number) => {
        const newGifts = giftProducts.filter((_, i) => i !== index);
        setGiftProducts(newGifts);
    };

    const addCondition = () => {
        setConditions([...conditions, { min_purchase_qty: '', min_purchase_amount: '', discount: '' }]);
    };

    const removeCondition = (index: number) => {
        // No API call here yet, will be handled during submission by comparing initial and current states
        const newConditions = conditions.filter((_, i) => i !== index);
        setConditions(newConditions);
    };

    const validateForm = () => {
        if (!formData.discount_name.trim()) {
            toast.error("Discount name is required.");
            return false;
        }
        if (formData.usage_limit && Number(formData.usage_limit) < 0) {
            toast.error("Usage limit cannot be negative.");
            return false;
        }
        if (formData.discount_type === 'DISCOUNT') {
            if (!formData.promotion_value && formData.promotion_value !== 0) { // Allow 0 as a value
                toast.error("Promotion value is required for Discount type.");
                return false;
            }
            if (Number(formData.promotion_value) < 0) {
                toast.error("Promotion value cannot be negative.");
                return false;
            }
        }

        for (const condition of conditions) {
            if (condition.min_purchase_qty === '' && condition.min_purchase_amount === '' && condition.discount === '') {
                // Allow entirely empty rows to be ignored, or handle as user wants to remove
                continue;
            }
            if (condition.min_purchase_qty === '') {
                toast.error("Minimum Purchase Quantity is required for all active conditions.");
                return false;
            }
            if (Number(condition.min_purchase_qty) < 0) {
                toast.error("Minimum Purchase Quantity cannot be negative.");
                return false;
            }
            if (condition.min_purchase_amount === '') {
                toast.error("Minimum Purchase Amount is required for all active conditions.");
                return false;
            }
            if (Number(condition.min_purchase_amount) < 0) {
                toast.error("Minimum Purchase Amount cannot be negative.");
                return false;
            }
            if (condition.discount && Number(condition.discount) < 0) {
                toast.error("Condition discount value cannot be negative.");
                return false;
            }
            // Check if at least one value is filled if the row is not completely empty
            if (condition.min_purchase_qty !== '' || condition.min_purchase_amount !== '' || condition.discount !== '') {
                if (condition.min_purchase_qty === '' || condition.min_purchase_amount === '') { // Discount can be empty or 0
                    toast.error("For conditions, both Min Purchase Quantity and Min Purchase Amount are required if the row is not empty.");
                    return false;
                }
            }
        }

        if (formData.discount_type === 'BUY_X_GET_Y') {
            if (giftProducts.length === 0) {
                toast.error("At least one gift product is required for Buy X Get Y type.");
                return false;
            }
            for (const gift of giftProducts) {
                if (!gift.variant_id) {
                    toast.error("Variant is required for all gift products.");
                    return false;
                }
                if (gift.qty === '' || Number(gift.qty) <= 0) {
                    toast.error("Quantity must be a positive number for all gift products.");
                    return false;
                }
            }
        }
        return true;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!discountId) return;
        if (!validateForm()) return;

        const mainDiscountPayload = {
            ...formData,
            usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
            promotion_value: formData.discount_type === 'DISCOUNT' ? Number(formData.promotion_value) : null,
            start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
            end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            gift_products:
                formData.discount_type === 'BUY_X_GET_Y'
                    ? giftProducts.map((g) => ({
                        variant: Number(g.variant_id), // API model for gift_product in Discount shows 'variant'
                        qty: Number(g.qty)
                    }))
                    : []
        };

        // Filter out completely empty conditions before processing
        const activeConditions = conditions.filter(c =>
            !(c.min_purchase_qty === '' && c.min_purchase_amount === '' && c.discount === '')
        );

        try {
            setIsLoading(true);
            // 1. Update main discount details
            await api.put(`/api/discounts/${discountId}/`, mainDiscountPayload);

            // 2. Handle Conditions
            // Explicitly type conditionPromises to hold an array of Promises.
            // Assuming your api calls (api.delete, api.put, api.post) return Promise<AxiosResponse<any, any>>
            const conditionPromises: Promise<AxiosResponse<any, any>>[] = [];
            // If you don't have AxiosResponse imported or want a more generic type, you can use:
            // const conditionPromises: Promise<any>[] = [];

            // Identify conditions to create, update, or delete
            const currentConditionIds = new Set(activeConditions.map(c => c.id).filter(id => id !== undefined));

            // Deletions: conditions in initialConditions but not in activeConditions
            for (const initialCond of initialConditions) {
                if (initialCond.id !== undefined && !currentConditionIds.has(initialCond.id)) {
                    conditionPromises.push(api.delete(`/api/conditions/delete/${initialCond.id}/`));
                }
            }

            for (const condition of activeConditions) {
                // This is the payload that will be sent to the API for POST or PUT
                const conditionPayload = {
                    min_purchase_qty: Number(condition.min_purchase_qty),
                    min_purchase_amount: Number(condition.min_purchase_amount),
                    // Ensure discount is null if empty or not a valid number, or Number(condition.discount)
                    discount: (condition.discount !== '' && condition.discount !== null && !isNaN(Number(condition.discount))) ? Number(condition.discount) : null,
                    discount_id: Number(discountId) // Assuming discount_id is needed for POST/PUT condition
                };

                if (condition.id) { // Existing condition: PUT
                    const originalCondition = initialConditions.find(ic => ic.id === condition.id);

                    // Improved comparison:
                    // Create objects for comparison that normalize the data to how it would be in conditionPayload (numbers and nulls)
                    const originalPayloadEquivalent = originalCondition ? {
                        min_purchase_qty: Number(originalCondition.min_purchase_qty),
                        min_purchase_amount: Number(originalCondition.min_purchase_amount),
                        discount: (originalCondition.discount !== '' && originalCondition.discount !== null && !isNaN(Number(originalCondition.discount))) ? Number(originalCondition.discount) : null,
                    } : null;

                    const currentPayloadEquivalent = {
                        min_purchase_qty: conditionPayload.min_purchase_qty, // Already Number from conditionPayload
                        min_purchase_amount: conditionPayload.min_purchase_amount, // Already Number
                        discount: conditionPayload.discount, // Already Number or null
                    };

                    // Trigger PUT if the original condition is not found (shouldn't happen if id exists) 
                    // OR if the relevant data has changed.
                    if (!originalPayloadEquivalent || JSON.stringify(originalPayloadEquivalent) !== JSON.stringify(currentPayloadEquivalent)) {
                        conditionPromises.push(api.put(`/api/conditions/update/${condition.id}/`, conditionPayload));
                    }
                } else { // New condition: POST
                    conditionPromises.push(api.post('/api/conditions/', conditionPayload));
                }
            }

            // Only await if there are actual promises to process
            if (conditionPromises.length > 0) {
                await Promise.all(conditionPromises);
            }

            toast.success('Discount updated successfully.');
            navigate('/promotion/discount');

        } catch (err: any) {
            console.error("Error updating discount:", err);
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Update failed.';
            if (typeof errorMessage === 'string') {
                toast.error(errorMessage);
            } else if (typeof errorMessage === 'object') {
                // If the error is an object (e.g., validation errors from DRF)
                for (const key in errorMessage) {
                    if (Array.isArray(errorMessage[key])) {
                        errorMessage[key].forEach((msg: string) => toast.error(`${key}: ${msg}`));
                    } else {
                        toast.error(`${key}: ${errorMessage[key]}`);
                    }
                }
            } else {
                toast.error('An unexpected error occurred during update.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !formData.discount_name) { // Show spinner only on initial load
        return (
            <Center h="200px">
                <Spinner size="xl" />
            </Center>
        );
    }

    // Define today at the beginning of the day (00:00:00)
    const todayAtBeginning = new Date();
    todayAtBeginning.setHours(0, 0, 0, 0);

    return (
        <Col gap='30px'>
            <Title label='Edit Discount' />
            <Stack gap={10} as="form" onSubmit={handleSubmit}>
                {/* Conditions Section */}
                <Box>
                    <Text fontWeight="bold" mb={2}>
                        Conditions
                    </Text>
                    <Table.Root variant="outline">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Minimum Purchase Quantity</Table.ColumnHeader>
                                <Table.ColumnHeader>Minimum Purchase Amount</Table.ColumnHeader>
                                <Table.ColumnHeader>Discount Value (optional)</Table.ColumnHeader>
                                <Table.ColumnHeader width="50px"></Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {conditions.map((condition, idx) => (
                                <Table.Row key={condition.id || `new-${idx}`}>
                                    <Table.Cell>
                                        <CustomInput type='number'
                                            value={condition.min_purchase_qty}
                                            onChange={(e) => handleConditionChange(idx, 'min_purchase_qty', e.target.value)}
                                            placeholder="e.g., 2"
                                            min="0"
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <CustomInput
                                            type="number"
                                            value={condition.min_purchase_amount}
                                            onChange={(e) => handleConditionChange(idx, 'min_purchase_amount', e.target.value)}
                                            placeholder="e.g., 100000"
                                            min="0"
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <CustomInput
                                            type="number"
                                            value={condition.discount}
                                            onChange={(e) => handleConditionChange(idx, 'discount', e.target.value)}
                                            placeholder="e.g., 10 (fixed or %)"
                                            min="0"
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        {conditions.length > 0 && ( // Show remove only if there's at least one, or always if you allow removing the last one to have no conditions.
                                            <Box onClick={() => removeCondition(idx)} cursor={'pointer'} display="flex" alignItems="center" justifyContent="center">
                                                <AiOutlineClose fontSize={'20px'} color="red" />
                                            </Box>
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                    <Text color={'green'} fontSize={'sm'} textDecor={'underline'} justifyContent={'start'} mt={3} onClick={addCondition}>+ Add a condition</Text>
                </Box>

                {/* General Informations Section */}
                <Box>
                    <Text fontWeight="bold" mb={2}>
                        General Information
                    </Text>
                    <Stack gap={5}> {/* Reduced gap for denser form */}
                        <Field.Root orientation='horizontal'>
                            <Field.Label minW="120px">Name:</Field.Label>
                            <CustomInput name="discount_name" value={formData.discount_name} onChange={(e) => handleChange('discount_name', e.target.value)} />
                        </Field.Root>
                        <Field.Root orientation='horizontal'>
                            <Field.Label minW="120px">Type:</Field.Label>
                            <Select
                                chakraStyles={{ container: (provided) => ({ ...provided, width: '100%' }) }}
                                options={discountTypeOptions}
                                value={discountTypeOptions.find(opt => opt.value === formData.discount_type)}
                                onChange={(option) => handleChange('discount_type', option?.value || 'DISCOUNT')}
                            />
                        </Field.Root>
                        <Field.Root orientation='horizontal' display={'flex'} alignItems="center">
                            <Field.Label minW="120px">Start Date:</Field.Label>
                            <DatePicker
                                selected={formData.start_date ? new Date(formData.start_date) : null}
                                onChange={(date) => handleChange('start_date', date ? date.toISOString() : null)}
                                showTimeSelect
                                dateFormat="Pp"
                                placeholderText="Select start date"
                                minDate={todayAtBeginning}
                                wrapperClassName="date-picker-wrapper"
                                className="chakra-input" // Apply some basic styling
                            />
                        </Field.Root>
                        <Field.Root orientation='horizontal' display={'flex'} alignItems="center">
                            <Field.Label minW="120px">End Date:</Field.Label>
                            <DatePicker
                                selected={formData.end_date ? new Date(formData.end_date) : null}
                                onChange={(date) => handleChange('end_date', date ? date.toISOString() : null)}
                                showTimeSelect
                                dateFormat="Pp"
                                placeholderText="Select end date"
                                minDate={formData.start_date ? new Date(formData.start_date) : undefined}
                                wrapperClassName="date-picker-wrapper"
                                className="chakra-input"
                            />
                        </Field.Root>
                        <Field.Root orientation='horizontal'>
                            <Field.Label minW="120px">Usage Limit:</Field.Label>
                            <CustomInput type='number' value={formData.usage_limit} onChange={(e) => handleChange('usage_limit', e.target.value)} min="0" />
                        </Field.Root>
                        {formData.discount_type !== 'BUY_X_GET_Y' && (
                            <>
                                <Field.Root orientation='horizontal'>
                                    <Field.Label minW="120px">Value:</Field.Label>
                                    <CustomInput type='number' value={formData.promotion_value} onChange={(e) => handleChange('promotion_value', e.target.value)} min="0" />
                                </Field.Root>
                                <Field.Root orientation='horizontal'>
                                    <Field.Label minW="120px">Value Type:</Field.Label>
                                    <Select
                                        chakraStyles={{ container: (provided) => ({ ...provided, width: '100%' }) }}
                                        options={promotionValueTypeOptions}
                                        value={promotionValueTypeOptions.find(opt => opt.value === formData.promotion_value_type)}
                                        onChange={(option) => handleChange('promotion_value_type', option?.value || 'PERCENTAGE')}
                                    />
                                </Field.Root>
                            </>
                        )}
                    </Stack>
                </Box>

                {/* Gift Products Section (Conditional) */}
                {formData.discount_type === 'BUY_X_GET_Y' && (
                    <Box>
                        <Text fontWeight="bold" mb={2}>
                            Gift Products
                        </Text>
                        <Stack>
                            <Table.Root variant="outline">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader>Variant</Table.ColumnHeader>
                                        <Table.ColumnHeader>Quantity</Table.ColumnHeader>
                                        <Table.ColumnHeader width="50px"></Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {giftProducts.map((gift, idx) => (
                                        <Table.Row key={idx}> {/* Consider a more stable key if gifts have IDs */}
                                            <Table.Cell>
                                                <CreatableSelect
                                                    chakraStyles={{ container: (provided) => ({ ...provided, width: '100%' }) }}
                                                    options={variants}
                                                    placeholder="Select or type to search variant"
                                                    value={variants.find(option => option.value === Number(gift.variant_id))}
                                                    onChange={selectedOption => {
                                                        handleGiftChange(idx, 'variant_id', selectedOption ? String(selectedOption.value) : '')
                                                    }}
                                                    onInputChange={(inputValue) => { // Use onInputChange for search-as-you-type
                                                        if (inputValue.length > 2) { // Trigger search after 3 chars
                                                            searchVariants(inputValue);
                                                        } else if (inputValue.length === 0) {
                                                            getVariantOptions(); // Reset to full list if input cleared
                                                        }
                                                    }}
                                                    isClearable
                                                />
                                            </Table.Cell>
                                            <Table.Cell>
                                                <CustomInput
                                                    type="number"
                                                    value={gift.qty}
                                                    onChange={(e) => handleGiftChange(idx, 'qty', e.target.value)}
                                                    placeholder="e.g., 1"
                                                    min="1"
                                                />
                                            </Table.Cell>
                                            <Table.Cell>
                                                {giftProducts.length > 0 && (
                                                    <Box onClick={() => removeGiftProduct(idx)} cursor={'pointer'} display="flex" alignItems="center" justifyContent="center">
                                                        <AiOutlineClose fontSize={'20px'} color="red" />
                                                    </Box>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                            {giftProducts.length === 0 && (<Text textDecor={'underline'} justifyContent={'start'} fontSize={"sm"} color={'green'} mt={3} onClick={addGiftProduct}>+ Add gift product</Text>)}
                        </Stack>
                    </Box>
                )}

                {/* Action Buttons */}
                <Row justifyContent='flex-end' gap='28px' mt={5}>
                    <CustomButton label='Save Changes' type="submit" loading={isLoading} />
                    <Link to='/promotion/discount'>
                        <CustomButton label='Cancel' color='blue.900' background='gray.300' />
                    </Link>
                </Row>
            </Stack>
            {/* Basic styling for DatePicker input */}
            <style>{`
                .date-picker-wrapper .chakra-input {
                    width: 100%;
                    height: var(--input-height); /* Or your specific height */
                    padding: 0 1rem;
                    border-radius: var(--input-border-radius);
                    border: 1px solid var(--chakra-colors-gray-200);
                }
                .date-picker-wrapper .chakra-input:focus {
                    border-color: var(--chakra-colors-blue-500);
                    box-shadow: 0 0 0 1px var(--chakra-colors-blue-500);
                }
            `}</style>
        </Col >
    )
}
