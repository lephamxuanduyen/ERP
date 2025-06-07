import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import CustomButton from '../../../components/CustomButton'
import SearchBox from '../../../components/SearchBox'
import api from '../../../api'
import UnitsTable from '../components/UnitsTable'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

const index = () => {
    const [units, setUnits] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('')

    useEffect(() => {
        getUnits()
    }, [])

    const handleEnter = (value: string, filter: string | undefined) => {
        setSearchValue(value)
        console.log(value)
        searchUnitsByName(value)
    }

    const searchUnitsByName = (name: string) => {
        api.get(`/api/units/?name=${name}`)
            .then((res) => res.data.results)
            .then((data) => {
                setUnits(data)
            })
            .catch((err) => toast.success(err))
    }

    const getUnits = () => {
        api.get("/api/units/")
            .then((res) => res.data.results)
            .then((data) => {
                setUnits(data)
            })
            .catch((err) => toast.error(err))
    }

    return (
        <Col gap={'50px'}>
            <Row justifyContent={{ base: 'start', lg: 'space-between' }}>
                <Link
                    to={'/products/units/add/'}
                >
                    <CustomButton label='+ Create New Unit' display={{ base: 'none', lg: 'inline-flex' }} />
                </Link>
                <SearchBox onEnter={handleEnter} />
            </Row>
            <UnitsTable units={units} />
        </Col>
    )
}

export default index