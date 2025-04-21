import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Tag,
  Descriptions,
  Select,
  Spin,
  Modal,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useUserStore from "@/stores/useUserStore";
import CreateUserModal from "./components/CreateUserModal";

const { RangePicker } = DatePicker;
const { Option } = Select;

const EmployeeList = () => {
  const { users, fetchUsers, fetchBannedUsers, isLoading, error } = useUserStore();
  const [bannedUsers, setBannedUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    status: undefined,
    dateRange: undefined,
    role: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUsers();
        const banned = await fetchBannedUsers();
        setBannedUsers(banned || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setBannedUsers([]);
      }
    };
    fetchData();
  }, [fetchUsers, fetchBannedUsers]);

  const isUserBanned = (userId) => {
    return bannedUsers?.some(user => user.id === userId) || false;
  };

  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const stringToColor = (str) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
          }
          const color = '#' + ('00000' + (hash & 0xFFFFFF).toString(16)).slice(-6);
          return color;
        };

        const avatarColor = stringToColor(record.email);

        return (
          <Space>
            {record.avatarUrl ? (
              <img
                src={record.avatarUrl}
                alt={text}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  marginRight: 8
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: avatarColor,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8
                }}
              >
                {record.email.charAt(0).toUpperCase()}
              </div>
            )}
            {text}
          </Space>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
      render: (roleName) => {
        const roleColors = {
          Staff: "blue",
          Accountant: "purple",
          Designer: "green",
          Manager: "orange",
        };
        const roleNames = {
          Staff: "Nhân viên bán hàng",
          Accountant: "Kế toán",
          Designer: "Thiết kế viên",
          Manager: "Quản lý",
        };
        const role = roleName?.charAt(0).toUpperCase() + roleName?.slice(1).toLowerCase();
        return role ? (
          <Tag color={roleColors[role] || "default"}>
            {roleNames[role] || role}
          </Tag>
        ) : (
          <Tag color="default">Không xác định</Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "id",
      key: "status",
      render: (id) => {
        const isBanned = isUserBanned(id);
        return (
          <Tag color={isBanned ? "red" : "green"}>
            {isBanned ? "Đã nghỉ việc" : "Đang làm việc"}
          </Tag>
        );
      },
    },
  ];

  const expandedRowRender = (record) => {
    const isBanned = isUserBanned(record.id);
    return (
      <Descriptions title="Thông tin chi tiết" bordered column={2}>
        <Descriptions.Item label="Họ và tên">{record.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{record.phone}</Descriptions.Item>
        <Descriptions.Item label="Vai trò">
          {record.roleName === "Staff" && "Nhân viên bán hàng"}
          {record.roleName === "Accountant" && "Kế toán"}
          {record.roleName === "Designer" && "Thiết kế viên"}
          {record.roleName === "Manager" && "Quản lý"}
          {!record.roleName && "Không xác định"}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          {record.address ? record.address.replace(/\|/g, ', ') : "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={isBanned ? "red" : "green"}>
            {isBanned ? "Đã nghỉ việc" : "Đang làm việc"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const handleCreateUser = async (values) => {
    try {
      // TODO: Implement user creation logic here
      console.log('Creating user:', values);
      setIsCreateModalVisible(false);
      // Refresh the user list after creation
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleExport = () => {
    let filteredData = [...(users || [])].filter(
      (user) => user.roleName !== "Customer" && user.roleName !== "Admin"
    );

    // Apply role filter
    if (exportFilters.role) {
      filteredData = filteredData.filter(
        (user) => user.roleName === exportFilters.role
      );
    }

    // Apply status filter
    if (exportFilters.status) {
      filteredData = filteredData.filter(user => {
        const isBanned = isUserBanned(user.id);
        return exportFilters.status === 'active' ? !isBanned : isBanned;
      });
    }

    // Apply date range filter
    if (exportFilters.dateRange) {
      const [startDate, endDate] = exportFilters.dateRange;
      filteredData = filteredData.filter(user => {
        const employeeDate = new Date(user.joinDate);
        return employeeDate >= startDate && employeeDate <= endDate;
      });
    }

    // Prepare data for export
    const exportData = filteredData.map(user => {
      const isBanned = isUserBanned(user.id);
      return {
        "Họ và tên": user.name,
        Email: user.email,
        "Số điện thoại": user.phone,
        "Vai trò": user.roleName === "Staff"
          ? "Nhân viên bán hàng"
          : user.roleName === "Accountant"
          ? "Kế toán"
          : user.roleName === "Designer"
          ? "Thiết kế viên"
          : user.roleName === "Manager"
          ? "Quản lý"
          : user.roleName,
        "Trạng thái": isBanned ? "Đã nghỉ việc" : "Đang làm việc",
        "Địa chỉ": user.address ? user.address.replace(/\|/g, ', ') : "Chưa cập nhật",
      };
    });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save file
    saveAs(
      data,
      `employees_export_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    setIsExportModalVisible(false);
  };

  const filteredEmployees = (users || [])
    .filter((employee) => {
      const matchSearch = searchText
        ? employee.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          employee.email?.toLowerCase().includes(searchText.toLowerCase())
        : true;

      const matchRole = roleFilter ? employee.roleName === roleFilter : true;

      return (
        matchSearch &&
        matchRole &&
        employee.roleName !== "Customer" &&
        employee.roleName !== "Admin"
      );
    })
    .map(employee => ({ ...employee, key: employee.id }));

  if (isLoading) {
    return (
      <Card title="Danh sách nhân viên">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    console.error('Error fetching users:', error);
    if (!users || users.length === 0) {
      return (
        <Card title="Danh sách nhân viên">
          <div style={{ textAlign: "center", color: "red" }}>
            Không thể tải dữ liệu nhân viên
          </div>
        </Card>
      );
    }
  }

  return (
    <Card
      title="Danh sách nhân viên"
      bodyStyle={{
        padding: "24px",
        overflow: "auto",
      }}
    >
      <div style={{ minWidth: "800px" }}>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input.Search
              placeholder="Tìm kiếm nhân viên"
              style={{ width: 300 }}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Lọc theo vai trò"
              style={{ width: 200 }}
              onChange={setRoleFilter}
              allowClear
            >
              <Option value="Staff">Nhân viên bán hàng</Option>
              <Option value="Accountant">Kế toán</Option>
              <Option value="Designer">Thiết kế viên</Option>
              <Option value="Manager">Quản lý</Option>
            </Select>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              onClick={() => setIsExportModalVisible(true)}
            >
              Xuất Excel
            </Button>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={() => setIsCreateModalVisible(true)}
            >
              Thêm nhân viên
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          pagination={{
            total: filteredEmployees.length,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          rowKey="id"
        />
      </div>
      <Modal
        title="Xuất danh sách nhân viên"
        open={isExportModalVisible}
        onOk={handleExport}
        onCancel={() => setIsExportModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <div style={{ marginBottom: 8 }}>Vai trò:</div>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn vai trò"
              onChange={(value) =>
                setExportFilters((prev) => ({ ...prev, role: value }))
              }
              allowClear
            >
              <Option value="Staff">Nhân viên bán hàng</Option>
              <Option value="Accountant">Kế toán</Option>
              <Option value="Designer">Thiết kế viên</Option>
              <Option value="Manager">Quản lý</Option>
            </Select>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>Trạng thái:</div>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn trạng thái"
              onChange={(value) =>
                setExportFilters((prev) => ({ ...prev, status: value }))
              }
              allowClear
            >
              <Option value="active">Đang làm việc</Option>
              <Option value="inactive">Đã nghỉ việc</Option>
            </Select>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>Khoảng thời gian:</div>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(dates) =>
                setExportFilters((prev) => ({ ...prev, dateRange: dates }))
              }
            />
          </div>
        </Space>
      </Modal>
      <CreateUserModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateUser}
      />
    </Card>
  );
};

export default EmployeeList;
