import React from "react";
import { Row, Col, Button, Select } from "antd";
import { LeftOutlined, RightOutlined, CalendarOutlined } from "@ant-design/icons";
import "./styles/CalendarHeader.scss";

const { Option } = Select;

const CalendarHeader = ({
  value,
  onChange,
  onAddNew,
  designers = [],
  selectedDesigner = "all",
  onDesignerChange,
}) => {
  // Xử lý thay đổi tháng
  const handlePrevMonth = () => {
    const newValue = value.clone().subtract(1, "month");
    onChange(newValue);
  };

  const handleNextMonth = () => {
    const newValue = value.clone().add(1, "month");
    onChange(newValue);
  };

  const handleToday = () => {
    onChange(value.clone().date(new Date().getDate()));
  };

  return (
    <div className="calendar-header">
      <Row justify="space-between" align="middle">
        {/* Cột bên trái: Nút Hôm nay */}
        <Col xs={6} sm={6} md={6} lg={6}>
          <Button 
            onClick={handleToday}
            icon={<CalendarOutlined />}
            className="today-button"
          >
            Hôm nay
          </Button>
        </Col>
        
        {/* Cột giữa: Điều hướng tháng */}
        <Col xs={12} sm={12} md={12} lg={12} className="month-navigation">
          <Button.Group>
            <Button onClick={handlePrevMonth} icon={<LeftOutlined />} />
            <Button className="month-display">
              {value.format("MMMM YYYY")}
            </Button>
            <Button onClick={handleNextMonth} icon={<RightOutlined />} />
          </Button.Group>
        </Col>
        
        {/* Cột bên phải: Lọc designers */}
        <Col xs={6} sm={6} md={6} lg={6} className="designer-filter">
          <Select
            value={selectedDesigner}
            onChange={onDesignerChange}
            style={{ width: '100%' }}
            placeholder="Chọn designer"
          >
            <Option value="all">Tất cả designers</Option>
            {designers.map((designer) => (
              <Option key={designer.id} value={designer.id}>
                {designer.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default CalendarHeader;
