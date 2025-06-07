import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import Title from '../../../components/Title'
import { Field, Input, Stack } from '@chakra-ui/react'
import { Link, useParams } from 'react-router-dom'
import { Row } from '../../../components/Row'
import CustomButton from '../../../components/CustomButton'
import api from '../../../api'
import { useNavigate } from 'react-router-dom'
import { BsArrowLeft } from "react-icons/bs";
import { toast } from 'sonner'
import { Select } from 'chakra-react-select'


type Units = {
    id: number
    unit_name: string
    contains: number
    reference_unit: number
}

const EditUnit = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [formData, setFormData] = useState({
        id: '',
        unit_name: '',
        contains: '',
        reference_unit: ''
    })

    const [existingUnits, setExistingUnit] = useState<{ value: number, name: string }[]>([])

    useEffect(() => {
        getUnits()
        getUnit(id)
    }, [])

    const getUnits = () => {
        api.get("/api/units/")
            .then((res) => res.data.results)
            .then((data) => {
                const option = data.map((unit) => ({
                    value: unit.id,
                    label: unit.unit_name,
                }))
                setExistingUnit(option)
            })
            .catch((err) => toast.error(err))
    }

    const getUnit = (id) => {
        api.get(`/api/units/${id}/`)
            .then((res) => res.data)
            .then((data) => {
                setFormData(data)
            })
            .catch((err) => toast.error(err))
    }

    const editUnit = (id) => {
        api.put(`/api/unit/update/${id}/`, formData)
            .then((res) => {
                if (res.status === 200) {
                    toast.success('Edited successfully.')
                    navigate('/products/units/')
                }
                else toast.warning('Something is wrong!.')
            })
            .catch((err) => toast.error(err))
    }

    const deleteUnit = (id) => {
        api.delete(`/api/unit/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) {
                    toast.success('Deleted successfully.')
                    navigate('/products/units/')
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
        editUnit(id)
    }

    const handleDelete = (e) => {
        e.preventDefault()
        deleteUnit(id)
    }
    return (
        <Col gap={'30px'}>
            <Row gap={10} alignItems={'center'}>
                <Link to={'/products/units/'}>
                    <BsArrowLeft fontSize={30} color='primary' />
                </Link>
                <Title label={`Edit Unit #${formData.id}`} />
            </Row>
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
                <CustomButton label='Delete' onClick={handleDelete} background={'red'} color_hover='red' />
            </Row>
        </Col>
    )
}

export default EditUnit