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
          <Option value="0">Chờ xử lý</Option>
          <Option value="1">Đang xử lý</Option>
          <Option value="2">Đã xử lý</Option>
          <Option value="3">Đã hủy</Option>
          <Option value="4">Đã hoàn tiền</Option>
          <Option value="5">Đã hoàn tiền xong</Option>
          <Option value="6">Đã lấy hàng & đang giao</Option>
          <Option value="7">Giao hàng thất bại</Option>
          <Option value="8">Giao lại</Option>
          <Option value="9">Đã giao hàng thành công</Option>
        </Select>
      </Col>
      {/* <Col xs={24} sm={12} md={6}>
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
      </Col> */}
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