import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Alert } from "antd";
import useOrderStore from "../../../stores/orderStore";
import useProductStore from "../../../stores/useProductStore";
import OrdersTable from "./components/OrdersTable";
import OrdersFilter from "./components/OrdersFilter";

const { Title } = Typography;

const OrdersList = () => {
  const { orders, isLoading, error, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterPayment, setFilterPayment] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Fetch orders và products khi component mount
  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  // Lọc dữ liệu khi orders, searchText, filterStatus, filterPayment hoặc dateRange thay đổi
  useEffect(() => {
    let result = orders ? [...orders] : [];

    // Lọc theo searchText
    if (searchText && result.length > 0) {
      const lowercasedSearch = searchText.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(lowercasedSearch) ||
          (order && (
            (order.userName && order.userName.toLowerCase().includes(lowercasedSearch)) ||
            (order.email && order.email.toLowerCase().includes(lowercasedSearch)) ||
            (order.phone && order.phone.includes(searchText))
          ))
      );
    }

    // Lọc theo trạng thái đơn hàng
    if (filterStatus && result.length > 0) {
      result = result.filter((order) => order.status === filterStatus);
    }

    // Lọc theo khoảng thời gian
    if (dateRange && dateRange[0] && dateRange[1] && result.length > 0) {
      result = result.filter((order) => {
        const orderDate = new Date(
          order.creationDate.split("/").reverse().join("-")
        );
        const startDate = dateRange[0].startOf("day").toDate();
        const endDate = dateRange[1].endOf("day").toDate();
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredData(result);
  }, [orders, searchText, filterStatus, dateRange]);

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-lg">
        <Title level={4} className="mb-6">Danh sách đơn hàng</Title>

        <OrdersFilter 
          searchText={searchText}
          setSearchText={setSearchText}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        
        <OrdersTable 
          data={filteredData}
          products={products}
          isLoading={isLoading}
          expandedRowKeys={expandedRowKeys}
          setExpandedRowKeys={setExpandedRowKeys}
        />
      </Card>
    </div>
  );
};

export default OrdersList;
