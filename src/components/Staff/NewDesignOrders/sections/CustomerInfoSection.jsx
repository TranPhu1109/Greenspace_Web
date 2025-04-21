import React from "react";
import { Card, Descriptions } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "./CustomerInfoSection.scss";

const CustomerInfoSection = ({ customer }) => {
  console.log("CustomerInfoSection received:", customer);

  if (!customer) {
    console.error("No customer data provided to CustomerInfoSection");
    return <Card title="Thông tin khách hàng">Không có dữ liệu</Card>;
  }

  return (
    <Card
      title="Thông tin khách hàng"
      style={{
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        borderRadius: "12px",
        border: "1px solid #f0f0f0",
      }}
      styles={{
        header: {
          background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
          color: "white",
          borderRadius: "12px 12px 0 0",
          padding: "16px 20px",
          fontSize: "16px",
          fontWeight: "600",
          border: "none",
        },
      }}
    >
      <Descriptions column={{ xs: 1, sm: 2 }} bordered>
        <Descriptions.Item
          label={
            <>
              <UserOutlined /> Họ tên
            </>
          }
        >
          {customer.userName}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <PhoneOutlined /> Số điện thoại
            </>
          }
        >
          {customer.cusPhone}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <MailOutlined /> Email
            </>
          }
        >
          {customer.email}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <HomeOutlined /> Địa chỉ
            </>
          }
        >
          {customer.address?.replace(/\|/g, ", ")}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CustomerInfoSection;
