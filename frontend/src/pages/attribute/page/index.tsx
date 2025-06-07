import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import CustomButton from '../../../components/CustomButton'
import SearchBox from '../../../components/SearchBox'
import api from '../../../api'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import AttributesTable from '../components/AttributeTable'


const index = () => {
    const [attributes, setAttributes] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('')

    useEffect(() => {
        getAttributes()
    }, [])

    const handleEnter = (value: string, filter: string | undefined) => {
        setSearchValue(value)
        searchAttributesByName(value)
    }

    const searchAttributesByName = (name: string) => {
        api.get(`/api/attributes/?name=${name}`)
            .then((res) => res.data.results)
            .then((data) => {
                setAttributes(data)
            })
            .catch((err) => toast.error('Error!!!'))
    }

    const getAttributes = () => {
        api.get("/api/attributes/")
            .then((res) => res.data.results)
            .then((data) => {
                setAttributes(data)
            })
            .catch((err) => alert(err))
    }

    return (
        <Col gap={'50px'}>
            <Row justifyContent={{ base: 'start', lg: 'space-between' }}>
                <Link to={'/products/attributes/add/'}>
                    <CustomButton label='+ Create New Attribute' display={{ base: 'none', lg: 'inline-flex' }} />
                </Link>
                <SearchBox onEnter={handleEnter} />
            </Row>
            <AttributesTable attributes={attributes} />
        </Col>
    )
}

export default index