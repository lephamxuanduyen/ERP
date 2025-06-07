import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../../../api'
import { Row } from '../../../components/Row';
import { Col } from '../../../components/Col';
import { Link } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';
import SearchBox from '../../../components/SearchBox';
import DiscountTable from '../components/DiscountTable';

const index = () => {
  const [discounts, setDiscounts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("")

  useEffect(() => {
    getDiscounts();
  }, []);

  const handelSearch = (value: string, filter: string | undefined) => {
    setSearchValue(value)
    if (filter?.toLowerCase() === "name") searchDiscountByName(value)
    else if (filter?.toLowerCase() === 'product') searchDiscountByProduct(value)
  }

  const searchDiscountByName = (value: string) => {
    api.get(`/api/discounts/?name=${value}&?limit=10000`)
      .then(res => res.data.results)
      .then(data => setDiscounts(data))
      .catch(err => toast.error("Failed to search discounts"));
  };

  const searchDiscountByProduct = (variant: string) => {
    api.get(`/api/discounts/?product=${variant}&?limit=10000`)
      .then(res => res.data.results)
      .then(data => setDiscounts(data))
      .catch(err => toast.error(err))
  }

  const getDiscounts = () => {
    api.get("/api/discounts/?limit=10000")
      .then((res) => setDiscounts(res.data.results))
      .catch((err) => toast.error("Failed to fetch discounts"));
  };

  const handelSelectFilter = (filter: string) => {
    setSelectedFilter(filter)
  }

  return (
    <Col gap="50px">
      <Row justifyContent={{ base: "start", lg: "space-between" }}>
        <Link to={"/promotion/discount/add"}>
          <CustomButton
            label="+ Create New Discount"
            display={{ base: "none", lg: "inline-flex" }}
          />
        </Link>
        <SearchBox
          onEnter={handelSearch}
          filterOptions={['Name', 'Product']}
          onFilterSelect={handelSelectFilter}
        />
      </Row>
      <DiscountTable discounts={discounts} />
    </Col>
  )
}

export default index