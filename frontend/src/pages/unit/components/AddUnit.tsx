import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import Title from '../../../components/Title'
import CustomButton from '../../../components/CustomButton'
import { Field, Input, Link, Stack } from '@chakra-ui/react'
import { Link as LinkRouter, useNavigate } from 'react-router-dom'
import api from '../../../api'
import { toast } from 'sonner'
import { Select } from 'chakra-react-select'


const AddUnit = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        unit_name: '',
        contains: '',
        reference_unit: ''
    })

    const [existingUnits, setExistingUnit] = useState<{ value: number, label: string }[]>([])

    useEffect(() => { getUnits() }, [])

    const getUnits = () => {
        api.get("/api/units/")
            .then((res) => res.data.results)
            .then((data) => {
                const options = data.map((unit) => ({
                    value: unit.id,
                    label: unit.unit_name,
                }))
                setExistingUnit(options)
            })
            .catch((err) => alert(err))
    }

    const addUnit = () => {
        api.post("/api/units/", formData)
            .then((res) => {
                if (res.status === 201) {
                    toast.success('Added successfully.')
                    navigate('/products/units/')
                }
                else toast.warning('Something is wrong!');
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
        addUnit()
    }
    return (
        <Col gap={'30px'}>
            <Title label='Create new unit' />
            <Stack>
                <Field.Root orientation={'horizontal'}>
                    <Field.Label>Name:</Field.Label>
                    <Input name="unit_name" value={formData.unit_name} onChange={(e) => handleChange(e.target.name, e.target.value)} />
                </Field.Root>

                <Field.Root orientation={'horizontal'}>
                    <Field.Label>Quantity:</Field.Label>
                    <Input name="contains" value={formData.contains} onChange={(e) => handleChange(e.target.name, e.target.value)} type="number" />
                </Field.Root>

                <Field.Root orientation={'horizontal'}>
                    <Field.Label>Reference Unit:</Field.Label>
                    <Select
                        options={existingUnits}
                        placeholder="Please Select a Unit"
                        value={existingUnits.find(option => option.value === Number(formData.reference_unit)) || null}
                        onChange={(selectedOption) => handleChange('reference_unit', selectedOption ? String(selectedOption.value) : '')}
                    />
                </Field.Root>
            </Stack>
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label='Save' onClick={handleSubmit} />
                <Link as={LinkRouter} href={'/products/units/'}>
                    <CustomButton label='Cancel' color='blue.900' background='gray.300' />
                </Link>
            </Row>
        </Col>
    )
}

export default AddUnit