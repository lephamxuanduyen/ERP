import React, { useEffect, useState } from 'react'
import { Select, CreatableSelect } from 'chakra-react-select'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../api'
import { toast } from 'sonner'
import { Col } from '../../../components/Col'
import Title from '../../../components/Title'
import { Box, Button, Field, Input, Stack, Table, Text } from '@chakra-ui/react'
import CustomInput from '../../../components/CustomInput'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Row } from '../../../components/Row'
import CustomButton from '../../../components/CustomButton'
import { AiOutlineClose } from "react-icons/ai";

const discountTypeOptions = [
    { value: 'DISCOUNT', label: 'Discount' },
    { value: 'BUY_X_GET_Y', label: 'Buy X Get Y' }
]

const promotionValueTypeOptions = [
    { value: 'FIX', label: 'Fixed Amount' },
    { value: 'PERCENTAGE', label: 'Percentage' }
]

export const AddDiscount = () => {
    const navigate = useNavigate()

    useEffect(() => {
        getVariant()
    }, [])

    const [formData, setFormData] = useState({
        discount_name: '',
        discount_type: 'DISCOUNT',
        start_date: '',
        end_date: '',
        usage_limit: '',
        promotion_value: '',
        promotion_value_type: 'PERCENTAGE'
    })

    const [variants, setVariant] = useState<{ value: number, label: string }[]>([])

    const [conditions, setConditions] = useState([
        { min_purchase_qty: 0, min_purchase_amount: 0, discount: '' }
    ])

    const [giftProducts, setGiftProducts] = useState([
        { variant_id: '', qty: '' }
    ])

    const getVariant = () => {
        api.get('/api/variants/?limit=10000')
            .then(res => res.data.results)
            .then(data => {
                const options = data.map(variant => ({
                    value: variant.id,
                    label: variant.variant_name
                }))
                setVariant(options)
            })
            .catch(err => toast.error(err))
    }

    const searchVariants = (name: string) => {
        api.get(`/api/variants/?name=${name}&?limit=10000`)
            .then(res => res.data.results)
            .then(data => {
                const options = data.map(variant => ({
                    value: variant.id,
                    label: variant.name
                }))
                setVariant(options)
            })
            .catch(err => toast.error(err))
    }

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleGiftChange = (index: number, name: string, value: any) => {
        const newGifts = [...giftProducts]
        newGifts[index][name] = value
        setGiftProducts(newGifts)
    }

    const handleConditionChange = (index: number, name: string, value: any) => {
        const newConditions = [...conditions]
        newConditions[index][name] = value
        setConditions(newConditions)
    }

    const addGiftProduct = () => {
        setGiftProducts([...giftProducts, { variant_id: '', qty: '' }])
    }

    const removeGiftProduct = (index: number) => {
        const newGifts = giftProducts.filter((_, i) => i !== index)
        setGiftProducts(newGifts)
    }

    const addCondition = () => {
        setConditions([...conditions, { min_purchase_qty: 0, min_purchase_amount: 0, discount: '' }])
    }

    const removeCondition = (index: number) => {
        const newConditions = conditions.filter((_, i) => i !== index)
        setConditions(newConditions)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const payload = {
            ...formData,
            usage_limit: Number(formData.usage_limit),
            promotion_value: Number(formData.promotion_value),
            conditions: conditions ? conditions.map((c) => ({
                min_purchase_qty: Number(c.min_purchase_qty),
                min_purchase_amount: Number(c.min_purchase_amount),
                discount: Number(c.discount)
            })) : [],
            gift_products:
                formData.discount_type === 'BUY_X_GET_Y'
                    ? giftProducts.map((g) => ({
                        variant_id: Number(g.variant_id),
                        qty: Number(g.qty)
                    })) : []
        }
        api.post('/api/discounts/', payload)
            .then((res) => {
                if (res.status === 201) {
                    toast.success('Discount created successfully.')
                    navigate('/promotion/discount')
                } else toast.error('Create failed.')
            })
            .catch(err => toast.error(err))
    }

    // Define today at the beginning of the day (00:00:00)
    const todayAtBeginning = new Date();
    todayAtBeginning.setHours(0, 0, 0, 0);

    return (
        <Col gap='30px'>
            <Title label='Create New Discount' />
            <Stack gap={10}>
                <Box>
                    <Text fontWeight="bold" mb={2}>
                        Conditions
                    </Text>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Minimum Purchase Quantity</Table.ColumnHeader>
                                <Table.ColumnHeader>Minimum Purchase Amount</Table.ColumnHeader>
                                <Table.ColumnHeader></Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {conditions.map((condition, idx) => (
                                <Table.Row key={idx}>
                                    <Table.Cell>
                                        <Field.Root orientation={'horizontal'}>
                                            <CustomInput type='number'
                                                value={condition.min_purchase_qty}
                                                onChange={(e) => handleConditionChange(idx, 'min_purchase_qty', e.target.value)} />
                                        </Field.Root>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Field.Root>
                                            <CustomInput
                                                type="number"
                                                value={condition.min_purchase_amount}
                                                onChange={(e) => handleConditionChange(idx, 'qty', e.target.value)}
                                            />
                                        </Field.Root>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Box onClick={() => removeCondition(idx)} cursor={'pointer'}>
                                            <AiOutlineClose fontSize={'30px'} />
                                        </Box>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                    <Button justifyContent={'start'} size={"sm"} color={'green'} bg={'none'} textDecor={'underline'} mt={3} onClick={addCondition}>Add a line</Button>

                </Box>

                <Box>
                    <Text fontWeight="bold" mb={2}>
                        General Informations
                    </Text>
                    <Stack gap={30}>
                        <Field.Root orientation='horizontal'>
                            <Field.Label>Name:</Field.Label>
                            <CustomInput name="discount_name" value={formData.discount_name} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                        </Field.Root>
                        <Field.Root orientation='horizontal'>
                            <Field.Label>Type:</Field.Label>
                            <Select
                                options={discountTypeOptions}
                                value={discountTypeOptions.find(opt => opt.value === formData.discount_type)}
                                onChange={(option) => handleChange('discount_type', option?.value || '')}
                            />
                        </Field.Root>
                        <Field.Root orientation='horizontal' display={'flex'} justifyContent={'start'}>
                            <Field.Label>Start Date:</Field.Label>
                            <DatePicker
                                selected={formData.start_date ? new Date(formData.start_date) : null}
                                onChange={(date) => handleChange('start_date', date?.toISOString() || null)}
                                showTimeSelect
                                dateFormat="Pp"
                                placeholderText="Select start date"
                                minDate={todayAtBeginning}
                                wrapperClassName="date-picker-wrapper"
                                className="chakra-input"
                            />
                        </Field.Root>
                        <Field.Root orientation='horizontal' display={'flex'} justifyContent={'start'}>
                            <Field.Label>End Date:</Field.Label>
                            <DatePicker
                                selected={formData.end_date ? new Date(formData.end_date) : null}
                                onChange={(date) => handleChange('end_date', date?.toISOString() || null)}
                                showTimeSelect
                                dateFormat="Pp"
                                placeholderText="Select end date"
                                minDate={formData.start_date ? new Date(formData.start_date) : undefined}
                                wrapperClassName="date-picker-wrapper"
                                className="chakra-input"
                            />
                        </Field.Root>
                        <Field.Root orientation='horizontal'>
                            <Field.Label>Usage Limit:</Field.Label>
                            <Input type='number' name="usage_limit" value={formData.usage_limit} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                        </Field.Root>
                        {formData.discount_type !== 'BUY_X_GET_Y' && (
                            <>
                                <Field.Root orientation='horizontal'>
                                    <Field.Label>Value:</Field.Label>
                                    <Input type='number' name="promotion_value" value={formData.promotion_value} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                                </Field.Root>
                                <Field.Root orientation='horizontal'>
                                    <Field.Label>Value Type:</Field.Label>
                                    <Select
                                        options={promotionValueTypeOptions}
                                        value={promotionValueTypeOptions.find(opt => opt.value === formData.promotion_value_type)}
                                        onChange={(option) => handleChange('promotion_value_type', option?.value || '')}
                                    />
                                </Field.Root>
                            </>
                        )}
                    </Stack>
                </Box>

                {formData.discount_type === 'BUY_X_GET_Y' && (
                    <Box>
                        <Text fontWeight="bold" mb={2}>
                            Gift Products
                        </Text>
                        <Stack>
                            <Table.Root>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader>Variant</Table.ColumnHeader>
                                        <Table.ColumnHeader>Quantity</Table.ColumnHeader>
                                        <Table.ColumnHeader></Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {giftProducts.map((gift, idx) => (
                                        <Table.Row key={idx}>
                                            <Table.Cell>
                                                <Field.Root orientation={'horizontal'}>
                                                    <CreatableSelect
                                                        options={variants}
                                                        placeholder="Please select a variant"
                                                        value={variants.find(option => option.value === Number(variants.values))}
                                                        onChange={selectedOption => {
                                                            handleGiftChange(idx, 'variant_id', selectedOption ? String(selectedOption.value) : '')
                                                        }}
                                                        onCreateOption={(inputValue) => {
                                                            searchVariants(inputValue)
                                                            setVariant(variants)
                                                        }}
                                                        isClearable
                                                    />
                                                </Field.Root>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Field.Root>
                                                    <CustomInput
                                                        type="number"
                                                        value={gift.qty}
                                                        onChange={(e) => handleGiftChange(idx, 'qty', e.target.value)}
                                                    />
                                                </Field.Root>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Box onClick={() => removeGiftProduct(idx)} cursor={'pointer'}>
                                                    <AiOutlineClose fontSize={'30px'} />
                                                </Box>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                            {/* <Button justifyContent={'start'} size={"sm"} color={'green'} bg={'none'} textDecor={'underline'} mt={3} onClick={addGiftProduct}>Add a line</Button> */}
                        </Stack>
                    </Box>
                )}
            </Stack>
            <Row justifyContent='flex-end' gap='28px'>
                <CustomButton label='Save' onClick={handleSubmit} />
                <Link to='/promotion/discount'>
                    <CustomButton label='Cancel' color='blue.900' background='gray.300' />
                </Link>
            </Row>
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
