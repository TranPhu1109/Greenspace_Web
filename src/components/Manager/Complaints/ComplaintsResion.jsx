import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Input, Form, Popconfirm, message, Typography, Card, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import useComplaintReasonStore from "@/stores/useComplaintReasonStore";

const { Title } = Typography;

const ComplaintReasonManage = () => {
  const [form] = Form.useForm();
  const [editingReason, setEditingReason] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const reasons = useComplaintReasonStore((state) => state.reasons);
  const loading = useComplaintReasonStore((state) => state.loading);
  const fetchReasons = useComplaintReasonStore((state) => state.fetchComplaintReasons);
  const createReason = useComplaintReasonStore((state) => state.createComplaintReason);
  const updateReason = useComplaintReasonStore((state) => state.updateComplaintReason);
  const deleteReason = useComplaintReasonStore((state) => state.deleteComplaintReason);

  useEffect(() => {
    fetchReasons();
  }, [fetchReasons]);

  const handleAdd = () => {
    setEditingReason(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (reason) => {
    setEditingReason(reason);
    form.setFieldsValue({ reason: reason.reason });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteReason(id);
      message.success("Xóa lý do thành công!");
      fetchReasons();
    } catch (error) {
      message.error("Xóa lý do thất bại!");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingReason) {
        await updateReason(editingReason.id, values.reason);
        message.success("Cập nhật lý do thành công!");
      } else {
        await createReason(values.reason);
        message.success("Thêm lý do thành công!");
      }
      setModalVisible(false);
      fetchReasons();
    } catch (error) {
      console.error(error);
      message.error("Thao tác thất bại!");
    }
  };

  const columns = [
    {
      title: "Lý do khiếu nại",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text} placement="top">
          <span style={{ maxWidth: 220, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa lý do này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      bodyStyle={{ padding: 0, background: '#fafbfc' }}
      style={{ boxShadow: 'none', border: 'none', margin: 0 }}
    >
      <div style={{ padding: 16, paddingBottom: 0 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm lý do mới
          </Button>
        </Space>
      </div>
      <div style={{ padding: 16, paddingTop: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={reasons}
          loading={loading}
          size="middle"
          bordered
          pagination={{ pageSize: 8 }}
          style={{ background: '#fff', borderRadius: 8 }}
        />
      </div>
      <Modal
        open={modalVisible}
        title={editingReason ? "Cập nhật lý do" : "Thêm lý do mới"}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        okText="Lưu"
        cancelText="Hủy"
        width={400}
        centered
        bodyStyle={{ paddingTop: 16 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Lý do"
            rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
          >
            <Input placeholder="Nhập lý do khiếu nại..." maxLength={100} showCount allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ComplaintReasonManage;
