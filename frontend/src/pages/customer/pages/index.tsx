import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col } from "../../../components/Col";
import { Row } from "../../../components/Row";
import SearchBox from "../../../components/SearchBox";
import CustomButton from "../../../components/CustomButton";
import { CusTable } from "../components/CusTable";
import api from "../../../api";
import { toast } from "sonner";

const Customer = () => {
    const [customers, setCustomers] = useState([])
    const [searchValue, setSearchValue] = useState("");
    const [selectedFilter, setSelectedFilter] = useState('')
    const filterOptions = ['Name', 'Phone', 'Address', 'Tier'];

    useEffect(() => {
        getCustomers()
    }, [])

    const handleSearch = (value: string, filter: String | undefined) => {
        setSearchValue(value);
        if (filter?.toLowerCase() === "name") searchCustomerByName(value)
        else if (filter?.toLowerCase() === "phone") searchCustomerByPhone(value)
        else if (filter?.toLowerCase() === 'address') searchCustomerByAddress(value)
        else if (filter?.toLowerCase() === 'tier') searchCustomerByTier(value)
    };

    const searchCustomerByName = (name: string) => {
        api.get(`/api/customers/?name=${name}`)
            .then(res => res.data.results)
            .then(data => {
                setCustomers(data)
            })
            .catch(err => toast.error(err))
    }

    const searchCustomerByPhone = (phone: string) => {
        api.get(`/api/customers/?phone=${phone}`)
            .then(res => res.data.results)
            .then(data => {
                setCustomers(data)
            })
            .catch(err => toast.error(err))
    }

    const searchCustomerByAddress = (address: string) => {
        api.get(`/api/customers/?address=${address}`)
            .then(res => res.data.results)
            .then(data => {
                setCustomers(data)
            })
            .catch(err => toast.error(err))
    }

    const searchCustomerByTier = (tier: string) => {
        api.get(`/api/customers/?tier=${tier}`)
            .then(res => res.data.results)
            .then(data => {
                setCustomers(data)
            })
            .catch(err => toast.error(err))
    }

    const handelSelectedFilter = (filter: string) => {
        setSelectedFilter(filter)
    }

    const getCustomers = () => {
        api.get("/api/customers/")
            .then((res) => res.data.results)
            .then((data) => setCustomers(data))
            .catch((err) => toast(err))
    }

    return (
        <Col gap={"50px"}>
            <Row justifyContent={{ base: "start", lg: "space-between" }}>
                <Link to={"/customer/add/"}>
                    <CustomButton
                        label="+ Create New Customer"
                        display={{ base: "none", lg: "inline-flex" }}
                    />
                </Link>
                <SearchBox
                    onEnter={handleSearch}
                    filterOptions={filterOptions}
                    onFilterSelect={handelSelectedFilter} />
            </Row>
            <CusTable customers={customers} />
        </Col>
    );
};

export default Customer;
