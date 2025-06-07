// --- START OF FILE AddCoupon.tsx ---
// (e.g., src/pages/promotion/coupon/AddCoupon.tsx)

import React, { useState } from 'react';
import { Col } from '../../../components/Col';
import Title from '../../../components/Title';
import { CouponForm } from '../components/CouponForm';
import { Row } from '../../../components/Row';
import { Link, useNavigate } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';
import api from '../../../api';
import { toast } from 'sonner';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { Coupon } from '../../../types/coupon.type';


const AddCoupon = () => {
    const navigate = useNavigate();
    const [couponData, setCouponData] = useState<Partial<Coupon>>({}); // Use Partial for flexibility
    const [isLoading, setIsLoading] = useState(false);

    const handleFormDataChange = (data: Coupon) => { // Expecting full Coupon object or your FormData type
        setCouponData(data);
    };

    const validateCouponData = (data: Partial<Coupon>): boolean => {
        if (!data.code || data.code.trim() === "") {
            toast.error("Coupon code is required.");
            return false;
        }
        if (data.code.length > 20) {
            toast.error("Coupon code cannot exceed 20 characters.");
            return false;
        }
        // Add more specific validations as needed
        if (data.usage_limit && Number(data.usage_limit) < 0) {
            toast.error("Usage limit cannot be negative.");
            return false;
        }
        if (data.promotion_value && Number(data.promotion_value) < 0) {
            toast.error("Promotion value cannot be negative.");
            return false;
        }
        if (data.promotion_value && !data.promotion_value_type) {
            toast.error("Promotion value type is required if promotion value is set.");
            return false;
        }
        if (!data.promotion_value && data.promotion_value_type) {
            toast.error("Promotion value is required if promotion value type is set.");
            return false;
        }
        if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
            toast.error("End date cannot be before start date.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateCouponData(couponData)) {
            return;
        }
        setIsLoading(true);

        // Prepare payload, converting numbers and handling nulls
        const payload = {
            ...couponData,
            usage_limit: couponData.usage_limit ? Number(couponData.usage_limit) : null,
            promotion_value: couponData.promotion_value ? Number(couponData.promotion_value) : null,
            // start_date and end_date should already be ISO string or null from DatePicker
            // promotion_value_type is already string or null
        };
        // Remove id if it's present and empty/0 from initial state, API might not like it on POST
        if (payload.hasOwnProperty('id')) delete payload.id;
        console.log(payload)

        try {
            const res = await api.post("/api/coupons/", payload);
            if (res.status === 201) {
                toast.success('Coupon created successfully.');
                navigate('/promotion/coupon'); // Navigate to coupon list page
            } else {
                // This else might not be reached if API throws error for non-2xx
                toast.error(res.data?.message || 'Failed to create coupon.');
            }
        } catch (err: any) {
            console.error("Error creating coupon:", err);
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || (typeof err.response?.data === 'object' ? JSON.stringify(err.response.data) : 'Creation failed.');
            if (typeof errorMessage === 'string') {
                toast.error(errorMessage);
            } else if (typeof errorMessage === 'object') {
                for (const key in errorMessage) {
                    toast.error(`${key}: ${errorMessage[key]}`);
                }
            } else {
                toast.error('An unexpected error occurred during coupon creation.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Col gap={'30px'}>
            <Title label='Create New Coupon' />
            <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="sm">
                <CouponForm onSendData={handleFormDataChange} />
            </Box>
            <Row gap={'28px'} justifyContent={'flex-end'} mt={4}>
                <CustomButton label='Save Coupon' onClick={handleSubmit} loading={isLoading} />
                <Link to={'/promotion/coupon'}> {/* Link to coupon list */}
                    <CustomButton label='Cancel' colorScheme="gray" />
                </Link>
            </Row>
        </Col>
    );
};

export default AddCoupon;