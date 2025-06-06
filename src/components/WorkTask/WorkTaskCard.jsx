import React from "react";
import {
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Divider,
  Space,
  Button,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeOutlined,
  DollarOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  getWorkTaskStatus,
  getServiceOrderStatus,
  formatDate,
  formatTime,
  formatCurrency,
} from "@/utils/statusUtils";
import "./WorkTaskCard.scss";

const { Text, Title } = Typography;

const WorkTaskCard = ({ workTask, onViewDetail }) => {
  const workTaskStatus = getWorkTaskStatus(workTask.status);
  const serviceOrderStatus = getServiceOrderStatus(
    workTask.serviceOrder?.status
  );

  return (
    <Card
      className="work-task-card"
      hoverable
      style={{
        borderRadius: "16px",
        boxShadow: "0 2px 16px rgba(24,144,255,0.08)",
        marginBottom: "18px",
        border: "none",
        background: "#fff",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      {/* Header */}
      <Row justify="space-between" align="top" style={{ marginBottom: "12px" }}>
        <Col>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#1890ff",
              }}
            >
              Công việc{" "}
              <span style={{ fontWeight: 400, color: "#999", fontSize: 15 }}>
                #{workTask.id.slice(-8)}
              </span>
            </span>
          </div>
          <div style={{ color: "#aaa", fontSize: 13 }}>
            Nhân viên: {workTask.userName}
          </div>
        </Col>
        <Col>
          <Space>
            <Tag
              className="work-task-status"
              color={workTaskStatus.color}
              style={{
                // background: workTaskStatus.bgColor,
                border: "none",
                borderRadius: "20px",
                fontWeight: 500,
                fontSize: 14,
                padding: "2px 14px",
              }}
            >
              {workTaskStatus.text}
            </Tag>
            {/* <Button size="small" type="primary" icon={<EyeOutlined />}>
              Chi tiết
            </Button> */}
          </Space>
        </Col>
      </Row>

      {/* Appointment Info */}
      <Row gutter={[16, 8]} style={{ marginBottom: "10px" }}>
        <Col xs={24} sm={12}>
          <Space>
            <CalendarOutlined style={{ color: "#52c41a" }} />
            <Text strong>Ngày hẹn:</Text>
            <Text>{formatDate(workTask.dateAppointment)}</Text>
          </Space>
        </Col>
        <Col xs={24} sm={12}>
          <Space>
            <ClockCircleOutlined style={{ color: "#fa8c16" }} />
            <Text strong>Giờ hẹn:</Text>
            <Text>{formatTime(workTask.timeAppointment)}</Text>
          </Space>
        </Col>
      </Row>

      {/* Note */}
      {workTask.note && (
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, marginRight: 4 }}>Ghi chú:</span>
          <Tooltip
            // Sử dụng render HTML cho nội dung tooltip
            title={
              <div
                style={{ maxWidth: 800 }}
                className="html-preview"
                dangerouslySetInnerHTML={{ __html: workTask.note }}
              />
            }
            color="white"
            overlayStyle={{
              maxWidth: 800,
              maxHeight: 400,
              overflow: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#d9d9d9 #f0f0f0",
            }}
            placement="top"
          >
            {" "}
            <div
              // className="html-preview"
              style={{
                width: "100%",
                maxWidth: 350,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
              dangerouslySetInnerHTML={{ __html: workTask.note }}
            />
          </Tooltip>
        </div>
      )}

      <Divider style={{ margin: "12px 0" }} />

      {/* Service Order Info */}
      <div
        className="service-order-section"
        style={{
          background: "#f8faff",
          padding: 12,
          borderRadius: 10,
        }}
      >
        <Row align="middle" style={{ marginBottom: 8 }}>
          <Col flex="auto">
            <span style={{ color: "#1890ff", fontWeight: 600, fontSize: 15 }}>
              Đơn hàng dịch vụ
            </span>
          </Col>
          <Col>
            <Tag
              color={serviceOrderStatus.color}
              style={{
                border: "none",
                borderRadius: "20px",
                fontWeight: 500,
                fontSize: 14,
                padding: "2px 14px",
              }}
            >
              {serviceOrderStatus.text}
            </Tag>
          </Col>
        </Row>

        {/* Customer Info */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Space style={{ marginBottom: "10px" }}>
            <TagOutlined style={{ color: "#1890ff" }} />
            <Text strong>Mã đơn hàng:</Text>
            <Text copyable>{workTask.serviceOrder?.id}</Text>
          </Space>
          <Space style={{ marginBottom: "10px" }}>
            <UserOutlined style={{ color: "#1890ff" }} />
            <Text strong>Khách hàng:</Text>
            <Text>{workTask.serviceOrder?.userName}</Text>
          </Space>
          <Space style={{ marginBottom: "10px" }}>
            <PhoneOutlined style={{ color: "#52c41a" }} />
            <Text strong>SĐT:</Text>
            <Text>{workTask.serviceOrder?.cusPhone}</Text>
          </Space>
          <Space style={{ marginBottom: "10px" }}>
            <MailOutlined style={{ color: "#fa8c16" }} />
            <Text strong>Email:</Text>
            <Text>{workTask.serviceOrder?.email}</Text>
          </Space>
        </div>
        {/* Address */}
        {workTask.serviceOrder?.address && (
          <Space align="start" style={{ marginBottom: "10px" }}>
            <EnvironmentOutlined
              style={{ color: "#722ed1", marginTop: "4px" }}
            />
            <div>
              <Text strong>Địa chỉ: </Text>
              <Text>{workTask.serviceOrder.address.replace(/\|/g, ", ")}</Text>
            </div>
          </Space>
        )}
        <Row gutter={[16, 8]} style={{ marginBottom: "10px" }}>
          {/* <Col xs={24} sm={12}></Col> */}
          <Col xs={24} sm={12}>
            <Space>
              <DollarOutlined style={{ color: "#722ed1" }} />
              <Text strong>Tổng tiền:</Text>
              <Text strong style={{ color: "#f5222d" }}>
                {formatCurrency(workTask.serviceOrder?.totalCost)}
              </Text>
            </Space>
          </Col>
        </Row>
        {/* Project Info */}
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <Text strong>Loại dịch vụ: </Text>
            <Text>
              {workTask.serviceOrder?.serviceType === "NoDesignIdea"
                ? "Thiết kế theo yêu cầu"
                : "Thiết kế có sẵn"}
            </Text>
          </Col>
          {workTask.serviceOrder?.length && workTask.serviceOrder?.width && (
            <Col xs={24} sm={12}>
              <Text strong>Kích thước: </Text>
              <Text>
                {workTask.serviceOrder?.length} x {workTask.serviceOrder?.width}{" "}
                m
              </Text>
            </Col>
          )}
        </Row>
      </div>

      {/* Creation Date */}
      <div
        style={{
          marginTop: 8,
          textAlign: "right",
          color: "#bbb",
          fontSize: 12,
        }}
      >
        Tạo ngày: {formatDate(workTask.creationDate)}
      </div>
    </Card>
  );
};

export default WorkTaskCard;
