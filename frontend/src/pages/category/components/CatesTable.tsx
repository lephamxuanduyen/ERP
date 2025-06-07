import { Box, Table, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import React from 'react'
import { Category } from "../../../types/category.type";

interface CatesTableProps {
    categories: Category[]
}

const CatesTable: React.FC<CatesTableProps> = ({ categories }) => {
    if (!categories || categories.length === 0) {
        return (
            <Box bg="white" borderRadius="lg" boxShadow="lg" p={4} textAlign="center">
                <Text>No categories found.</Text>
            </Box>
        );
    }
    return (
        <Box bg="white" borderRadius="lg" boxShadow="0px 5px 90px 0px rgba(0, 0, 0, 0.20)" p={4}>
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader fontWeight={'900'}>Name</Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight={'900'}>Parent</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {categories.map((item, index) => (
                        <Table.Row key={index}>
                            <Table.Cell><Link to={`/products/categories/edit/${item.id}`}>{item.cate_name}</Link></Table.Cell>
                            <Table.Cell>{item.parent_name}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}

export default CatesTable