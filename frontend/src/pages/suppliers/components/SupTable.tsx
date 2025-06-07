import React from 'react'
import { Supplier } from "../../../types/supplier.type"
import { Box, Table, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

interface SupTableProps {
    suppliers: Supplier[]
}

const SupTable: React.FC<SupTableProps> = ({ suppliers }) => {
    if (!suppliers || suppliers.length === 0) {
        return (
            <Box bg="white" borderRadius="lg" boxShadow="lg" p={4} textAlign="center">
                <Text>No suppliers found.</Text>
            </Box>
        );
    }
    return (
        <Box bg={'white'} borderRadius={'lg'} boxShadow={'0 5px 90px, 0 rgba(0, 0, 0, 0.2)'} p={4}>
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Name</Table.ColumnHeader>
                        <Table.ColumnHeader>Phone</Table.ColumnHeader>
                        <Table.ColumnHeader>Address</Table.ColumnHeader>
                        <Table.ColumnHeader>Contact Person</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        suppliers.map((item, index) => (
                            <Table.Row key={index}>
                                <Table.Cell>
                                    <Link to={`/supplier/edit/${item.id}`}>{item.sup_name}</Link>
                                </Table.Cell>
                                <Table.Cell>{item.sup_phone}</Table.Cell>
                                <Table.Cell>{item.sup_add}</Table.Cell>
                                <Table.Cell>{item.contact_person}</Table.Cell>
                            </Table.Row>
                        ))
                    }
                </Table.Body>
            </Table.Root>
        </Box>
    )
}

export default SupTable