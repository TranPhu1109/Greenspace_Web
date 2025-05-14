import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Switch,
  Checkbox,
  Row,
  Col,
} from "antd";
import useUserStore from "../../../../stores/useUserStore";

const { Option } = Select;

const CreateUserModal = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { users } = useUserStore();

  const roles = [
    { value: "admin", label: "Quản trị viên", defaultPassword: "123456" },
    { value: "manager", label: "Quản lý", defaultPassword: "123456" },
    {
      value: "accountant",
      label: "Kế toán",
      defaultPassword: "123456",
    },
    { value: "staff", label: "Nhân viên", defaultPassword: "123456" },
    { value: "designer", label: "Nhà thiết kế", defaultPassword: "123456" },
    { value: "contructor", label: "Đội thi công", defaultPassword: "123456" },
  ];

  const handleSubmit = async (values) => {
    try {
      // If not using custom password, use the default password for the selected role
      if (!useCustomPassword) {
        const selectedRole = roles.find(
          (role) => role.value === values.roleName
        );
        values.password = selectedRole.defaultPassword;
      }
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Email validation against existing users
  const validateEmail = async (_, value) => {
    if (!value) return;
    const emailExists = users.some((user) => user.email === value);
    if (emailExists) {
      throw new Error("Email đã tồn tại trong hệ thống!");
    }
  };

  // Phone validation against existing users
  const validatePhone = async (_, value) => {
    if (!value) return;
    const phoneExists = users.some((user) => user.phone === value);
    if (phoneExists) {
      throw new Error("Số điện thoại đã tồn tại trong hệ thống!");
    }
  };

  return (
    <Modal
      title="Thêm nhân viên mới"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: "100%" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input placeholder="Nhập tên người dùng" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
              { validator: validateEmail },
            ]}
          >
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>

          <Form.Item
            name="roleName"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select placeholder="Chọn vai trò">
              {roles.map((role) => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { validator: validatePhone },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <div
                style={{ display: "flex", alignItems: "center", gap: "41px" }}
              >
                <span>Mật khẩu</span>
                <Checkbox
                  checked={useCustomPassword}
                  onChange={(e) => setUseCustomPassword(e.target.checked)}
                >
                  Tùy chỉnh mật khẩu
                </Checkbox>
              </div>
            }
            rules={[
              {
                required: useCustomPassword,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password
              placeholder={
                useCustomPassword
                  ? "Nhập mật khẩu"
                  : "Sử dụng mật khẩu mặc định theo vai trò"
              }
              disabled={!useCustomPassword}
            />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
        </div>

        <Form.Item
          style={{ textAlign: "right", marginBottom: 0, marginTop: "20px" }}
        >
          <Button onClick={onCancel} style={{ marginRight: 8 }} disabled={submitLoading}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={submitLoading}>
            Thêm mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
