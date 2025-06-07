import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Title from '../../../components/Title'
import { Col } from '../../../components/Col'
import { Box, Input, Table, Text, Button, Field, createListCollection, Portal } from '@chakra-ui/react'
import { Row } from '../../../components/Row'
import CustomButton from '../../../components/CustomButton'
import { BsArrowLeft } from "react-icons/bs";
import { toast } from 'sonner'
import api from '../../../api'
import { Select } from 'chakra-react-select'

type AttributeValues = {
    value: string
    default_extra_price: number
    color?: string
}

const EditAttribute = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        getAttribute(id)
    }, [])

    const [attName, setAttName] = useState("")
    // const [displayType, setDisplayType] = useState<string[]>(["RADIO"])
    const [values, setValues] = useState<AttributeValues[]>([
        {
            value: "",
            default_extra_price: 0,
            color: "",
        }
    ])
    
    const [displayType, setDisplayType] = useState<string>("RADIO")

    const DisplayTypes = [
    { label: "RADIO", value: "RADIO" },
    { label: "SELECTION", value: "SELECTION" },
    { label: "COLOR", value: "COLOR" }
    ]

    const handleChangeValue = (index: number, field: keyof (typeof values)[number], value: any) => {
        const updated = [...values]
        updated[index] = {
            ...updated[index], [field]: value
        }
        setValues(updated)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Gửi dữ liệu lên server ở đây
        editAttribute(id)
    }

    const handleDelete = (e) => {
        e.preventDefault()
        deleteAttribute(id)
    }

    const getAttribute = (id) => {
        api.get(`/api/attributes/${id}`)
            .then((res) => res.data)
            .then((data) => {
                setAttName(data.att_name)
                setDisplayType(data.display_type)
                setValues(data.values)
            })
            .catch((err) => toast.error(err))
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

    const deleteAttribute = (id) => {
        api.delete(`/api/attribute/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) {
                    toast.success('Deleted successfully.')
                    navigate('/products/attributes/')
                }
                else toast.warning('Something is wrong!')
            })
            .catch((err) => toast.error('Error!!!'))
    }

    const editAttribute = (id) => {
        api.put(`/api/attribute/update/${id}/`, { ["att_name"]: attName, ["display_type"]: displayType, ["values"]: values })
            .then((res) => {
                if (res.status === 200) {
                    toast.success('Added successfully.')
                    navigate('/products/attributes/')
                }
                else toast.warning('Something is wrong!');
            })
            .catch((err) => toast.error('Error!!!'))
    }

    return (

        <Col gap={'30px'}>
            <Row gap={10} alignItems={'center'}>
                <Link to={"/products/attributes/"}>
                    <BsArrowLeft fontSize={30} color='primary' />
                </Link>
                <Title label={`Edit Attribute #${id}`} />
            </Row>
            <Box p={6} boxShadow={'0px 5px 90px 0px rgba(0, 0, 0, 0.20)'} borderRadius={'md'} bg={"white"}>
                <Box mb={6}>
                    <Field.Root mb={4} orientation={'horizontal'}>
                        <Field.Label>Name</Field.Label>
                        <Input value={attName} onChange={(e) => setAttName(e.target.value)} />
                    </Field.Root>
                    {/* <FormControl mb={4}>
                        <FormLabel>Display Type</FormLabel>
                        <Select name="parent" value={displayType} onChange={(e) => setDisplayType(e.target.value)}>
                            <option value={''}>Please Select Display Type</option>
                            {
                                (DisplayTypes) && DisplayTypes.map((item, idx) => (
                                    <option key={idx} value={item}>{item}</option>
                                ))
                            }
                        </Select>
                    </FormControl> */}
                    {/* <Select.Root collection={DisplayTypes} w={'100%'} value={displayType} onValueChange={(e) => setDisplayType(e.value)}>
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
                                        (DisplayTypes.items) && DisplayTypes.items.map((item) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))
                                    }
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root> */}

                    <Select 
                    options={DisplayTypes}
                    placeholder="Please Select Display Type"
                    value={DisplayTypes.find(option => option.value === displayType) || null}
                    onChange={(selelectesOption) => setDisplayType(selelectesOption ? selelectesOption.value : "")}/>
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
                    <Button size={"sm"} colorScheme='green' mt={3} onClick={editValue}>Add a line</Button>
                </Box>
            </Box>
            <Row gap={'28px'} justifyContent={'end'}>
                <CustomButton label='Save' onClick={handleSubmit} />
                <CustomButton label='Delete' background={'red'} color_hover='red' onClick={handleDelete} />
            </Row>
        </Col>
    )
}

export default EditAttribute