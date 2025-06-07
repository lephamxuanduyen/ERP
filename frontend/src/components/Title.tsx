import React from 'react'
import { Text, TextProps } from '@chakra-ui/react'

interface Props extends TextProps {
    label: string
    color?: string
}

const Title = ({ label, color, ...rest }: Props) => {
    return (
        <Text fontSize={'20px'} fontWeight={700} color={color ? color : 'blue.900'} {...rest}>{label.toUpperCase()}</Text>
    )
}
export default Title