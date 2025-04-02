import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Alert } from "antd";
import useOrderStore from "../../../stores/orderStore";
import OrdersTable from "./components/OrdersTable";
import OrdersFilter from "./components/OrdersFilter";

const { Title } = Typography;

const OrdersList = () => {
  const { orders, isLoading, error, fetchOrders } = useOrderStore();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterPayment, setFilterPayment] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Fetch orders khi component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Lọc dữ liệu khi orders, searchText, filterStatus, filterPayment hoặc dateRange thay đổi
  useEffect(() => {
    let result = orders ? [...orders] : [];

    // Lọc theo searchText
    if (searchText && result.length > 0) {
      const lowercasedSearch = searchText.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(lowercasedSearch) ||
          order.customer.name.toLowerCase().includes(lowercasedSearch) ||
          order.customer.email.toLowerCase().includes(lowercasedSearch) ||
          order.customer.phone.includes(searchText)
      );
    }

    // Lọc theo trạng thái đơn hàng
    if (filterStatus && result.length > 0) {
      result = result.filter((order) => order.orderStatus === filterStatus);
    }

    // Lọc theo trạng thái thanh toán
    if (filterPayment && result.length > 0) {
      result = result.filter((order) => order.payment.status === filterPayment);
    }

    // Lọc theo khoảng thời gian
    if (dateRange && dateRange[0] && dateRange[1] && result.length > 0) {
      result = result.filter((order) => {
        const orderDate = new Date(
          order.orderDate.split("/").reverse().join("-")
        );
        const startDate = dateRange[0].startOf("day").toDate();
        const endDate = dateRange[1].endOf("day").toDate();
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredData(result);
  }, [orders, searchText, filterStatus, filterPayment, dateRange]);

  if (error && orders.length === 0) {
    return (
      <Alert
        message="Lỗi khi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        className="mb-4"
      />
    );
        }

        return (
    <div className="w-full">
      <Card className="shadow-sm rounded-lg">
        <Title level={4} className="mb-6">Danh sách đơn hàng</Title>

        <OrdersFilter 
          searchText={searchText}
          setSearchText={setSearchText}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPayment={filterPayment}
          setFilterPayment={setFilterPayment}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        
        <OrdersTable 
          data={filteredData}
          isLoading={isLoading}
          expandedRowKeys={expandedRowKeys}
          setExpandedRowKeys={setExpandedRowKeys}
        />
      </Card>
    </div>
  );
};

export default OrdersList;
