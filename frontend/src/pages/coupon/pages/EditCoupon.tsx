// --- START OF FILE EditCoupon.tsx ---
// (e.g., src/pages/promotion/coupon/EditCoupon.tsx)

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../../api';
import { Col } from '../../../components/Col';
import { Row } from '../../../components/Row';
import { BsArrowLeft } from 'react-icons/bs';
import Title from '../../../components/Title';
import { CouponForm } from '../components/CouponForm';
import CustomButton from '../../../components/CustomButton';
import { toast } from 'sonner';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';
import { Coupon } from '../../../types/coupon.type';

const EditCoupon = () => {
    const navigate = useNavigate();
    const { id: couponId } = useParams<{ id: string }>();
    const [couponData, setCouponData] = useState<Partial<Coupon>>({});
    const [initialCouponData, setInitialCouponData] = useState<Partial<Coupon> | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start true for initial fetch

    useEffect(() => {
        if (!couponId) {
            toast.error("Coupon ID is missing.");
            navigate('/promotion/coupon');
            return;
        }
        setIsLoading(true);
        api.get(`/api/coupons/${couponId}/`) // Assuming your API uses /api/coupons/{id}/ for GET by ID
            .then((res) => {
                setInitialCouponData(res.data);
                setCouponData(res.data); // Also set current form data
            })
            .catch(err => {
                console.error("Error fetching coupon:", err);
                toast.error('Failed to fetch coupon details.');
                navigate('/promotion/coupon');
            })
            .finally(() => setIsLoading(false));
    }, [couponId, navigate]);

    const handleFormDataChange = (data: Coupon) => {
        setCouponData(data);
    };

    const validateCouponData = (data: Partial<Coupon>): boolean => {
        // Code validation is not strictly needed here as it's not editable, but other fields yes.
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
        if (!data.promotion_value && data.promotion_value_type && data.promotion_value !== 0) { // Allow 0
            toast.error("Promotion value is required if promotion value type is set.");
            return false;
        }
        if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
            toast.error("End date cannot be before start date.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!couponId) return;

        if (!validateCouponData(couponData)) {
            return;
        }
        setIsLoading(true);

        const payload = {
            ...couponData,
            // Code is often not part of PUT payload if uneditable, but your API might require it.
            // If code is not editable and not required in PUT, remove it from payload:
            // const { code, ...restOfPayload } = couponData; 
            usage_limit: couponData.usage_limit || couponData.usage_limit === 0 ? Number(couponData.usage_limit) : null,
            promotion_value: couponData.promotion_value || couponData.promotion_value === 0 ? Number(couponData.promotion_value) : null,
        };
        // The API for PUT is /api/coupon/{id} - singular 'coupon'
        try {
            const res = await api.put(`/api/coupon/update/${couponId}/`, payload); // Ensure endpoint matches your spec
            if (res.status === 200) {
                toast.success('Coupon updated successfully.');
                navigate('/promotion/coupon');
            } else {
                toast.error(res.data?.message || 'Failed to update coupon.');
            }
        } catch (err: any) {
            console.error("Error updating coupon:", err);
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || (typeof err.response?.data === 'object' ? JSON.stringify(err.response.data) : 'Update failed.');
            if (typeof errorMessage === 'string') {
                toast.error(errorMessage);
            } else if (typeof errorMessage === 'object') {
                for (const key in errorMessage) {
                    toast.error(`${key}: ${errorMessage[key]}`);
                }
            } else {
                toast.error('An unexpected error occurred during coupon update.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !initialCouponData) { // Show spinner only on initial load
        return (
            <Center h="300px">
                <Spinner size="xl" />
            </Center>
        );
    }

    if (!initialCouponData && !isLoading) {
        return (
            <Center h="300px">
                <Text>Coupon not found or failed to load.</Text>
            </Center>
        );
    }


    return (
        <Col gap={'30px'}>
            <Row gap={5} alignItems={'center'} mb={4}>
                <Link to={'/promotion/coupon'}>
                    <BsArrowLeft fontSize={28} /> {/* Slightly smaller icon */}
                </Link>
                <Title label={`Edit Coupon: ${initialCouponData?.code || couponId}`} />
            </Row>
            <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="sm">
                {initialCouponData && ( // Render form only when initialData is loaded
                    <CouponForm
                        onSendData={handleFormDataChange}
                        initialData={initialCouponData}
                        isEditMode={true}
                    />
                )}
            </Box>
            <Row gap={'28px'} justifyContent={'flex-end'} mt={4}>
                <CustomButton label='Save Changes' onClick={handleSubmit} loading={isLoading} />
                <Link to={'/promotion/coupon'}>
                    <CustomButton label='Cancel' colorScheme="gray" />
                </Link>
            </Row>
        </Col>
    );
};

export default EditCoupon;