import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Spinner, Center } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../../api';
import { Row } from '../../../components/Row';
import { Col } from '../../../components/Col';
import CustomButton from '../../../components/CustomButton';
import SearchBox from '../../../components/SearchBox';
import PurchaseOrderTable, { PurchaseOrder } from '../components/PurchaseOrder';
import { toast } from 'sonner';
import { getUserGroups } from '../../../utils/auth';

// Function to fetch supplier/employee names (placeholder - implement actual fetching)
// This is a simplified example. In a real app, you might fetch all suppliers/employees once
// and cache them, or have a more efficient way to batch-resolve IDs.
const enrichPurchaseOrders = async (pos: PurchaseOrder[]): Promise<PurchaseOrder[]> => {
    // Create sets of unique IDs to fetch
    const supplierIds = new Set<number>();
    const employeeIds = new Set<number>();
    pos.forEach(po => {
        supplierIds.add(po.supplier);
        // employeeIds.add(po.employee);
    });

    let supplierMap = new Map<number, string>();
    let employeeMap = new Map<number, string>();

    try {
        if (supplierIds.size > 0) {
            // Example: /api/suppliers/?id__in=1,2,3 (if backend supports this)
            // Or fetch all and filter client-side if lists are small
            const supplierRes = await api.get(`/api/suppliers/?limit=${supplierIds.size * 2}`); // Fetch more to be safe or use specific IDs
            supplierRes.data.results.forEach((s: { id: number, sup_name: string /* or actual name field */ }) => {
                if (supplierIds.has(s.id)) supplierMap.set(s.id, s.sup_name || `Supplier ${s.id}`);
            });
        }
        // if (employeeIds.size > 0) {
        //     const employeeRes = await api.get(`/api/employees/?limit=${employeeIds.size * 2}`);
        //     employeeRes.data.results.forEach((e: { id: number, emp_name: string /* or actual name field */ }) => {
        //         if (employeeIds.has(e.id)) employeeMap.set(e.id, e.emp_name || `Employee ${e.id}`);
        //     });
        // }
    } catch (error) {
        console.error("Error enriching POs:", error);
        // Continue without enrichment if it fails
    }

    return pos.map(po => ({
        ...po,
        supplier_name: supplierMap.get(po.supplier) || `Supplier ID: ${po.supplier}`,
        employee_name: employeeMap.get(po.employee) || `Emp. ID: ${po.employee}`,
    }));
};


const index = () => {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPurchaseOrders = useCallback(async (searchTerm = "", filterKey = "id") => {
        setIsLoading(true);
        let queryParams = `?limit=10000`; // Fetch many as requested

        if (searchTerm) {
            if (filterKey === "supplier_name" || filterKey === "employee_name") {
                queryParams += `&${filterKey}__icontains=${encodeURIComponent(searchTerm)}`;
            } else if (filterKey === "id" && !isNaN(Number(searchTerm))) {
                queryParams += `&id=${searchTerm}`;
            } else if (filterKey === "status") {
                queryParams += `&status__iexact=${encodeURIComponent(searchTerm.toUpperCase())}`;
            }
        }

        try {
            const res = await api.get(`/api/purchases/${queryParams}`);
            const rawPOs: PurchaseOrder[] = res.data.results || [];
            const enrichedPOs = await enrichPurchaseOrders(rawPOs); // Enrich with names
            setPurchaseOrders(enrichedPOs);
        } catch (err) {
            console.error("Failed to fetch purchase orders:", err);
            toast.error("Failed to fetch purchase orders. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    const handleSearch = (value: string, filter?: string) => {
        // Assuming filter from SearchBox is the key to search on
        fetchPurchaseOrders(value, filter?.toLowerCase().replace(' ', '_') || "id");
    };


    if (isLoading && purchaseOrders.length === 0) { // Show full page spinner only on initial load
        return (
            <Center h="calc(100vh - 200px)">
                <Spinner size="xl" />
            </Center>
        );
    }
    const groups = getUserGroups()

    const isShopOwner = groups.includes("Shop Owner")
    const isWarehouseManager = groups.includes("Warehouse Manager")

    return (isShopOwner || isWarehouseManager) && (
        <Col gap="20px" p={{ base: "15px", md: "20px" }}>
            <Row
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={{ base: 4, md: 2 }}
                mb={6}
            >
                {(isShopOwner) && (<RouterLink to="/purchase/add"> {/* Adjust to your "create purchase order" route */}
                    <CustomButton
                        label="+ Create New PO"
                    // Add other props like colorScheme if needed
                    />
                </RouterLink>)}
                <Box mb={6}>
                    <SearchBox
                        onEnter={handleSearch}
                        filterOptions={['PO ID', 'Supplier Name', 'Employee Name', 'Status']} // Example filters
                        placeholder="Search purchase orders..."
                    />
                </Box>
            </Row>

            {isLoading && purchaseOrders.length > 0 && ( // Inline spinner if refreshing data
                <Center py={4}><Spinner /></Center>
            )}
            <PurchaseOrderTable purchaseOrders={purchaseOrders} />
        </Col>
    );
};

export default index;