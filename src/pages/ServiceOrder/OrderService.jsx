import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Select,
  Collapse,
  Badge,
  Space,
  Alert,
  Tag,
  Statistic,
  Checkbox
} from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  UserOutlined,
  HomeOutlined,
  ReadOutlined,
  MinusOutlined,
  PlusOutlined,
  FilterOutlined,
  TagOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useDesignIdeaStore from "@/stores/useDesignIdeaStore";
import useProductStore from "@/stores/useProductStore";
import useAuthStore from "@/stores/useAuthStore";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import useWalletStore from "@/stores/useWalletStore";
import useShippingStore from "@/stores/useShippingStore";
// import "./styles.scss";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const OrderService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentDesign,
    fetchDesignIdeaById,
    isLoading: designLoading,
  } = useDesignIdeaStore();
  const { getProductById, updateProduct, fetchProducts, fetchCategories, categories } = useProductStore();
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
  
  const [productDetails, setProductDetails] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const mountedRef = useRef(true);
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState(['1', '2', '3']);
  const rightColumnRef = useRef(null);
  const leftColumnRef = useRef(null);
  const titleRef = useRef(null);
  const footerRef = useRef(null);
  const [leftColumnHeight, setLeftColumnHeight] = useState(0);
  const [footerTop, setFooterTop] = useState(0);
  const containerRef = useRef(null);
  
  // New states for products and categories
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingAllProducts, setLoadingAllProducts] = useState(false);
  const [existingCategories, setExistingCategories] = useState([]);
  const [originalProductDetails, setOriginalProductDetails] = useState([]);
  const [isChangeProductModalOpen, setIsChangeProductModalOpen] = useState(false);
  const [selectedProductToChange, setSelectedProductToChange] = useState(null);
  const [productsForCategory, setProductsForCategory] = useState([]);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Kiểm tra xem người dùng đã có địa chỉ hay chưa
  const hasExistingAddress = user?.address && user.address.trim() !== "";

  // Kiểm tra và thiết lập tính hợp lệ của địa chỉ
  useEffect(() => {
    if (useExistingAddress && hasExistingAddress) {
      // Nếu sử dụng địa chỉ có sẵn và có địa chỉ
      setIsAddressValid(true);
    } else if (!useExistingAddress) {
      // Nếu nhập địa chỉ mới, kiểm tra đầy đủ thông tin
      const isValid = selectedProvince && selectedDistrict && selectedWard && addressDetail.trim() !== "";
      setIsAddressValid(isValid);
    } else {
      setIsAddressValid(false);
    }
  }, [useExistingAddress, hasExistingAddress, selectedProvince, selectedDistrict, selectedWard, addressDetail]);

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

  // Tính toán chiều cao và vị trí các phần tử
  useEffect(() => {
    const calculateHeights = () => {
      if (leftColumnRef.current && rightColumnRef.current && footerRef.current && titleRef.current) {
        setLeftColumnHeight(leftColumnRef.current.scrollHeight);
        setFooterTop(footerRef.current.offsetTop);
      }
    };

    calculateHeights();
    window.addEventListener('resize', calculateHeights);

    // Theo dõi sự kiện scroll để điều chỉnh sticky positioning
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const rightColumn = rightColumnRef.current;
      if (!rightColumn || !footerRef.current) return;
      
      const footerTop = footerRef.current.offsetTop;
      const rightColumnHeight = rightColumn.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Điểm bắt đầu dịch chuyển: khi footer sắp va chạm với cột phải
      const scrollThreshold = footerTop - viewportHeight;
      
      // Giới hạn dịch chuyển: không dịch chuyển quá chiều cao của cột phải
      const maxOffset = Math.max(0, rightColumnHeight - viewportHeight + 100); // +100px buffer
      
      if (scrollY > scrollThreshold) {
        // Tính toán khoảng cách dịch chuyển và giới hạn nó
        const distance = Math.min(scrollY - scrollThreshold, maxOffset);
        rightColumn.style.transform = `translateY(-${distance}px)`;
      } else {
        rightColumn.style.transform = 'translateY(0)';
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', calculateHeights);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Xử lý sự kiện cuộn trang
  useEffect(() => {
    if (!leftColumnRef.current || !containerRef.current) return;

    const handleWheel = (e) => {
      const leftColumn = leftColumnRef.current;
      if (!leftColumn) return true; // Để browser xử lý nếu không có ref
      
      // Không cần kiểm tra vị trí chuột, luôn ưu tiên cuộn cột trái trước
      
      const scrollHeight = leftColumn.scrollHeight;
      const clientHeight = leftColumn.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      const currentScroll = leftColumn.scrollTop;

      // Kiểm tra cuộn xuống
      if (e.deltaY > 0) {
        // Nếu chưa cuộn đến cuối cột trái
        if (currentScroll < maxScroll - 5) {
          e.preventDefault();
          leftColumn.scrollTop += Math.min(e.deltaY, maxScroll - currentScroll);
          return false;
        }
        // Nếu đã cuộn đến cuối, để browser xử lý cuộn cả trang
        return true;
      } 
      // Kiểm tra cuộn lên
      else if (e.deltaY < 0) {
        // Nếu cột trái không ở đầu, ưu tiên cuộn cột trái lên trước
        if (currentScroll > 5) {
          e.preventDefault();
          leftColumn.scrollTop += Math.max(e.deltaY, -currentScroll);
          return false;
        }
        // Nếu đã ở đầu cột trái, để browser xử lý cuộn cả trang
        return true;
      }
      
      return true; // Để browser xử lý trong các trường hợp khác
    };

    // Lắng nghe sự kiện wheel trên toàn trang, không chỉ container
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Cập nhật chiều cao cho cột bên phải
  useEffect(() => {
    const updateRightColumnHeight = () => {
      const rightColumn = rightColumnRef.current;
      if (!rightColumn) return;

      // Đặt chiều cao tối đa cho cột phải dựa vào kích thước cửa sổ
      const viewportHeight = window.innerHeight;
      const headerHeight = 80; // Chiều cao ước tính của header
      const footerHeight = 60; // Chiều cao ước tính của footer
      const padding = 40; // Padding thêm vào
      
      const maxHeight = viewportHeight - headerHeight - padding;
      rightColumn.style.maxHeight = `${maxHeight}px`;
    };

    // Cập nhật khi component mount và khi resize window
    updateRightColumnHeight();
    window.addEventListener('resize', updateRightColumnHeight);

    return () => {
      window.removeEventListener('resize', updateRightColumnHeight);
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
        setOriginalProductDetails([]);
        setIsLoadingProducts(false);
        // Initialize prices to zero when no products
        setMaterialPrice(0);
        setTotalPrice(currentDesign?.designPrice || 0);
        return;
      }

      setIsLoadingProducts(true);
      setProductError(null);

      try {
        // Ensure categories are loaded first
        const categoriesData = await fetchCategories();
        
        // Load all products
        const allProductsData = await fetchProducts();
        if (!isMounted) return;
        
        console.log("All products loaded:", allProductsData);
        setAllProducts(allProductsData || []);

        const productPromises = currentDesign.productDetails.map(
          async (detail) => {
            try {
              // Find product from all products instead of making separate API calls
              const product = allProductsData.find(p => p.id === detail.productId);

              if (!isMounted) return null;

              if (product) {
                // Find category name from categories
                const category = categoriesData.find(cat => cat.id === product.categoryId);
                const categoryName = category ? category.name : "Không xác định";
                
                // Add categoryId and categoryName to detail
                const enhancedDetail = {
                  ...detail,
                  categoryId: product.categoryId,
                  categoryName: categoryName
                };
                
                return {
                  detail: enhancedDetail,
                  product: {
                    ...product,
                    categoryName: categoryName
                  }
                };
              } else {
                return null;
              }
            } catch (error) {
              console.error("Error mapping product:", error);
              return null;
            }
          }
        );

        const results = await Promise.all(productPromises);

        if (isMounted) {
          const validResults = results.filter(Boolean);
          console.log("Loaded products with categories:", validResults);
          
          // Tính toán giá dựa trên sản phẩm ban đầu
          let initialMaterialPrice = 0;
          
          validResults.forEach(({ detail }) => {
            initialMaterialPrice += detail.price || 0;
          });
          
          const designPrice = currentDesign?.designPrice || 0;
          const initialTotalPrice = initialMaterialPrice + designPrice;
          
          console.log("Initial prices:", {
            materialPrice: initialMaterialPrice,
            designPrice,
            totalPrice: initialTotalPrice
          });
          
          // Cập nhật state
          setProductDetails(validResults);
          setOriginalProductDetails([...validResults]); // Store original product details
          setMaterialPrice(initialMaterialPrice);
          setTotalPrice(initialTotalPrice);
          
          // Cập nhật giá trong currentDesign
          if (currentDesign) {
            currentDesign.materialPrice = initialMaterialPrice;
            currentDesign.totalPrice = initialTotalPrice;
          }
          
          setProductError(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load products:", error);
          setProductError("Failed to load products");
          setProductDetails([]);
          setOriginalProductDetails([]);
          setMaterialPrice(0);
          setTotalPrice(currentDesign?.designPrice || 0);
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
  }, [currentDesign, fetchProducts, fetchCategories]);

  // Filter products based on existing product categories
  useEffect(() => {
    if (productDetails && productDetails.length > 0) {
      // Extract unique categories from current products
      const categoryIds = productDetails.map(({ detail }) => detail.categoryId).filter(Boolean);
      const uniqueCategories = [...new Set(categoryIds)];
      
      console.log("Unique categories from products:", uniqueCategories);
      console.log("Available categories:", categories);
      
      setExistingCategories(uniqueCategories);
      
      // If no category selected, select the first one
      if (!selectedCategory && uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
    } else {
      setExistingCategories([]);
      setSelectedCategory(null);
      setFilteredProducts([]);
    }
  }, [productDetails, selectedCategory, categories]);

  // Load all products and categories - we can remove this since we load products in the previous effect
  useEffect(() => {
    const loadAllProductsAndCategories = async () => {
      try {
        setLoadingAllProducts(true);
        // Load categories
        const categoriesData = await fetchCategories();
        console.log("Loaded categories:", categoriesData);
        
        if (mountedRef.current) {
          // We already loaded products in the previous effect
          setLoadingAllProducts(false);
        }
      } catch (error) {
        if (mountedRef.current) {
          console.error("Error loading categories:", error);
          setLoadingAllProducts(false);
        }
      }
    };
    
    loadAllProductsAndCategories();
  }, [fetchCategories]);

  // Filter products by selected category
  useEffect(() => {
    if (selectedCategory && allProducts.length > 0) {
      console.log("Filtering products by category:", selectedCategory);
      console.log("All products count:", allProducts.length);
      
      const filtered = allProducts.filter(product => product.categoryId === selectedCategory);
      console.log("Filtered products count:", filtered.length);
      setFilteredProducts(filtered);
    } else if (existingCategories.length > 0 && allProducts.length > 0) {
      // If no category selected but there are existing categories, filter by all existing categories
      console.log("Filtering products by all existing categories:", existingCategories);
      const filtered = allProducts.filter(product => existingCategories.includes(product.categoryId));
      console.log("Filtered products count (all categories):", filtered.length);
      setFilteredProducts(filtered);
    } else {
      console.log("No filtering applied, clearing filtered products");
      setFilteredProducts([]);
    }
  }, [selectedCategory, allProducts, existingCategories]);

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
        //message.error("Không thể tải danh sách tỉnh thành");
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
          // Reset district and ward selections when province changes
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
          // Reset ward selection when district changes
          setSelectedWard(null);
        } catch (error) {
          console.error("Error loading wards:", error);
          message.error("Không thể tải danh sách phường/xã");
        }
      }
    };
    loadWards();
  }, [selectedDistrict, getWards]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Xác định địa chỉ giao hàng
      let fullAddress = "";
      
      if (useExistingAddress && hasExistingAddress) {
        fullAddress = user.address;
      } else {
        const provinceName = selectedProvince ? provinces.find(p => p.provinceId === selectedProvince)?.provinceName : '';
        const districtName = selectedDistrict ? districts.find(d => d.districtId === selectedDistrict)?.districtName : '';
        const wardName = selectedWard ? wards.find(w => w.wardCode === selectedWard)?.wardName : '';
        fullAddress = `${addressDetail}|${provinceName}|${districtName}|${wardName}`;
      }

      // Create a productDetails array from the current product details 
      const updatedProductDetails = productDetails.map(({ detail }) => ({
        productId: detail.productId,
        quantity: detail.quantity,
        // price: detail.price,
        // categoryName: detail.categoryName
      }));

      // Log để kiểm tra danh sách sản phẩm
      console.log("Submitting order with products:", updatedProductDetails);
      
      const data = {
        userId: user.id,
        designIdeaId: currentDesign.id,
        address: fullAddress,
        cusPhone: values.phone,
        isCustom: false,
        totalPrice: totalPrice, // Sử dụng tổng giá từ state
        designPrice: currentDesign.designPrice,
        materialPrice: materialPrice, // Sử dụng giá vật liệu từ state
        products: updatedProductDetails, // Danh sách sản phẩm hiện tại
      };
      
      console.log("Order data prepared:", data);
      setOrderData({
        ...data,
        saveAddress: saveNewAddress && !hasExistingAddress && !useExistingAddress
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  const handleConfirmOrder = async () => {
    try {
      // Cập nhật lại danh sách sản phẩm mới nhất và giá hiện tại
      const updatedProductData = {
        ...orderData,
        totalPrice: totalPrice,
        materialPrice: materialPrice,
        productDetails: productDetails.map(({ detail }) => ({
          productId: detail.productId,
          quantity: detail.quantity,
          // price: detail.price,
          // categoryName: detail.categoryName
        }))
      };
      
      console.log("Sending order with latest products:", updatedProductData.productDetails);
      console.log("Total price being sent:", updatedProductData.totalPrice);

      // Nếu có yêu cầu lưu địa chỉ mới
      if (orderData.saveAddress) {
        try {
          // Cập nhật địa chỉ người dùng thông qua API
          await useAuthStore.getState().updateUserAddress(orderData.address);
          message.success("Đã lưu địa chỉ mới");
        } catch (error) {
          console.error("Error saving address:", error);
          message.warning("Không thể lưu địa chỉ mới, nhưng đơn hàng vẫn được xử lý");
        }
      }

      // Create the order
      const orderResponse = await createDesignOrder(updatedProductData);
      
      // Create bill after successful order creation
      await createBill(orderResponse.data.id, totalPrice);
      
      // Update stock for each product in the order using the latest productDetails
      if (productDetails && productDetails.length > 0) {
        for (const { detail, product } of productDetails) {
          try {
            // Calculate new stock by subtracting ordered quantity
            const newStock = product.stock - detail.quantity;
            
            // Prepare update data
            const updateData = {
              name: product.name,
              categoryId: product.categoryId,
              price: product.price,
              stock: newStock,
              description: product.description,
              designImage1URL: product.designImage1URL || "",
              size: product.size,
              image: {
                imageUrl: product.image?.imageUrl || "",
                image2: product.image?.image2 || "",
                image3: product.image?.image3 || ""
              }
            };
            
            // Update product stock
            await updateProduct(product.id, updateData);
          } catch (error) {
            console.error(`Error updating stock for product ${product.id}:`, error);
            // Continue with other products even if one fails
          }
        }
      }
      
      // Refresh wallet balance after successful order creation and bill creation
      await fetchBalance();
      message.success("Đặt hàng thành công!");
      setIsModalOpen(false);
      navigate("/serviceorderhistory");
    } catch (error) {
      console.error("Order submission error:", error);
      message.error("Có lỗi xảy ra khi đặt hàng");
    }
  };

  // Handle province selection
  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
  };

  // Handle district selection
  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
  };

  // Handle ward selection
  const handleWardChange = (value) => {
    setSelectedWard(value);
  };

  // Handle address detail change
  const handleAddressDetailChange = (e) => {
    setAddressDetail(e.target.value);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    console.log("Category selected:", categoryId);
    console.log("Categories available:", categories);
    console.log("All products:", allProducts);
    setSelectedCategory(categoryId);
  };

  // Handle adding a product to the design
  const handleAddProduct = (product) => {
    // Check if product is already in productDetails
    const existingProductIndex = productDetails.findIndex(
      ({ detail }) => detail.productId === product.id
    );

    if (existingProductIndex >= 0) {
      // If product exists, increase quantity
      const updatedProductDetails = [...productDetails];
      const currentDetail = updatedProductDetails[existingProductIndex].detail;
      
      updatedProductDetails[existingProductIndex] = {
        ...updatedProductDetails[existingProductIndex],
        detail: {
          ...currentDetail,
          quantity: currentDetail.quantity + 1,
          price: product.price * (currentDetail.quantity + 1)
        }
      };
      
      setProductDetails(updatedProductDetails);
      message.success(`Đã tăng số lượng ${product.name}`);
    } else {
      // If product doesn't exist, add it
      const newProductDetail = {
        detail: {
          productId: product.id,
          quantity: 1,
          price: product.price,
          categoryId: product.categoryId,
          categoryName: product.categoryName || categories.find(c => c.id === product.categoryId)?.name || "Không xác định"
        },
        product
      };
      
      console.log("Adding new product:", newProductDetail);
      setProductDetails([...productDetails, newProductDetail]);
      message.success(`Đã thêm ${product.name} vào thiết kế`);
    }
    
    // Recalculate total price
    updateTotalPrice();
  };

  // Handle removing a product from the design
  const handleRemoveProduct = (productId) => {
    const updatedProductDetails = productDetails.filter(
      ({ detail }) => detail.productId !== productId
    );
    
    setProductDetails(updatedProductDetails);
    message.success('Đã xóa sản phẩm khỏi thiết kế');
    
    // Recalculate total price
    updateTotalPrice();
  };

  // Handle quantity change for a product
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const productIndex = productDetails.findIndex(
      ({ detail }) => detail.productId === productId
    );
    
    if (productIndex >= 0) {
      const updatedProductDetails = [...productDetails];
      const product = updatedProductDetails[productIndex].product;
      
      // Check if new quantity exceeds stock
      if (newQuantity > product.stock) {
        message.warning(`Số lượng vượt quá hàng trong kho (${product.stock})`);
        newQuantity = product.stock;
      }
      
      updatedProductDetails[productIndex] = {
        ...updatedProductDetails[productIndex],
        detail: {
          ...updatedProductDetails[productIndex].detail,
          quantity: newQuantity,
          price: product.price * newQuantity
        }
      };
      
      setProductDetails(updatedProductDetails);
      
      // Recalculate total price
      updateTotalPrice();
    }
  };

  // Handle replacing a product in the design
  const handleReplaceProduct = (product) => {
    // Find if any product with the same category already exists
    const existingCategoryProductIndex = productDetails.findIndex(
      ({ detail, product: existingProduct }) => 
        (detail.categoryId && detail.categoryId === product.categoryId) || 
        (existingProduct.categoryId && existingProduct.categoryId === product.categoryId)
    );

    if (existingCategoryProductIndex >= 0) {
      // Replace the existing product with the new one
      const updatedProductDetails = [...productDetails];
      const existingDetail = updatedProductDetails[existingCategoryProductIndex].detail;
      
      // Preserve the quantity from the existing product
      const quantity = existingDetail.quantity || 1;
      
      updatedProductDetails[existingCategoryProductIndex] = {
        detail: {
          productId: product.id,
          quantity: quantity,
          price: product.price * quantity,
          categoryId: product.categoryId,
          categoryName: product.categoryName || categories.find(c => c.id === product.categoryId)?.name || "Không xác định"
        },
        product
      };
      
      setProductDetails(updatedProductDetails);
      message.success(`Đã thay thế bằng ${product.name}`);
    } else {
      // If no product with the same category exists, simply add it
      handleAddProduct(product);
    }
    
    // Recalculate total price
    updateTotalPrice();
  };

  // Update filtered products when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = allProducts.filter(product => product.categoryId === selectedCategory);
      setFilteredProducts(filtered);
      console.log("Filtered products:", filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [selectedCategory, allProducts]);

  // Update the total price based on product details
  const updateTotalPrice = () => {
    // Calculate material price based on selected products
    const calculatedMaterialPrice = productDetails.reduce(
      (total, { detail }) => total + detail.price,
      0
    );
    
    // Keep the same design price
    const designPrice = currentDesign?.designPrice || 0;
    
    // Calculate total price
    const calculatedTotalPrice = calculatedMaterialPrice + designPrice;
    
    // Update state to trigger re-render
    setMaterialPrice(calculatedMaterialPrice);
    setTotalPrice(calculatedTotalPrice);
    
    // Update the currentDesign object for use in the order
    if (currentDesign) {
      currentDesign.materialPrice = calculatedMaterialPrice;
      currentDesign.totalPrice = calculatedTotalPrice;
    }

    console.log("Updated prices:", {
      materialPrice: calculatedMaterialPrice,
      designPrice,
      totalPrice: calculatedTotalPrice
    });
  };

  // Hiển thị modal thay đổi sản phẩm
  const showChangeProductModal = (productId, categoryId) => {
    // Tìm product cần thay đổi
    const productToChange = productDetails.find(({detail}) => detail.productId === productId);
    if (!productToChange) return;

    setSelectedProductToChange(productToChange);

    // Lọc các sản phẩm cùng category
    const productsInSameCategory = allProducts.filter(product => 
      product.categoryId === categoryId
    );
    
    console.log("Showing products of category:", categoryId);
    console.log("Found products:", productsInSameCategory.length);
    
    setProductsForCategory(productsInSameCategory);
    setIsChangeProductModalOpen(true);
  };

  // Xử lý thay đổi sản phẩm
  const handleChangeProduct = (newProduct) => {
    if (!selectedProductToChange) return;

    // Tìm vị trí sản phẩm cần thay đổi trong productDetails
    const productIndex = productDetails.findIndex(
      ({detail}) => detail.productId === selectedProductToChange.detail.productId
    );

    if (productIndex >= 0) {
      // Tạo bản sao của danh sách sản phẩm
      const updatedProductDetails = [...productDetails];
      
      // Giữ nguyên số lượng của sản phẩm cũ
      const quantity = updatedProductDetails[productIndex].detail.quantity;
      
      // Tính giá mới
      const newPrice = newProduct.price * quantity;
      
      // Thay thế sản phẩm
      updatedProductDetails[productIndex] = {
        detail: {
          productId: newProduct.id,
          quantity: quantity,
          price: newPrice,
          categoryId: newProduct.categoryId,
          categoryName: newProduct.categoryName || categories.find(c => c.id === newProduct.categoryId)?.name || "Không xác định"
        },
        product: newProduct
      };
      
      // Cập nhật danh sách sản phẩm
      setProductDetails(updatedProductDetails);
      
      // Tính toán giá mới
      const newMaterialPrice = updatedProductDetails.reduce(
        (total, { detail }) => total + detail.price,
        0
      );
      
      // Keep the same design price
      const designPrice = currentDesign?.designPrice || 0;
      
      // Calculate new total price
      const newTotalPrice = newMaterialPrice + designPrice;
      
      // Cập nhật state để trigger re-render
      setMaterialPrice(newMaterialPrice);
      setTotalPrice(newTotalPrice);
      
      // Cập nhật giá trong currentDesign
      if (currentDesign) {
        currentDesign.materialPrice = newMaterialPrice;
        currentDesign.totalPrice = newTotalPrice;
      }
      
      console.log("Updated prices after product change:", {
        materialPrice: newMaterialPrice,
        designPrice,
        totalPrice: newTotalPrice,
        updatedProduct: newProduct.name,
        quantity,
        productPrice: newProduct.price,
        newItemPrice: newPrice
      });
      
      // Đóng modal
      setIsChangeProductModalOpen(false);
      
      // Hiển thị thông báo thành công
      message.success(`Đã thay thế bằng ${newProduct.name}`);
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
      <Content style={{ paddingTop: '30px', paddingBottom: '10px' }}>
        <div className="order-service-content" ref={containerRef} style={{ paddingBottom: '50px' }}>
          <div className="container order-service-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>

            <Row gutter={[24, 24]} style={{ position: 'relative' }}>
              {/* Cột trái (2/3) - Có thể cuộn */}
              <Col xs={24} md={16}>
                <div
                  ref={leftColumnRef}
                  className="left-column-scrollable"
                  style={{
                    height: 'calc(100vh - 200px)',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d9d9d9 #f5f5f5',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f5f5f5',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#d9d9d9',
                      borderRadius: '4px',
                    }
                  }}
                >
                  <div className="order-form">
                    {/* Design Information */}
                    <Card className="form-section design-info-card">
                      <Row gutter={[16, 16]}>
                        <Col span={24}>
                          <div className="design-images-carousel">
                            <Title level={3}>{currentDesign?.name}</Title>
                            <Row gutter={[16, 16]}>
                              {currentDesign?.image?.imageUrl && (
                                <Col span={24} md={8}>
                                  <img
                                    src={currentDesign.image.imageUrl}
                                    alt={`${currentDesign.name} - 1`}
                                    className="design-image"
                                    style={{
                                      width: "100%",
                                      height: "220px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Col>
                              )}
                              {currentDesign?.image?.image2 && (
                                <Col span={24} md={8}>
                                  <img
                                    src={currentDesign.image.image2}
                                    alt={`${currentDesign.name} - 2`}
                                    className="design-image"
                                    style={{
                                      width: "100%",
                                      height: "220px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Col>
                              )}
                              {currentDesign?.image?.image3 && (
                                <Col span={24} md={8}>
                                  <img
                                    src={currentDesign.image.image3}
                                    alt={`${currentDesign.name} - 3`}
                                    className="design-image"
                                    style={{
                                      width: "100%",
                                      height: "220px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                </Col>
                              )}
                            </Row>
                          </div>
                        </Col>
                      </Row>

                      <Collapse
                        className="design-description-collapse"
                        defaultActiveKey={['1']}
                        bordered={false}
                        expandIconPosition="end"
                        style={{ marginTop: '20px' }}
                      >
                        <Panel header={<Title level={5}>Chi tiết thiết kế</Title>} key="1">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: currentDesign?.description,
                            }}
                            className="design-description"
                          />
                        </Panel>
                      </Collapse>
                    </Card>
                    
                    {/* Product List */}
                    <Collapse
                      defaultActiveKey={activeKey}
                      onChange={setActiveKey}
                      className="form-section"
                      style={{ marginTop: '24px' }}
                      expandIconPosition="end"
                    >
                      <Panel
                        header={
                          <div className="panel-header">
                            <ReadOutlined style={{ marginRight: '8px' }} />
                            <span>Danh sách sản phẩm</span>
                            <Badge count={productDetails.length} style={{ marginLeft: '8px', backgroundColor: '#4caf50' }} />
                          </div>
                        }
                        key="1"
                        forceRender
                      >
                        {isLoadingProducts ? (
                          <div className="loading-container">
                            <Spin size="large" />
                          </div>
                        ) : productError ? (
                          <Paragraph type="danger">{productError}</Paragraph>
                        ) : productDetails && productDetails.length > 0 ? (
                          <div className="product-list">
                            <div className="product-summary" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                              <Row gutter={16}>
                                <Col span={8}>
                                  <Statistic 
                                    title="Tổng sản phẩm" 
                                    value={productDetails.reduce((total, { detail }) => total + detail.quantity, 0)} 
                                    prefix={<TagOutlined />} 
                                  />
                                </Col>
                                <Col span={8}>
                                  <Statistic 
                                    title="Số loại sản phẩm" 
                                    value={productDetails.length} 
                                    prefix={<AppstoreOutlined />} 
                                  />
                                </Col>
                                <Col span={8}>
                                  <Statistic 
                                    title="Tổng tiền vật liệu" 
                                    value={productDetails.reduce((total, { detail }) => total + detail.price, 0)} 
                                    prefix={<DollarOutlined />}
                                    formatter={(value) => value.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    })}
                                  />
                                </Col>
                              </Row>
                            </div>

                            <div className="categories-container" style={{ marginBottom: '20px' }}>
                              <Text strong>Danh mục hiện có:</Text>
                              <div style={{ marginTop: '8px' }}>
                                {existingCategories.map(categoryId => {
                                  const category = categories.find(cat => cat.id === categoryId);
                                  return category ? (
                                    <Tag 
                                      key={categoryId} 
                                      color="blue" 
                                      style={{ marginBottom: '8px', fontSize: '14px', padding: '4px 8px' }}
                                    >
                                      {category.name}
                                    </Tag>
                                  ) : null;
                                })}
                              </div>
                            </div>
                            
                            {productDetails.map(({ detail, product }) => (
                              <div key={detail.productId} className="product-item">
                                <Row gutter={16} align="middle">
                                  <Col span={4}>
                                    <img
                                      src={product.image?.imageUrl}
                                      alt={product.name}
                                      className="product-image"
                                      style={{ borderRadius: '8px', maxWidth: '100%', height: 'auto' }}
                                    />
                                  </Col>
                                  <Col span={8}>
                                    <Title level={5}>{product.name}</Title>
                                    <Paragraph ellipsis={{ rows: 2 }}>{product.description}</Paragraph>
                                    <Tag color="blue">{detail.categoryName || product.categoryName || "Không xác định"}</Tag>
                                  </Col>
                                  <Col span={4}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <Input 
                                        value={detail.quantity} 
                                        style={{ width: '50px', margin: '0 8px', textAlign: 'center' }} 
                                        disabled={true}
                                      />
                                    </div>
                                  </Col>
                                  <Col span={4}>
                                    <span className="product-price">
                                      {detail.price.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      })}
                                    </span>
                                  </Col>
                                  <Col span={4}>
                                    <Button 
                                      type="primary" 
                                      icon={<FilterOutlined />}
                                      onClick={() => showChangeProductModal(detail.productId, product.categoryId)}
                                    >
                                      Thay đổi
                                    </Button>
                                  </Col>
                                </Row>
                                <Divider style={{ margin: '12px 0' }} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Empty description="Không có sản phẩm nào" />
                        )}
                      </Panel>

                      {/* Customer Information */}
                      <Panel
                        header={
                          <div className="panel-header">
                            <UserOutlined style={{ marginRight: '8px' }} />
                            <span>Thông tin người đặt</span>
                          </div>
                        }
                        key="2"
                        forceRender
                      >
                        <Form
                          form={form}
                          layout="vertical"
                          initialValues={{
                            fullName: user?.name || "",
                            phone: user?.phone || "",
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
                                <Input disabled={true} />
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
                                <Input disabled={true} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </Panel>

                      {/* Address Information */}
                      <Panel
                        header={
                          <div className="panel-header">
                            <HomeOutlined style={{ marginRight: '8px' }} />
                            <span>Thông tin địa chỉ</span>
                          </div>
                        }
                        key="3"
                        forceRender
                      >
                        <div style={{ marginBottom: '16px' }}>
                          <Text strong style={{ fontSize: '16px', color: '#333' }}>Địa chỉ giao hàng</Text>
                          <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
                            Vui lòng chọn địa chỉ giao hàng chính xác để đảm bảo đơn hàng được giao đúng nơi nhận
                          </Text>
                        </div>
                        
                        {/* Checkbox sử dụng địa chỉ có sẵn - chỉ hiển thị nếu người dùng đã có địa chỉ */}
                        {hasExistingAddress && (
                          <Form.Item>
                            <Checkbox 
                              checked={useExistingAddress} 
                              onChange={handleUseExistingAddress}
                              style={{ marginBottom: '16px' }}
                            >
                              <span style={{ fontWeight: 'bold' }}>Sử dụng địa chỉ có sẵn</span>
                            </Checkbox>
                            
                            {/* {useExistingAddress && ( */}
                              <Alert
                                message="Địa chỉ hiện tại"
                                description={user.address.replace(/\|/g, ', ')}
                                type="info"
                                showIcon
                                style={{ marginBottom: '16px' }}
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
                                      <Option key={ward.wardCode} value={ward.wardCode}>
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
                      
                    </Collapse>
                  </div>
                </div>
              </Col>

              {/* Cột phải (1/3) */}
              <Col xs={24} md={8}>
                <div 
                  ref={rightColumnRef}
                  className="right-column-sticky"
                  style={{
                    position: 'sticky',
                    top: '80px',
                    maxHeight: 'calc(100vh - 100px)',
                    overflow: 'auto',
                    display: 'block',
                    zIndex: 10,
                    backgroundColor: '#fff'
                  }}
                >
                  <Card
                    className="order-summary-card"
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <DollarOutlined style={{ marginRight: '8px', color: '#4caf50' }} />
                        <span>Thông tin đơn hàng</span>
                      </div>
                    }
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  >
                    <div className="price-summary">
                      {/* Tổng giá - hiển thị nổi bật nhất */}
                      <div className="total-price-container" style={{
                        background: 'linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        marginBottom: '16px'
                      }}>
                        <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                          Tổng giá
                        </Text>
                        <Text strong style={{
                          fontSize: '28px',
                          color: '#4caf50',
                          display: 'block',
                          fontFamily: "'Roboto', sans-serif"
                        }}>
                          {totalPrice.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </Text>
                      </div>

                      {/* Chi tiết giá */}
                      <div className="price-details" style={{
                        background: '#fff',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '16px'
                      }}>
                        <div className="price-detail-item" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <Text type="secondary">Giá thiết kế:</Text>
                          <Text>
                            {currentDesign?.designPrice?.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </Text>
                        </div>
                        <div className="price-detail-item" style={{
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <Text type="secondary">Giá vật liệu:</Text>
                          <Text>
                            {materialPrice.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </Text>
                        </div>
                      </div>


                      {/* Số dư ví */}
                      <div className="wallet-balance-container" style={{
                        background: balance >= totalPrice
                          ? 'linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%)'
                          : 'linear-gradient(135deg, #fff2f0 0%, #ffebee 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        border: balance >= totalPrice
                          ? '1px solid #b7eb8f'
                          : '1px solid #ffccc7'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                              Số dư ví:
                            </Text>
                            <Text strong style={{
                              fontSize: '18px',
                              color: balance >= totalPrice ? '#4caf50' : '#f5222d'
                            }}>
                              {walletLoading ? (
                                <Spin size="small" />
                              ) : (
                                balance?.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })
                              )}
                            </Text>
                          </div>
                          {balance >= totalPrice && (
                            <Badge
                              status="success"
                              text={<Text style={{ color: '#4caf50' }}>Đủ để thanh toán</Text>}
                            />
                          )}
                        </div>

                        {balance < totalPrice && (
                          <div style={{ marginTop: '12px' }}>
                            <Text type="danger" style={{ display: 'block', marginBottom: '8px' }}>
                              Số dư ví không đủ để thanh toán.
                            </Text>
                            <Button
                              type="primary"
                              danger
                              onClick={() => navigate("/userwallets")}
                              icon={<DollarOutlined />}
                              block
                            >
                              Nạp tiền ngay
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Nút đặt hàng */}
                      <div style={{ margin: '20px 0' }}>
                        <Button
                          type="primary"
                          size="large"
                          icon={<ShoppingCartOutlined />}
                          onClick={handleSubmit}
                          loading={orderLoading}
                          disabled={balance < totalPrice || !isAddressValid}
                          block
                          style={{
                            height: '48px',
                            fontSize: '16px',
                            background: balance >= totalPrice && isAddressValid ? '#4caf50' : '#d9d9d9',
                            borderColor: balance >= totalPrice && isAddressValid ? '#3d9140' : '#d9d9d9'
                          }}
                        >
                          Xác nhận đặt hàng
                        </Button>
                        {!isAddressValid && (
                          <Text type="danger" style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
                            Vui lòng {hasExistingAddress ? 'chọn địa chỉ có sẵn hoặc điền đầy đủ thông tin địa chỉ mới' : 'điền đầy đủ thông tin địa chỉ'}
                          </Text>
                        )}
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <Space>
                          <CheckCircleOutlined style={{ color: '#4caf50' }} />
                          <Text type="secondary">Đảm bảo 100% chính hãng</Text>
                        </Space>
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Content>
      {/* <Footer ref={footerRef} /> */}

      {/* Confirmation Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <CheckCircleOutlined style={{ color: '#4caf50', fontSize: '24px', marginRight: '8px' }} />
            <span>Xác nhận đặt hàng</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleConfirmOrder}
        onCancel={() => setIsModalOpen(false)}
        okText="Xác nhận đặt hàng"
        cancelText="Hủy"
        centered
        width={480}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: '#4caf50', marginBottom: "16px" }}>
            Hoàn tất đơn hàng!
          </h2>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>
              Số tiền cần thanh toán:
            </p>
            <p
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#f5222d",
                marginBottom: "16px",
              }}
            >
              {totalPrice.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                Số dư ví hiện tại:
              </p>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color:
                    balance >= totalPrice
                      ? "#52c41a"
                      : "#f5222d",
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
              </p>
            </div>
            {balance < totalPrice && (
              <div
                style={{
                  color: "#f5222d",
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền.
              </div>
            )}
          </div>
          <p style={{ color: "#666" }}>
            {balance >= totalPrice
              ? 'Nhấn "Xác nhận đặt hàng" để hoàn tất'
              : "Vui lòng nạp thêm tiền vào ví để tiếp tục"}
          </p>
        </div>
      </Modal>

      {/* Change Product Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <FilterOutlined style={{ color: '#1890ff', fontSize: '24px', marginRight: '8px' }} />
            <span>Thay đổi sản phẩm</span>
          </div>
        }
        open={isChangeProductModalOpen}
        onCancel={() => setIsChangeProductModalOpen(false)}
        footer={null}
        width={800}
      >
        <div>
          {selectedProductToChange && (
            <Alert
              message="Sản phẩm hiện tại"
              description={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src={selectedProductToChange.product.image?.imageUrl} 
                    alt={selectedProductToChange.product.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '12px', borderRadius: '4px' }}
                  />
                  <div>
                    <Text strong>{selectedProductToChange.product.name}</Text>
                    <div>
                      <Tag color="blue">{selectedProductToChange.detail.categoryName}</Tag>
                      <Text type="secondary" style={{ marginLeft: '8px' }}>
                        Số lượng: {selectedProductToChange.detail.quantity}
                      </Text>
                    </div>
                  </div>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}

          <Divider>
            <Text type="secondary">Chọn sản phẩm thay thế</Text>
          </Divider>

          {productsForCategory.length > 0 ? (
            <Row gutter={[16, 16]}>
              {productsForCategory.map(product => {
                // Kiểm tra xem đây có phải là sản phẩm đang được sử dụng không
                const isCurrentProduct = selectedProductToChange && 
                  selectedProductToChange.detail.productId === product.id;
                
                return (
                  <Col key={product.id} xs={24} sm={12} md={8}>
                    <Card
                      hoverable={!isCurrentProduct}
                      style={{ 
                        height: '100%', 
                        opacity: isCurrentProduct ? 0.7 : 1,
                        border: isCurrentProduct ? '2px solid #d9d9d9' : '1px solid #f0f0f0'
                      }}
                      onClick={() => {
                        if (!isCurrentProduct) {
                          handleChangeProduct(product);
                        }
                      }}
                      cover={
                        <div style={{ position: 'relative', height: '150px' }}>
                          <img
                            alt={product.name}
                            src={product.image?.imageUrl}
                            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                          />
                          {isCurrentProduct && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Badge.Ribbon text="Đang sử dụng" color="grey" />
                            </div>
                          )}
                        </div>
                      }
                    >
                      <Card.Meta
                        title={product.name}
                        description={
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                              <Text type="secondary">Kho: {product.stock}</Text>
                              <Text strong style={{ color: '#f50' }}>
                                {product.price.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                              </Text>
                            </div>
                            {!isCurrentProduct && (
                              <Button
                                type="primary"
                                size="small"
                                block
                                style={{ marginTop: '12px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChangeProduct(product);
                                }}
                                disabled={product.stock <= 0}
                              >
                                Chọn sản phẩm này
                              </Button>
                            )}
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Empty description="Không tìm thấy sản phẩm cùng loại" />
          )}
        </div>
      </Modal>
    </Layout>
  );
};

export default OrderService;
