import { Button, ButtonProps } from '@chakra-ui/react'
import React, { Component } from 'react'

interface Props extends ButtonProps {
    label: string
    color?: string
    background?: string
    color_hover?: string
    bg_hover?: string
    leftIcon?: any
}

const CustomButton = ({ label, color, background, color_hover, bg_hover, leftIcon, ...rest }: Props) => {
    return (
        <Button
            p={'10px 20px'}
            bg={background ? background : 'blue.900'}
            color={color ? color : 'white'}
            _hover={{
                bg: bg_hover ? bg_hover : 'white',
                color: color_hover ? color_hover : (background ? background === 'gray.300' ? 'blue.900' : background : 'blue.900'),
                border: background ? `1px solid ${(background === 'gray.300' ? 'black' : background)}` : '1px solid black',
            }}
            _focus={{
                boxShadow: 'none',
                outline: 'none'
            }}
            {...rest}
        >
            {leftIcon ? leftIcon : ""}
            {label}
        </Button>
    )
}

export default CustomButton