import React, { use } from 'react'
import { Col } from "../components/Col"
import { getUserGroups, getUsername } from '../utils/auth'
import { Text } from '@chakra-ui/react'

const Header = () => {
    const group = getUserGroups()[0]
    const username = getUsername()

    return (
        <Col
            w={'calc(100vw - 200px)'}
            height={'65px'} bg={'blue.900'}
            borderLeft={'1px solid white'}
            color={'white'} p={'18px 20px'}
            alignItems={'flex-end'}
            justifyContent={'center'}
            gap={'5px'}
            pos={'fixed'}
            zIndex={1}>
            <Text fontSize={'14px'} fontWeight={'800'}>{username}</Text>
            <Text fontSize={'10px'} fontWeight={'400'}>{group}</Text>
        </ Col>
    )
}

export default Header