import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Space,
  Button,
  Table,
  Image,
  Empty,
  Spin,
  message,
  Modal,
  InputNumber,
  Form,
  Splitter,
  Tree,
  Typography,
  Popconfirm,
  Tooltip,
  Alert
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  EditOutlined,
  ShoppingOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import useAccountantStore from "../../stores/useAccountantStore";
import useProductStore from "../../stores/useProductStore";
import dayjs from "dayjs";
import CreateProductModal from "@/components/Staff/Products/components/CreateProductModal";
import api from "@/api/api";
import { formatPrice } from "@/utils/helpers";

const { Title, Text } = Typography;

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, isLoading, getServiceOrderById, updateDesignPrice, updateOrderStatus, updateServiceOrderDetails } = useAccountantStore();
  const { products, fetchProducts, categories, fetchCategories, createProduct, isLoading: isProductLoading } = useProductStore();
  const [orderDetails, setOrderDetails] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isCreateProductModalVisible, setIsCreateProductModalVisible] = useState(false);
  const [createProductForm] = Form.useForm();

  const [isProductCustomizeModalVisible, setIsProductCustomizeModalVisible] = useState(false);
  const [tempServiceOrderDetails, setTempServiceOrderDetails] = useState([]);
  const [customizeModalLoading, setCustomizeModalLoading] = useState(false);

  const [externalProducts, setExternalProducts] = useState([]);
  const [updatingPriceId, setUpdatingPriceId] = useState(null);
  const [editPriceForm] = Form.useForm();
  const [selectedExternalProductIds, setSelectedExternalProductIds] = useState([]);
  const [isBulkPriceModalVisible, setIsBulkPriceModalVisible] = useState(false);
  const [bulkPriceForm] = Form.useForm();
  const [bulkPriceLoading, setBulkPriceLoading] = useState(false);
  const [bulkPriceValues, setBulkPriceValues] = useState({});
  const [viewingExternalProduct, setViewingExternalProduct] = useState(null);
  const [isViewExternalProductModalVisible, setIsViewExternalProductModalVisible] = useState(false);
  const [previewTotalPrice, setPreviewTotalPrice] = useState(0);

  const [confirmingPrices, setConfirmingPrices] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getServiceOrderById(id),
          fetchProducts(),
          fetchCategories(),
        ]);
      } catch (error) {
        // message.error("Không thể tải thông tin đơn hàng");
        // navigate(-1);
      }
    };
    fetchData();
  }, [id, getServiceOrderById, fetchProducts, fetchCategories]);

  useEffect(() => {
    if (selectedOrder?.serviceOrderDetails && products.length > 0) {
      const details = selectedOrder.serviceOrderDetails.map(detail => {
        const product = products.find(p => p.id === detail.productId);
        return {
          ...detail,
          productName: product?.name || "Không xác định",
          categoryName: product?.categoryName || "Không xác định",
          imageUrl: product?.image?.imageUrl,
          price: product?.price
        };
      });
      setOrderDetails(details);

      setTempServiceOrderDetails(
        selectedOrder.serviceOrderDetails.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity || 1,
        }))
      );

    } else {
      setOrderDetails([]);
      setTempServiceOrderDetails([]);
    }
  }, [selectedOrder, products]);

  useEffect(() => {
    if (selectedOrder?.externalProducts) {
      setExternalProducts(selectedOrder.externalProducts);
    } else {
      setExternalProducts([]);
    }
  }, [selectedOrder]);

  const handleViewProductExternal = (productId) => {
    const product = selectedOrder?.externalProducts.find(p => p.id === productId);
    if (product) {
      setViewingExternalProduct(product);
      setPreviewTotalPrice((product.price || 0) * product.quantity);
      editPriceForm.resetFields();
      editPriceForm.setFieldsValue({ price: product.price || null });
      setIsViewExternalProductModalVisible(true);
    }
  };

  const showModal = () => {
    form.setFieldsValue({ designPrice: selectedOrder?.designPrice || null });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "gold",
      ConsultingAndSketching: "blue",
      DeterminingDesignPrice: "purple",
      DepositSuccessful: "green",
      AssignToDesigner: "orange",
      DeterminingMaterialPrice: "cyan",
      DoneDesign: "volcano",
      PaymentSuccess: "success",
      Processing: "processing",
      PickedPackageAndDelivery: "geekblue",
      DeliveryFail: "error",
      ReDelivery: "warning",
      DeliveredSuccessfully: "success",
      CompleteOrder: "success",
      OrderCancelled: "error",
      Warning: "orange",
      Refund: "purple",
      DoneRefund: "success",
      StopService: "default",
      ReConsultingAndSketching: "blue",
      ReDesign: "volcano",
      WaitDeposit: "gold",
      DoneDeterminingDesignPrice: "success",
      DoneDeterminingMaterialPrice: "success",
      ReDeterminingDesignPrice: "purple",
      ExchangeProduct: "magenta",
      WaitForScheduling: "lime",
      Installing: "cyan",
      DoneInstalling: "success",
      ReInstall: "warning",
      CustomerConfirm: "blue",
      Successfully: "success",
      MaterialPriceConfirmed: "success",
      ReDetermineMaterialPrice: "volcano"
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Đang xác định giá TK",
      DepositSuccessful: "Đã đặt cọc",
      AssignToDesigner: "Đã giao cho NTK",
      DeterminingMaterialPrice: "Đang xác định giá VL",
      DoneDesign: "Đã hoàn thành TK",
      PaymentSuccess: "Đã thanh toán đủ",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã lấy hàng & đang giao",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Giao lại",
      DeliveredSuccessfully: "Đã giao thành công",
      CompleteOrder: "Hoàn thành đơn hàng",
      OrderCancelled: "Đơn hàng đã hủy",
      Warning: "Cảnh báo vượt 30%",
      Refund: "Hoàn tiền",
      DoneRefund: "Đã hoàn tiền",
      StopService: "Ngưng dịch vụ",
      ReConsultingAndSketching: "Tư vấn & phác thảo lại",
      ReDesign: "Thiết kế lại",
      WaitDeposit: "Chờ đặt cọc",
      DoneDeterminingDesignPrice: "Đã xác định giá TK",
      DoneDeterminingMaterialPrice: "Đã xác định giá VL",
      ReDeterminingDesignPrice: "Xác định lại giá TK",
      ExchangeProduct: "Đổi sản phẩm",
      WaitForScheduling: "Chờ lên lịch thi công",
      Installing: "Đang thi công",
      DoneInstalling: "Đã thi công xong",
      ReInstall: "Thi công lại",
      CustomerConfirm: "Chờ khách hàng xác nhận",
      Successfully: "Hoàn thành",
      MaterialPriceConfirmed: "Đã xác nhận giá sản phẩm",
      ReDetermineMaterialPrice: "Yêu cầu điều chỉnh giá sản phẩm"
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text, record) => (
        <Space>
          {record.imageUrl && (
            <Image
              src={record.imageUrl}
              alt={text}
              width={50}
              height={50}
              style={{ objectFit: "cover", borderRadius: '4px' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            {record.categoryName && <Tag color="blue">{record.categoryName}</Tag>}
          </div>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: 'center',
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: 'right',
      render: (text) => <span>{text?.toLocaleString("vi-VN")} đ</span>,
    },
    {
      title: "Thành tiền",
      key: "totalPrice",
      align: 'right',
      render: (_, record) => {
        const totalPrice = (record.price || 0) * (record.quantity || 0);
        return <span style={{ fontWeight: 'bold' }}>{totalPrice.toLocaleString("vi-VN")} đ</span>;
      },
    },
  ];

  const handleCreateProduct = async (productData) => {
    try {
      const newProduct = await createProduct(productData);
      message.success("Thêm vật liệu mới thành công");
      setIsCreateProductModalVisible(false);
      createProductForm.resetFields();

      if (newProduct && newProduct.id && newProduct.price) {
        setTempServiceOrderDetails(prev => [...prev, { productId: newProduct.id, quantity: 1 }]);
      }

      fetchProducts();
    } catch (error) {
      message.error("Không thể thêm vật liệu mới: " + (error.message || "Lỗi không xác định"));
    }
  };

  const showCreateProductModal = () => {
    setIsCreateProductModalVisible(true);
  };

  const handleCancelCreateProductModal = () => {
    setIsCreateProductModalVisible(false);
    createProductForm.resetFields();
  };

  const showProductCustomizeModal = () => {
    setTempServiceOrderDetails(
      selectedOrder?.serviceOrderDetails?.map(detail => ({
        productId: detail.productId,
        quantity: detail.quantity || 1,
      })) || []
    );
    setIsProductCustomizeModalVisible(true);
  };

  const handleCancelProductCustomizeModal = () => {
    setIsProductCustomizeModalVisible(false);
  };

  const handleUpdateQuantity = (productId, value) => {
    const newQuantity = parseInt(value);
    if (isNaN(newQuantity) || newQuantity < 1) {
      return;
    }
    setTempServiceOrderDetails(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleProductCheck = (checkedKeysValue, info) => {
    // Filter checkedKeysValue to only include actual product IDs
    // by checking if the key exists in the global products list
    const checkedProductIds = checkedKeysValue.filter(key =>
      products.some(product => product.id === key)
    );

    // Create new details based on filtered product IDs
    const newDetails = checkedProductIds.map(productId => {
      // Find existing item to preserve quantity if it was already selected
      const existingItem = tempServiceOrderDetails.find(item => item.productId === productId);
      return {
        productId: productId,
        quantity: existingItem?.quantity || 1, // Default to 1 if newly checked
      };
    });
    setTempServiceOrderDetails(newDetails);
  };

  const handleRemoveProduct = (productId) => {
    setTempServiceOrderDetails(prev =>
      prev.filter(item => item.productId !== productId)
    );
  };

  const handleSaveCustomizedProducts = async () => {
    setCustomizeModalLoading(true);
    try {
      const detailsToSave = tempServiceOrderDetails.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      await updateServiceOrderDetails(id, detailsToSave);

      message.success("Cập nhật danh sách vật liệu thành công");
      setIsProductCustomizeModalVisible(false);

      await getServiceOrderById(id);

    } catch (error) {
      message.error("Lỗi khi cập nhật danh sách vật liệu: " + (error.message || "Lỗi không xác định"));
    } finally {
      setCustomizeModalLoading(false);
    }
  };

  const updateExternalProductPrice = async (productId, price) => {
    setUpdatingPriceId(productId);
    try {
      await api.put(`/api/externalproduct/price/${productId}`, { price });
      message.success(`Cập nhật giá thành công cho sản phẩm ${externalProducts.find(p => p.id === productId)?.name}`);

      // Update local state
      setExternalProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, price, totalPrice: price * product.quantity }
            : product
        )
      );

      // Refresh order data to get updated totalPrice calculations
      await getServiceOrderById(id);
    } catch (error) {
      console.error("Error updating price:", error);
      message.error("Không thể cập nhật giá: " + (error.response?.data?.error || error.message));
    } finally {
      setUpdatingPriceId(null);
    }
  };

  const showPriceEditModal = (product) => {
    // Initialize with empty value if price is 0 or undefined, not with 0
    editPriceForm.setFieldsValue({ price: (!product.price || product.price === 0) ? null : product.price });

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.ant-modal-confirm-btns .ant-btn-primary')?.click();
      } else if (e.key === 'Escape') {
        document.querySelector('.ant-modal-confirm-btns .ant-btn-default')?.click();
      }
    };

    Modal.confirm({
      title: null,
      icon: null,
      width: 500,
      content: (
        <div style={{ paddingTop: 8 }}>
          <Card
            bordered={false}
            style={{
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '8px',
              marginBottom: 16,
            }}
            bodyStyle={{ padding: '12px 16px' }}
          >
            <Space align="start">
              <InfoCircleOutlined style={{ fontSize: 20, color: '#52c41a', marginTop: 4 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#389e0d' }}>
                  Cập nhật giá cho sản phẩm
                </div>
                <div style={{ color: '#595959', marginTop: 2 }}>
                  Bạn đang chỉnh giá cho: <strong>{product.name}</strong>
                </div>
              </div>
            </Space>
          </Card>

          <Form form={editPriceForm} layout="vertical">
            <Form.Item
              name="price"
              label="Giá sản phẩm (VNĐ)"
              rules={[
                { required: true, message: "Vui lòng nhập giá" },
                { type: "number", min: 0, message: "Giá phải là số không âm" }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập giá sản phẩm"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </Form.Item>
          </Form>
        </div>
      ),
      okText: "Lưu giá",
      cancelText: "Hủy",
      okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
      onOk: () => {
        return editPriceForm
          .validateFields()
          .then((values) => updateExternalProductPrice(product.id, values.price))
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }
    });
  };

  const calculateExternalProductsTotal = () => {
    return externalProducts.reduce((total, product) => {
      return total + (product.price || 0) * (product.quantity || 0);
    }, 0);
  };

  const externalProductsColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (text, record) => (
        <Space>
          {record.imageURL && (
            <Image
              src={record.imageURL}
              alt={text}
              width={50}
              height={50}
              style={{ objectFit: "cover", borderRadius: '4px' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#888' }}>ID: {record.id}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Yêu cầu về sản phẩm mới",
      dataIndex: "description",
      key: "description",
      width: 400,
      render: (text) => (
        <Tooltip styles={{
          body: {
            width: 900,
            maxHeight: 500,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d9d9d9 #f0f0f0',
          },
        }} title={<div className="html-preview" dangerouslySetInnerHTML={{ __html: text }} />} color="white">
          <div 
            // className="html-preview" 
            dangerouslySetInnerHTML={{ __html: text }} 
            style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineClamp: 3
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: 'center',
      width: 100,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: 'right',
      width: 150,
      render: (text, record) => {
        if (updatingPriceId === record.id) {
          return <Spin size="small" />;
        }

        if (!text || text === 0) {
          return (
            <Button
              type="dashed"
              size="small"
              onClick={() => showPriceEditModal(record)}
              style={{ padding: '5px 10px', color: '#ff4d4f' }}
            >
              Cập nhật giá
            </Button>
          );
        }

        return (
          <Space>
            <span>{text.toLocaleString("vi-VN")} đ</span>
            <Button
              type="link"
              size="small"
              onClick={() => showPriceEditModal(record)}
              style={{ padding: '0' }}
            >
              <EditOutlined />
            </Button>
          </Space>
        );
      },
    },
    {
      title: "Thành tiền",
      key: "totalAmount",
      align: 'right',
      width: 150,
      render: (_, record) => {
        const totalPrice = (record.price || 0) * (record.quantity || 0);
        if (totalPrice === 0) return <span>-</span>;
        return <span style={{ fontWeight: 'bold' }}>{totalPrice.toLocaleString("vi-VN")} đ</span>;
      },
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      key: "action",
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="primary" size="middle" onClick={() => handleViewProductExternal(record.id)}>
            <EyeOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const showBulkPriceModal = () => {
    // Initialize form with current prices
    const initialValues = {};
    selectedExternalProductIds.forEach(id => {
      const product = externalProducts.find(p => p.id === id);
      // Use null instead of 0 for empty values
      initialValues[`price_${id}`] = (!product?.price || product?.price === 0) ? null : product.price;
    });

    setBulkPriceValues(initialValues);
    bulkPriceForm.resetFields();
    setIsBulkPriceModalVisible(true);
  };

  const handleBulkPriceUpdate = async () => {
    try {
      const values = await bulkPriceForm.validateFields();
      setBulkPriceLoading(true);

      if (!selectedExternalProductIds.length) {
        message.warning("Vui lòng chọn ít nhất một sản phẩm để cập nhật giá");
        setBulkPriceLoading(false);
        return;
      }

      // Process each product with its own price
      const updatePromises = [];
      const updatedProducts = [];

      for (const productId of selectedExternalProductIds) {
        const fieldName = `price_${productId}`;
        const price = values[fieldName];

        if (price !== undefined) {
          updatePromises.push(
            api.put(`/api/externalproduct/price/${productId}`, { price })
              .then(() => {
                // Store successful updates to apply to local state later
                updatedProducts.push({ id: productId, price });
              })
              .catch(error => {
                console.error(`Error updating product ${productId}:`, error);
                // Don't throw error to allow other products to update
                return null;
              })
          );
        }
      }

      await Promise.all(updatePromises);

      // Update local state for successfully updated products
      if (updatedProducts.length > 0) {
        setExternalProducts(prevProducts =>
          prevProducts.map(product => {
            const updatedProduct = updatedProducts.find(p => p.id === product.id);
            if (updatedProduct) {
              return {
                ...product,
                price: updatedProduct.price,
                totalPrice: updatedProduct.price * product.quantity
              };
            }
            return product;
          })
        );

        message.success(`Đã cập nhật giá cho ${updatedProducts.length} sản phẩm`);

        // Refresh order data to get updated totalPrice calculations
        await getServiceOrderById(id);
      } else {
        message.error("Không thể cập nhật giá cho bất kỳ sản phẩm nào");
      }

      setIsBulkPriceModalVisible(false);
      setSelectedExternalProductIds([]);

    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setBulkPriceLoading(false);
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedExternalProductIds,
    onChange: (selectedRowKeys) => {
      setSelectedExternalProductIds(selectedRowKeys);
    }
  };

  const handleConfirmMaterialPrices = async () => {
    if (externalProducts.some(p => !p.price || p.price === 0)) {
      message.error("Vui lòng nhập giá cho tất cả sản phẩm!");
      return;
    }

    try {
      setConfirmingPrices(true);
      // Update order status to MaterialPriceConfirmed (33)
      await updateOrderStatus(selectedOrder.id, 33);

      message.success(
        selectedOrder.status === 'DeterminingMaterialPrice'
          ? "Đã xác nhận thành công tất cả giá sản phẩm!"
          : "Đã xác nhận thành công điều chỉnh giá sản phẩm!"
      );

      // Refresh the order data
      await getServiceOrderById(selectedOrder.id);
    } catch (error) {
      console.error("Error confirming material prices:", error);
      message.error("Không thể cập nhật trạng thái: " + (error.message || "Lỗi không xác định"));
    } finally {
      setConfirmingPrices(false);
    }
  };

  if (isLoading && !selectedOrder) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!selectedOrder) {
    return <Empty description="Không tìm thấy thông tin đơn hàng" />;
  }

  const totalMaterialPrice = orderDetails.reduce((total, detail) => {
    const price = detail.price || 0;
    const quantity = detail.quantity || 0;
    return total + (price * quantity);
  }, 0);

  return (
    <Spin spinning={isLoading && !!selectedOrder} tip="Đang cập nhật...">
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Splitter style={{ height: 'auto', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: 10, border: '1px solid #f0f0f0' }}>
              <Splitter.Panel defaultSize="65%" min="50%" max="70%" >
                <Card
                  title="Thông tin đơn hàng"
                  bordered={false}
                  style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { flexGrow: 1 } }}
                  extra={
                    selectedOrder?.status === "DeterminingDesignPrice" && (
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={showModal}
                      >
                        Nhập giá thiết kế
                      </Button>
                    )
                  }
                >
                  <Descriptions bordered layout="vertical" size="middle">
                    <Descriptions.Item label="Mã đơn hàng" span={1}>
                      #{selectedOrder.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo" span={1}>
                      {dayjs(selectedOrder.creationDate).format("DD/MM/YYYY HH:mm")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" span={1}>
                      <Tag color={getStatusColor(selectedOrder.status)} style={{ fontWeight: 'bold', whiteSpace: 'normal', height: 'auto', padding: '2px 7px' }}>
                        {getStatusText(selectedOrder.status)}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại dịch vụ" span={1}>
                      {selectedOrder.serviceType === "UsingDesignIdea"
                        ? "Sử dụng mẫu thiết kế"
                        : "Thiết kế theo yêu cầu"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Diện tích (ước tính)" span={1}>
                      {selectedOrder.length && selectedOrder.width ? `${selectedOrder.length * selectedOrder.width} m²` : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá thiết kế" span={1}>
                      {selectedOrder.designPrice != null ? `${selectedOrder.designPrice.toLocaleString("vi-VN")} đ` : 'Chưa xác định'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá vật liệu (ước tính)" span={1}>
                      {selectedOrder.materialPrice != null ? `${selectedOrder.materialPrice.toLocaleString("vi-VN")} đ` : 'Chưa xác định'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng chi phí (ước tính)" span={1}>
                      <strong style={{ color: "#1890ff", fontSize: '1.1em' }}>
                        {selectedOrder.totalCost != null ? `${selectedOrder.totalCost.toLocaleString("vi-VN")} đ` : 'Chưa xác định'}
                      </strong>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Splitter.Panel>

              <Splitter.Panel>
                <Card title="Thông tin khách hàng" bordered={false} style={{ width: '100%', display: 'flex', flexDirection: 'column' }} styles={{ body: { flexGrow: 1 } }}>
                  <Descriptions bordered layout="horizontal" column={1}>
                    <Descriptions.Item
                      label={
                        <Space>
                          <UserOutlined />
                          Họ tên
                        </Space>
                      }
                    >
                      {selectedOrder.userName || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Space>
                          <PhoneOutlined />
                          Số điện thoại
                        </Space>
                      }
                    >
                      {selectedOrder.cusPhone || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Space>
                          <MailOutlined />
                          Email
                        </Space>
                      }
                    >
                      {selectedOrder.email || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Space>
                          <HomeOutlined />
                          Địa chỉ
                        </Space>
                      }
                    >
                      {selectedOrder.address ? selectedOrder.address.replace(/\|/g, ', ') : 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Splitter.Panel>
            </Splitter>
          </Col>

          <Col span={24}>
            <Card title="Hình ảnh phác thảo/thiết kế">
              {selectedOrder.image && (selectedOrder.image.imageUrl || selectedOrder.image.image2 || selectedOrder.image.image3) ? (
                <Space size="large" wrap>
                  {selectedOrder.image?.imageUrl && (
                    <Image
                      src={selectedOrder.image.imageUrl}
                      alt="Hình ảnh 1"
                      width={200}
                      height={200}
                      style={{ objectFit: "cover", borderRadius: '8px' }}
                    />
                  )}
                  {selectedOrder.image?.image2 && (
                    <Image
                      src={selectedOrder.image.image2}
                      alt="Hình ảnh 2"
                      width={200}
                      height={200}
                      style={{ objectFit: "cover", borderRadius: '8px' }}
                    />
                  )}
                  {selectedOrder.image?.image3 && (
                    <Image
                      src={selectedOrder.image.image3}
                      alt="Hình ảnh 3"
                      width={200}
                      height={200}
                      style={{ objectFit: "cover", borderRadius: '8px' }}
                    />
                  )}
                </Space>
              ) : (
                <Empty description="Không có hình ảnh" />
              )}
            </Card>
          </Col>

          {selectedOrder.reportAccoutant && (
            <Col span={24}>
              <Card
                title={
                  <Space style={{ width: '100%', justifyContent: 'space-between', color: '#f5222d' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Yêu cầu điều chỉnh giá sản phẩm</span>
                  </Space>
                }
              >
                <div className="html-preview"
                  dangerouslySetInnerHTML={{ __html: selectedOrder.reportAccoutant }}
                  style={{ background: '#f5f5f5', padding: '0 15px 0', borderRadius: '4px', border: '1px solid #e8e8e8' }}
                />
              </Card>
            </Col>
          )}

          <Col span={24}>
            <Card
              title={
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>Danh sách vật liệu đã chọn từ hệ thống</span>
                </Space>
              }
            >
              <Table
                columns={columns}
                dataSource={orderDetails}
                rowKey="productId"
                pagination={false}
                summary={() => (
                  <Table.Summary.Row style={{ background: '#fafafa' }}>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                      <strong>Tổng giá vật liệu:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong style={{ color: '#f5222d' }}>{totalMaterialPrice.toLocaleString("vi-VN")} đ</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                locale={{ emptyText: <Empty description="Chưa có vật liệu nào được chọn cho đơn hàng này." /> }}
              />
            </Card>
          </Col>

          {externalProducts.length > 0 && (
            <Col span={24}>
              <Card
                title={
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>Sản phẩm thêm mới (ngoài hệ thống)</span>
                    {selectedExternalProductIds.length > 0 ? (
                      <Button
                        type="primary"
                        onClick={showBulkPriceModal}
                        style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                      >
                        Cập nhật giá cho {selectedExternalProductIds.length} sản phẩm đã chọn
                      </Button>
                    ) : (
                      <>
                        {selectedOrder.status === 'DeterminingMaterialPrice' && (
                          <Tag color="volcano">Yêu cầu xác định giá</Tag>
                        )}
                        {selectedOrder.status === 'ReDetermineMaterialPrice' && (
                          <Tag color="volcano">Yêu cầu điều chỉnh giá</Tag>
                        )}
                      </>
                    )}
                  </Space>
                }
              >
                <Table
                  rowSelection={rowSelection}
                  columns={externalProductsColumns}
                  dataSource={externalProducts.map(item => ({ ...item, key: item.id }))}
                  pagination={false}
                  rowClassName={record => (!record.price || record.price === 0) ? 'ant-table-row-error' : ''}
                  summary={() => (
                    <Table.Summary.Row style={{ background: '#fafafa' }}>
                      <Table.Summary.Cell index={0} colSpan={3} align="right">
                        <strong>Tổng giá sản phẩm thêm mới:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong style={{ color: '#1890ff' }}>{calculateExternalProductsTotal().toLocaleString("vi-VN")} đ</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  locale={{ emptyText: <Empty description="Không có sản phẩm thêm mới nào." /> }}
                />
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  {(selectedOrder.status === 'DeterminingMaterialPrice' || selectedOrder.status === 'ReDetermineMaterialPrice') && (
                    <Button
                      type="primary"
                      disabled={externalProducts.some(p => !p.price || p.price === 0)}
                      onClick={handleConfirmMaterialPrices}
                      loading={confirmingPrices}
                    >
                      {selectedOrder.status === 'DeterminingMaterialPrice'
                        ? "Xác nhận tất cả giá sản phẩm"
                        : "Xác nhận điều chỉnh giá sản phẩm"}
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
          )}
        </Row>

        <CreateProductModal
          visible={isCreateProductModalVisible}
          onCancel={handleCancelCreateProductModal}
          onSubmit={handleCreateProduct}
          form={createProductForm}
          categories={categories}
          isLoading={isProductLoading}
        />

        <Modal
          title="Tùy chỉnh danh sách sản phẩm"
          open={isProductCustomizeModalVisible}
          onOk={handleSaveCustomizedProducts}
          onCancel={handleCancelProductCustomizeModal}
          confirmLoading={customizeModalLoading}
          width={1200}
          okText="Lưu thay đổi"
          cancelText="Hủy"
        >
          <Spin spinning={!products.length || !categories.length} tip="Đang tải dữ liệu sản phẩm...">
            <div style={{ display: 'flex', maxHeight: '60vh', overflow: 'hidden' }}>
              <div style={{ width: '50%', paddingRight: '8px', display: 'flex', flexDirection: 'column' }}>
                <Title level={5}>Sản phẩm có sẵn</Title>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px', overflowY: 'auto', flexGrow: 1, scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent' }}>
                  <Tree
                    checkable
                    checkedKeys={tempServiceOrderDetails.map(item => item.productId)}
                    onCheck={handleProductCheck}
                    treeData={(categories || []).map(category => ({
                      key: category.id,
                      title: <span style={{ fontWeight: 'bold' }}>{category.name}</span>,
                      selectable: false,
                      children: products
                        .filter(product => product.categoryId === category.id)
                        .map(product => {
                          // Tính xem có phải hàng mới (24h)
                          const isNew = dayjs().diff(dayjs(product.creationDate), 'hour') < 24;
                          return {
                            key: product.id,
                            title: (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '6px 0px',
                                  borderRadius: 4,
                                  transition: 'background 0.2s',
                                }}
                                // hiệu ứng hover nhẹ
                                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                {/* 1. Ảnh */}
                                <Image
                                  src={product.image?.imageUrl || '/placeholder.png'}
                                  width={36}
                                  height={36}
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: 4,
                                    marginRight: 12
                                  }}
                                  preview={false}
                                />

                                {/* 2. Tên & Giá */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
                                  <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>
                                    {product.name}
                                  </span>
                                  <span style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                                    {product.price?.toLocaleString("vi-VN")} đ
                                  </span>
                                </div>

                                {/* 3. Tag "Mới" */}
                                {isNew && (
                                  <Tag
                                    color="green"
                                    style={{
                                      marginLeft: 8,
                                      fontSize: 10,
                                      padding: '0 4px',
                                      lineHeight: '16px',
                                    }}
                                  >
                                    Mới
                                  </Tag>
                                )}
                              </div>
                            ),
                            isLeaf: true,
                          };
                        }),
                    }))}
                    showLine={{ showLeafIcon: false }}
                    defaultExpandAll
                  />
                </div>
              </div>

              <div style={{ width: '50%', paddingLeft: '8px', display: 'flex', flexDirection: 'column' }}>
                <Title level={5}>Sản phẩm đã chọn cho đơn hàng</Title>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', overflowY: 'auto', flexGrow: 1, scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent' }}>
                  {tempServiceOrderDetails.length > 0 ? (
                    <Table
                      dataSource={tempServiceOrderDetails.map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        return {
                          key: item.productId,
                          productId: item.productId,
                          productName: product ? product.name : "Sản phẩm không tồn tại",
                          productImage: product?.image?.imageUrl,
                          productPrice: product?.price || 0,
                          quantity: item.quantity,
                        };
                      })}
                      columns={[
                        {
                          title: "Sản phẩm",
                          dataIndex: "productName",
                          key: "productName",
                          render: (_, record) => {
                            return (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Image
                                  src={record.productImage || '/placeholder.png'}
                                  alt={record.productName}
                                  width={40}
                                  height={40}
                                  style={{ objectFit: "cover", borderRadius: "4px", marginRight: "8px" }}
                                />
                                <span style={{ fontSize: '13px', marginLeft: 12 }}>{record.productName}</span>
                              </div>
                            );
                          },
                        },
                        {
                          title: "Đơn giá",
                          dataIndex: "productPrice",
                          key: "productPrice",
                          align: 'right',
                          render: (price) => price ? price.toLocaleString("vi-VN") + " đ" : "0 đ",
                        },
                        {
                          title: "SL",
                          dataIndex: "quantity",
                          key: "quantity",
                          width: 90,
                          align: 'center',
                          render: (_, record) => (
                            <InputNumber
                              min={1}
                              value={record.quantity}
                              onChange={(value) => handleUpdateQuantity(record.productId, value)}
                              style={{ width: 60 }}
                              size="small"
                            />
                          ),
                        },
                        {
                          title: "Thành tiền",
                          key: "totalPrice",
                          align: 'right',
                          render: (_, record) => {
                            const price = record.productPrice || 0;
                            return (
                              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                {(price * record.quantity).toLocaleString("vi-VN")} đ
                              </span>
                            );
                          },
                        },
                        {
                          title: "Xóa",
                          key: "action",
                          width: 60,
                          align: 'center',
                          render: (_, record) => (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveProduct(record.productId)}
                              size="small"
                            />
                          ),
                        },
                      ]}
                      pagination={false}
                      size="small"
                      showHeader
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', flexDirection: 'column', padding: '20px' }}>
                      <ShoppingOutlined style={{ fontSize: 32, marginBottom: '10px' }} />
                      <p>Chọn sản phẩm từ danh sách bên trái.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Spin>
        </Modal>

        <Modal
          title="Cập nhật giá hàng loạt"
          open={isBulkPriceModalVisible}
          onOk={handleBulkPriceUpdate}
          onCancel={() => setIsBulkPriceModalVisible(false)}
          confirmLoading={bulkPriceLoading}
          okText="Lưu tất cả"
          cancelText="Hủy"
          width={650}
          bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
        >
          <Alert
            message={`Cập nhật giá cho ${selectedExternalProductIds.length} sản phẩm đã chọn`}
            description="Nhập giá cho từng sản phẩm và nhấn Lưu tất cả để cập nhật. Nhấn Enter để đi tới ô tiếp theo."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form
            form={bulkPriceForm}
            layout="vertical"
            initialValues={bulkPriceValues}
          >
            <Table
              size="small"
              pagination={false}
              dataSource={externalProducts
                .filter(product => selectedExternalProductIds.includes(product.id))
                .map(product => ({ ...product, key: product.id }))
              }
              columns={[
                {
                  title: "Sản phẩm",
                  dataIndex: "name",
                  key: "name",
                  width: '50%',
                  render: (text, record) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {record.imageURL && (
                        <Image
                          src={record.imageURL}
                          alt={text}
                          width={40}
                          height={40}
                          style={{ objectFit: "cover", borderRadius: '4px', marginRight: 8 }}
                        />
                      )}
                      <div style={{ fontWeight: 500, marginLeft: 8 }}>{text}</div>
                    </div>
                  )
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: '15%',
                  align: 'center'
                },
                {
                  title: "Giá sản phẩm (VNĐ)",
                  key: "price",
                  width: '35%',
                  render: (_, record) => (
                    <Form.Item
                      name={`price_${record.id}`}
                      rules={[
                        { required: true, message: "Vui lòng nhập giá" },
                        { type: "number", min: 0, message: "Giá phải là số không âm" }
                      ]}
                      style={{ margin: 0 }}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        placeholder="Nhập giá sản phẩm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            // Find the next input and focus it
                            const inputs = document.querySelectorAll('.ant-input-number-input');
                            const currentIndex = Array.from(inputs).findIndex(input => input === e.target);
                            if (currentIndex < inputs.length - 1) {
                              inputs[currentIndex + 1].focus();
                            } else {
                              // If it's the last input, submit the form
                              handleBulkPriceUpdate();
                            }
                          } else if (e.key === 'Escape') {
                            setIsBulkPriceModalVisible(false);
                          }
                        }}
                      />
                    </Form.Item>
                  )
                }
              ]}
              locale={{ emptyText: "Không có sản phẩm nào được chọn" }}
            />
          </Form>
        </Modal>
        <Modal
          open={isViewExternalProductModalVisible}
          onCancel={() => {
            setViewingExternalProduct(null);
            setPreviewTotalPrice(0);
            editPriceForm.resetFields();
            setIsViewExternalProductModalVisible(false);
          }}
          footer={null}
          title="Chi tiết sản phẩm thêm mới"
          width={900}
        >
          {viewingExternalProduct && (
            <>
              <Row gutter={16}>
                <Col span={8}>
                  <Image
                    src={viewingExternalProduct.imageURL || '/placeholder.png'}
                    alt={viewingExternalProduct.name}
                    width="100%"
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                  />
                </Col>
                <Col span={16}>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Tên sản phẩm">
                      <Text strong>{viewingExternalProduct.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng">
                      {viewingExternalProduct.quantity}
                    </Descriptions.Item>
                    <Descriptions.Item label="Đơn giá">
                      <Form
                        form={editPriceForm}
                        layout="vertical"
                        onFinish={(values) =>
                          updateExternalProductPrice(viewingExternalProduct.id, values.price)
                        }
                        initialValues={{
                          price: viewingExternalProduct.price || null,
                        }}
                      >
                        <Descriptions.Item label="Đơn giá">
                          <Form.Item
                            name="price"
                            noStyle
                            rules={[
                              { required: true, message: "Vui lòng nhập giá" },
                              { type: "number", min: 0, message: "Giá không hợp lệ" },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Nhập giá sản phẩm"
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                              onChange={(value) => {
                                // Update preview total price when price changes
                                setPreviewTotalPrice((value || 0) * viewingExternalProduct.quantity);
                              }}
                            />
                          </Form.Item>
                        </Descriptions.Item>
                      </Form>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thành tiền">
                      {(viewingExternalProduct.totalPrice === 0 && selectedOrder.status === "DeterminingMaterialPrice") ? (
                        <Tag color="orange">Chưa xác định</Tag>
                      ) : (
                        <Text strong style={{ color: '#4caf50' }}>
                          {formatPrice(previewTotalPrice)}
                        </Text>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                  <div style={{ textAlign: 'right', marginTop: 16 }}>
                    <Button
                      type="primary"
                      onClick={() => editPriceForm.submit()}
                      loading={updatingPriceId === viewingExternalProduct?.id}
                    >
                      Lưu giá sản phẩm
                    </Button>
                  </div>

                </Col>
              </Row>

              <div style={{ marginTop: 24 }}>
                <Typography.Title level={5} style={{ marginBottom: 8 }}>
                  Yêu cầu về sản phẩm
                </Typography.Title>
                <div
                  className="html-preview"
                  style={{
                    border: '1px solid #f0f0f0',
                    padding: 12,
                    borderRadius: 4,
                    background: '#fafafa',
                    maxHeight: 300,
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d3d3d3 #f9f9f9'
                  }}
                  dangerouslySetInnerHTML={{ __html: viewingExternalProduct.description }}
                />
              </div>
            </>
          )}
        </Modal>
      </div>
    </Spin>
  );
};

export default ServiceOrderDetail; 