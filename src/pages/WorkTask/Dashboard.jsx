import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  Alert,
  Empty,
  Button,
  Space,
  Select,
  Input,
  DatePicker,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import useWorkTaskStore from "@/stores/useWorkTaskStore";
import useAuthStore from "@/stores/useAuthStore";
import WorkTaskCard from "@/components/WorkTask/WorkTaskCard";
import { getWorkTaskStatus, getServiceOrderStatus } from "@/utils/statusUtils";
import dayjs from "dayjs";
import "./Dashboard.scss";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const WorkTaskDashboard = () => {
  const { user } = useAuthStore();
  const { workTasks, isLoading, error, fetchWorkTasks, clearError } =
    useWorkTaskStore();

  // Filter states
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  // Load work tasks on component mount
  useEffect(() => {
    if (user?.id) {
      loadWorkTasks();
    }
  }, [user]);

  // Filter tasks when workTasks or filters change
  useEffect(() => {
    filterTasks();
  }, [workTasks, searchText, statusFilter, dateRange]);

  const loadWorkTasks = async () => {
    try {
      await fetchWorkTasks(user.id);
    } catch (error) {
      message.error("Không thể tải danh sách công việc");
    }
  };

  const filterTasks = () => {
    let filtered = [...workTasks];

    // Role-based filter - only show tasks relevant to user's role
    const userRole = user?.roleName?.toLowerCase();
    if (userRole === "designer") {
      filtered = filtered.filter((task) =>
        [
          "ConsultingAndSket",
          "DoneConsulting",
          "Design",
          "DoneDesign",
        ].includes(task.status)
      );
    } else if (userRole === "contructor") {
      filtered = filtered.filter((task) =>
        [
          "Completed",
          "Pending",
          "Installing",
          "DoneInstalling",
          "ReInstall",
          "Cancle",
        ].includes(task.status)
      );
    }

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (task) =>
          task.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
          task.serviceOrder?.userName
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          task.note.toLowerCase().includes(searchText.toLowerCase()) ||
          task.id.toLowerCase().includes(searchText.toLowerCase())  ||
          task.serviceOrder?.id?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter((task) => {
        const taskDate = dayjs(task.dateAppointment);
        return (
          taskDate.isAfter(dateRange[0].startOf("day")) &&
          taskDate.isBefore(dateRange[1].endOf("day"))
        );
      });
    }

    setFilteredTasks(filtered);
  };

  const handleViewDetail = (task) => {
    // TODO: Navigate to task detail page or open modal
    console.log("View task detail:", task);
    message.info("Chức năng xem chi tiết sẽ được phát triển");
  };

  // Get status options based on user role
  const getStatusOptions = () => {
    const userRole = user?.roleName?.toLowerCase();

    if (userRole === "designer") {
      return [
        { value: "ConsultingAndSket", label: "Tư vấn & Phác thảo" },
        { value: "DoneConsulting", label: "Hoàn thành tư vấn" },
        { value: "Design", label: "Thiết kế" },
        { value: "DoneDesign", label: "Hoàn thành thiết kế" },
      ];
    } else if (userRole === "contructor") {
      return [
        { value: "Completed", label: "Hoàn thành" },
        { value: "Pending", label: "Chờ xử lý" },
        { value: "Installing", label: "Đang hỗ trợ lắp đặt" },
        { value: "DoneInstalling", label: "Hoàn thành lắp đặt" },
        { value: "ReInstall", label: "Làm lại" },
        { value: "cancel", label: "Đã hủy" },
      ];
    } else {
      // For staff and other roles, show all options
      return [
        { value: "ConsultingAndSket", label: "Tư vấn & Phác thảo" },
        { value: "DoneConsulting", label: "Hoàn thành tư vấn" },
        { value: "Design", label: "Thiết kế" },
        { value: "DoneDesign", label: "Hoàn thành thiết kế" },
        { value: "DesignDetail", label: "Thiết kế chi tiết" },
        { value: "DoneDesignDetail", label: "Hoàn thành thiết kế chi tiết" },
        { value: "Completed", label: "Hoàn thành" },
        { value: "Pending", label: "Chờ xử lý" },
        { value: "Installing", label: "Đang hỗ trợ lắp đặt" },
        { value: "DoneInstalling", label: "Hoàn thành lắp đặt" },
        { value: "ReInstall", label: "Làm lại" },
        { value: "cancel", label: "Đã hủy" },
      ];
    }
  };

  const getStatistics = () => {
    const total = workTasks.length;
    const completed = workTasks.filter((task) =>
      [
        "DoneConsulting",
        "DoneDesign",
        "DoneDesignDetail",
        "Completed",
        "DoneInstalling",
      ].includes(task.status)
    ).length;
    const inProgress = workTasks.filter((task) =>
      [
        "ConsultingAndSket",
        "Design",
        "DesignDetail",
        "Pending",
        "Installing",
        "ReInstall",
      ].includes(task.status)
    ).length;
    const today = workTasks.filter((task) =>
      dayjs(task.dateAppointment).isSame(dayjs(), "day")
    ).length;

    return { total, completed, inProgress, today };
  };

  const statistics = getStatistics();

  if (error) {
    return (
      <Content style={{ padding: "24px" }}>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Space>
              <Button size="small" onClick={clearError}>
                Đóng
              </Button>
              <Button size="small" type="primary" onClick={loadWorkTasks}>
                Thử lại
              </Button>
            </Space>
          }
        />
      </Content>
    );
  }

  return (
    <Content
      style={{
        padding: "10px",
        backgroundColor: "#f5f5f5",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
              Dashboard Công Việc
            </Title>
            <Text type="secondary">
              Quản lý và theo dõi các công việc được giao
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={loadWorkTasks}
              loading={isLoading}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <div className="statistics-cards">
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col xs={12} sm={6} md={6} lg={6} xl={6}>
          <Card
            className="statistic-card"
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(24,144,255,0.10)",
              background: "#fff",
              minHeight: 105,
            }}
            bodyStyle={{ padding: "18px 22px" }}
          >
            <Row align="middle">
              <Col flex="48px">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e6f7ff, #fff 80%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                    boxShadow: "0 1px 4px rgba(24,144,255,0.12)",
                  }}
                >
                  <CalendarOutlined
                    style={{ color: "#1890ff", fontSize: 24 }}
                  />
                </div>
              </Col>
              <Col flex="auto">
                <div
                  style={{
                    fontSize: 13,
                    color: "#888",
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  Tổng công việc
                </div>
                <div
                  style={{ fontWeight: 700, fontSize: 28, color: "#1890ff" }}
                >
                  {statistics.total}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6} lg={6} xl={6}>
          <Card
            className="statistic-card"
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(82,196,26,0.08)",
              background: "#fff",
              minHeight: 105,
            }}
            bodyStyle={{ padding: "18px 22px" }}
          >
            <Row align="middle">
              <Col flex="48px">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(82,196,26,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", fontSize: 24 }}
                  />
                </div>
              </Col>
              <Col flex="auto">
                <div
                  style={{
                    fontSize: 13,
                    color: "#888",
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  Đã hoàn thành
                </div>
                <div
                  style={{ fontWeight: 700, fontSize: 28, color: "#52c41a" }}
                >
                  {statistics.completed}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6} lg={6} xl={6}>
          <Card
            className="statistic-card"
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(250,140,22,0.08)",
              background: "#fff",
              minHeight: 105,
            }}
            bodyStyle={{ padding: "18px 22px" }}
          >
            <Row align="middle">
              <Col flex="48px">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(250,140,22,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <ClockCircleOutlined
                    style={{ color: "#fa8c16", fontSize: 24 }}
                  />
                </div>
              </Col>
              <Col flex="auto">
                <div
                  style={{
                    fontSize: 13,
                    color: "#888",
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  Đang thực hiện
                </div>
                <div
                  style={{ fontWeight: 700, fontSize: 28, color: "#fa8c16" }}
                >
                  {statistics.inProgress}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6} lg={6} xl={6}>
          <Card
            className="statistic-card"
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(114,46,209,0.08)",
              background: "#fff",
              minHeight: 105,
            }}
            bodyStyle={{ padding: "18px 22px" }}
          >
            <Row align="middle">
              <Col flex="48px">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(114,46,209,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <CalendarOutlined
                    style={{ color: "#722ed1", fontSize: 24 }}
                  />
                </div>
              </Col>
              <Col flex="auto">
                <div
                  style={{
                    fontSize: 13,
                    color: "#888",
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  Hôm nay
                </div>
                <div
                  style={{ fontWeight: 700, fontSize: 28, color: "#722ed1" }}
                >
                  {statistics.today}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        </Row>
      </div>

      {/* Filters */}
      <Card
        style={{
          // marginBottom: 16,
          borderRadius: 16,
          boxShadow: "0 2px 16px #e6f7ff",
        }}
      >
        <Row
          gutter={[12, 16]}
          align="middle"
          style={{ flexWrap: "wrap" }}
          justify="space-between"
        >
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Tìm kiếm công việc..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{
                borderRadius: 12,
              }}
              size="middle"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%", borderRadius: 12 }}
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              suffixIcon={<FilterOutlined />}
              size="middle"
              dropdownStyle={{ borderRadius: 12 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              {getStatusOptions().map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={7}>
            <RangePicker
              style={{
                width: "100%",
                borderRadius: 8,
                // height: 40,
              }}
              placeholder={["Từ ngày", "Đến ngày"]}
              value={dateRange}
              onChange={setDateRange}
              suffixIcon={<FilterOutlined />}
              format="DD/MM/YYYY"
              size="middle"
            />
          </Col>
          <Col xs={24} sm={12} md={5} style={{ textAlign: "right" }}>
            <Text type="secondary" style={{ fontSize: 16 }}>
              <b>{filteredTasks.length}</b> / {workTasks.length} công việc
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Work Tasks List */}
      <div className="work-tasks-container">
        <Spin spinning={isLoading}>
          {filteredTasks.length === 0 ? (
            <Card>
              <Empty
                description={
                  workTasks.length === 0
                    ? "Chưa có công việc nào được giao"
                    : "Không tìm thấy công việc phù hợp với bộ lọc"
                }
              />
            </Card>
          ) : (
            <div className="work-tasks-list">
              <Row gutter={[16, 16]}>
                {filteredTasks.map((task, index) => (
                  <Col xs={24} lg={12} xl={8} key={task.id}>
                    <div
                      className="work-task-item"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <WorkTaskCard workTask={task} onViewDetail={handleViewDetail} />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Spin>
      </div>
    </Content>
  );
};

export default WorkTaskDashboard;
