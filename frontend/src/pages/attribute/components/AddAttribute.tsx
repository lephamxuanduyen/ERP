import React, { useEffect, useState } from 'react'
import { Col } from '../../../components/Col'
import { Row } from '../../../components/Row'
import Title from '../../../components/Title'
import CustomButton from '../../../components/CustomButton'
import { Input, Select, Text, Box, Table, Button, Portal, createListCollection, Field } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import api from '../../../api'

const AddAttribute = () => {
    const navigate = useNavigate()

    const [attName, setAttName] = useState("")
    const [displayType, setDisplayType] = useState<string[]>(["RADIO"])
    const [values, setValues] = useState([
        {
            value: "",
            default_extra_price: 0,
            color: "",
        }
    ])

    const DisplayType = createListCollection({
        items: [
            { label: "RADIO", value: "RADIO" },
            { label: "SELECTION", value: "SELECTION" },
            { label: "COLOR", value: "COLOR" }
        ]
    })

    const handleChangeValue = (index: number, field: keyof (typeof values)[number], value: any) => {
        const updated = [...values]
        updated[index] = {
            ...updated[index], [field]: value
        }
        setValues(updated)
    }

    const editValue = () => {
        setValues([
            ...values,
            {
                value: "",
                default_extra_price: 0,
                color: "",
            }
        ])
    }

    const addAttribute = () => {
        api.post("/api/attributes/", { ["att_name"]: attName, ["display_type"]: displayType, ["values"]: values })
            .then((res) => {
                if (res.status === 201) {
                    toast.success('Added successfully.')
                    navigate('/products/attributes/')
                }
                else toast.warning('Something is wrong!');
            })
            .catch((err) => toast.error('Error!!!'))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Gửi dữ liệu lên server ở đây
        addAttribute()
    }
    return (
        <Col gap={'30px'}>

            <Title label='Create new Attribute' />
            <Box p={6} boxShadow={'0px 5px 90px 0px rgba(0, 0, 0, 0.20)'} borderRadius={'md'} bg={"white"}>
                <Box mb={6}>
                    <Field.Root orientation={"horizontal"} required mb={4}>
                        <Field.Label>Name</Field.Label>
                        <Input value={attName} onChange={(e) => setAttName(e.target.value)} />
                    </Field.Root>
                    <Select.Root collection={DisplayType} w={'100%'} value={displayType}
                        onValueChange={(e) => setDisplayType(e.value)}>
                        <Select.HiddenSelect />
                        <Select.Label>Type</Select.Label>
                        <Select.Control>
                            <Select.Trigger>
                                <Select.ValueText />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content>
                                    {
                                        (DisplayType.items) && DisplayType.items.map((item) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))
                                    }
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>
                </Box>
                <Box>
                    <Text fontWeight={"bold"} mb={3}>Attribute Value</Text>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Value</Table.ColumnHeader>
                                {(displayType.includes("COLOR")) && <Table.ColumnHeader>Color</Table.ColumnHeader>}
                                <Table.ColumnHeader>Default Extra Price</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {values.map((item, idx) => (
                                <Table.Row key={idx}>
                                    <Table.Cell>
                                        <Input value={item.value} onChange={(e) => handleChangeValue(idx, "value", e.target.value)} />
                                    </Table.Cell>
                                    {(displayType.includes("COLOR")) &&
                                        <Table.Cell>
                                            <Input type='color' value={item.color} w={30} h={30} p={0} onChange={(e) => handleChangeValue(idx, "color", e.target.value)} />
                                        </Table.Cell>
                                    }
                                    <Table.Cell>
                                        <Input type='number' value={item.default_extra_price} onChange={(e) => handleChangeValue(idx, "default_extra_price", e.target.value)} />
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                    <Button size={"sm"} color={'green'} bg={'none'} textDecor={'underline'} mt={3} onClick={editValue}>Add a line</Button>
                </Box>
            </Box>
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label='Save' onClick={handleSubmit} />
                <Link to={'/products/attributes/'}>
                    <CustomButton label='Cancel' color='blue.900' background='gray.300' />
                </Link>
            </Row>
        </Col>
    )
}

export default AddAttribute