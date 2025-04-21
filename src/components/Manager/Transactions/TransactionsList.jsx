import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Space,
  Input,
  Button,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  message,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "./TransactionsList.scss";

const { Text } = Typography;

// Add this import at the top with other imports
import useTransactionStore from "../../../stores/useTransactionStore";

const TransactionsList = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [form] = Form.useForm();

  // Replace the local state with store state
  const { 
    transactions, 
    isLoading, 
    fetchTransactions, 
    updateTransaction 
  } = useTransactionStore();

  // Update handleSubmit to use store's updateTransaction
  const handleSubmit = async (values) => {
    try {
      await updateTransaction(editingTransaction.id, {
        amount: values.amount,
        notes: values.notes,
        processedBy: currentUser.name,
      });

      setIsModalVisible(false);
      form.resetFields();
      message.success("Cập nhật giao dịch thành công");
      fetchTransactions();
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  // Remove the local fetchTransactions function since we're using the store's version

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const columns = [
    {
      title: "Mã giao dịch",
      dataIndex: "transactionId",
      key: "transactionId",
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Nội dung chuyển khoản",
      dataIndex: "transferContent",
      key: "transferContent",
    },
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp) => moment(timestamp).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "success" ? "green" : "red"}>
          {status === "success" ? "Thành công" : "Thất bại"}
        </Tag>
      ),
    },
    {
      title: "Người xử lý",
      dataIndex: "processedBy",
      key: "processedBy",
    },
    // {
    //   title: "Ghi chú",
    //   dataIndex: "notes",
    //   key: "notes",
    //   render: (notes) => (
    //     <Text ellipsis={{ tooltip: notes }}>{notes || "Không có"}</Text>
    //   ),
    // },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.status === "pending" && (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Cập nhật
            </Button>
          </Space>
        ),
    },
  ];

  const handleEdit = (record) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      amount: record.amount,
      notes: record.notes,
    });
    setIsModalVisible(true);
  };

  

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.transactionId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.transferContent.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="transactions-container">
      <Card title="Lịch sử giao dịch">
        <Row gutter={[16, 16]} className="mb-4">
          <Col flex="300px">
            <Input
              placeholder="Tìm kiếm giao dịch..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col flex="auto" style={{ textAlign: "right" }}>
            <Button icon={<ReloadOutlined />} onClick={fetchTransactions}>
              Làm mới
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="transactionId"
          loading={isLoading}
        />
      </Card>

      <Modal
        title="Cập nhật giao dịch"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[{ required: true, message: "Vui lòng nhập số tiền!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              prefix="₫"
            />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space style={{ float: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TransactionsList;