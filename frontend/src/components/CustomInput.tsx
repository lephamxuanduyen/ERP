import { Input, InputProps } from '@chakra-ui/react'
import React from 'react'

interface Props extends InputProps {
}

const CustomInput = (props: Props) => {
    return (
        <Input
            borderRadius={'none'}
            border={'none'}
            _focus={{
                boxShadow: 'none',
                outline: 'none',
                borderBottom: '1px solid lightgrey'
            }}
            borderBottom={'1px solid lightgrey'}
            autoComplete='off'
            {...props}
        />
    )
}

export default CustomInput