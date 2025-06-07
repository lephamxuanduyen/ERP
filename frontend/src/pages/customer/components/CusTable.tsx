import React, { useEffect, useState } from 'react'
import { Customer } from "../../../types/customers.type"
import { Box, Table, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import api from '../../../api'
import { toast } from 'sonner'

interface CusTableProps {
    customers: Customer[]
}

export const CusTable: React.FC<CusTableProps> = ({ customers }) => {
    const [tiers, setTiers] = useState<{ [key: number]: string }>({})

    useEffect(() => getCusTiers(), [])

    const getCusTiers = () => {
        api.get('/api/reward-tiers/')
            .then((res) => res.data.results)
            .then((data) => {
                const tierMap: { [key: number]: string } = {};
                data.forEach((tier: { id: number, tier_name: string }) => {
                    tierMap[tier.id] = tier.tier_name
                });
                setTiers(tierMap)
            })
            .catch((err) => toast.error(err))
    }

    if (!customers || customers.length === 0) {
        return (
            <Box bg="white" borderRadius="lg" boxShadow="lg" p={4} textAlign="center">
                <Text>No customers found.</Text>
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
                        <Table.ColumnHeader>TIER</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {customers.map((item, index) => (
                        <Table.Row key={index}>
                            <Table.Cell>
                                <Link to={`/customer/edit/${item.id}`}>{item.cus_name}</Link>
                            </Table.Cell>
                            <Table.Cell>{item.cus_phone}</Table.Cell>
                            <Table.Cell>{item.tier ? tiers[item.tier] : ""}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}
