// --- START OF FILE DashboardPage.tsx ---
// (e.g., src/pages/dashboard/DashboardPage.tsx)
import React, { useEffect, useState, useCallback } from 'react';
import { Box, SimpleGrid, Text, Heading, Flex, Icon, Tag, VStack, HStack, Progress, Table, Link as ChakraLink, Button, ButtonGroup, Spinner, Center, Stat, StatLabel, StatHelpText, Badge } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiTrendingUp, FiShoppingCart, FiBox, FiUsers, FiDollarSign, FiArrowRight } from 'react-icons/fi'; // Example icons for summary cards
import ReactApexChart from 'react-apexcharts'; // For charts
import ApexCharts, { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import api from '../../api';
import { toast } from 'sonner';
import OrderTable, { Order } from '../order/components/OrderTable';

// --- Interfaces (Define based on actual API responses for each section) ---
interface SummaryCardData {
    title: string;
    value: string | number;
    percentageChange: number;
    icon: React.ElementType;
    color: string;
}

interface TopProductData {
    id: string | number;
    name: string;
    popularity: number; // 0-100 for progress bar
    salesPercentage: number; // For the tag
    barColor: string;
}

interface RevenueDataPoint {
    period: string; // YYYY-MM-DD
    total_amount: number;
}

// --- Helper Functions ---
const formatCurrency = (amount: number, currency = 'VND') => {
    if (currency === 'USD') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getOrderStatusProps = (status: RecentOrderItem['status']) => {
    switch (status) {
        case 'Pending': return { label: 'Pending', colorScheme: 'blue' };
        case 'Approved': return { label: 'Approved', colorScheme: 'green' };
        case 'Completed': return { label: 'Completed', colorScheme: 'green' };
        case 'Paused': return { label: 'Paused', colorScheme: 'orange' };
        case 'Cancelled': return { label: 'Cancelled', colorScheme: 'red' };
        default: return { label: status, colorScheme: 'gray' };
    }
};


// --- Main Component ---
const DashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    // State for each section
    const [summaryData, setSummaryData] = useState<SummaryCardData[]>([]);
    const [earningsData, setEarningsData] = useState({ totalExpense: 0, profitPercentage: 0 });
    const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
    const [revenueChartData, setRevenueChartData] = useState<RevenueDataPoint[]>([]);
    const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month' | 'year'>('week'); // Default to week like image
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    const fetchRevenueData = useCallback(async (period: 'day' | 'week' | 'month' | 'year') => {
        try {
            // Your API for revenue uses 'week', 'month', 'year'. 'day' might need different handling or API support.
            // For 'day', the API expects start_date and end_date.
            let queryParams = `?period=${period}`;
            if (period === 'day') { // Example: fetch for the last 7 days if 'day' means daily data for a week
                const endDate = dayjs().format('YYYY-MM-DD');
                const startDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
                queryParams = `?start_date=${startDate}&end_date=${endDate}&period=day`; // Assuming API supports period=day with dates
            }

            const response = await api.get(`/api/revenue/${queryParams}`);
            // API response for revenue is directly an array, not nested in "results"
            setRevenueChartData(response.data || []);
        } catch (error) {
            console.error("Error fetching revenue data:", error);
            toast.error("Could not fetch revenue data.");
        }
    }, [toast]);


    const fetchOrders = useCallback((searchTerm = "", filter = "Phone") => {
        setIsLoading(true);
        let queryParams = `?limit=100000`; // Fetch a large number as requested
        api.get(`/api/orders/${queryParams}`)
            .then((res) => {
                setRecentOrders(res.data.results || []);
                console.log(res.data.results)
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


    useEffect(() => {
        const fetchAllDashboardData = async () => {
            setIsLoading(true);
            try {
                // --- Fetch Summary Data (Total Sales, Total Order, Product Sold, New Customer) ---
                // TODO: Replace with your actual API calls for these summary stats
                // These are often separate, aggregated API endpoints.
                // Example: GET /api/dashboard/summary/
                setSummaryData([
                    { title: "Total Sales", value: 7200000, percentageChange: 3.4, icon: FiDollarSign, color: "green.500" },
                    { title: "Total Order", value: 200, percentageChange: -0.5, icon: FiShoppingCart, color: "red.500" },
                    { title: "Product Sold", value: 20, percentageChange: 2.0, icon: FiBox, color: "green.500" },
                    { title: "New Customer", value: 3, percentageChange: -98, icon: FiUsers, color: "red.500" },
                ]);

                // --- Fetch Earnings Data ---
                // TODO: API for Total Expense & Profit. Example: GET /api/dashboard/earnings/
                setEarningsData({ totalExpense: 1440000, profitPercentage: 48 }); // profitPercentage for the gauge chart

                // --- Fetch Top Products ---
                // TODO: API for Top Products. Example: GET /api/products/top/?limit=4
                setTopProducts([
                    { id: 1, name: "Home Decore Range", popularity: 80, salesPercentage: 46, barColor: "orange.400" },
                    { id: 2, name: "Disney Princess Dress", popularity: 50, salesPercentage: 17, barColor: "cyan.400" },
                    { id: 3, name: "Bathroom Essentials", popularity: 60, salesPercentage: 19, barColor: "blue.400" },
                    { id: 4, name: "Apple Smartwatch", popularity: 70, salesPercentage: 29, barColor: "pink.400" },
                ]);

                // --- Fetch Recent Orders ---
                // TODO: API for Recent Orders. Example: GET /api/orders/?limit=3&ordering=-order_date
                // You'll need to map the API response to RecentOrderItem structure
                // For now, using placeholder data matching the image

                // Fetch initial revenue data
                await fetchRevenueData(revenuePeriod);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Could not load dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllDashboardData();
    }, [fetchRevenueData, revenuePeriod, toast]); // revenuePeriod change will refetch revenue


    // --- Chart Options ---
    const revenueChartOptions: ApexOptions = {
        chart: {
            id: 'revenue-chart',
            toolbar: { show: false },
            zoom: { enabled: false },
            animations: { enabled: true },
            fontFamily: 'Inter, sans-serif', // Match your app's font
        },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#3182CE'], // Chakra blue.500
        dataLabels: { enabled: false },
        xaxis: {
            type: 'datetime',
            categories: revenueChartData.map(d => dayjs(d.period).valueOf()), // Use timestamp for datetime axis
            labels: {
                format: revenuePeriod === 'day' ? 'dd MMM' : (revenuePeriod === 'week' ? 'dd MMM' : (revenuePeriod === 'month' ? 'MMM yyyy' : 'yyyy')),
                style: { colors: "#A0AEC0" }, // Chakra gray.500
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                formatter: (value) => {
                    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B';
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                    return value?.toLocaleString() || '0';
                },
                style: { colors: "#A0AEC0" },
            },
            min: 0, // Ensure y-axis starts at 0
        },
        grid: {
            borderColor: '#E2E8F0', // Chakra gray.200
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } },
        },
        tooltip: {
            x: { format: 'dd MMM yyyy' },
            y: { formatter: (value) => formatCurrency(value) },
            theme: 'light',
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 100]
            }
        }
    };
    const revenueChartSeries = [{ name: 'Revenue', data: revenueChartData.map(d => d.total_amount) }];

    const earningsChartOptions: ApexOptions = {
        chart: { type: 'radialBar', sparkline: { enabled: true } },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: { margin: 0, size: '65%' },
                track: { background: '#E2E8F0', strokeWidth: '97%' },
                dataLabels: {
                    name: { show: false },
                    value: { offsetY: -2, fontSize: '1.25rem', fontWeight: 'bold', color: '#2D3748' }, // Chakra gray.700
                },
            },
        },
        fill: { type: 'solid', colors: ['#38A169'] }, // Chakra green.500
        stroke: { lineCap: 'round' },
        labels: ['Profit'],
    };
    const earningsChartSeries = [earningsData.profitPercentage];


    if (isLoading) {
        return <Center h="100vh"><Spinner size="xl" /></Center>;
    }

    return (
        <VStack gap={6} align="stretch" p={{ base: 4, md: 6 }}>
            {/* Revenue Chart */}
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Text fontSize="sm" color="gray.500">Revenue</Text>
                        <Text fontSize="2xl" fontWeight="bold">${(revenueChartData.reduce((sum, item) => sum + item.total_amount, 0) / 1000).toFixed(3)}</Text> {/* Example of total revenue from chart data */}
                        {/* You might want a separate API for the total revenue number and percentage change */}
                        <Text fontSize="sm" color="green.500">+3.4% from last period</Text>
                    </Box>
                    <ButtonGroup size="sm" attached variant="outline">
                        {['Day', 'Week', 'Month', 'Year'].map((period) => (
                            <Button
                                key={period}
                                _active={revenuePeriod === period.toLowerCase()}
                                onClick={() => {
                                    const newPeriod = period.toLowerCase() as 'day' | 'week' | 'month' | 'year';
                                    setRevenuePeriod(newPeriod);
                                    fetchRevenueData(newPeriod);
                                }}
                            >
                                {period}
                            </Button>
                        ))}
                    </ButtonGroup>
                </Flex>
                <Box h="350px">
                    <ReactApexChart options={revenueChartOptions} series={revenueChartSeries} type="area" height="100%" />
                </Box>
            </Box>

            {/* Recent Orders */}
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                <Flex justify="space-between" align="center" mb={4}>
                    <HStack>
                        <Heading size="md">Recent Orders</Heading>
                        <Tag.Root colorScheme="green" size="sm" variant="solid">
                            <Tag.Label>+1 new order</Tag.Label>
                        </Tag.Root>
                    </HStack>
                    <ChakraLink as={RouterLink} href="/orders" color="blue.500" fontSize="sm" fontWeight="medium">
                        Go to Orders Page <Icon as={FiArrowRight} ml={1} />
                    </ChakraLink>
                </Flex>
                <OrderTable orders={recentOrders} size={3} />
            </Box>
        </VStack>
    );
};

// --- Sub-components for clarity ---

const StatCard: React.FC<SummaryCardData> = ({ title, value, percentageChange, icon, color }) => (
    <Box p={5} bg="white" borderRadius="lg" boxShadow="md">
        <HStack gap={4} align="start">
            <Flex
                w={12} h={12}
                borderRadius="lg"
                bg={`${color.split('.')[0]}.100`} // e.g., green.100
                justify="center"
                align="center"
                color={color}
            >
                <Icon as={icon} w={6} h={6} />
            </Flex>
            <VStack align="start" gap={0}>
                <Text fontSize="sm" color="gray.500">{title}</Text>
                <Text fontSize="2xl" fontWeight="bold">{typeof value === 'number' ? value.toLocaleString() : value}</Text>
                <Stat.Root>
                    <Stat.HelpText mt={0}>
                        {percentageChange >= 0 ? <Stat.UpIndicator /> : <Stat.DownIndicator />}
                        {Math.abs(percentageChange)}%
                    </Stat.HelpText>
                </Stat.Root>
            </VStack>
        </HStack>
    </Box>
);

const TopProductItem: React.FC<{ product: TopProductData, index: number }> = ({ product, index }) => (
    <Flex align="center" justify="space-between" py={2} borderBottomWidth={index === 3 ? "0px" : "1px"} borderColor="gray.100">
        <HStack gap={3}>
            <Text fontWeight="medium" color="gray.600" w="20px">{String(index).padStart(2, '0')}</Text>
            <Text fontWeight="medium">{product.name}</Text>
        </HStack>
        <HStack gap={4} w="40%">
            <Progress.Root value={product.popularity} size="xs" /* colorScheme có thể không áp dụng trực tiếp ở Root */ >
                <Progress.Track borderRadius="full" bg="gray.200"> {/* Màu nền cho track */}
                    <Progress.Range
                        borderRadius="full"
                        bg={product.barColor} // Áp dụng màu trực tiếp cho Range
                        // Hoặc nếu có prop colorScheme cho Range:
                        // colorScheme={colorSchemeBase}
                        style={{ width: `${product.popularity}%` }} // Cần thiết nếu value không tự động set width
                    />
                </Progress.Track>
            </Progress.Root>
            {/* <Progress value={product.popularity} size="xs" colorScheme={product.barColor.split('.')[0]} flex={1} borderRadius="full" /> */}
            <Tag.Root size="sm" colorScheme={product.barColor.split('.')[0]} variant="outline" minW="50px" textAlign="center" justifyContent="center">
                <Tag.Label>{product.salesPercentage}%</Tag.Label>
            </Tag.Root>
        </HStack>
    </Flex>
);

const RecentOrdersTable: React.FC<{ orders: RecentOrderItem[] }> = ({ orders }) => (
    <Box overflowX="auto">
        <Table.Root size="sm">
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader>ID</Table.ColumnHeader>
                    <Table.ColumnHeader>Item</Table.ColumnHeader>
                    <Table.ColumnHeader>Qty</Table.ColumnHeader>
                    <Table.ColumnHeader>Order Date</Table.ColumnHeader>
                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {orders.map((order) => {
                    const statusProps = getOrderStatusProps(order.status);
                    return (
                        <Table.Row key={order.id}>
                            <Table.Cell>
                                <ChakraLink as={RouterLink} href={`/orders/view/${order.api_order_id || order.id}`} color="blue.500">
                                    {order.id}
                                </ChakraLink>
                            </Table.Cell>
                            <Table.Cell>{order.itemSummary}</Table.Cell>
                            <Table.Cell >{order.qty}</Table.Cell>
                            <Table.Cell>{dayjs(order.order_date).format("MMMM DD, YYYY")}</Table.Cell>
                            <Table.Cell >{formatCurrency(order.amount, 'USD')}</Table.Cell> {/* Assuming USD from image */}
                            <Table.Cell>
                                <Badge colorScheme={statusProps.colorScheme} variant="subtle" px={2} py={1} borderRadius="md">
                                    {statusProps.label}
                                </Badge>
                            </Table.Cell>
                        </Table.Row>
                    );
                })}
                {orders.length === 0 && (
                    <Table.Row><Table.Cell colSpan={6} textAlign="center" color="gray.500">No recent orders.</Table.Cell></Table.Row>
                )}
            </Table.Body>
        </Table.Root>
    </Box>
);

export default DashboardPage;
// --- END OF FILE DashboardPage.tsx ---