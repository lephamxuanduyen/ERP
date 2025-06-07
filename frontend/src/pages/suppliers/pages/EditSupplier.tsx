import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BsArrowLeft } from 'react-icons/bs'
import Title from '../../../components/Title'
import api from '../../../api'
import { toast } from 'sonner'
import SupForm from '../components/SupForm'
import CustomButton from '../../../components/CustomButton'

const EditSupplier = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [supplier, setSupplier] = useState({
        id: 0,
        sup_name: "",
        sup_phone: "",
        sup_mail: "",
        sup_add: "",
        contact_person: ""
    })

    useEffect(() => getSupplier(id), [])

    const getSupplier = (id) => {
        api.get(`/api/suppliers/${id}/`)
            .then(res => res.data)
            .then(data => setSupplier(data))
            .catch(err => toast.error(err))
    }

    const handelEditSup = (data: any) => setSupplier(data)

    const handelSubmit = (e) => {
        e.preventDefault()
        editSupplier(id)
    }

    const handelDelete = (e) => {
        e.preventDefault()
        deleteSupplier(id)
    }

    const editSupplier = (id) => {
        api.put(`/api/supplier/update/${id}/`)
            .then(res => {
                if (res.data === 200) {
                    toast.success('Edit successfully.')
                    navigate('/supplier/')
                }
                else toast.error("Editted Fail.")
            })
            .catch(err => toast.error(err))
    }

    const deleteSupplier = (id) => {
        api.delete(`/api/supplier/delete/${id}`)
            .then(res => {
                if (res.status === 204) {
                    toast.success('Deleted Successfully.')
                    navigate('/suppliers/')
                }
                else toast.error("Deleted Fail")
            })
            .catch(err => toast.error(err))
    }

    return (
        <Col gap={'30px'}>
            <Row gap={10} alignItems={'center'}>
                <Link to={'/supplier/'}>
                    <BsArrowLeft fontSize={30} color='blue.900' />
                </Link>
                <Title label={`Edit Supplier #${supplier.id}`} />
            </Row>
            <SupForm onSendData={handelEditSup} initialData={supplier} />
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label='Save' onClick={handelSubmit} />
                <CustomButton label='Delete' onClick={handelDelete} background='red' color_hover='red' />
            </Row>
        </Col>
    )
}

export default EditSupplier