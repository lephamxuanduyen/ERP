import { Text, Image, Card, defineTextStyles } from '@chakra-ui/react';
import React from 'react'
import { noImage } from '../../../assets/image';
import { Link } from 'react-router-dom';

type ProductCardProps = {
    id: number;
    prod_name: string;
    prod_type: string;
    category: string;
    prod_price: number;
    total_inventory: number;
    image?: string;
};

const ProductCard: React.FC<ProductCardProps> = ({ id, prod_name, prod_type, category, prod_price, total_inventory, image }) => {
    return (
        <Card.Root
            borderWidth={'1px'}
            borderRadius={'md'}
            overflow={'hidden'}
            p={4}
            w={300}
            minH={250}
            boxShadow={'0px 5px 90px 0px rgba(0, 0, 0, 0.20)'}>
            <Image src={image ? image : noImage} alt={prod_name} boxSize={60} w={'100%'} objectFit={'cover'} borderRadius={'md'} />
            <Link to={`/products/edit/${id}/`}>
                <Card.Header>
                    <Text as={'div'} style={{
                        fontWeight: 'bold',
                        fontSize: 'lg',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }} >
                        {prod_name}
                    </Text>
                </Card.Header>
                <Card.Body gap={2}>
                    <Text fontSize={'sm'}>
                        <b>Product type:</b> {prod_type}
                    </Text>
                    <Text fontSize={'sm'}>
                        <b>Category:</b> {category}
                    </Text>
                    <Text fontSize={'sm'}>
                        <b>Price:</b> {prod_price}
                    </Text>
                    <Text fontSize={'sm'}>
                        <b>Inventory:</b> {total_inventory}
                    </Text>
                </Card.Body>
            </Link>
        </Card.Root >
    )
}

export default ProductCard