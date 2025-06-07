import React, { useEffect, useState } from "react";
import { Box, createListCollection, Field, Stack, Text, Select as ChakraSelect, Portal, Image, Flex } from "@chakra-ui/react";
import CustomInput from "../../../components/CustomInput";
import { Row } from "../../../components/Row";
import api from "../../../api";
import { Select } from "chakra-react-select"
import { toast } from "sonner";
import { Product } from "../../../types/product.type";
import { noImage } from "../../../assets/image";
import { Col } from "../../../components/Col";

interface Props {
    onSendGeneralInfo: (data: any) => void
    onValidityChange?: (isValid: boolean) => void
    initialData?: Product
}

export default function GeneralInfoForm({ onSendGeneralInfo, onValidityChange, initialData }: Props) {
    const [units, setUnits] = useState<{ value: number, label: string }[]>([])
    const [categories, setcategory] = useState<{ value: number, label: string }[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const [formData, setFormData] = useState({
        prod_name: '',
        unit: '',
        prod_type: '',
        category: '',
        prod_price: 0,
        prod_cost_price: 0,
        taxes: 0,
        barcode: 0,
    })

    const ProductType = [
        { label: "GOOD", value: "GOOD" },
        { label: "SERVICE", value: "SERVICE" },
    ]

    useEffect(() => {
        if (initialData) setFormData(initialData)
    }, [initialData?.id])

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        // Bạn có thể gọi validate cho riêng trường đó ở đây nếu muốn
        // validateField(name, formData[name]);
    };

    useEffect(() => {
        onSendGeneralInfo(formData)
        validate(formData)
    }, [formData])

    useEffect(() => {
        getUnits()
        getCategories()
    }, [])

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [name]: value }
            return updated
        })
    }

    const validate = (data) => {
        const newErrors: { [key: string]: string } = {};
        if (!data.prod_name.trim()) newErrors.prod_name = "This is a requied field.";
        else if (data.prod_name.length > 100) newErrors.prod_name = "Max length is 100 characters";

        if (!data.unit) newErrors.unit = "This is a requied field.";
        if (!data.prod_type) newErrors.prod_type = "This is a requied field.";
        if (!data.category) newErrors.category = "This is a requied field.";

        if (data.prod_price <= 0) newErrors.prod_price = "Price must be greater than 0";
        if (data.prod_cost_price <= 0) newErrors.prod_cost_price = "Cost must be greater than 0";
        if (data.prod_price < data.prod_cost_price) newErrors.prod_price = "Price cannot be smaller than cost";
        if (data.taxes < 0) newErrors.taxes = "Taxes cannot be smaller than 0"

        setErrors(newErrors);
        onValidityChange?.(Object.keys(newErrors).length === 0);
    };


    const getUnits = () => {
        api.get("/api/units/")
            .then((res) => res.data.results)
            .then((data) => {
                const option = data.map(unit => ({
                    value: unit.id,
                    label: unit.unit_name
                }))
                setUnits(option)
            })
            .catch((err) => toast.error(err))
    }

    const getCategories = () => {
        api.get("/api/categories/")
            .then((res) => res.data.results)
            .then((data) => {
                const option = data.map(cate => ({
                    value: cate.id,
                    label: cate.cate_name
                }))
                setcategory(option)
            })
            .catch((err) => toast.error(err))
    }

    return (
        <Box p={5} bg="white" boxShadow={'xl'}>
            <Text fontWeight="bold" mb={4}>General Information</Text>

            <Flex gap={10} pr={50} flexDirection={{ base: "column-reverse", lg: "row" }}>
                <Col w={'100%'}>
                    <Stack>
                        <Field.Root orientation={'horizontal'} required invalid={touched.prod_name && !!errors.prod_name}>
                            <Field.Label w={'80px'}>Name</Field.Label>
                            <CustomInput name="prod_name" value={formData.prod_name || ''}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                onBlur={handleBlur} />
                            {errors.prod_name && <Field.ErrorText>{errors.prod_name}</Field.ErrorText>}
                        </Field.Root>

                        <Field.Root orientation={'horizontal'} required invalid={touched.unit && !!errors.unit}>
                            <Field.Label w={'80px'}>Unit</Field.Label>
                            <Select
                                options={units}
                                placeholder="Please Select a Unit"
                                value={units.find(option => option.value === Number(formData.unit)) || null}
                                onChange={(selectedOption) => handleChange('unit', selectedOption ? String(selectedOption.value) : '')}
                                onBlur={handleBlur}
                            />
                            {errors.unit && <Field.ErrorText>{errors.unit}</Field.ErrorText>}
                        </Field.Root>

                        <Field.Root orientation={'horizontal'} required invalid={touched.prod_type && !!errors.prod_type}>
                            <Field.Label w={'80px'}>Type</Field.Label>
                            <Select
                                options={ProductType}
                                placeholder="Please Select Product Type"
                                value={ProductType.find(option => option.value === (formData.prod_type)) || null}
                                onChange={(selectedOption) => handleChange('prod_type', selectedOption ? String(selectedOption.value) : '')}
                                onBlur={handleBlur}
                            />
                            {errors.prod_type && <Field.ErrorText>{errors.prod_type}</Field.ErrorText>}
                        </Field.Root>

                        <Field.Root orientation={'horizontal'} required invalid={touched.category && !!errors.category}>
                            <Field.Label w={'80px'}>Category</Field.Label>
                            <Select
                                options={categories}
                                placeholder="Please Select a Category"
                                value={categories.find(option => option.value === Number(formData.category)) || null}
                                onChange={(selectedOption) => handleChange('category', selectedOption ? String(selectedOption.value) : '')}
                                onBlur={handleBlur}
                            />
                            {errors.category && <Field.ErrorText>{errors.category}</Field.ErrorText>}
                        </Field.Root>

                        <Field.Root orientation={'horizontal'} invalid={touched.prod_price && !!errors.prod_price}>
                            <Field.Label w={'80px'}>Price</Field.Label>
                            <CustomInput name="prod_price" type="number" value={formData.prod_price || 0}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                onBlur={handleBlur} />
                            {errors.prod_price && <Field.ErrorText>{errors.prod_price}</Field.ErrorText>}
                        </Field.Root>

                        <Field.Root orientation={'horizontal'} invalid={touched.prod_cost_price && !!errors.prod_cost_price}>
                            <Field.Label w={'80px'}>Cost</Field.Label>
                            <CustomInput name="prod_cost_price" type="number" value={formData.prod_cost_price || 0}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                onBlur={handleBlur} />
                            {errors.prod_cost_price && <Field.ErrorText>{errors.prod_cost_price}</Field.ErrorText>}
                        </Field.Root>

                        <Field.Root orientation={'horizontal'}>
                            <Field.Label w={'80px'}>Taxes</Field.Label>
                            <CustomInput name="taxes" type="number" value={formData.taxes || 0}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                onBlur={handleBlur} />
                        </Field.Root>

                        <Field.Root orientation="horizontal">
                            <Field.Label w="80px">Image</Field.Label>
                            <Stack w={'100%'} gap={3}>
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                            </Stack>
                        </Field.Root>


                        <Field.Root orientation={'horizontal'}>
                            <Field.Label>Barcode</Field.Label>
                            <CustomInput name="barcode" value={formData.barcode || 0}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                onBlur={handleBlur} />
                        </Field.Root>
                    </Stack>
                </Col>
                <Image
                    src={previewUrl || noImage}
                    alt={formData.prod_name}
                    maxW="300px"
                    maxH="100%"
                    objectFit="contain"
                    borderRadius="md"
                    border="1px solid #ccc" />
            </Flex>
        </Box>
    );
}
