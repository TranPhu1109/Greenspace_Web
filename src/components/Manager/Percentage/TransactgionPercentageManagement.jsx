import React, { useEffect, useState } from "react";
import { Card, Form, InputNumber, Button, Spin, Typography, message, Row, Col, Slider, notification } from "antd";
import { InfoCircleOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import usePercentageStore from "@/stores/usePercentageStore";

const { Title, Paragraph } = Typography;

const TransactionPercentageManagement = () => {
  const { data, loading, error, fetchPercentage, createPercentage, updatePercentage } = usePercentageStore();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPercentage();
  }, [fetchPercentage]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (!data) {
        const success = await createPercentage(values);
        if (success) {
          notification.success({
            message: "Thành công ",
            description: "🎉 Tạo tỷ lệ đặt cọc và hoàn cọc thành công!",
          });
          
          fetchPercentage();
        }
      } else {
        const success = await updatePercentage(data.id, values);
        if (success) {
          notification.success({
            message: "Thành công ",
            description: "🎉 Cập nhật tỷ lệ thành công!",
          });
          fetchPercentage();
        }
      }
    } catch (error) {
      notification.error({
        message: "Lỗi ",
        description: "❗ Có lỗi xảy ra, vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Spin tip="Đang tải dữ liệu tỷ lệ..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={3}>Quản lý tỷ lệ Đặt cọc / Hoàn cọc</Title>

      <Card
        style={{ marginBottom: 24 }}
        type="inner"
        title={<span><InfoCircleOutlined /> Hướng dẫn thiết lập ✍️</span>}
      >
        <Paragraph>
          ✅ <strong>Tỷ lệ Đặt cọc</strong> phải từ <strong>30% đến 80%</strong> tổng giá trị đơn hàng.
        </Paragraph>
        <Paragraph>
          ✅ <strong>Tỷ lệ Hoàn cọc</strong> phải từ <strong>10% đến 50%</strong> số tiền khách đã cọc.
        </Paragraph>
        <Paragraph type="secondary">
          Ví dụ: Nếu khách đặt cọc 40% thì hoàn tối đa 20% số tiền đã cọc khi hủy đơn.
        </Paragraph>
        <Paragraph type="warning">
          ⚠️ Hãy nhập đúng quy định để hệ thống xử lý đơn hàng chính xác nhé!
        </Paragraph>
      </Card>

      <Card bordered style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            depositPercentage: data?.depositPercentage ?? 30,
            refundPercentage: data?.refundPercentage ?? 10,
          }}
          onFinish={handleSubmit}
          size="large"
        >
          {/* <Row gutter={[64, 32]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#1890ff", fontWeight: 500 }}>🔵 Tỷ lệ Đặt cọc (%)</span>}
                name="depositPercentage"
                validateTrigger="onChange"
                rules={[
                  { required: true, message: "Vui lòng nhập tỷ lệ đặt cọc" },
                  { type: "number", min: 30, max: 80, message: "Tỷ lệ từ 30% đến 80%" },
                ]}
              >
                <Slider
                  min={30}
                  max={80}
                  marks={{ 30: "30%", 40: "40%", 50: "50%", 60: "60%", 70: "70%", 80: "80%" }}
                  tooltip={{ formatter: value => `${value}%` }}
                  onChange={(value) => form.setFieldsValue({ depositPercentage: value })}
                />
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, current) => prev.depositPercentage !== current.depositPercentage}
              >
                {({ getFieldValue, setFieldsValue }) => (
                  <InputNumber
                    min={30}
                    max={80}
                    value={getFieldValue("depositPercentage")}
                    onChange={(value) => setFieldsValue({ depositPercentage: value })}
                    style={{ width: "100%", marginTop: 8 }}
                    addonAfter="%"
                  />
                )}
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#22c55e", fontWeight: 500 }}>🟢 Tỷ lệ Hoàn cọc (%)</span>}
                name="refundPercentage"
                rules={[
                  { required: true, message: "Vui lòng nhập tỷ lệ hoàn cọc" },
                  { type: "number", min: 10, max: 50, message: "Tỷ lệ từ 10% đến 50%" },
                ]}
              >
                <Slider
                  min={10}
                  max={50}
                  marks={{ 10: "10%", 20: "20%", 30: "30%", 40: "40%", 50: "50%" }}
                  tooltip={{ formatter: value => `${value}%` }}
                  onChange={(value) => form.setFieldsValue({ refundPercentage: value })}
                />
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, current) => prev.refundPercentage !== current.refundPercentage}
              >
                {({ getFieldValue, setFieldsValue }) => (
                  <InputNumber
                    min={10}
                    max={50}
                    value={getFieldValue("refundPercentage")}
                    onChange={(value) => setFieldsValue({ refundPercentage: value })}
                    style={{ width: "100%", marginTop: 8 }}
                    addonAfter="%"
                  />
                )}
              </Form.Item>
            </Col>
          </Row> */}
          <Row gutter={[64, 32]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#1890ff", fontWeight: 500 }}>🔵 Tỷ lệ Đặt cọc (%)</span>}
                name="depositPercentage"
                validateTrigger="onChange"
                rules={[
                  { required: true, message: "Vui lòng nhập tỷ lệ đặt cọc" },
                  { type: "number", min: 30, max: 80, message: "Tỷ lệ phải từ 30% đến 80%" },
                ]}
              >
                <Slider
                  min={30}
                  max={80}
                  marks={{ 30: "30%", 40: "40%", 50: "50%", 60: "60%", 70: "70%", 80: "80%" }}
                  tooltip={{ formatter: value => `${value}%` }}
                  onChange={(value) => {
                    form.setFieldsValue({ depositPercentage: value });
                    form.validateFields(["depositPercentage"]); // 👉 Force validate immediately
                  }}
                />
              </Form.Item>

              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue, setFieldsValue }) => (
                  <InputNumber
                    min={30}
                    max={80}
                    value={getFieldValue("depositPercentage")}
                    onChange={(value) => {
                      setFieldsValue({ depositPercentage: value });

                      if (value < 30 || value > 80) {
                        form.setFields([
                          {
                            name: "depositPercentage",
                            errors: ["Tỷ lệ đặt cọc phải từ 30% đến 80%"],
                          },
                        ]);
                      } else {
                        form.setFields([
                          {
                            name: "depositPercentage",
                            errors: [],
                          },
                        ]);
                      }
                    }}
                    style={{ width: "100%", marginTop: 8 }}
                    addonAfter="%"
                  />
                )}
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#22c55e", fontWeight: 500 }}>🟢 Tỷ lệ Hoàn cọc (%)</span>}
                name="refundPercentage"
                validateTrigger="onChange"
                rules={[
                  { required: true, message: "Vui lòng nhập tỷ lệ hoàn cọc" },
                  { type: "number", min: 10, max: 50, message: "Tỷ lệ phải từ 10% đến 50%" },
                ]}
              >
                <Slider
                  min={10}
                  max={50}
                  marks={{ 10: "10%", 20: "20%", 30: "30%", 40: "40%", 50: "50%" }}
                  tooltip={{ formatter: value => `${value}%` }}
                  onChange={(value) => {
                    form.setFieldsValue({ refundPercentage: value });
                    form.validateFields(["refundPercentage"]); // 👉 Force validate immediately
                  }}
                />
              </Form.Item>

              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue, setFieldsValue }) => (
                  <InputNumber
                    min={10}
                    max={50}
                    value={getFieldValue("refundPercentage")}
                    onChange={(value) => {
                      setFieldsValue({ refundPercentage: value });

                      if (value < 10 || value > 50) {
                        form.setFields([
                          {
                            name: "refundPercentage",
                            errors: ["Tỷ lệ hoàn cọc phải từ 10% đến 50%"],
                          },
                        ]);
                      } else {
                        form.setFields([
                          {
                            name: "refundPercentage",
                            errors: [],
                          },
                        ]);
                      }
                    }}
                    style={{ width: "100%", marginTop: 8 }}
                    addonAfter="%"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>


          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              icon={data ? <SaveOutlined /> : <PlusOutlined />}
            >
              {data ? "Cập nhật tỷ lệ" : "Tạo tỷ lệ mới"}
            </Button>
          </div>
        </Form>
      </Card>

    </div>
  );
};

export default TransactionPercentageManagement;
