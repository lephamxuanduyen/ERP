import React from 'react'
import LoginForm from '../components/Form'
import { Box, Image } from '@chakra-ui/react'
import { loginBackground } from '../../../assets/image'

const LoginPage = () => {
    return (
        <Box pos={'relative'}>
            <Image src={loginBackground} w="100vw" h="100vh" pos={'absolute'} />
            <Box pos={'absolute'} left={{ base: "50vw", 'lg': "10%" }} top={'50vh'} transform={{ base: 'translateY(-50%) translateX(-50%)', 'lg': 'translateY(-50%)' }} >
                <LoginForm route="/api/token/" method="login" />
            </Box>
        </Box>
    )
}

export default LoginPage