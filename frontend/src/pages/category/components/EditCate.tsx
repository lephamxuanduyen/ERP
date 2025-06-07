import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import Title from '../../../components/Title'
import { Box, Field, Input, Stack, Textarea } from '@chakra-ui/react'
import { Link, useParams } from 'react-router-dom'
import { Row } from '../../../components/Row'
import CustomButton from '../../../components/CustomButton'
import api from '../../../api'
import { useNavigate } from 'react-router-dom'
import { BsArrowLeft } from "react-icons/bs";
import { toast } from 'sonner'
import { Select } from 'chakra-react-select'

const EditCate = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [formData, setFormData] = useState({
        id: '',
        cate_name: '',
        cate_desc: '',
        parent: ''
    })

    const [existingCates, setExistingCates] = useState<{ value: number; label: string }[]>([])

    useEffect(() => {
        getCates()
        getCate(id)
    }, [])

    const getCates = () => {
        api.get("/api/categories/")
            .then((res) => res.data.results)
            .then((data) => {
                const options = data.map((cate) => ({
                    value: cate.id,
                    label: cate.cate_name,
                }))
                setExistingCates(options)
            })
            .catch((err) => toast.error(err))
    }

    const getCate = (id) => {
        api.get(`/api/categories/${id}/`)
            .then((res) => res.data)
            .then((data) => {
                setFormData(data)
                console.log(data)
            })
            .catch((err) => toast.error(err))
    }

    const editCate = (id) => {
        api.put(`/api/category/update/${id}/`, formData)
            .then((res) => {
                if (res.status === 200) {
                    toast.success('Edited successfully.')
                    navigate('/products/categories/')
                }
                else toast.error('Edited Fail.')
            })
            .catch((err) => toast.error(err))
    }

    const deleteCate = (id) => {
        api.delete(`/api/category/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) {
                    toast.success('Deleted successfully.')
                    navigate('/products/categories/')
                }
                else toast.warning('Something is wrong!')
            })
            .catch((err) => toast.error(err))
    }
    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('submit', formData)
        editCate(id)
    }

    const handleDelete = (e) => {
        e.preventDefault()
        deleteCate(id)
    }
    return (
        <Col gap={'30px'}>
            <Row gap={10} alignItems={'center'}>
                <Link to={'/products/categories/'}>
                    <BsArrowLeft fontSize={30} color='blue.900' />
                </Link>
                <Title label={`Edit Category #${formData.id}`} />
            </Row>
            <Stack>
                <Field.Root orientation={'horizontal'}>
                    <Field.Label>Name:</Field.Label>
                    <Input name="cate_name" value={formData.cate_name} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </Field.Root>

                <Field.Root orientation={'horizontal'}>
                    <Field.Label>Description:</Field.Label>
                    <Textarea name="contains" value={formData.cate_desc} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </Field.Root>

                <Field.Root orientation={'horizontal'}>
                    <Field.Label>Parent:</Field.Label>
                    <Select
                        options={existingCates}
                        placeholder="Please Select a Category"
                        value={existingCates.find(option => option.value === Number(formData.parent)) || null}
                        onChange={(selectedOption) => handleChange('parent', selectedOption ? String(selectedOption.value) : '')}
                    />
                </Field.Root>
            </Stack>
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label='Save' onClick={handleSubmit} />
                <CustomButton label='Delete' onClick={handleDelete} background={'red'} color_hover='red' />
            </Row>
        </Col>
    )
}

export default EditCate