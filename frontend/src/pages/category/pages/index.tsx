import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import CustomButton from '../../../components/CustomButton'
import SearchBox from '../../../components/SearchBox'
import api from '../../../api'
import CatesTable from '../components/CatesTable'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

const index = () => {
    const [categories, setCategories] = useState([])
    const [searchValue, setSearchValue] = useState('')
    // const [selectedFilter, setSelectedFilter] = useState('')

    useEffect(() => {
        getCategories()
    }, [])

    const handleSearch = (value: string, filter: string | undefined) => {
        setSearchValue(value)
        console.log(value)
        searchCategoriesByName(value)
    }

    const searchCategoriesByName = (name: string) => {
        api.get(`/api/categories/?name=${name}`)
            .then((res) => res.data.results)
            .then((data) => {
                setCategories(data)
            })
            .catch((err) => toast.error(err))
    }

    const getCategories = () => {
        api.get("/api/categories/")
            .then((res) => res.data.results)
            .then((data) => {
                setCategories(data)
            })
            .catch((err) => toast.error(err))
    }

    return (
        <Col gap={'50px'}>
            <Row justifyContent={{ base: 'start', lg: 'space-between' }}>
                <Link to={'/products/categories/add/'}>
                    <CustomButton label='+ Create New Category' display={{ base: 'none', lg: 'inline-flex' }} />
                </Link>
                <SearchBox onEnter={handleSearch} />
            </Row>
            <CatesTable categories={categories} />
        </Col>
    )
}

export default index