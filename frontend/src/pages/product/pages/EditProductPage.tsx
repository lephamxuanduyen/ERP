import React, { useEffect, useState } from 'react'
import api from '../../../api'
import { toast } from 'sonner'
import { Box, Flex, Heading, Tabs } from '@chakra-ui/react'
import GeneralInfoForm from '../components/GeneralInfoForm'
import AttributeForm from '../components/AttributeForm'
import CustomButton from '../../../components/CustomButton'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Product } from '../../../types/product.type'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import { BsArrowLeft } from 'react-icons/bs'
import Title from '../../../components/Title'

export const EditProductPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
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
        attributes: [],
        attributes_display: []
    })
    const [isGeneralInfoValid, setIsGeneralInfoValid] = useState<boolean>(true)

    useEffect(() => {
        getProduct(id)
    }, [])

    const getProduct = (id) => {
        api.get(`/api/products/${id}/`)
            .then(res => res.data)
            .then(data => setProduct(data))
            .catch(err => toast.error(err))
    }

    const handleEdit = (id) => {
        api.put(`/api/product/update/${id}`)
        .then(res => {
            if (res.status === 200) {
                toast.success("Edited successfully.")
                navigate('/products/')
            } else toast.error('Edited Fail')
        })
        .catch(err => toast.error(err))
    }

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

    return (
        <Col gap={'30px'}>
            <Row gap={10} alignItems={'center'}>
                <Link to={'/products/categories/'}>
                    <BsArrowLeft fontSize={30} color='blue.900' />
                </Link>
                <Title label={`Edit Category #${product.id}`} />
            </Row>
            <Box p={5}>
                <Tabs.Root defaultValue={"general"} variant={'line'}>
                    <Tabs.List>
                        <Tabs.Trigger value="general">General Info</Tabs.Trigger>
                        <Tabs.Trigger value="attribute">Attribute</Tabs.Trigger>
                        {/* <Tabs.Trigger value="discount">Discount</Tabs.Trigger> */}
                    </Tabs.List>

                    <Tabs.Content value="general">
                        <GeneralInfoForm
                            onSendGeneralInfo={handelGeneralInfo}
                            onValidityChange={setIsGeneralInfoValid}
                            initialData={product} />
                    </Tabs.Content>
                    <Tabs.Content value="attribute">
                        <AttributeForm onSendAttribute={handelAttribute} initialData={product} />
                    </Tabs.Content>
                    {/* <Tabs.Content value="discount">
                        <DiscountForm />
                    </Tabs.Content> */}
                </Tabs.Root>
            </Box>
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label="Save" onClick={handleEdit} />
                <CustomButton label='Delete' background={'red'} color_hover='red' />
            </Row>
        </Col>
    );
}
