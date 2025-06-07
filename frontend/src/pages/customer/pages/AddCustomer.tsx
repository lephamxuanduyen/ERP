import React, { useState } from 'react'
import { Col } from '../../../components/Col'
import Title from '../../../components/Title'
import { CusForm } from '../components/CusForm'
import { Row } from '../../../components/Row'
import { Link, useNavigate } from 'react-router-dom'
import CustomButton from '../../../components/CustomButton'
import api from '../../../api'
import { toast } from 'sonner'

const AddCustomer = () => {
    const navigate = useNavigate()
    const [customer, setCustomer] = useState({
        id: "",
        cus_name: "",
        cus_phone: "",
        cus_mail: "",
        cus_address: "",
        create_at: "",
        tier: ""
    })

    const handelAddCus = (data: any) => {
        setCustomer(data)
    }

    const handleSubmit = () => {
        addCustomer()
    }

    const addCustomer = () => {
        api.post("/api/customers/", customer)
            .then((res) => {
                if (res.status === 201) {
                    toast.success('Added successfully.')
                    navigate('/customer/')
                }
                else toast.error('Added Fail.')
            })
            .catch((err) => toast.error(err))
    }

    return (
        <Col gap={'30px'}>
            <Title label='Create new Customer' />
            <CusForm onSendData={handelAddCus} />
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label='Save' onClick={handleSubmit} />
                <Link to={'/customer/'}>
                    <CustomButton label='Cancel' color='blue.900' bg={'gray.300'} />
                </Link>
            </Row>
        </Col>
    )
}

export default AddCustomer