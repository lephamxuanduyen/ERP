import { Box, Table, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import React from 'react'

type UnitsProps = {
    units: {
        id: number
        unit_name: string
        contains: number
        reference_unit: number | null
        reference_unit_name: string
    }[]
}

const UnitsTable: React.FC<UnitsProps> = ({ units }) => {
    if (!units || units.length === 0) {
        return (
            <Box bg="white" borderRadius="lg" boxShadow="lg" p={4} textAlign="center">
                <Text>No units found.</Text>
            </Box>
        );
    }
    return (
        <Box bg="white" borderRadius="lg" boxShadow="0px 5px 90px 0px rgba(0, 0, 0, 0.20)" p={4}>
            <Table.Root>
                <Table.Header>
                    <Table.Row >
                        <Table.ColumnHeader fontWeight={'bold'}>Unit of Measure</Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight={'bold'}>Contains</Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight={'bold'}>Reference Unit</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {units.map((item, index) => (
                        <Table.Row key={index}>
                            <Table.Cell><Link to={`/products/units/edit/${item.id}`}>{item.unit_name}</Link></Table.Cell>
                            <Table.Cell>{item.contains}</Table.Cell>
                            <Table.Cell>{item.reference_unit === null ? item.reference_unit_name : null}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}

export default UnitsTable