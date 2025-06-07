import React, { use, useEffect, useState } from "react";
import { Box, Flex, Heading, Tabs } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import GeneralInfoForm from "../components/GeneralInfoForm";
import AttributeForm from "../components/AttributeForm";
import DiscountForm from "../components/DiscountForm";
import CustomButton from "../../../components/CustomButton";
import api from "../../../api";
import { toast } from "sonner";
import { Product } from "../../../types/product.type";

export default function CreateProductPage() {
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product>({
        id: 0,
        prod_name: '',
        unit: '',
        prod_type: '',
        category: '',
        prod_price: 0,
        prod_cost_price: 0,
        taxes: 0,
        barcode: 0,
        attributes: []
    })
    const [isGeneralInfoValid, setIsGeneralInfoValid] = useState<boolean>(true)

    const handelGeneralInfo = (data) => {
        setProduct(prev => ({
            ...prev,
            ...data
        }))
    }

    const handelAttribute = (data) => {
        setProduct(prev => ({
            ...prev,
            attributes: data.attributes,
        }))
    }

    const handelAddProduct = () => {
        if (!isGeneralInfoValid) {
            toast.error('Create Product unsuccessfully.')
            return
        }
        else addProduct()
    }

    const addProduct = () => {
        const productDataToSend: Product = {
            id: product.id,
            prod_name: product.prod_name,
            category: product.category,
            unit: product.unit,
            prod_type: product.prod_type,
            prod_price: product.prod_price,
            prod_cost_price: product.prod_cost_price,
            taxes: product.taxes,
            barcode: product.barcode,
            attributes: product.attributes?.filter(attr => {
                return Number(attr.id) > 0 && attr.attribute_id !== null
            })
                .map(attr => {
                    return {
                        id: attr.id,
                        value: attr.value,
                        default_extra_price: Number(attr.default_extra_price),
                        color: attr.color,
                        attribute_id: attr.attribute_id
                    }
                })
        }

        api.post('/api/products/', productDataToSend)
            .then((res) => {
                if (res.status === 201) {
                    toast.success('Added successfully.')
                    navigate('/products/')
                }
            })
    }

    return (
        <Box p={5}>
            <Heading size="lg" mb={5}>Create New Product</Heading>
            <Tabs.Root defaultValue={"general"} variant={'line'}>
                <Tabs.List>
                    <Tabs.Trigger value="general">General Info</Tabs.Trigger>
                    <Tabs.Trigger value="attribute">Attribute</Tabs.Trigger>
                    {/* <Tabs.Trigger value="discount">Discount</Tabs.Trigger> */}
                </Tabs.List>

                <Tabs.Content value="general">
                    <GeneralInfoForm
                        onSendGeneralInfo={handelGeneralInfo}
                        onValidityChange={setIsGeneralInfoValid} />
                </Tabs.Content>
                <Tabs.Content value="attribute">
                    <AttributeForm onSendAttribute={handelAttribute} />
                </Tabs.Content>
                {/* <Tabs.Content value="discount">
                    <DiscountForm />
                </Tabs.Content> */}
            </Tabs.Root>

            <Flex justify="flex-end" mt={5} gap={3}>
                <CustomButton label="Save" onClick={handelAddProduct} />
                <Link to={'/products/'}>
                    <CustomButton label='Cancel' color='blue.900' background='gray.300' />
                </Link>
            </Flex>
        </Box>
    );
}
