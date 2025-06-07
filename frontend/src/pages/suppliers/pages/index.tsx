import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import { Link } from 'react-router-dom'
import CustomButton from '../../../components/CustomButton'
import SearchBox from '../../../components/SearchBox'
import SupTable from '../components/SupTable'
import api from '../../../api'
import { toast } from 'sonner'

const index = () => {
    const [suppliers, setSuppliers] = useState([])
    const filterOptions = ["Name", "Phone", "Address", "Contact Person"]
    const [searchValue, setSearchValue] = useState("")
    const [selectedFilter, setSelectedFilter] = useState("")

    useEffect(() => getSuppliers(), [])

    const getSuppliers = () => {
        api.get("/api/suppliers/")
            .then((res) => res.data.results)
            .then((data) => setSuppliers(data))
            .catch((err) => toast(err))
    }

    const handelSearch = (value: string, filter: string | undefined) => {
        setSearchValue(value)
        if (filter?.toLowerCase() === "name") searchSuppliersByName(value)
        else if (filter?.toLowerCase() === 'phone') searchSupplierByPhone(value)
        else if (filter?.toLowerCase() === "address") searchSuppliersByAddress(value)
        else if (filter?.toLowerCase() === "contact person") searchSuppliersByContactPerson(value)
    }

    const handelSelectedFilter = (filter: string) => {
        setSelectedFilter(filter)
    }

    const searchSuppliersByName = (name: string) => {
        api.get(`/api/suppliers/?name=${name}`)
            .then(res => res.data.results)
            .then(data => setSuppliers(data))
            .catch(err => toast(err))
    }

    const searchSupplierByPhone = (phone: string) => {
        api.get(`/api/suppliers/?phone=${phone}`)
            .then(res => res.data.results)
            .then(data => setSuppliers(data))
            .catch(err => toast(err))
    }

    const searchSuppliersByAddress = (address: string) => {
        api.get(`/api/suppliers/?address=${address}`)
            .then(res => res.data.results)
            .then(data => setSuppliers(data))
            .catch(err => toast.error(err))
    }

    const searchSuppliersByContactPerson = (contactPerson: string) => {
        api.get(`/api/suppliers/?contact=${contactPerson}`)
            .then(res => res.data.results)
            .then(data => setSuppliers(data))
            .catch(err => toast.error(err))
    }

    return (
        <Col gap={'50px'}>
            <Row justifyContent={{ base: "start", lg: "space-between" }}>
                <Link to={"/supplier/add/"}>
                    <CustomButton label='+ Create New Supplier'
                        display={{ base: "none", lg: "inline-flex" }} />
                </Link>
                <SearchBox
                    onEnter={handelSearch}
                    filterOptions={filterOptions}
                    onFilterSelect={handelSelectedFilter}
                />
            </Row>
            <SupTable suppliers={suppliers} />
        </Col>
    )
}
export default index