import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Image,
  Descriptions,
  Alert,
  Button,
  message,
  Modal,
  Tooltip,
  App,
  QRCode,
} from "antd";
import { format } from "date-fns";
import { ShoppingOutlined, ReloadOutlined, CheckCircleOutlined, InfoOutlined, InfoCircleOutlined } from "@ant-design/icons";
import useComplaintStore from "../../../stores/useComplaintStore";
import useAuthStore from "../../../stores/useAuthStore";
import useProductStore from "../../../stores/useProductStore";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;
const { confirm } = Modal;

const ComplaintHistoryTab = ({ complaints: propsComplaints }) => {
  const { fetchUserComplaints, updateComplaintStatus } = useComplaintStore();
  const { user } = useAuthStore();
  const { getProductById } = useProductStore();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [confirmingComplaint, setConfirmingComplaint] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [selectedShippingRecord, setSelectedShippingRecord] = useState(null);


  // Use complaints from props if available, otherwise fetch them
  useEffect(() => {
    if (propsComplaints) {
      setComplaints(propsComplaints);
      setLoading(false);
    } else {
      const fetchComplaints = async () => {
        if (!user?.id) return;

        try {
          setLoading(true);
          const data = await fetchUserComplaints(user.id);
          setComplaints(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchComplaints();
    }
  }, [user?.id, fetchUserComplaints, propsComplaints]);

  // Force refresh data function for manual refresh
  const refreshData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await fetchUserComplaints(user.id);
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle confirm received refund
  const handleConfirmRefund = (complaintId, complaintType) => {
    setConfirmingComplaint(complaintId);

    // Different title and content based on complaint type
    const isProductReturn = complaintType === 'ProductReturn';
    const title = isProductReturn
      ? 'Xác nhận đã nhận được hàng đổi trả'
      : 'Xác nhận đã nhận được tiền hoàn về ví';
    const content = isProductReturn
      ? 'Bạn đã kiểm tra và xác nhận đã nhận được sản phẩm mới đổi trả?'
      : 'Bạn đã kiểm tra và xác nhận đã nhận được tiền hoàn về ví của mình?';
    const okText = isProductReturn ? 'Đã nhận được hàng' : 'Đã nhận được tiền';
    const deliveryCode = complaints.find(complaint => complaint.id === complaintId)?.deliveryCode;

    confirm({
      title: title,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: content,
      okText: okText,
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateComplaintStatus(
            complaintId,
            5, // Status 5 = Complete
            isProductReturn ? 0 : 1, // ComplaintType: 0 for ProductReturn, 1 for Refund
            deliveryCode
          );
          messageApi.success(isProductReturn
            ? 'Đã xác nhận nhận hàng thành công!'
            : 'Đã xác nhận nhận tiền hoàn thành công!');
          // Refresh data after confirmation
          refreshData();
        } catch (error) {
          messageApi.error(`Lỗi: ${error.message}`);
        } finally {
          setConfirmingComplaint(null);
        }
      },
      onCancel: () => {
        setConfirmingComplaint(null);
      }
    });
  };

  // Fetch product details for all products in complaints
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!complaints || complaints.length === 0) return;

      const productIds = complaints.flatMap(
        (complaint) => complaint.complaintDetails?.map((detail) => detail.productId) || []
      );

      const uniqueProductIds = [...new Set(productIds)];
      const missingProductIds = uniqueProductIds.filter(id => !productDetails[id]);

      if (missingProductIds.length === 0) {
        return;
      }

      let newDetails = { ...productDetails };
      let hasNewData = false;

      for (const productId of missingProductIds) {
        try {
          const product = await getProductById(productId);
          if (product) {
            newDetails[productId] = product;
            hasNewData = true;
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      if (hasNewData) {
        setProductDetails(newDetails);
      }
    };

    fetchProductDetails();
  }, [complaints, getProductById]);

  const getComplaintTypeTag = (type) => {
    const typeMap = {
      'refund': { color: 'red', text: 'Trả hàng và hoàn tiền' },
      'ProductReturn': { color: 'orange', text: 'Đổi hàng' }
    };
    return typeMap[type] || { color: 'default', text: 'Không xác định' };
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'pending': { color: 'warning', text: 'Đang chờ xử lý' },
      'ItemArrivedAtWarehouse': { color: 'processing', text: 'Hàng đã về kho kiểm tra' },
      'Approved': { color: 'success', text: 'Đã phê duyệt' },
      'Processing': { color: 'processing', text: 'Đang xử lý' },
      'refund': { color: 'success', text: 'Đã hoàn tiền' },
      'Complete': { color: 'success', text: 'Đã hoàn thành' },
      'reject': { color: 'error', text: 'Đã từ chối' },
      'Delivery': { color: 'processing', text: 'Giao hàng' },
      'delivered': { color: 'success', text: 'Giao hàng thành công' }
    };
    return statusMap[status] || { color: 'default', text: 'Không xác định' };
  };

  // Determine if a complaint can be confirmed as received
  const canConfirmReceived = (record) => {
    return (
      (record.complaintType === 'refund' && record.status === 'refund') ||
      (record.complaintType === 'ProductReturn' && (record.status === 'delivered' || record.status === '8'))
    );
  };

  const columns = [
    {
      title: "Mã khiếu nại",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (id) => <Text strong copyable={{ text: id }}>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 60,
      render: (id) => <Text strong copyable={{ text: id }}>#{id.slice(0, 8)}...</Text>,
    },
    {
      title: "Loại khiếu nại",
      dataIndex: "complaintType",
      key: "complaintType",
      width: 100,
      render: (type) => {
        const { color, text } = getComplaintTypeTag(type);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Lý do",
      dataIndex: "complaintReason",
      key: "complaintReason",
      width: 150,
      ellipsis: true,
      render: (_, record) => {
        // Prefer complaintReason, fallback to reason (legacy)
        const displayReason = record.complaintReason || '';
        return (
          <Tooltip
            title={
              displayReason.split(";").map((item, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  {item.trim()}
                </div>
              ))
            }
            color="#ffffff"
            styles={{
              body: {
                backgroundColor: "#f9f9f9",
                color: "#000",
                fontSize: 14,
                padding: 12,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            <Text ellipsis style={{ cursor: "pointer" }}>
              {displayReason}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => {
        const { color, text } = getStatusTag(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "creationDate",
      key: "creationDate",
      width: 80,
      render: (date) => format(new Date(date), "dd/MM/yyyy HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space>
          {canConfirmReceived(record) && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              loading={confirmingComplaint === record.id}
              onClick={() => handleConfirmRefund(record.id, record.complaintType)}
            >
              {record.complaintType === 'ProductReturn'
                ? 'Đã nhận hàng'
                : 'Đã nhận tiền'}
            </Button>
          )}
          {record.status === "pending" && (
            <Button
              type="dashed"
              size="small"
              icon={<InfoCircleOutlined style={{ color: 'blue' }} />}
              onClick={() => handleOpenShippingModal(record)}
              style={{
                width: 120,
                whiteSpace: 'normal',
                height: 'auto',
                textAlign: 'center',
                color: 'blue'
              }}
            >
              Thông tin gửi hàng
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleOpenShippingModal = (record) => {
    setSelectedShippingRecord(record);
    setShippingModalVisible(true);
  };

  const handleDownloadShippingInfo = async (record) => {
    // 1. Tạo iframe ẩn
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
      position: 'absolute',
      top: '-9999px',
      left: '0',
      width: '600px',
      height: '800px',
      border: 'none',
    });
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    doc.open();
    doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    doc.close();
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = `
      <div style="max-width: 500px; margin: 32px auto; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 2px 8px #0001; background: #fff; padding: 32px;">
        <div style="font-size: 22px; font-weight: bold; color: #1890ff; text-align: center; margin-bottom: 18px; letter-spacing: 1px;">THÔNG TIN GỬI HÀNG</div>
        <div style="display: flex; flex-direction: column; align-items: center; margin: 18px 0;">
          <img id="qrcode-download" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${record.orderId}" alt="QRCode" style="width: 120px; height: 120px;" />
          <div style="font-size: 13px; color: #888; margin-top: 4px;">Mã đơn hàng: <span style="color: #faad14; font-weight: 600;">${record.orderId}</span></div>
        </div>
        <div style="margin-bottom: 18px;"><span style="font-weight: 500; color: #555; min-width: 160px; display: inline-block;">Người gửi:</span> <span style="color: #222; font-size: 15px;">${record.userName}</span></div>
        <div style="margin-bottom: 18px;"><span style="font-weight: 500; color: #555; min-width: 160px; display: inline-block;">Số điện thoại người gửi:</span> <span style="color: #222; font-size: 15px;">${record.cusPhone}</span></div>
        <div style="margin-bottom: 18px;"><span style="font-weight: 500; color: #555; min-width: 160px; display: inline-block;">Số điện thoại nhận hàng:</span> <span style="color: #222; font-size: 15px;">0909 999 888</span></div>
        <div style="margin-bottom: 18px;"><span style="font-weight: 500; color: #555; min-width: 160px; display: inline-block;">Địa chỉ kho nhận hàng:</span><br />
          <span style="color: #222; font-size: 15px;">Bộ phận Kho hàng GreenSpace<br />7 Đường D1, Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh<br />Hotline: 0909 999 888</span>
        </div>
        <div style="text-align: center; color: #888; font-size: 13px; margin-top: 24px;">
          Vui lòng ghi rõ <span style="color: #faad14; font-weight: 600;">MÃ ĐƠN HÀNG</span> lên gói hàng trước khi gửi!<br />
          Cảm ơn bạn đã sử dụng dịch vụ của <span style="color: #1890ff; font-weight: 600;">GreenSpace</span>.
        </div>
      </div>
    `;
    // 3. Chèn wrapper vào iframe
    doc.body.appendChild(wrapper);

    // 4. Đợi QR code load xong
    const img = doc.getElementById('qrcode-download');
    if (img && !img.complete) {
      await new Promise(res => { img.onload = img.onerror = res; });
    }

    // 5. Chụp canvas trên toàn body của iframe
    const canvas = await html2canvas(doc.body, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
    });

    // 6. Tạo PDF và lưu
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = Math.min(pageWidth - 40, canvas.width);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 20, 40, imgWidth, imgHeight);
    pdf.save(`Shipping_Info_${record.orderId}.pdf`);

    // 7. Dọn dẹp
    document.body.removeChild(iframe);
  };

  const handlePrintShippingInfo = () => {
    if (!selectedShippingRecord) {
      message.error('Không tìm thấy thông tin để in.');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=900');
    if (!printWindow) {
      message.error('Không thể mở cửa sổ in.');
      return;
    }

    // Prepare the print HTML with QRCode
    const printHtml = `
      <html>
      <head>
        <title>Thông Tin Gửi Hàng - GreenSpace</title>
        <style>
          body { font-family: Arial, sans-serif; background: #fff; color: #222; margin: 0; padding: 0; }
          .print-container { max-width: 500px; margin: 24px auto; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px 32px 24px 32px; background: #fff; }
          .print-title { font-size: 22px; font-weight: bold; color: #1890ff; text-align: center; margin-bottom: 18px; letter-spacing: 1px; }
          .print-logo { display: block; margin: 0 auto 12px auto; max-width: 120px; }
          .print-section { margin-bottom: 18px; }
          .print-label { font-weight: bold; color: #555; display: inline-block; min-width: 160px; }
          .print-value { color: #222; font-size: 15px; }
          .qrcode-container { text-align: center; margin: 18px 0 18px 0; }
          .print-footer { text-align: center; color: #888; font-size: 13px; margin-top: 24px; }
          .print-highlight { color: #faad14; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-title">THÔNG TIN GỬI HÀNG</div>
          <div class="qrcode-container">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${selectedShippingRecord.orderId}" alt="QRCode" style="width: 120px; height: 120px;" />
            <div style="font-size: 13px; color: #888; margin-top: 4px;">Mã đơn hàng: <span class="print-highlight">${selectedShippingRecord.orderId}</span></div>
          </div>
          <div class="print-section"><span class="print-label">Người gửi:</span> <span class="print-value">${selectedShippingRecord.userName}</span></div>
          <div class="print-section"><span class="print-label">Số điện thoại người gửi:</span> <span class="print-value">${selectedShippingRecord.cusPhone}</span></div>
          <div class="print-section"><span class="print-label">Số điện thoại nhận hàng:</span> <span class="print-value">0909 999 888</span></div>
          <div class="print-section"><span class="print-label">Địa chỉ kho nhận hàng:</span><br />
            <span class="print-value">Bộ phận Kho hàng GreenSpace<br />7 Đường D1, Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh<br />Hotline: 0909 999 888</span>
          </div>
          <div class="print-footer">
            Vui lòng ghi rõ <span class="print-highlight">MÃ ĐƠN HÀNG</span> lên gói hàng trước khi gửi!<br />
            Cảm ơn bạn đã sử dụng dịch vụ của <span style="color: #1890ff; font-weight: bold;">GreenSpace</span>.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };



  const expandedRowRender = (record) => {
    return (
      <Card size="small" className="expanded-row-card">
        <Descriptions column={3} bordered>
          <Descriptions.Item label="Tên người dùng" span={2}>
            {record.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {record.cusPhone}
          </Descriptions.Item>
          <Descriptions.Item label="Mã vận đơn" span={1}>
            {record.deliveryCode
              ? <Text copyable strong type="success">{record.deliveryCode}</Text>
              : '-----'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật" span={2}>
            {record.modificationDate ? format(new Date(record.modificationDate), "dd/MM/yyyy HH:mm") : '--'}
          </Descriptions.Item>
          {record.reason ? (
            <Descriptions.Item
              span={3}
              label={
                <div style={{ maxWidth: 80, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  Lý do từ chối khiếu nại
                </div>
              }
            >
              {record.reason}
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item label="Địa chỉ" span={3}>
            {record.address.replace(/\|/g, ', ')}
          </Descriptions.Item>
          <Descriptions.Item label="Hình ảnh/Video" span={3}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {record.image?.imageUrl && (
                <div style={{
                  backgroundColor: '#fafafa',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                  flex: '1 1 320px',
                  maxWidth: 360
                }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}> 🎥 Video minh chứng:</Typography.Text>
                  <video
                    src={record.image.imageUrl}
                    controls
                    width={320}
                    style={{ borderRadius: 6, maxHeight: 220 }}
                  />
                </div>
              )}

              {(record.image?.image2 || record.image?.image3) && (
                <div style={{
                  backgroundColor: '#fafafa',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                  flex: '1 1 320px',
                  maxWidth: 360
                }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>🖼️ Hình ảnh bổ sung:</Typography.Text>
                  <Space size="middle" wrap>
                    {record.image?.image2 && (
                      <Image
                        src={record.image.image2}
                        alt="Hình ảnh 1"
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }}
                      />
                    )}
                    {record.image?.image3 && (
                      <Image
                        src={record.image.image3}
                        alt="Hình ảnh 2"
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }}
                      />
                    )}
                  </Space>
                </div>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
        <Table
          columns={[
            {
              title: "Sản phẩm",
              dataIndex: "productId",
              key: "productId",
              render: (productId) => {
                const product = productDetails[productId];

                // Show loading state if product is being fetched
                if (!product) {
                  return (
                    <Space>
                      <div style={{ width: 50, height: 50, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                        <ShoppingOutlined style={{ fontSize: 20, color: '#bbb' }} />
                      </div>
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">Đang tải thông tin sản phẩm...</Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          #{productId.slice(0, 8)}...
                        </Text>
                      </Space>
                    </Space>
                  );
                }

                // Normal rendering with product details
                return (
                  <Space>
                    {product?.image?.imageUrl ? (
                      <img
                        src={product.image.imageUrl}
                        alt={product.name}
                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                      />
                    ) : (
                      <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                        <ShoppingOutlined style={{ fontSize: 20, color: '#999' }} />
                      </div>
                    )}
                    <Space direction="vertical" size={0}>
                      <Text strong>{product.name}</Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {product.categoryName || `#${productId.slice(0, 8)}...`}
                      </Text>
                    </Space>
                  </Space>
                );
              },
            },
            {
              title: "Số lượng",
              dataIndex: "quantity",
              key: "quantity",
            },
            {
              title: "Đơn giá",
              dataIndex: "price",
              key: "price",
              render: (price) => (
                <Text type="secondary">{price.toLocaleString()}đ</Text>
              ),
            },
            {
              title: "Thành tiền",
              dataIndex: "totalPrice",
              key: "totalPrice",
              render: (price) => (
                <Text type="success" strong>{price.toLocaleString()}đ</Text>
              ),
            },
          ]}
          dataSource={record.complaintDetails}
          pagination={false}
          rowKey="productId"
        />

        {/* Show confirmation button in expanded row as well */}
        {
          canConfirmReceived(record) && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={confirmingComplaint === record.id}
                onClick={() => handleConfirmRefund(record.id, record.complaintType)}
              >
                {record.complaintType === 'ProductReturn'
                  ? 'Xác nhận đã nhận được hàng đổi trả'
                  : 'Xác nhận đã nhận được tiền hoàn vào ví'}
              </Button>
            </div>
          )
        }
      </Card >
    );
  };

  // if (error) {
  //   return (
  //     <Alert
  //       message="Lỗi"
  //       description={error}
  //       type="error"
  //       showIcon
  //     />
  //   );
  // }

  return (
    <App>
      {contextHolder}
      <div>
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Title level={4} style={{ margin: 0 }}>
                Lịch sử khiếu nại
              </Title>
            </Space>
          </Col>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={complaints}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => true,
              }}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} khiếu nại`,
              }}
              // scroll={{ x: 'max-content' }}
              size="middle"
            />
          </Col>
        </Row>
        <Modal
          title={null}
          open={shippingModalVisible}
          onCancel={() => setShippingModalVisible(false)}
          footer={null}
          width={600}
          centered
          styles={{ body: { background: '#f7faff', padding: 0 } }}
        >
          {selectedShippingRecord && (
            <div style={{ maxWidth: 500, margin: '32px auto', border: '1px solid #e0e0e0', borderRadius: 12, boxShadow: '0 2px 8px #0001', background: '#fff', padding: 32 }}>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: '#1890ff', textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>THÔNG TIN GỬI HÀNG</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '18px 0' }}>
                <QRCode value={selectedShippingRecord?.orderId || ''} size={120} />
                <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                  Mã đơn hàng: <span style={{ color: '#faad14', fontWeight: 600 }}>{selectedShippingRecord.orderId}</span>
                </div>
              </div>
              <div style={{ marginBottom: 18 }}><span style={{ fontWeight: 500, color: '#555', minWidth: 160, display: 'inline-block' }}>Người gửi:</span> <span style={{ color: '#222', fontSize: 15 }}>{selectedShippingRecord.userName}</span></div>
              <div style={{ marginBottom: 18 }}><span style={{ fontWeight: 500, color: '#555', minWidth: 160, display: 'inline-block' }}>Số điện thoại người gửi:</span> <span style={{ color: '#222', fontSize: 15 }}>{selectedShippingRecord.cusPhone}</span></div>
              <div style={{ marginBottom: 18 }}><span style={{ fontWeight: 500, color: '#555', minWidth: 160, display: 'inline-block' }}>Số điện thoại nhận hàng:</span> <span style={{ color: '#222', fontSize: 15 }}>0909 999 888</span></div>
              <div style={{ marginBottom: 18 }}><span style={{ fontWeight: 500, color: '#555', minWidth: 160, display: 'inline-block' }}>Địa chỉ kho nhận hàng:</span><br />
                <span style={{ color: '#222', fontSize: 15 }}>Bộ phận Kho hàng GreenSpace<br />7 Đường D1, Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh<br />Hotline: 0909 999 888</span>
              </div>
              <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginTop: 24 }}>
                Vui lòng ghi rõ <span style={{ color: '#faad14', fontWeight: 600 }}>MÃ ĐƠN HÀNG</span> lên gói hàng trước khi gửi!<br />
                Cảm ơn bạn đã sử dụng dịch vụ của <span style={{ color: '#1890ff', fontWeight: 600 }}>GreenSpace</span>.
              </div>
              <Space style={{ marginTop: 32, justifyContent: 'center', width: '100%' }}>
                <Button type="primary" onClick={() => handleDownloadShippingInfo(selectedShippingRecord)}>
                  Tải xuống (.pdf)
                </Button>
                <Button onClick={handlePrintShippingInfo}>
                  In
                </Button>
              </Space>
            </div>
          )}
        </Modal>

      </div>
    </App>
  );
};

export default ComplaintHistoryTab; 