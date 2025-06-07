import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import Title from '../../../components/Title'
import CustomButton from '../../../components/CustomButton'
import { Field, Input, Stack, Textarea } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../api'
import { toast } from 'sonner'
import { Select } from 'chakra-react-select'


const AddCate = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        cate_name: '',
        cate_desc: '',
        parent: ''
    })

    const [existingCates, setExistingCates] = useState<{ value: number; label: string }[]>([])

    useEffect(() => { getCates() }, [])

    const getCates = () => {
        api.get("/api/categories/")
            .then((res) => res.data.results)
            .then((data) => {
                const options = data.map((cate) => ({
                    value: cate.id,
                    label: cate.cate_name
                }))
                setExistingCates(options)
            })
            .catch((err) => toast.error(err))
    }

    const addCates = () => {
        api.post("/api/categories/", formData)
            .then((res) => {
                if (res.status === 201) {
                    toast.success('Added successfully.')
                    navigate('/products/categories/')
                }
                else toast.error('Added Fail!');
            })
            .catch((err) => toast.error(err))
    }

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Submit', formData)
        // Gửi dữ liệu lên server ở đây
        addCates()
    }
    return (
        <Col gap={'30px'}>
            <Title label='Create new Category' />
            <Stack>
                <Field.Root orientation={'horizontal'}>
                    <Field.Label>Name:</Field.Label>
                    <Input name="cate_name" value={formData.cate_name} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </Field.Root>

                <Field.Root orientation={'horizontal'}>
                    <Field.Label>Description:</Field.Label>
                    <Textarea name="cate_desc" value={formData.cate_desc} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </Field.Root>

                <Field.Root orientation={'horizontal'}>
                    <Field.Label>Parent</Field.Label>
                    <Select
                        options={existingCates}
                        placeholder="Please Select a Category"
                        value={existingCates.find(option => option.value === Number(formData.parent)) || null}
                        onChange={(selectedOption) => handleChange('parent', selectedOption ? String(selectedOption.value) : '')}
                        isClearable
                    />
                </Field.Root>
            </Stack>
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label='Save' onClick={handleSubmit} />
                <Link to={'/products/categories/'}>
                    <CustomButton label='Cancel' color='blue.900' background='gray.300' />
                </Link>
            </Row>
        </Col>
    )
}

export default AddCate