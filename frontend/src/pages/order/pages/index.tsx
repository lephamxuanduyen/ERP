import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../api'; // Adjust path to your api.ts
import { Row } from '../../../components/Row'; // Adjust path
import { Col } from '../../../components/Col';   // Adjust path
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton'; // Adjust path
import SearchBox from '../../../components/SearchBox';     // Adjust path
import OrderTable, { Order } from '.././components/OrderTable'; // Adjust path
import { Box, Heading, Spinner, Center, Text } from '@chakra-ui/react';

const OrdersListPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // For row click navigation if desired from here

    // For search functionality (currently placeholder)
    // const [searchValue, setSearchValue] = useState("");
    // const [selectedFilter, setSelectedFilter] = useState("Phone"); // Default as per image

    const fetchOrders = useCallback((searchTerm = "", filter = "Phone") => {
        setIsLoading(true);
        let queryParams = `?limit=100000`; // Fetch a large number as requested

        // Placeholder for actual search query construction
        // if (searchTerm) {
        //     if (filter.toLowerCase() === "phone") {
        //         queryParams += `&customer_phone_icontains=${encodeURIComponent(searchTerm)}`; // Example
        //     } else if (filter.toLowerCase() === "customer") {
        //          queryParams += `&customer_name_icontains=${encodeURIComponent(searchTerm)}`; // Example
        //     }
        // }

        api.get(`/api/orders/${queryParams}`)
            .then((res) => {
                setOrders(res.data.results || []);
            })
            .catch((err) => {
                console.error("Failed to fetch orders:", err);
                toast.error("Failed to fetch orders. Please try again.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleSearch = (value: string, filter?: string) => {
        // toast.info(`Search for: "${value}" using filter: "${filter}". Implement API call.`);
        // fetchOrders(value, filter); // Uncomment and adapt when search API is ready
        console.log("Search value:", value, "Filter:", filter);
        // For now, just re-fetch all orders or implement actual search
        fetchOrders();
    };

    // const handleFilterSelect = (filter: string) => {
    //    setSelectedFilter(filter);
    // };

    if (isLoading) {
        return (
            <Center h="calc(100vh - 200px)"> {/* Adjust height as needed */}
                <Spinner size="xl" />
            </Center>
        );
    }

    return (
        <Col gap="20px" p={{ base: "15px", md: "20px" }}>
            {/* Header Row with Create Button and Search */}
            <Row
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={{ base: 4, md: 2 }} // Gap for responsiveness
                mb={6}
            >
                <RouterLink to="/orders/add/"> {/* Adjust to your "create order" route */}
                    <CustomButton
                        label="+ Create New Order"
                    // size="lg" // As per image, the button looks larger
                    />
                </RouterLink>
                <Box flexGrow={{ base: 1, md: 0 }} minW={{ base: "200px", sm: "300px" }}>
                    <SearchBox
                        onEnter={handleSearch}
                        filterOptions={['Phone', 'Customer', 'Order ID']} // Example filters
                        // onFilterSelect={handleFilterSelect}
                        placeholder="Search orders..."
                    />
                </Box>
            </Row>

            {/* Orders Table Section */}
            <Box bg="white" borderRadius="xl" boxShadow="0 4px 12px 0 rgba(0,0,0,0.05)" >
                <Box p={{ base: 3, md: 5 }}>
                    <Heading as="h2" size="md" mb={4}>List Orders</Heading>
                    <OrderTable orders={orders} />
                </Box>
            </Box>
        </Col>
    );
};

export default OrdersListPage;