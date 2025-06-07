import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import SideBar from './SideBar'
import { Col } from '../components/Col'
import { Row } from '../components/Row'
import { Box } from '@chakra-ui/react'
import { Toaster } from "sonner";


const index = () => {
    return (
        <Row>
            <Toaster position="top-center" richColors />
            <SideBar />
            <Col>
                <Box as={'main'} ml={'200px'}>
                    <Header />
                    <Box w={'calc(100vw - 200px)'} p={'40px'} mt={'65px'}>
                        <Outlet />
                    </Box>
                </Box>
            </Col>
        </Row >
    )
}

export default index