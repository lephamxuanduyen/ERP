import React, { useEffect, useState } from 'react'
import { Supplier } from '../../../types/supplier.type'
import { Field, Input, Stack } from '@chakra-ui/react'

interface Props {
    onSendData: (data: any) => void
    initialData?: Supplier
}

const SupForm = ({ onSendData, initialData }: Props) => {
    const [formData, setFormData] = useState({
        id: 0,
        sup_name: "",
        sup_phone: "",
        sup_mail: "",
        sup_add: "",
        contact_person: ""
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
                <Field.Label>Name</Field.Label>
                <Input name="sup_name" value={formData.sup_name} onChange={(e) => handelChange(e.target.name, e.target.value)} />
            </Field.Root>
            <Field.Root orientation={'horizontal'}>
                <Field.Label>Phone</Field.Label>
                <Input name="sup_phone" value={formData.sup_phone} onChange={(e) => handelChange(e.target.name, e.target.value)} />
            </Field.Root>
            <Field.Root orientation={'horizontal'}>
                <Field.Label>Address</Field.Label>
                <Input name="sup_add" value={formData.sup_add} onChange={(e) => handelChange(e.target.name, e.target.value)} />
            </Field.Root>
            <Field.Root orientation={'horizontal'}>
                <Field.Label>Contact Person</Field.Label>
                <Input name="contact_person" value={formData.contact_person} onChange={(e) => handelChange(e.target.name, e.target.value)} />
            </Field.Root>
        </Stack>
    )
}

export default SupForm