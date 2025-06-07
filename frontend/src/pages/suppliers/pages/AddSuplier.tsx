import React, { useState } from 'react'
import { Col } from '../../../components/Col'
import Title from '../../../components/Title'
import { Link, useNavigate } from 'react-router-dom'
import { CusForm } from '../../customer/components/CusForm'
import { Row } from '../../../components/Row'
import CustomButton from '../../../components/CustomButton'
import api from '../../../api'
import { toast } from 'sonner'

const AddSuplier = () => {
    const navigate = useNavigate()
    const [supplier, setSupplier] = useState({
        id: "",
        sup_name: "",
        sup_phone: "",
        suơ_add: "",
        contact_person: ""
    })

    const onSubmit = () => {
        AddSuppliers()
    }

    const handelAddSupplier = (data: any) => {
        setSupplier(data)
    }

    const AddSuppliers = () => {
        api.post("/api/suppliers/", supplier)
            .then(res => {
                if (res.status === 201) {
                    toast.success("dded Successfully.")
                    navigate('/supplier/')
                }
                else toast.error("Add Faid")
            }
            )
    }

    return (
        <Col gap={'30px'}>
            <Title label='Create new Supplier' />
            <CusForm onSendData={handelAddSupplier} />
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label='Save' onClick={onSubmit} />
                <Link to={"/supplier/"}>
                    <CustomButton label='Cancel' color='blue.900' bg={'gray.300'} />
                </Link>
            </Row>
        </Col>
    )
}

export default AddSuplier