import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../../api'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import { BsArrowLeft } from 'react-icons/bs'
import Title from '../../../components/Title'
import { CusForm } from '../components/CusForm'
import CustomButton from '../../../components/CustomButton'
import { toast } from 'sonner'

const EditCustomer = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [customer, setCustomer] = useState({
        id: 0,
        cus_name: "",
        cus_phone: "",
        cus_mail: "",
        cus_address: "",
        create_at: "",
        tier: 0
    })

    useEffect(() => {
        getCustomer(id)
    }, [])

    const getCustomer = (id) => {
        api.get(`/api/customers/${id}/`)
            .then((res) => res.data)
            .then(data => {
                setCustomer(data)
            })
            .catch(err => toast.error(err))
    }

    const handelEditCus = (data: any) => {
        setCustomer(data)
    }

    const handelSubmit = (e) => {
        e.preventDefault()
        editCustomer(id)
    }

    const editCustomer = (id) => {
        api.put(`/api/customer/${id}/`, customer)
            .then(res => {
                if (res.status === 200) {
                    toast.success('Edited successfully.')
                    navigate('/customer/')
                }
                else toast.error('Edited Fail.')
            })
            .catch(err => toast.error(err))
    }

    return (
        <Col gap={'30px'}>
            <Row gap={10} alignItems={'center'}>
                <Link to={'/customer/'}>
                    <BsArrowLeft fontSize={30} color='blue.900' />
                </Link>
                <Title label={`Edit Customer #${customer.id}`} />
            </Row>
            <CusForm onSendData={handelEditCus} initialData={customer} />
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label='Save' onClick={handelSubmit} />
            </Row>
        </Col>
    )
}
export default EditCustomer