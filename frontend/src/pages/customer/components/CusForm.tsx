import { Field, Input, Stack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { Customer } from '../../../types/customers.type'

interface Props {
    onSendData: (data: any) => void
    initialData?: Customer
}

export const CusForm = ({ onSendData, initialData }: Props) => {
    const [formData, setFormData] = useState({
        id: 0,
        cus_name: "",
        cus_phone: "",
        cus_mail: "",
        cus_address: "",
        create_at: "",
        tier: 0
    })

    useEffect(() => {
        if (initialData) setFormData(initialData)
    }, [initialData])

    const handelChange = (name: string, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [name]: value }
            onSendData(updated)
            return updated
        })
    }

    return (
        <Stack>
            <Field.Root orientation={'horizontal'}>
                <Field.Label>Name:</Field.Label>
                <Input name='cus_name' value={formData.cus_name} onChange={(e) => handelChange(e.target.name, e.target.value)} />
            </Field.Root>

            <Field.Root orientation={'horizontal'}>
                <Field.Label>Phone:</Field.Label>
                <Input name='cus_phone' value={formData.cus_phone} onChange={(e) => handelChange(e.target.name, e.target.value)} />
            </Field.Root>

            <Field.Root orientation={'horizontal'}>
                <Field.Label>Mail:</Field.Label>
                <Input name='cus_mail' type='email' value={formData.cus_mail} onChange={(e) => handelChange(e.target.name, e.target.value)} />
            </Field.Root>

            <Field.Root orientation={'horizontal'}>
                <Field.Label>Address:</Field.Label>
                <Input name='cus_address' value={formData.cus_address} onChange={(e) => handelChange(e.target.name, e.target.value)} />
            </Field.Root>
        </Stack>
    )
}