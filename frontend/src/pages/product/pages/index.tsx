import React, { useEffect, useState } from "react";
import { Col } from "../../../components/Col";
import { Row } from "../../../components/Row";
import { Box, Grid, GridItem, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import CustomButton from "../../../components/CustomButton";
import SearchBox from "../../../components/SearchBox";
import api from "../../../api";
import ProductCard from "../components/ProductCard";
import { toast } from "sonner";

type Product = {
    id: number
    prod_name: string;
    prod_type: string;
    category: string;
    prod_price: number;
    total_inventory: number;
    image?: string;
};

const index = () => {

    const [products, setProducts] = useState<Product[]>([])
    const [searchValue, setSearchValue] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("");

    useEffect(() => {
        getProducts()
    }, [])

    const handleEnter = (value: string, filter: string | undefined) => {
        setSearchValue(value);
        (filter) && setSelectedFilter(filter.toLowerCase());
        searchProduct(value, filter)
        console.log('handle enter', products)
    };

    const getProducts = () => {
        api.get("/api/products/?limit=10000")
            .then((res) => res.data.results)
            .then((data) => {
                setProducts(data)
            })
            .catch((err) => toast.error(err))
    }

    const searchProduct = (value, filter) => {
        console.log(`/api/products/?${filter.toLowerCase()}=${value}&?limit=10000`)
        api.get(`/api/products/?${filter.toLowerCase()}=${value}&?limit=10000`)
            .then((res) => res.data.results)
            .then((data) => {
                console.log(data)
                setProducts(data)
            })
            .catch((err) => toast.error(err))
    }

    return (
        <Col gap={50}>
            <Row justifyContent={{ base: "start", lg: "space-between" }}>
                <Link to={"/products/add/"}>
                    <CustomButton
                        label="+ Create New Product"
                        display={{ base: "none", lg: "inline-flex" }}
                    />
                </Link>
                <SearchBox filterOptions={['Name', 'Type', 'Category', 'Price']} onEnter={handleEnter} />
            </Row>
            <Box justifyContent={'center'} w={'100%'}>
                <Grid
                    templateColumns="repeat(auto-fill, minmax(280px, 1fr))"
                    gap={5}
                    w={'100%'}
                    justifyItems={'center'}
                >

                    {products ?

                        products.map((product, idx) => (
                            <GridItem key={idx}>
                                <ProductCard
                                    id={product.id}
                                    prod_name={product.prod_name}
                                    prod_type={product.prod_type}
                                    category={product.category}
                                    prod_price={product.prod_price}
                                    total_inventory={product.total_inventory}
                                    image={product.image} />
                            </GridItem>
                        )) :
                        <Box bg="white" borderRadius="lg" boxShadow="lg" p={4} textAlign="center">
                            <Text>No products found.</Text>
                        </Box>
                    }
                </Grid>
            </Box>
        </Col >
    );
};

export default index;
