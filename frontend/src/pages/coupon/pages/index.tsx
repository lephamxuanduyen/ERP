import React, { useCallback, useEffect, useState } from 'react'
import { CouponTable } from '../components/CouponTable';
import api from '../../../api';
import { toast } from 'sonner';
import { Box, Center, Heading, Spinner } from '@chakra-ui/react';
import { Col } from '../../../components/Col';
import { Row } from '../../../components/Row';
import { Link } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';
import SearchBox from '../../../components/SearchBox';
import { Coupon } from '../../../types/coupon.type';

const index = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // Search and filter states can be added if needed, similar to discounts
    // For now, a simple fetch all is implemented.
    // const [searchValue, setSearchValue] = useState("");
    // const [selectedFilter, setSelectedFilter] = useState("");


    const getCoupons = useCallback(() => {
        setIsLoading(true);
        api.get("/api/coupons/?limit=10000") // Assuming you want to fetch many, adjust limit as needed
            .then((res) => {
                setCoupons(res.data.results || []); // Ensure results is an array
            })
            .catch((err) => {
                console.error("Failed to fetch coupons:", err);
                toast.error("Failed to fetch coupons. Please try again.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        getCoupons();
    }, [getCoupons]);

    const handleSearch = (value: string) => {
        api.get(`/api/coupons/?code=${value}&?limit10000`)
            .then(res => res.data.results)
            .then(data => setCoupons(data))
            .catch(err => toast.error("Failed to search coupons"))
    };

    if (isLoading) {
        return (
            <Center h="200px">
                <Spinner size="xl" />
            </Center>
        );
    }
    return (
        <Col gap="30px"> {/* Reduced gap for a tighter layout */}
            <Row
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap" // Allow wrapping on smaller screens
                gap={4} // Add gap between items when they wrap
            >
                <Link to={"/promotion/coupon/add"}> {/* Adjust link to your add coupon page */}
                    <CustomButton
                        label="+ Create New Coupon"
                    />
                </Link>
                <Box>
                    <SearchBox
                        onEnter={handleSearch}
                        // onFilterSelect={setSelectedFilter} // If you implement selectedFilter state
                        placeholder="Search coupons..."
                    />
                </Box>
            </Row>
            <CouponTable coupons={coupons} />
        </Col>
    )
}
export default index