import React from 'react'
import { Col } from '../components/Col'
import { IconType } from 'react-icons/lib';
import { CiHome, CiBoxes } from "react-icons/ci";
import { Row } from '../components/Row';
import { Text, Box } from '@chakra-ui/react';
import { getUserGroups } from '../utils/auth';
import { useLocation } from 'react-router-dom';
import "../assets/scss/main.scss"
import { Link } from 'react-router-dom';
import { CiUser } from "react-icons/ci";
import { CiGlobe } from "react-icons/ci";
import { CiDiscount1 } from "react-icons/ci";
import { CiDeliveryTruck } from "react-icons/ci";
import { CiShoppingCart } from "react-icons/ci";
import { CiShop } from "react-icons/ci";
import { CiSpeaker } from "react-icons/ci";

type SidebarItemProps = {
    to: string;
    label: string;
    icon: IconType
    subItems?: {
        to: string;
        label: string;
    }[]
}

const SideBarItem = ({ to, label, icon: Icon, subItems }: SidebarItemProps) => {
    const location = useLocation()
    const isActive = location.pathname === to || (subItems && subItems.some(sub => location.pathname === sub.to))

    return (
        <Col gap={'5px'}>
            <Link
                to={to}
            >
                <Box
                    color={isActive ? 'blue.900' : 'white'}
                    bg={isActive ? 'white' : 'blue.900'}
                    p={'5px 6px'}
                    borderRadius={'5px'}
                    _hover={{
                        textDecor: 'none',
                        color: 'blue.900',
                        bg: 'white'
                    }}
                    _focus={{
                        boxShadow: 'none',
                        outline: 'none'
                    }}
                >
                    <Row gap={'10px'} alignItems={'center'}>
                        <Box as={Icon} fontSize={'25px'} />
                        <Text>{label}</Text>
                    </Row>
                </Box>
            </Link>

            {isActive && subItems && (<Col mt={'20px'} gap={'8px'}>{subItems?.map((sub, idx) => (
                <Link
                    to={sub.to}
                    key={idx}
                >
                    <Box
                        color={'white'}
                        textDecor={'none'}
                        borderBottom={location.pathname === sub.to ? '2px solid white' : 'none'}
                        bg={location.pathname === sub.to ? '' : 'transparent'}
                        fontWeight={location.pathname === sub.to ? 'bolder' : 'normal'}
                        ml={'32px'}
                        p={'3px 10px'}
                        fontSize={'14px'}
                        _hover={{
                            borderBottom: '2px solid white'
                        }}
                        _focus={{
                            boxShadow: 'none',
                            outline: 'none'
                        }}
                    >
                        {sub.label}
                    </Box>
                </Link>
            ))}</Col>)}
        </Col>
    )
}


const SideBar = () => {
    const groups = getUserGroups()

    const isAdmin = groups.includes("Manager")
    const isSaler = groups.includes("Saler")

    return (
        <Col
            bg={'blue.900'}
            w={'200px'}
            h={'100vh'}
            p={'100px 12px'}
            pos={'fixed'}
            overflowY={'auto'}
            color={'white'}
            fontWeight={'700'}
            fontSize={'16px'}
            gap={'5px'}
            zIndex={1}
        >
            {(true) && (<SideBarItem to='/' label='Dashboard' icon={CiHome} />)}
            {(true) && (
                <SideBarItem
                    to='/products/'
                    label='Products'
                    icon={CiBoxes}
                    subItems={[
                        { to: '/products/', label: 'Product' },
                        { to: '/products/categories/', label: 'Category' },
                        { to: '/products/attributes/', label: 'Attribute' },
                        { to: '/products/units/', label: 'Unit' },
                    ]} />)}
            {(true) && (<SideBarItem to="/customer/" label='Customer' icon={CiUser} />)}
            {(true) && (<SideBarItem to="/supplier/" label='Supplier' icon={CiShop} />)}
            {(true) && (
                <SideBarItem
                    to='/promotion/discount/'
                    label='Promotions'
                    icon={CiDiscount1}
                    subItems={[
                        { to: '/promotion/discount/', label: 'Discount' },
                        { to: '/promotion/coupon/', label: 'Coupon' },
                    ]} />)}
            {(true) && (<SideBarItem to="/purchase/" label='Purchase Order' icon={CiDeliveryTruck} />)}
            {(true) && (<SideBarItem to="/orders/" label='Order' icon={CiShoppingCart} />)}
            {(true) && (<SideBarItem to="/employee/" label='Employee' icon={CiSpeaker} />)}

        </Col>
    )
}

export default SideBar