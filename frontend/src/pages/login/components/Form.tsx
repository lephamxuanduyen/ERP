import React from 'react';
import { useState } from "react";
import api from "../../../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../../constants";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { Box, Button, Field, Flex, Input, Text, chakra } from "@chakra-ui/react"
import { Col } from '../../../components/Col';
import { Row } from '../../../components/Row'
import { CiUser, CiLock } from "react-icons/ci";

const LoginForm = ({ route, method }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (err) {
            alert(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Col
            background={'rgba(255, 255, 255, 0.20)'}
            boxShadow={'0px 0px 40px 10px rgba(255, 255, 255, 0.60)'}
            backdropFilter={'blur(7.5px)'}
            border={'3px solid white'}
            borderRadius={'20px'}
            padding={'100px 40px'}
            gap={'60px'}
        >
            <Text fontWeight={'bold'} textAlign={'center'} fontSize={'24px'} color={'white'}>
                Sale Management
            </Text>
            <Col gap={'20px'} onSubmit={handleSubmit}>
                <Field.Root borderBottom={'2px solid white'}>
                    <Row alignItems={'center'} color={'white'}>
                        <Input
                            placeholder='Username'
                            _placeholder={{ color: 'white' }}
                            width={'320px'}
                            type='text'
                            border={'none'}
                            _focus={{
                                boxShadow: 'none',
                                border: 'none',
                                outline: 'none',
                            }}
                            name='username'
                            autoComplete='off'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <CiUser fontSize={'30px'} />
                    </Row>
                </Field.Root>
                <Field.Root borderBottom={'2px solid white'}>
                    <Row alignItems={'center'} color={'white'}>
                        <Input
                            placeholder='Password'
                            _placeholder={{ color: 'white' }}
                            type='password'
                            width={'320px'}
                            border={'none'}
                            _focus={{
                                boxShadow: 'none',
                                border: 'none',
                                outline: 'none'
                            }}
                            name='password'
                            autoComplete='off'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <CiLock fontSize={'30px'} />
                    </Row>
                </Field.Root>
                {loading && <LoadingIndicator />}
            </Col>
            <Button
                background={'black'}
                color={'white'}
                _hover={{ background: 'white', color: 'black' }}
                onClick={handleSubmit}
                _focus={{ 
                    boxShadow: 'none',
                    outline: 'none' 
                }}
            >
                Login
            </Button>
        </Col>
    );
};

export default LoginForm;
