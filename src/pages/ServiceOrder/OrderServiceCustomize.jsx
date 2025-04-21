import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Divider,
  Button,
  message,
  Spin,
  Empty,
  Input,
  Form,
  Modal,
  Upload,
  Select,
  Progress,
  Table,
  Popconfirm,
  InputNumber,
  Space,
  Image,
  Collapse,
  Checkbox,
  Alert,
} from "antd";
import {
  UploadOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  CheckCircleTwoTone,
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  ShoppingOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useWalletStore from "@/stores/useWalletStore";
import useShippingStore from "@/stores/useShippingStore";
import { useCloudinaryStorage } from "@/hooks/useCloudinaryStorage";
import EditorComponent from "@/components/Common/EditorComponent";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import "./styles.scss";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const OrderServiceCustomize = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    currentDesign,
    fetchDesignIdeaById,
    isLoading: designLoading,
  } = useDesignIdeaStore();
  const { user } = useAuthStore();
  const { createDesignOrder, isLoading: orderLoading } = useDesignOrderStore();
  const {
    balance,
    fetchBalance,
    loading: walletLoading,
    createBill,
  } = useWalletStore();
  const {
    getProvinces,
    getDistricts,
    getWards,
    provinces,
    districts,
    wards,
    provincesLoading,
    districtsLoading,
    wardsLoading,
  } = useShippingStore();
  const { uploadImages, progress, error: uploadError } = useCloudinaryStorage();
  const { getProductById, fetchProducts, products, updateProduct } =
    useProductStore();
  const { updateServiceForCus } = useServiceOrderStore();

  const [productDetails, setProductDetails] = useState([]);
  //console.log("productDetails", productDetails);

  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const mountedRef = useRef(true);
  const [form] = Form.useForm();

  // State for address selection
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  // Add state for checked status
  const [isDesignChecked, setIsDesignChecked] = useState(false);
  const [isProductChecked, setIsProductChecked] = useState(false);

  // New states for product customization
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tempServiceOrderDetails, setTempServiceOrderDetails] = useState([]);

  // State for material price and total price
  const [materialPrice, setMaterialPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // State for address selection
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [addressDetail, setAddressDetail] = useState("");
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  // Add state for original product price
  const [originalMaterialPrice, setOriginalMaterialPrice] = useState(0);
  const [isPriceWarning, setIsPriceWarning] = useState(false);

  const hasExistingAddress = user?.address && user.address.trim() !== "";

  useEffect(() => {
    if (useExistingAddress && hasExistingAddress) {
      // Nếu sử dụng địa chỉ có sẵn và có địa chỉ
      setIsAddressValid(true);
    } else if (!useExistingAddress) {
      // Nếu nhập địa chỉ mới, kiểm tra đầy đủ thông tin
      const isValid =
        selectedProvince &&
        selectedDistrict &&
        selectedWard &&
        addressDetail.trim() !== "";
      setIsAddressValid(isValid);
    } else {
      setIsAddressValid(false);
    }
  }, [
    useExistingAddress,
    hasExistingAddress,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    addressDetail,
  ]);

  // Xử lý khi chọn sử dụng địa chỉ có sẵn
  const handleUseExistingAddress = (e) => {
    const checked = e.target.checked;
    setUseExistingAddress(checked);

    if (checked && hasExistingAddress) {
      // Reset các trường địa chỉ khi sử dụng địa chỉ có sẵn
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setAddressDetail("");
    }
  };

  // Xử lý khi chọn lưu địa chỉ mới
  const handleSaveNewAddress = (e) => {
    setSaveNewAddress(e.target.checked);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load design data
  useEffect(() => {
    const loadDesign = async () => {
      if (!id || !mountedRef.current) return;
      try {
        const design = await fetchDesignIdeaById(id);
      } catch (error) {
        if (error.name !== "CanceledError" && mountedRef.current) {
          message.error("Không thể tải thông tin thiết kế");
        }
      }
    };
    loadDesign();
  }, [id, fetchDesignIdeaById]);

  // Load products when design data is available
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (!isMounted) return;

      if (!currentDesign?.productDetails?.length) {
        setProductDetails([]);
        setIsLoadingProducts(false);
        return;
      }

      setIsLoadingProducts(true);
      setProductError(null);

      try {
        const productPromises = currentDesign.productDetails.map(
          async (detail) => {
            try {
              const product = await getProductById(detail.productId);

              if (!isMounted) return null;

              if (product) {
                return {
                  detail,
                  product,
                };
              } else {
                return null;
              }
            } catch (error) {
              return null;
            }
          }
        );

        const results = await Promise.all(productPromises);

        if (isMounted) {
          const validResults = results.filter(Boolean);
          setProductDetails(validResults);
          setProductError(null);

          // Initialize material price with current design value
          const originalPrice = currentDesign?.materialPrice || 0;
          setMaterialPrice(originalPrice);
          setOriginalMaterialPrice(originalPrice);
          setTotalPrice(currentDesign?.totalPrice || 0);
        }
      } catch (error) {
        if (isMounted) {
          setProductError("Failed to load products");
          setProductDetails([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentDesign, getProductById]);

  // Add useEffect to fetch wallet balance
  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        await fetchBalance();
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };
    loadWalletBalance();
  }, [fetchBalance]);

  // Load provinces when component mounts
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        await getProvinces();
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };
    loadProvinces();
  }, [getProvinces]);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedProvince) {
        try {
          await getDistricts(selectedProvince);
          setSelectedDistrict(null);
          setSelectedWard(null);
        } catch (error) {
          console.error("Error loading districts:", error);
          message.error("Không thể tải danh sách quận/huyện");
        }
      }
    };
    loadDistricts();
  }, [selectedProvince, getDistricts]);

  // Load wards when district changes
  useEffect(() => {
    const loadWards = async () => {
      if (selectedDistrict) {
        try {
          await getWards(selectedDistrict);
          setSelectedWard(null);
        } catch (error) {
          console.error("Error loading wards:", error);
          message.error("Không thể tải danh sách phường/xã");
        }
      }
    };
    loadWards();
  }, [selectedDistrict, getWards]);

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const urls = await uploadImages([file]);
      if (urls && urls.length > 0) {
        setImageUrls((prev) => [...prev, ...urls]);
        message.success("Tải lên hình ảnh thành công");
      }
    } catch (error) {
      message.error("Tải lên hình ảnh thất bại");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleImageRemove = (file) => {
    setImageUrls((prev) => prev.filter((url) => url !== file.url));
    return true;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("values", values);
      let fullAddress = "";

      if (useExistingAddress && hasExistingAddress) {
        fullAddress = user.address;
      } else {
        const provinceName = selectedProvince
          ? provinces.find((p) => p.provinceId === selectedProvince)
              ?.provinceName
          : "";
        const districtName = selectedDistrict
          ? districts.find((d) => d.districtId === selectedDistrict)
              ?.districtName
          : "";
        const wardName = selectedWard
          ? wards.find((w) => w.wardCode === selectedWard)?.wardName
          : "";
        fullAddress = `${addressDetail}|${provinceName}|${districtName}|${wardName}`;
      }
      // Recalculate prices one final time to ensure accuracy
      const finalPrices = updateAllPrices(productDetails);

      const data = {
        userId: user.id,
        designIdeaId: currentDesign.id,
        address: fullAddress,
        cusPhone: values.phone,
        length: values?.length || 0,
        width: values?.width || 0,
        isCustom: true,
        totalPrice: currentDesign.totalPrice,
        designPrice: currentDesign.designPrice,
        materialPrice: currentDesign.materialPrice,
        description: values?.description || "",
        image: {
          imageUrl: imageUrls[0] || "",
          image2: imageUrls[1] || "",
          image3: imageUrls[2] || "",
        },
        // serviceOrderDetails is not needed here as it will be added in the second API call
      };

      console.log("Order data prepared with prices:", {
        materialPrice: finalPrices.materialPrice,
        designPrice: currentDesign.designPrice,
        totalPrice: finalPrices.totalPrice,
      });

      setOrderData({
        ...data,
        saveAddress:
          saveNewAddress && !hasExistingAddress && !useExistingAddress,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  const handleConfirmOrder = async () => {
    try {
      console.log("Submitting order with data:", orderData);

      // Step 1: Create the service order first
      const orderResponse = await createDesignOrder(orderData);
      console.log("Order response:", orderResponse);

      // Check for response structure based on the logged data
      const orderId = orderResponse?.data?.id;

      if (!orderId) {
        console.error("Invalid order response structure:", orderResponse);
        throw new Error("Không thể lấy thông tin đơn hàng");
      }

      // Only proceed to Step 2 if Step 1 was successful
      try {
        // Step 2: Update the order with product details using updateServiceForCus
        const serviceOrderDetails = productDetails.map((item) => ({
          productId: item.detail.productId,
          quantity: item.detail.quantity,
        }));
        console.log("serviceOrderDetails", serviceOrderDetails);

        const updateData = {
          serviceType: 0,
          designPrice: orderResponse.data.designPrice || 0,
          description: orderResponse.data.description || "",
          status: 0,
          report: "",
          image: {
            imageUrl: orderResponse.data.image?.imageUrl || "",
            image2: orderResponse.data.image?.image2 || "",
            image3: orderResponse.data.image?.image3 || "",
          },
          serviceOrderDetails: serviceOrderDetails,
        };

        console.log("Updating order with product details:", updateData);

        // Call the API to update the order with product details
        const updateResponse = await updateServiceForCus(orderId, updateData);
        console.log("Update response:", updateResponse);
      } catch (updateError) {
        console.error("Error updating order with products:", updateError);
        // Even if the update fails, the order was created successfully
        message.warning(
          "Đơn hàng đã được tạo nhưng không thể cập nhật danh sách vật liệu: " +
            (updateError.message || "Lỗi không xác định")
        );
      }

      await fetchBalance();
      message.success("Đặt hàng thành công!");
      setIsModalOpen(false);
      navigate("/serviceorderhistory");
    } catch (error) {
      console.error("Order submission error:", error);
      message.error(
        "Có lỗi xảy ra khi đặt hàng: " + (error.message || "Lỗi không xác định")
      );
    }
  };

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
  };

  const handleWardChange = (value) => {
    setSelectedWard(value);
  };

  const handleAddressDetailChange = (e) => {
    setAddressDetail(e.target.value);
  };

  // Handle design check
  const handleDesignCheck = () => {
    setIsDesignChecked(!isDesignChecked);
    if (!isDesignChecked) {
      setIsProductChecked(false);
    }
  };

  // Handle product check
  const handleProductCheck = () => {
    setIsProductChecked(!isProductChecked);
    if (!isProductChecked) {
      setIsDesignChecked(false);
    }
  };

  // Show product modal
  const showProductModal = async () => {
    try {
      // Get all products from shop
      const products = await fetchProducts();
      setAllProducts(products);

      // Initialize selected products from current product details
      const initialSelectedProducts = productDetails.map((detail) => ({
        productId: detail.product.id,
        quantity: detail.detail.quantity || 1,
        price: detail.product.price || 0,
        totalPrice: (detail.product.price || 0) * detail.detail.quantity,
      }));

      // Set temporary list from current products
      setTempServiceOrderDetails(initialSelectedProducts);
      setSelectedProducts([]); // Reset selected products
      setIsProductModalVisible(true);
    } catch (error) {
      message.error("Không thể tải danh sách vật liệu");
      console.error("Error loading products:", error);
    }
  };

  // Add new product to temporary list
  const handleAddProduct = () => {
    if (selectedProducts.length === 0) {
      message.warning("Vui lòng chọn vật liệu");
      return;
    }

    const selectedProductId = selectedProducts[0];
    const selectedProduct = allProducts.find((p) => p.id === selectedProductId);

    if (!selectedProduct) {
      message.error("Không tìm thấy thông tin vật liệu");
      return;
    }

    // Check if product already exists in temporary list
    const existingProduct = tempServiceOrderDetails.find(
      (item) => item.productId === selectedProductId
    );

    if (existingProduct) {
      message.warning("vật liệu này đã có trong danh sách");
      return;
    }

    // Add new product to temporary list
    const newProduct = {
      productId: selectedProductId,
      quantity: 1,
      price: selectedProduct.price || 0,
      totalPrice: selectedProduct.price || 0,
    };

    // Update temporary list
    setTempServiceOrderDetails((prev) => [...prev, newProduct]);
    setSelectedProducts([]); // Reset selected products

    message.success(`Đã thêm vật liệu "${selectedProduct.name}" vào danh sách`);
  };

  // Remove product from temporary list
  const handleRemoveProduct = (productId) => {
    const productToRemove = allProducts.find((p) => p.id === productId);

    // Update temporary list by filtering out the product
    setTempServiceOrderDetails((prev) =>
      prev.filter((item) => item.productId !== productId)
    );

    if (productToRemove) {
      message.success(
        `Đã xóa vật liệu "${productToRemove.name}" khỏi danh sách`
      );
    }
  };

  // Update product quantity in temporary list
  const handleUpdateQuantity = (productId, quantity) => {
    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity < 1) {
      message.warning("Số lượng phải là số nguyên dương");
      return;
    }

    const product = allProducts.find((p) => p.id === productId);
    const price = product?.price || 0;

    // Update quantity and total price in temporary list
    setTempServiceOrderDetails((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              price: price,
              totalPrice: price * newQuantity,
            }
          : item
      )
    );
  };

  // Function to calculate material price based on products
  const calculateMaterialPrice = (products) => {
    let totalMaterialPrice = 0;

    products.forEach((item) => {
      const price = item.product?.price || 0;
      const quantity = item.detail?.quantity || 0;
      totalMaterialPrice += price * quantity;
    });

    return totalMaterialPrice;
  };

  // Function to update all prices
  const updateAllPrices = (products) => {
    // Calculate material price
    const newMaterialPrice = products.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * (item.detail?.quantity || 0);
    }, 0);

    // Update material price
    setMaterialPrice(newMaterialPrice);

    // Update total price (design price + material price)
    const newTotalPrice = (currentDesign?.designPrice || 0) + newMaterialPrice;
    setTotalPrice(newTotalPrice);

    // Check if price difference exceeds 30%
    if (originalMaterialPrice > 0) {
      const percentDifference = Math.abs(newMaterialPrice - originalMaterialPrice) / originalMaterialPrice * 100;
      setIsPriceWarning(percentDifference > 30);
    }

    return { materialPrice: newMaterialPrice, totalPrice: newTotalPrice };
  };

  // Save the customized product list
  const handleSaveProducts = async () => {
    try {
      // Check if there are any products in the temporary list
      if (tempServiceOrderDetails.length === 0) {
        message.warning("Vui lòng thêm ít nhất một vật liệu");
        return;
      }

      // Update the displayed product details
      const updatedDetails = [];
      for (const item of tempServiceOrderDetails) {
        try {
          const product = await getProductById(item.productId);
          if (product) {
            updatedDetails.push({
              detail: {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              },
              product,
            });
          }
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
        }
      }

      // Update the product details display
      setProductDetails(updatedDetails);

      // Update all prices based on the updated products
      updateAllPrices(updatedDetails);

      message.success("Cập nhật danh sách vật liệu thành công");
      setIsProductModalVisible(false);
    } catch (error) {
      console.error("Error updating product list:", error);
      message.error("Có lỗi xảy ra khi cập nhật danh sách vật liệu");
    }
  };

  if (designLoading) {
    return (
      <Layout>
        <Header />
        <Content className="order-service-loading">
          <div className="container">
            <Card loading />
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (!currentDesign) {
    return (
      <Layout>
        <Header />
        <Content className="order-service-error">
          <div className="container">
            <Card>
              <Title level={3}>Không tìm thấy thiết kế</Title>
            </Card>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className="order-service-layout">
      <Header />
      <Content>
        <div className="order-service-content">
          <div className="container">
            <Title level={1}>Đặt hàng thiết kế tùy chỉnh</Title>

            <div className="order-form">
              {/* Customer Information */}

              {/* Design Information */}
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 3,
                      gap: "8px",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Thông tin thiết kế</span>
                    <Button
                      type="text"
                      size="small"
                      onClick={handleDesignCheck}
                      disabled={isProductChecked}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "4px 8px",
                        backgroundColor: isDesignChecked ? "#f6ffed" : "#fff",
                        border: `1px solid ${
                          isDesignChecked ? "#b7eb8f" : "#d9d9d9"
                        }`,
                        borderRadius: "4px",
                        height: "auto",
                        cursor: isProductChecked ? "not-allowed" : "pointer",
                        transition: "all 0.3s",
                        opacity: isProductChecked ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isProductChecked) {
                          e.currentTarget.style.backgroundColor =
                            isDesignChecked ? "#e6f7d7" : "#f5f5f5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isProductChecked) {
                          e.currentTarget.style.backgroundColor =
                            isDesignChecked ? "#f6ffed" : "#fff";
                        }
                      }}
                    >
                      {isDesignChecked ? (
                        <CheckCircleFilled
                          style={{
                            color: "#52c41a",
                            fontSize: "16px",
                            marginRight: "4px",
                          }}
                        />
                      ) : (
                        <CheckCircleOutlined
                          style={{
                            color: isProductChecked ? "#d9d9d9" : "#8c8c8c",
                            fontSize: "16px",
                            marginRight: "4px",
                          }}
                        />
                      )}
                      <span
                        style={{
                          color: isDesignChecked
                            ? "#52c41a"
                            : isProductChecked
                            ? "#d9d9d9"
                            : "#8c8c8c",
                          fontSize: "14px",
                        }}
                      >
                        Chỉnh sửa thiết kế
                      </span>
                    </Button>
                  </div>
                }
                className="form-section"
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Title level={4}>{currentDesign?.name}</Title>
                    {currentDesign?.description && (
                      <div>
                        {currentDesign.description
                          .split("|")
                          .map((section, index) => (
                            <p key={index} style={{ margin: "8px 0" }}>
                              {section}
                            </p>
                          ))}
                      </div>
                    )}
                  </Col>
                  <Col span={24}>
                    <Row gutter={[16, 16]}>
                      {currentDesign?.image?.imageUrl && (
                        <Col span={8}>
                          <img
                            src={currentDesign.image.imageUrl}
                            alt={`${currentDesign.name} - 4`}
                            className="design-image"
                            style={{
                              width: "100%",
                              height: "300px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </Col>
                      )}
                      {currentDesign?.image?.image2 && (
                        <Col span={8}>
                          <img
                            src={currentDesign.image.image2}
                            alt={`${currentDesign.name} - 5`}
                            className="design-image"
                            style={{
                              width: "100%",
                              height: "300px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </Col>
                      )}
                      {currentDesign?.image?.image3 && (
                        <Col span={8}>
                          <img
                            src={currentDesign.image.image3}
                            alt={`${currentDesign.name} - 6`}
                            className="design-image"
                            style={{
                              width: "100%",
                              height: "300px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </Col>
                      )}
                    </Row>
                  </Col>
                </Row>
              </Card>

              {/* Custom Order Fields */}
              <Card title="Thông tin tùy chỉnh" className="form-section">
                <div
                  style={{
                    marginBottom: 24,
                    padding: 16,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    color: "#666",
                  }}
                >
                  Vui lòng cung cấp cho chúng tôi một số thông tin sau: chiều
                  dài, chiều rộng của không gian bạn muốn tùy chỉnh, hình ảnh về
                  không gian(nếu có) và mô tả sơ bộ ý tưởng của bạn. Designer
                  bên phía chúng tôi sẽ liên lạc để tư vấn cho bạn trong thời
                  gian sớm nhất. Giá thiết kế và danh sách vật liệu sẽ được cập nhập sau khi Designer hoàn tất thiết kế.
                </div>
                <Form form={form} layout="vertical">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        name="length"
                        label="Chiều dài (m)"
                        rules={[
                          {
                            required: isDesignChecked,
                            message: "Vui lòng nhập chiều dài",
                          },
                        ]}
                      >
                        <Input
                          type="number"
                          min={0}
                          step={0.1}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="width"
                        label="Chiều rộng (m)"
                        rules={[
                          {
                            required: isDesignChecked,
                            message: "Vui lòng nhập chiều rộng",
                          },
                        ]}
                      >
                        <Input
                          type="number"
                          min={0}
                          step={0.1}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="description"
                        label="Mô tả yêu cầu tùy chỉnh"
                        rules={[
                          {
                            required: isDesignChecked,
                            message: "Vui lòng nhập mô tả yêu cầu",
                          },
                        ]}
                      >
                        <div
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <EditorComponent
                            value={form.getFieldValue("description")}
                            onChange={(content) =>
                              form.setFieldsValue({ description: content })
                            }
                            height={300}
                          />
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="images"
                        label="Hình ảnh tham khảo"
                        rules={[
                          {
                            required: isDesignChecked,
                            message: "Vui lòng tải lên hình ảnh",
                          },
                        ]}
                      >
                        <div>
                          <Upload
                            listType="picture-card"
                            beforeUpload={handleImageUpload}
                            onRemove={handleImageRemove}
                            maxCount={3}
                            accept="image/*"
                            fileList={imageUrls.map((url, index) => ({
                              uid: `-${index}`,
                              name: `image-${index + 1}`,
                              status: "done",
                              url: url,
                            }))}
                          >
                            {imageUrls.length < 3 && (
                              <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Tải lên</div>
                              </div>
                            )}
                          </Upload>
                          {uploading && (
                            <div style={{ marginTop: 8 }}>
                              <Progress percent={progress} size="small" />
                            </div>
                          )}
                          {uploadError && (
                            <div style={{ color: "red", marginTop: 8 }}>
                              {uploadError}
                            </div>
                          )}
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              {/* Product List */}
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 3,
                      gap: "8px",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Danh sách vật liệu</span>
                    <Button
                      type="text"
                      size="small"
                      onClick={handleProductCheck}
                      disabled={isDesignChecked}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "4px 8px",
                        backgroundColor: isProductChecked ? "#f6ffed" : "#fff",
                        border: `1px solid ${
                          isProductChecked ? "#b7eb8f" : "#d9d9d9"
                        }`,
                        borderRadius: "4px",
                        height: "auto",
                        cursor: isDesignChecked ? "not-allowed" : "pointer",
                        transition: "all 0.3s",
                        opacity: isDesignChecked ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isDesignChecked) {
                          e.currentTarget.style.backgroundColor =
                            isProductChecked ? "#e6f7d7" : "#f5f5f5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDesignChecked) {
                          e.currentTarget.style.backgroundColor =
                            isProductChecked ? "#f6ffed" : "#fff";
                        }
                      }}
                    >
                      {isProductChecked ? (
                        <CheckCircleFilled
                          style={{
                            color: "#52c41a",
                            fontSize: "16px",
                            marginRight: "4px",
                          }}
                        />
                      ) : (
                        <CheckCircleOutlined
                          style={{
                            color: isDesignChecked ? "#d9d9d9" : "#8c8c8c",
                            fontSize: "16px",
                            marginRight: "4px",
                          }}
                        />
                      )}
                      <span
                        style={{
                          color: isProductChecked
                            ? "#52c41a"
                            : isDesignChecked
                            ? "#d9d9d9"
                            : "#8c8c8c",
                          fontSize: "14px",
                        }}
                      >
                        Chỉnh sửa vật liệu
                      </span>
                    </Button>
                  </div>
                }
                className="form-section"
              >
                {isProductChecked && (
                  <>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={showProductModal}
                      >
                        Tùy chỉnh vật liệu
                      </Button>
                    </div>
                    <Alert
                      message="Lưu ý"
                      description="Tùy chỉnh vật liệu có thể dẫn đến thay đổi cấu trúc của thiết kế, designer sẽ liên lạc để tư vấn và xác nhận lại với bạn trong thời gian sớm nhất"
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  </>
                )}
                {isLoadingProducts ? (
                  <div className="loading-container">
                    <Spin size="large" />
                  </div>
                ) : productError ? (
                  <Paragraph type="danger">{productError}</Paragraph>
                ) : productDetails && productDetails.length > 0 ? (
                  productDetails.map(({ detail, product }) => (
                    <div key={detail.productId} className="product-item">
                      <Row gutter={16} align="middle">
                        <Col span={4}>
                          <img
                            src={product.image?.imageUrl}
                            alt={product.name}
                            className="product-image"
                          />
                        </Col>
                        <Col span={12}>
                          <Title level={5}>{product.name}</Title>
                          <Paragraph>{product.description}</Paragraph>
                        </Col>
                        <Col span={4}>
                          <span>Số lượng: {detail.quantity}</span>
                        </Col>
                        <Col span={4}>
                          <span className="product-price">
                            {detail.price.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </span>
                        </Col>
                      </Row>
                      <Divider />
                    </div>
                  ))
                ) : (
                  <Empty description="Không có vật liệu nào" />
                )}
              </Card>

              {/* Price Summary */}
              <Card title="Tổng quan giá" className="form-section">
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: "#fff7e6",
                    borderRadius: 8,
                    color: "#666",
                    border: "1px solid #ffd591",
                  }}
                >
                  Giá thiết kế và Giá vật liệu hiện tại là giá của Thiết kế mẫu,
                  Giá thiết kế và danh sách vật liệu mới sẽ được báo giá sau khi
                  Designer hoàn tất bản vẽ hoàn chỉnh.
                </div>
                {isPriceWarning && (
                  <Alert
                    message="Cảnh báo thay đổi giá"
                    description="Giá vật liệu đã thay đổi hơn 30% so với thiết kế ban đầu. Việc thay đổi này có thể ảnh hưởng đến cấu trúc thiết kế. Vui lòng chỉnh sửa vật liệu để tiếp tục."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
                <div className="price-summary">
                  <div className="price-item">
                    <span>Giá thiết kế:</span>
                    <span>
                      {currentDesign?.designPrice?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                  <div className="price-item">
                    <span>Giá vật liệu:</span>
                    <span>
                      {materialPrice.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                  {isProductChecked && originalMaterialPrice !== materialPrice && (
                    <div className="price-item" style={{ color: isPriceWarning ? "#faad14" : "#52c41a" }}>
                      <span>Thay đổi giá:</span>
                      <span>
                        {Math.abs(materialPrice - originalMaterialPrice).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                        {" "}
                        ({materialPrice > originalMaterialPrice ? "+" : "-"}
                        {Math.abs(Math.round((materialPrice - originalMaterialPrice) / originalMaterialPrice * 100))}%)
                      </span>
                    </div>
                  )}
                  <div className="price-item total">
                    <span>Tổng giá:</span>
                    <span>
                      {totalPrice.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </div>
                  <Divider />
                  <div className="price-item wallet-balance">
                    <span>Số dư ví:</span>
                    <span
                      style={{
                        color: balance >= totalPrice ? "#52c41a" : "#f5222d",
                        fontWeight: "bold",
                      }}
                    >
                      {walletLoading ? (
                        <Spin size="small" />
                      ) : (
                        balance?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      )}
                    </span>
                  </div>
                </div>
              </Card>

              <Card title="Thông tin người đặt" className="form-section">
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    fullName: user?.name || "",
                    phone: user?.phone || "",
                    address: user?.address || "",
                    email: user?.email || "",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập họ và tên",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: "email", message: "Email không hợp lệ" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    {/* Address Information */}
                    <Panel
                      header={
                        <div className="panel-header">
                          <HomeOutlined style={{ marginRight: "8px" }} />
                          <span>Thông tin địa chỉ</span>
                        </div>
                      }
                      key="3"
                      forceRender
                    >
                      <div style={{ marginBottom: "16px" }}>
                        <Text
                          strong
                          style={{ fontSize: "16px", color: "#333" }}
                        >
                          Địa chỉ giao hàng
                        </Text>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginTop: "4px" }}
                        >
                          Vui lòng chọn địa chỉ giao hàng chính xác để đảm bảo
                          đơn hàng được giao đúng nơi nhận
                        </Text>
                      </div>

                      {/* Checkbox sử dụng địa chỉ có sẵn - chỉ hiển thị nếu người dùng đã có địa chỉ */}
                      {hasExistingAddress && (
                        <Form.Item>
                          <Checkbox
                            checked={useExistingAddress}
                            onChange={handleUseExistingAddress}
                            style={{ marginBottom: "16px" }}
                          >
                            <span style={{ fontWeight: "bold" }}>
                              Sử dụng địa chỉ có sẵn
                            </span>
                          </Checkbox>

                          {/* {useExistingAddress && ( */}
                          <Alert
                            message="Địa chỉ hiện tại"
                            description={user.address.replace(/\|/g, ", ")}
                            type="info"
                            showIcon
                            style={{ marginBottom: "16px" }}
                          />
                          {/* )} */}
                        </Form.Item>
                      )}

                      {/* Address Selection - Hiển thị nếu không sử dụng địa chỉ có sẵn */}
                      {!useExistingAddress && (
                        <>
                          <Row gutter={[16, 16]}>
                            <Col span={24}>
                              <Form.Item label="Tỉnh/Thành phố" required>
                                <Select
                                  placeholder="Chọn tỉnh/thành phố"
                                  value={selectedProvince}
                                  onChange={handleProvinceChange}
                                  loading={provincesLoading}
                                  style={{ width: "100%" }}
                                >
                                  {provinces.map((province) => (
                                    <Option
                                      key={province.provinceId}
                                      value={province.provinceId}
                                    >
                                      {province.provinceName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item label="Quận/Huyện" required>
                                <Select
                                  placeholder="Chọn quận/huyện"
                                  value={selectedDistrict}
                                  onChange={handleDistrictChange}
                                  loading={districtsLoading}
                                  disabled={!selectedProvince}
                                  style={{ width: "100%" }}
                                >
                                  {districts.map((district) => (
                                    <Option
                                      key={district.districtId}
                                      value={district.districtId}
                                    >
                                      {district.districtName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item label="Phường/Xã" required>
                                <Select
                                  placeholder="Chọn phường/xã"
                                  value={selectedWard}
                                  onChange={handleWardChange}
                                  loading={wardsLoading}
                                  disabled={!selectedDistrict}
                                  style={{ width: "100%" }}
                                >
                                  {wards.map((ward) => (
                                    <Option
                                      key={ward.wardCode}
                                      value={ward.wardCode}
                                    >
                                      {ward.wardName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item label="Địa chỉ chi tiết" required>
                                <Input.TextArea
                                  rows={3}
                                  placeholder="Nhập số nhà, tên đường, tòa nhà, v.v."
                                  value={addressDetail}
                                  onChange={handleAddressDetailChange}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Checkbox lưu địa chỉ mới - chỉ hiển thị nếu chưa có địa chỉ */}
                          {!hasExistingAddress && (
                            <Form.Item>
                              <Checkbox
                                checked={saveNewAddress}
                                onChange={handleSaveNewAddress}
                              >
                                Lưu địa chỉ này cho lần sau
                              </Checkbox>
                            </Form.Item>
                          )}
                        </>
                      )}
                    </Panel>
                  </Row>
                </Form>
              </Card>

              {/* Submit Button */}
              <div className="form-actions">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={orderLoading}
                  disabled={isPriceWarning}
                >
                  Xác nhận đặt hàng
                </Button>
                {isPriceWarning && (
                  <div style={{ marginTop: 8, color: "#fa8c16", textAlign: "center" }}>
                    Không thể đặt hàng khi giá vật liệu thay đổi quá 30% so với thiết kế ban đầu
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer />

      {/* Confirmation Modal */}
      <Modal
        title="🎉 Xác nhận đặt hàng"
        open={isModalOpen}
        onOk={handleConfirmOrder}
        onCancel={() => setIsModalOpen(false)}
        okText="✨ Xác nhận đặt hàng"
        cancelText="Hủy"
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#1890ff", marginBottom: "16px" }}>
            Hoàn tất đơn hàng!
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              marginBottom: "20px",
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              border: "1px dashed #d9d9d9",
            }}
          >
            Đơn hàng sẽ được báo giá sau khi Designer hoàn tất bản vẽ
          </p>
          <p style={{ color: "#666" }}>Nhấn "Xác nhận đặt hàng" để hoàn tất</p>
        </div>
      </Modal>

      {/* Product Customization Modal */}
      <Modal
        title="Tùy chỉnh danh sách vật liệu"
        open={isProductModalVisible}
        onOk={handleSaveProducts}
        onCancel={() => setIsProductModalVisible(false)}
        width={800}
      >
        <div className="mb-4">
          <Space>
            <Select
              style={{ width: 300 }}
              placeholder="Chọn vật liệu"
              value={
                selectedProducts.length > 0 ? selectedProducts[0] : undefined
              }
              onChange={(value) => {
                setSelectedProducts(value ? [value] : []);
              }}
              optionFilterProp="children"
            >
              {allProducts.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.name}
                </Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProduct}
            >
              Thêm
            </Button>
          </Space>
        </div>

        <Table
          dataSource={tempServiceOrderDetails.map((item, index) => {
            const product = allProducts.find((p) => p.id === item.productId);
            return {
              key: index,
              productId: item.productId,
              product: product,
              quantity: item.quantity,
              price: item.price,
            };
          })}
          columns={[
            {
              title: "vật liệu",
              key: "product",
              render: (_, record) => {
                const product = record.product;
                if (!product) {
                  return <Text type="secondary">vật liệu không khả dụng</Text>;
                }
                return (  
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {product.image?.imageUrl ? (
                      <Image
                        src={product.image.imageUrl}
                        alt={product.name}
                        width={50}
                        height={50}
                        style={{ marginRight: "10px", borderRadius: "8px" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          background: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        <ShoppingOutlined
                          style={{ color: "#bfbfbf", fontSize: "20px" }}
                        />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>
                      
                    </div>
                  </div>
                );
              },
            },
            {
              title: "Đơn giá",
              dataIndex: "price",
              key: "price",
              render: (price) => price?.toLocaleString("vi-VN") + " đ",
            },
            {
              title: "Số lượng",
              dataIndex: "quantity",
              key: "quantity",
              render: (_, record) => (
                <InputNumber
                  min={1}
                  value={record.quantity}
                  onChange={(value) =>
                    handleUpdateQuantity(record.productId, value)
                  }
                  style={{ width: 80 }}
                />
              ),
            },
            {
              title: "Thành tiền",
              key: "totalPrice",
              render: (_, record) => {
                const totalPrice = record.price * record.quantity;
                return (
                  <Text strong>{totalPrice.toLocaleString("vi-VN")} đ</Text>
                );
              },
            },
            {
              title: "Thao tác",
              key: "action",
              render: (_, record) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveProduct(record.productId)}
                >
                  Xóa
                </Button>
              ),
            },
          ]}
          pagination={false}
          locale={{
            emptyText: <Empty description="Chưa có vật liệu nào" />,
          }}
        />
      </Modal>
    </Layout>
  );
};

export default OrderServiceCustomize;
