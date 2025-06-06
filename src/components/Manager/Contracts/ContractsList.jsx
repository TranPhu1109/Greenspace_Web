import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message, Spin, Tooltip, Input, Space } from "antd";
import api from "@/api/api";
import { Typography } from "antd";
import Title from "antd/es/typography/Title";

const { Text } = Typography;
const { Search } = Input;

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [open, setOpen] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredContracts, setFilteredContracts] = useState([]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await api.get("/api/contract", {
          params: { pageNumber: 0, pageSize: 500 },
          componentId: "ContractList",
        });
        setContracts(response.data);
      } catch (err) {
        message.error("Không thể tải danh sách hợp đồng.");
        console.error(err);
      }
    };

    fetchContracts();

    return () => {
      api.clearPendingRequests("ContractList");
    };
  }, []);

  useEffect(() => {
    filterContracts(searchText);
  }, [searchText, contracts]);

  const filterContracts = (text) => {
    if (!text) {
      setFilteredContracts(contracts);
      return;
    }

    const searchLower = text.toLowerCase();
    const filtered = contracts.filter((contract) => {
      // Kiểm tra xem searchText có phải là một số không
      const isNumeric = /^\d+$/.test(searchLower);
      
      if (isNumeric) {
        // Nếu là số và có độ dài <= 3, chỉ tìm kiếm với 3 số cuối
        if (searchLower.length <= 3) {
          return contract.phone.endsWith(searchLower);
        }
        // Nếu là số và dài hơn 3, tìm kiếm toàn bộ số điện thoại
        return contract.phone.includes(searchLower);
      }

      // Tìm kiếm các trường khác nếu không phải là số
      return (
        contract.id.toLowerCase().includes(searchLower) ||
        contract.serviceOrderId.toLowerCase().includes(searchLower) ||
        contract.name.toLowerCase().includes(searchLower) ||
        contract.email.toLowerCase().includes(searchLower)
      );
    });
    setFilteredContracts(filtered);
  };

  const handleViewPDF = (url) => {
    setLoadingPdf(true);
    setPdfUrl(null); // reset trước để tránh hiển thị PDF cũ
    setOpen(true);
    setTimeout(() => {
      setPdfUrl(url); // delay một chút để tránh flicker
    }, 100);
  };

  const handleIframeLoad = () => {
    setLoadingPdf(false);
  };

  const columns = [
    {
      title: "Mã hợp đồng",
      dataIndex: "id",
      key: "id",
      width: 130,
      render: (text) => (
        <Tooltip title={text}>
          <Text copyable={{ text }}>{text.slice(0, 8)}...</Text>
        </Tooltip>
      ),
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "serviceOrderId",
      key: "serviceOrderId",
      width: 130,
      render: (text) => (
        <Tooltip title={text}>
          <Text copyable={{ text }}>{text.slice(0, 8)}...</Text>
        </Tooltip>
      ),
    },
    {
      title: "Thông tin khách hàng",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address ",
    },
    {
      title: "Ngày ký hợp đồng",
      dataIndex: "modificationDate",
      key: "modificationDate ",
      render: (text) => {
        const date = new Date(text);
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return date.toLocaleDateString("vi-VN", options);
      },
    },
    {
      title: "Xem hợp đồng",
      key: "description",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            if (!loadingPdf) handleViewPDF(record.description);
          }}
          disabled={loadingPdf}
        >
            Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <Title level={3} style={{ marginBottom: "20px" }}>
        Danh sách hợp đồng
      </Title>
      
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo ID, Mã đơn hàng, Tên, Email, Số điện thoại..."
          allowClear
          enterButton="Tìm kiếm"
          size="middle"
          onSearch={(value) => setSearchText(value)}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 500 }}
        />
      </Space>

      <Table 
        dataSource={filteredContracts} 
        columns={columns} 
        rowKey="id"
        locale={{
          emptyText: 'Không tìm thấy kết quả phù hợp'
        }}
      />

      <Modal
        title="Xem hợp đồng PDF "
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width="80%"
      >
        {loadingPdf && (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <Spin size="large" tip="Đang tải hợp đồng..." />
          </div>
        )}
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: "none", display: loadingPdf ? "none" : "block" }}
            title="PDF Viewer"
            onLoad={handleIframeLoad}
          />
        )}
      </Modal>
    </>
  );
};

export default ContractList;
