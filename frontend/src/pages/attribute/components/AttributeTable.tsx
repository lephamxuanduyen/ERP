import { Box, Table, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import React from 'react'

type AttributesProps = {
    attributes: {
        id: number
        att_name: string
        display_type: string
    }[]
}

const AttributesTable: React.FC<AttributesProps> = ({ attributes }) => {
    if (!attributes || attributes.length === 0) {
        return (
            <Box bg="white" borderRadius="lg" boxShadow="lg" p={4} textAlign="center">
                <Text>No attributes found.</Text>
            </Box>
        );
    }
    return (
        <Box bg="white" borderRadius="lg" boxShadow="0px 5px 90px 0px rgba(0, 0, 0, 0.20)" p={4}>
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader fontWeight={'900'}>Name</Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight={'900'}>Display Type</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {attributes.map((item, index) => (
                        <Table.Row key={index}>
                            <Table.Cell><Link to={`/products/attributes/edit/${item.id}`}>{item.att_name}</Link></Table.Cell>
                            <Table.Cell>{item.display_type}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}

export default AttributesTable