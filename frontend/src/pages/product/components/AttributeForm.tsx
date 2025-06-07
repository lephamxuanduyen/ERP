import React, { useEffect, useState } from "react";
import { Box, Button, Field, Table, Text } from "@chakra-ui/react";
import api from "../../../api";
import { toast } from "sonner";
import { Select } from "chakra-react-select";
import { Attribute, Product } from "../../../types/product.type";

interface Props {
    onSendAttribute: (data: any) => void
    initialData?: Product
}

export default function AttributeForm({ onSendAttribute, initialData }: Props) {
    const [attributeValues, setAttributeValues] = useState<{ value: number, label: string }[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [formData, setFormData] = useState<{ attributes: Attribute[] }>(
        {
            attributes: [{
                id: 0,
                value: '',
                default_extra_price: 0,
                color: '',
                attribute_id: null
            }]
        }
    )

    useEffect(() => {
        getAttributeValues();
    }, [])

    useEffect(() => {
        if (initialData?.attributes_display && attributeValues.length > 0) {
            console.log("Processing initial data:", initialData.attributes_display);

            const populatedAttributes = initialData.attributes_display.map(attr => {
                const matchingAttr = attributeValues.find(option =>
                    option.label === attr.value
                );

                return {
                    ...attr,
                    id: matchingAttr ? matchingAttr.value : undefined
                };
            });

            setFormData({ attributes: populatedAttributes });
            setLoading(false);
            console.log("Populated attributes:", populatedAttributes);
        }
    }, [initialData?.id, attributeValues]);

    useEffect(() => {
        if (!loading) {
            onSendAttribute(formData);
        }
    }, [formData, loading]);

    const getAttributeValues = async () => {
        try {
            const res = await api.get('/api/attribute_value/');
            const data = res.data.results;
            const options = data.map(attr => ({
                value: attr.id,
                label: attr.value
            }));
            console.log("Available attribute values:", options);
            setAttributeValues(options);
        } catch (err) {
            console.error("Error loading attribute values:", err);
            toast.error("Failed to load attribute values");
        }
    }

    const getAttributeValue = (index: number, id: string) => {
        if (!id) return;

        api.get(`/api/attribute_value/${id}/`)
            .then((res) => res.data)
            .then((data) => {
                const updated = [...formData.attributes];
                updated[index] = {
                    ...data,
                    // Make sure to keep the id
                    id: data.id
                };

                setFormData(prev => ({
                    ...prev,
                    attributes: updated
                }));

                console.log(`Updated attribute at index ${index}:`, updated[index]);
            })
            .catch((err) => {
                console.error("Error getting attribute details:", err);
                toast.error("Failed to get attribute details");
            });
    }

    const handelChange = (index: number, selectedOption: any) => {
        if (!selectedOption) return;

        console.log(`Changed attribute at index ${index}, selected:`, selectedOption);

        const attributeId = selectedOption.value;
        const attributeLabel = selectedOption.label;

        const updated = [...formData.attributes];
        updated[index] = {
            ...updated[index],
            id: attributeId,
            value: attributeLabel
        };

        setFormData(prev => ({
            ...prev,
            attributes: updated
        }));

        getAttributeValue(index, String(attributeId));
    }

    const addAttribute = () => {
        setFormData(prev => ({
            ...prev,
            attributes: [
                ...prev.attributes,
                {
                    id: 0,
                    value: '',
                    default_extra_price: 0,
                    color: '',
                    attribute_id: null
                }
            ]
        }));
    }

    if (loading && attributeValues.length === 0) {
        return <Box p={5}>Loading attributes...</Box>;
    }

    return (
        <Box p={5} bg="white" borderRadius="md" boxShadow="md">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Value</Table.ColumnHeader>
                        <Table.ColumnHeader>Color</Table.ColumnHeader>
                        <Table.ColumnHeader>Default Extra</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        formData.attributes.map((item, idx) => {
                            const selectedOption = attributeValues.find(
                                option => option.label === item.value
                            );

                            return (
                                <Table.Row key={idx}>
                                    <Table.Cell>
                                        <Field.Root orientation={'horizontal'} w={'100%'}>
                                            <Select
                                                options={attributeValues}
                                                value={selectedOption || null}
                                                onChange={(selected) => handelChange(idx, selected)}
                                                placeholder="Select..."
                                            />
                                        </Field.Root>
                                    </Table.Cell>
                                    <Table.Cell>{item.color}</Table.Cell>
                                    <Table.Cell>{item.default_extra_price}</Table.Cell>
                                </Table.Row>
                            );
                        })
                    }
                </Table.Body>
            </Table.Root>
            <Button size={"sm"} color={'green'} bg={'none'} textDecor={'underline'} mt={3} onClick={addAttribute}>Add a line</Button>
        </Box>
    );
}