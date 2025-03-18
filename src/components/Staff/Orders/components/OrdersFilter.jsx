import React from "react";
import { Input, Select, DatePicker, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrdersFilter = ({
  searchText,
  setSearchText,
  filterStatus,
  setFilterStatus,
  filterPayment,
  setFilterPayment,
  dateRange,
  setDateRange,
}) => {
  return (
    <Row gutter={[16, 16]} className="mb-6" style={{ marginBottom: "10px" }}>
      <Col xs={24} sm={12} md={6}>
        <Input
          placeholder="Tìm kiếm theo mã đơn, tên, email, SĐT"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Select
          placeholder="Trạng thái đơn hàng"
          className="w-full"
          allowClear
          value={filterStatus}
          onChange={setFilterStatus}
        >
          <Option value="chờ xác nhận">Chờ xác nhận</Option>
          <Option value="đã xác nhận">Đã xác nhận</Option>
          <Option value="đã giao cho đơn vị vận chuyển">Đã giao cho ĐVVC</Option>
          <Option value="đang giao hàng">Đang giao hàng</Option>
          <Option value="đã giao hàng">Đã giao hàng</Option>
          <Option value="đơn bị từ chối">Đơn bị từ chối</Option>
          <Option value="đã hủy">Đã hủy</Option>
        </Select>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Select
          placeholder="Trạng thái thanh toán"
          className="w-full"
          allowClear
          value={filterPayment}
          onChange={setFilterPayment}
        >
          <Option value="đã thanh toán">Đã thanh toán</Option>
          <Option value="chưa thanh toán">Chưa thanh toán</Option>
        </Select>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <RangePicker
          className="w-full"
          onChange={setDateRange}
          value={dateRange}
          placeholder={["Từ ngày", "Đến ngày"]}
        />
      </Col>
    </Row>
  );
};

export default OrdersFilter; 