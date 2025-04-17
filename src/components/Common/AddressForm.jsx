import React, { useState, useEffect } from 'react';
import { Form, Input, Select, message, Checkbox, Alert, Space, Radio, Button, Spin, Card, Typography, Drawer, Badge, Empty, Modal } from 'antd';
import { HomeOutlined, PlusOutlined, PhoneOutlined, UserOutlined, EnvironmentOutlined, SwapOutlined, StarOutlined } from '@ant-design/icons';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/services/ghnService';
import useAddressStore from '../../stores/useAddressStore';
import useAuthStore from '../../stores/useAuthStore';
import AddAddressModal from './AddAddressModal';

const { Text } = Typography;
const MAX_ADDRESSES = 10; // Maximum number of addresses allowed

const AddressForm = ({ form, onAddressChange, useExistingAddress = true, initialAddress = null, showUserInfo = false }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [userAddress, setUserAddress] = useState(null);
  const [userPhone, setUserPhone] = useState(null);
  const [parsedAddress, setParsedAddress] = useState(null);
  const [initialAddressProcessed, setInitialAddressProcessed] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [settingAddressAsDefault, setSettingAddressAsDefault] = useState(false);
  const [showAddDefaultAddressModal, setShowAddDefaultAddressModal] = useState(false);
  const [defaultAddressForm] = Form.useForm();
  const [savingDefaultAddress, setSavingDefaultAddress] = useState(false);
  const [showDefaultAddressForm, setShowDefaultAddressForm] = useState(false);

  const { addresses, loading: loadingAddresses, fetchUserAddresses } = useAddressStore();
  const { user, updateUserAddress } = useAuthStore();

  // Fetch user's addresses from API
  useEffect(() => {
    if (useExistingAddress && user && user.id) {
      fetchUserAddresses(user.id);
    }
  }, [useExistingAddress, user, fetchUserAddresses]);

  // Theo dõi thay đổi của currentSelectedAddress để cập nhật thông tin
  useEffect(() => {
    if (currentSelectedAddress) {
      // Cập nhật thông tin địa chỉ ra bên ngoài component
      notifyFullAddressChange(currentSelectedAddress);
    }
  }, [currentSelectedAddress]);

  // Get default address from user in localStorage
  useEffect(() => {
    if (!useExistingAddress) return; // Skip if useExistingAddress is false

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData) {
          // Set user phone
          if (userData.phone) {
            setUserPhone(userData.phone);
          }

          // Set user address if available
          if (userData.address && userData.address.trim() !== "") {
            setUserAddress(userData.address);

            // Parse address from string "street|ward|district|province"
            const addressParts = userData.address.split('|');
            if (addressParts.length === 4) {
              const parsed = {
                streetAddress: addressParts[0],
                ward: addressParts[1],
                district: addressParts[2],
                province: addressParts[3]
              };
              setParsedAddress(parsed);

              // Khởi tạo địa chỉ hiện tại là địa chỉ mặc định
              setCurrentSelectedAddress({
                id: 'default',
                name: userData.name || '',
                phone: userData.phone || '',
                address: parsed,
                isDefault: true,
                fullAddress: userData.address
              });
            }
          }
        }
      } catch (error) {
        console.error("Error reading user information:", error);
      }
    }
  }, [useExistingAddress]);

  // Kiểm tra xem người dùng đã có địa chỉ mặc định hay chưa
  const hasDefaultAddress = () => {
    return userAddress && userAddress.trim() !== "";
  };

  useEffect(() => {
    const getProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await fetchProvinces();
        setProvinces(data);

        // After provinces are loaded, attempt to process initialAddress
        if (initialAddress && !initialAddressProcessed) {
          initializeFromAddress(initialAddress, data);
        }
      } catch (error) {
        message.error("Không thể tải danh sách tỉnh thành");
      } finally {
        setLoadingProvinces(false);
      }
    };
    getProvinces();
  }, [initialAddress, initialAddressProcessed]);

  // Update initialAddressProcessed state when initialAddress changes
  useEffect(() => {
    if (initialAddress) {
      setInitialAddressProcessed(false);
    }
  }, [initialAddress]);

  // Function to initialize address fields from an existing address string
  const initializeFromAddress = async (address, availableProvinces) => {
    try {
      if (!address || typeof address !== 'string') return;

      const parts = address.split('|');
      if (parts.length !== 4) return;

      const [street, wardName, districtName, provinceName] = parts;

      // Set street address immediately
      form.setFieldValue("streetAddress", street);

      // Find matching province
      const foundProvince = availableProvinces.find(p =>
        p.label.toLowerCase() === provinceName.toLowerCase());

      if (foundProvince) {
        // Set province selection
        form.setFieldValue("provinces", foundProvince.value);

        // Fetch districts for this province
        const districtData = await fetchDistricts(foundProvince.value);
        setDistricts(districtData);

        // Find matching district
        const foundDistrict = districtData.find(d =>
          d.label.toLowerCase() === districtName.toLowerCase());

        if (foundDistrict) {
          // Set district selection
          form.setFieldValue("district", foundDistrict.value);

          // Fetch wards for this district
          const wardData = await fetchWards(foundDistrict.value);
          setWards(wardData);

          // Find matching ward
          const foundWard = wardData.find(w =>
            w.label.toLowerCase() === wardName.toLowerCase());

          if (foundWard) {
            // Set ward selection
            form.setFieldValue("ward", foundWard.value);

            // Mark address as processed
            setInitialAddressProcessed(true);

            // Notify of address changes
            onAddressChange({
              province: foundProvince,
              district: foundDistrict,
              ward: foundWard,
              streetAddress: street,
              useDefaultAddress: false
            });
          }
        }
      }
    } catch (error) {
      console.error("Error initializing address fields:", error);
    }
  };

  const handleProvinceChange = async (provinceId) => {
    setDistricts([]);
    setWards([]);
    form.setFieldValue("district", undefined);
    form.setFieldValue("ward", undefined);
    if (!provinceId) return;

    setLoadingDistricts(true);
    try {
      const data = await fetchDistricts(provinceId);
      setDistricts(data);
    } catch (error) {
      message.error("Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtId) => {
    setWards([]);
    form.setFieldValue("ward", undefined);
    if (!districtId) return;

    setLoadingWards(true);
    try {
      const data = await fetchWards(districtId);
      setWards(data);
    } catch (error) {
      message.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingWards(false);
    }
  };

  // Hàm gửi thông tin đầy đủ về địa chỉ ra bên ngoài
  const notifyFullAddressChange = (addressData) => {
    if (!addressData || !addressData.address) return;

    const addr = addressData.address;
    const fullAddressStr = `${addr.streetAddress}|${addr.ward}|${addr.district}|${addr.province}`;

    // Chuẩn bị object data đầy đủ để truyền ra ngoài
    const fullAddressData = {
      // Thông tin người nhận
      recipientInfo: {
        name: addressData.name || user?.name || '',
        phone: addressData.phone || userPhone || '',
      },
      // Thông tin địa chỉ
      addressInfo: {
        province: addr.province,
        district: addr.district,
        ward: addr.ward,
        streetAddress: addr.streetAddress,
        fullAddress: fullAddressStr
      },
      // Thông tin giao hàng/vận chuyển (nếu có)
      shippingInfo: {
        addressId: addressData.id,
        isDefault: addressData.isDefault,
        saveAsDefault: saveAsDefault
      },
      // String đầy đủ để lưu trữ
      fullAddressString: fullAddressStr
    };

    // Gọi callback onAddressChange với dữ liệu đầy đủ
    onAddressChange({
      useDefaultAddress: addressData.isDefault,
      province: { label: addr.province },
      district: { label: addr.district },
      ward: { label: addr.ward },
      streetAddress: addr.streetAddress,
      name: addressData.name || '',
      phone: addressData.phone || '',
      saveAsDefault: saveAsDefault,
      fullAddressData: fullAddressData // Truyền toàn bộ dữ liệu
    });
  };

  const notifyAddressChange = () => {
    const province = provinces.find(
      (p) => p.value === form.getFieldValue("provinces")
    );
    const district = districts.find(
      (d) => d.value === form.getFieldValue("district")
    );
    const ward = wards.find((w) => w.value === form.getFieldValue("ward"));
    const streetAddress = form.getFieldValue("streetAddress");

    if (province && district && ward && streetAddress) {
      // Lấy thông tin người nhận từ form hoặc từ user
      const name = form.getFieldValue("userName") || user?.name || '';
      const phone = form.getFieldValue("userPhone") || userPhone || user?.phone || '';

      // Tạo string đầy đủ của địa chỉ
      const fullAddressStr = `${streetAddress}|${ward.label}|${district.label}|${province.label}`;

      // Tạo object đầy đủ thông tin địa chỉ
      const fullAddressData = {
        recipientInfo: {
          name: name,
          phone: phone,
        },
        addressInfo: {
          province: province.label,
          provinceId: province.value,
          district: district.label,
          districtId: district.value,
          ward: ward.label,
          wardId: ward.value,
          streetAddress: streetAddress,
          fullAddress: fullAddressStr
        },
        shippingInfo: {
          isDefault: useDefaultAddress,
          isFormOnly: true // Chỉ ra rằng đây là từ form nhập liệu, chưa lưu
        },
        fullAddressString: fullAddressStr
      };

      onAddressChange({
        province,
        district,
        ward,
        streetAddress,
        useDefaultAddress,
        name: name,
        phone: phone,
        fullAddressData: fullAddressData,
        isFormOnly: true // Chỉ ra rằng đây là từ form nhập liệu, chưa lưu
      });
    }
  };

  // Set default selected address
  useEffect(() => {
    // Default to user's default address if available
    if (userAddress && parsedAddress) {
      setSelectedAddressId('default');
    }
  }, [userAddress, parsedAddress]);

  // Handle selection of address option
  const handleAddressSelection = (addressId) => {
    if (!addressId) return;

    setSelectedAddressId(addressId);

    // If default address selected
    if (addressId === 'default' && parsedAddress) {
      setUseDefaultAddress(true);

      // Find province, district, ward based on name and populate fields
      const foundProvince = provinces.find(p => p?.label === parsedAddress.province);

      if (foundProvince) {
        form.setFieldValue("provinces", foundProvince.value);
        form.setFieldValue("streetAddress", parsedAddress.streetAddress);

        // Load districts for selected province and continue with district and ward
        const loadDistrictsAndWards = async () => {
          try {
            const districtData = await fetchDistricts(foundProvince.value);
            if (!districtData) return;

            setDistricts(districtData);

            const foundDistrict = districtData.find(d => d?.label === parsedAddress.district);
            if (foundDistrict) {
              form.setFieldValue("district", foundDistrict.value);

              const wardData = await fetchWards(foundDistrict.value);
              if (!wardData) return;

              setWards(wardData);

              const foundWard = wardData.find(w => w?.label === parsedAddress.ward);
              if (foundWard) {
                form.setFieldValue("ward", foundWard.value);
              }
            }
          } catch (error) {
            console.error("Error loading address data:", error);
          }
        };

        loadDistrictsAndWards();

        // Cập nhật địa chỉ hiện tại là địa chỉ mặc định
        setCurrentSelectedAddress({
          id: 'default',
          name: user?.name || '',
          phone: userPhone || '',
          address: parsedAddress,
          isDefault: true
        });

        // Notify with default address data
        onAddressChange({
          useDefaultAddress: true,
          province: { label: parsedAddress.province },
          district: { label: parsedAddress.district },
          ward: { label: parsedAddress.ward },
          streetAddress: parsedAddress.streetAddress,
          name: user?.name || '',
          phone: userPhone || '',
          isFormOnly: false // Đã lưu, có thể sử dụng
        });

        // Đóng drawer sau khi chọn địa chỉ mặc định
        setShowAddressDrawer(false);
      }
    }
    // If saved address selected
    else if (addressId !== 'new' && addresses && Array.isArray(addresses)) {
      setUseDefaultAddress(false);

      // Find selected address
      const selectedAddress = addresses.find(addr => addr?.id === addressId);
      if (selectedAddress && selectedAddress.userAddress) {
        // Parse address
        const parts = selectedAddress.userAddress.split('|');
        if (parts.length === 4) {
          const [street, wardName, districtName, provinceName] = parts;

          // Find province and populate form
          const foundProvince = provinces.find(p => p?.label === provinceName);
          if (foundProvince) {
            form.setFieldValue("provinces", foundProvince.value);
            form.setFieldValue("streetAddress", street);

            // Load districts and wards
            const loadDistrictsAndWards = async () => {
              try {
                const districtData = await fetchDistricts(foundProvince.value);
                if (!districtData) return;

                setDistricts(districtData);

                const foundDistrict = districtData.find(d => d?.label === districtName);
                if (foundDistrict) {
                  form.setFieldValue("district", foundDistrict.value);

                  const wardData = await fetchWards(foundDistrict.value);
                  if (!wardData) return;

                  setWards(wardData);

                  const foundWard = wardData.find(w => w?.label === wardName);
                  if (foundWard) {
                    form.setFieldValue("ward", foundWard.value);
                  }
                }
              } catch (error) {
                console.error("Error loading address data:", error);
              }
            };

            loadDistrictsAndWards();

            // Cập nhật địa chỉ hiện tại thành địa chỉ được chọn
            setCurrentSelectedAddress({
              id: selectedAddress.id,
              name: selectedAddress.name || '',
              phone: selectedAddress.phone || '',
              address: {
                streetAddress: street,
                ward: wardName,
                district: districtName,
                province: provinceName
              },
              isDefault: false
            });

            // Notify with selected address data
            onAddressChange({
              useDefaultAddress: false,
              province: { label: provinceName },
              district: { label: districtName },
              ward: { label: wardName },
              streetAddress: street,
              name: selectedAddress.name || '',
              phone: selectedAddress.phone || '',
              isFormOnly: false // Đã lưu, có thể sử dụng
            });
          }
        }
      }

      // Close the drawer after selection
      setShowAddressDrawer(false);
    }
  };

  // Xử lý đặt địa chỉ làm mặc định
  const handleSetAsDefault = async (addressId) => {
    if (!addressId || !addresses) return;

    // Tìm địa chỉ được chọn từ danh sách
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (!selectedAddress || !selectedAddress.userAddress) {
      message.error("Không thể tìm thấy địa chỉ đã chọn");
      return;
    }

    try {
      setSettingAddressAsDefault(true);

      // Cập nhật địa chỉ mặc định trong tài khoản người dùng
      await updateUserAddress(selectedAddress.userAddress);

      // Cập nhật dữ liệu trên localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.address = selectedAddress.userAddress;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Cập nhật state
      setUserAddress(selectedAddress.userAddress);

      // Parse address
      const parts = selectedAddress.userAddress.split('|');
      if (parts.length === 4) {
        const parsed = {
          streetAddress: parts[0],
          ward: parts[1],
          district: parts[2],
          province: parts[3]
        };
        setParsedAddress(parsed);

        // Cập nhật currentSelectedAddress
        setCurrentSelectedAddress({
          id: 'default',
          name: selectedAddress.name || user?.name || '',
          phone: selectedAddress.phone || userPhone || '',
          address: parsed,
          isDefault: true,
          fullAddress: selectedAddress.userAddress
        });
      }

      message.success("Đã đặt địa chỉ làm mặc định");

      // Đóng drawer
      setShowAddressDrawer(false);
    } catch (error) {
      console.error("Lỗi khi đặt địa chỉ mặc định:", error);
      message.error("Không thể đặt địa chỉ làm mặc định. Vui lòng thử lại sau.");
    } finally {
      setSettingAddressAsDefault(false);
    }
  };

  // Render the address form for manual input
  const renderAddressInputForm = (overrideShowUserInfo = null) => {
    // Xác định liệu có hiển thị thông tin người dùng không
    const _showUserInfo = overrideShowUserInfo !== null ? overrideShowUserInfo : showUserInfo;

    // Lấy thông tin tên và số điện thoại từ user store hoặc localStorage
    const userName = user?.name || '';
    const userPhoneNumber = userPhone || user?.phone || '';

    return (
      <>
        {/* Chỉ hiển thị thông tin người dùng ở dạng disabled khi _showUserInfo = true */}
        {_showUserInfo && (
          <>
            <Form.Item
              name="userName"
              label="Họ tên người nhận"
              initialValue={userName}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                disabled
                className="disabled-input"
              />
            </Form.Item>

            <Form.Item
              name="userPhone"
              label="Số điện thoại"
              initialValue={userPhoneNumber}
            >
              <Input
                prefix={<PhoneOutlined className="site-form-item-icon" />}
                disabled
                className="disabled-input"
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="provinces"
          label="Tỉnh/Thành phố"
          rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
        >
          <Select
            showSearch
            loading={loadingProvinces}
            placeholder="Chọn tỉnh/thành phố"
            optionFilterProp="label"
            options={provinces}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              handleProvinceChange(value);
              notifyAddressChange();
            }}
          />
        </Form.Item>

        <Form.Item
          name="district"
          label="Quận/Huyện"
          rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
        >
          <Select
            showSearch
            loading={loadingDistricts}
            placeholder="Chọn quận/huyện"
            optionFilterProp="label"
            options={districts}
            disabled={!form.getFieldValue("provinces")}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              handleDistrictChange(value);
              notifyAddressChange();
            }}
          />
        </Form.Item>

        <Form.Item
          name="ward"
          label="Phường/Xã"
          rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
        >
          <Select
            showSearch
            loading={loadingWards}
            placeholder="Chọn phường/xã"
            optionFilterProp="label"
            options={wards}
            disabled={!form.getFieldValue("district")}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              notifyAddressChange();
            }}
          />
        </Form.Item>

        <Form.Item
          name="streetAddress"
          label="Số nhà, tên đường"
          rules={[{ required: true, message: "Vui lòng nhập số nhà, tên đường" }]}
        >
          <Input
            prefix={<HomeOutlined className="site-form-item-icon" />}
            placeholder="Ví dụ: 123 Đường Lê Lợi"
            onChange={() => notifyAddressChange()}
            onBlur={() => notifyAddressChange()}
          />
        </Form.Item>
      </>
    );
  };

  // Xử lý sau khi thêm địa chỉ mới thành công
  const handleAddressAdded = async (newAddress) => {
    console.log("=== handleAddressAdded được gọi ===");
    console.log("Địa chỉ mới:", newAddress);

    try {
      // Đóng modal trước tiên
      setAddAddressModalVisible(false);

      // Đóng drawer nếu đang mở
      setShowAddressDrawer(false);

      // Thông báo thành công
      message.success("Đã thêm địa chỉ mới thành công");

      // Tạo đối tượng địa chỉ mới để thêm vào danh sách
      let addressToAdd = { ...newAddress };

      // Đảm bảo địa chỉ có ID
      if (!addressToAdd.id) {
        addressToAdd.id = `temp_${Date.now()}`;
      }

      // Thêm vào danh sách địa chỉ hiện tại
      if (addresses && Array.isArray(addresses)) {
        // Kiểm tra xem địa chỉ đã tồn tại chưa
        const addressExists = addresses.some(addr => addr.id === addressToAdd.id);
        if (!addressExists) {
          console.log("Thêm địa chỉ mới vào danh sách local:", addressToAdd);
          // Thực hiện một bản sao để tránh thay đổi state trực tiếp
          const updatedAddresses = [...addresses, addressToAdd];
          // Cập nhật state addresses
          useAddressStore.setState({ addresses: updatedAddresses });
        }
      } else {
        // Nếu addresses không phải array, khởi tạo với chỉ đối tượng mới
        console.log("Khởi tạo danh sách địa chỉ với địa chỉ mới:", addressToAdd);
        useAddressStore.setState({ addresses: [addressToAdd] });
      }

      // Đợi một chút trước khi fetch lại danh sách địa chỉ từ server
      if (user && user.id) {
        console.log("Chọn địa chỉ mới ngay lập tức...");
        try {
          handleAddressSelection(addressToAdd.id);
        } catch (error) {
          console.error("Lỗi khi chọn địa chỉ mới:", error);
        }

        // Tải lại danh sách địa chỉ sau 1 giây
        setTimeout(async () => {
          try {
            console.log("Tải lại danh sách địa chỉ từ server...");
            await fetchUserAddresses(user.id);
          } catch (error) {
            console.error("Lỗi khi tải lại danh sách địa chỉ:", error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Lỗi trong handleAddressAdded:", error);
    }

    console.log("=== Kết thúc handleAddressAdded ===");
  };

  const handleAddNewAddressClick = () => {
    // Check if maximum number of addresses reached
    if (addresses && addresses.length >= MAX_ADDRESSES) {
      message.warning(`Bạn đã đạt giới hạn ${MAX_ADDRESSES} địa chỉ. Vui lòng xóa địa chỉ cũ trước khi thêm địa chỉ mới.`);
      return;
    }

    // Reset form fields in case there are any lingering values
    form.setFieldsValue({
      provinces: undefined,
      district: undefined,
      ward: undefined,
      streetAddress: ""
    });

    // Reset districts and wards
    setDistricts([]);
    setWards([]);

    // Open add address modal
    setAddAddressModalVisible(true);
  };

  // Hiển thị địa chỉ được chọn hiện tại (có thể là mặc định hoặc địa chỉ khác)
  const getSelectedAddressCard = () => {
    if (!currentSelectedAddress) {
      // Nếu không có địa chỉ nào được chọn, hiển thị trạng thái trống
      return (
        <Empty
          description="Không có địa chỉ được chọn"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    const addressObj = currentSelectedAddress.address;

    return (
      <Card
        size="small"
        style={{
          borderColor: '#1890ff',
          backgroundColor: '#f0f8ff'
        }}
      >
        <Space direction="vertical" size={1} style={{ width: '100%' }}>
          <Space size={4} align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Text strong>{currentSelectedAddress.name || 'Không có tên'}</Text>
              {currentSelectedAddress.isDefault && <Text type="success">(Mặc định)</Text>}
            </Space>
            <Space>
              {/* Hiển thị nút thêm địa chỉ mặc định nếu chưa có địa chỉ mặc định */}
              {!currentSelectedAddress.isDefault && !hasDefaultAddress() && (
                <Button
                  type="default"
                  size="small"
                  onClick={() => setShowDefaultAddressForm(true)}
                  icon={<StarOutlined />}
                >
                  Thêm địa chỉ mặc định
                </Button>
              )}
              {/* Hiển thị nút cập nhật địa chỉ mặc định nếu đây là địa chỉ mặc định */}
              {currentSelectedAddress.isDefault && (
                <Button
                  type="default"
                  size="small"
                  onClick={() => setShowAddDefaultAddressModal(true)}
                  icon={<StarOutlined />}
                >
                  Cập nhật địa chỉ mặc định
                </Button>
              )}
              <Button
                type="primary"
                icon={<SwapOutlined />}
                size="small"
                onClick={() => setShowAddressDrawer(true)}
              >
                Đổi địa chỉ
              </Button>
            </Space>
          </Space>
          <Space size={4}>
            <PhoneOutlined />
            <Text>{currentSelectedAddress.phone || 'Chưa cung cấp số điện thoại'}</Text>
          </Space>
          <Space size={4} align="start">
            <EnvironmentOutlined style={{ marginTop: 4 }} />
            <Text>{`${addressObj.streetAddress || ''}, ${addressObj.ward || ''}, ${addressObj.district || ''}, ${addressObj.province || ''}`}</Text>
          </Space>
        </Space>
      </Card>
    );
  };

  // Render address selection options inside drawer
  const renderAddressOptions = () => {
    const addressOptions = [];

    // Add default address if available
    if (userAddress && parsedAddress) {
      addressOptions.push({
        id: 'default',
        value: (
          <Card
            size="small"
            style={{
              marginBottom: 8,
              borderColor: selectedAddressId === 'default' ? '#4caf50' : undefined,
              backgroundColor: selectedAddressId === 'default' ? 'rgba(34, 197, 94, 0.1)' : undefined
            }}
            onClick={() => handleAddressSelection('default')}
            hoverable
          >
            <Space direction="vertical" size={1} style={{ width: '100%' }}>
              <Space size={4}>
                <Text strong>{user?.name || 'Địa chỉ mặc định'}</Text>
                <Text type="success">(Mặc định)</Text>
              </Space>
              <Space size={4}>
                <PhoneOutlined />
                <Text>{userPhone || 'Chưa cung cấp số điện thoại'}</Text>
              </Space>
              <Space size={4} align="start">
                <EnvironmentOutlined style={{ marginTop: 4 }} />
                <Text>{`${parsedAddress.streetAddress || ''}, ${parsedAddress.ward || ''}, ${parsedAddress.district || ''}, ${parsedAddress.province || ''}`}</Text>
              </Space>
            </Space>
          </Card>
        )
      });
    }

    // Add saved addresses
    if (addresses && Array.isArray(addresses)) {
      addresses.forEach(address => {
        if (!address || !address.userAddress) return;

        try {
          const addressParts = address.userAddress.split('|');
          let formattedAddress = address.userAddress;

          if (addressParts.length === 4) {
            formattedAddress = `${addressParts[0]}, ${addressParts[1]}, ${addressParts[2]}, ${addressParts[3]}`;
          }

          addressOptions.push({
            id: address.id,
            value: (
              <Card
                size="small"
                style={{
                  marginBottom: 8,
                  borderColor: selectedAddressId === address.id ? '#4caf50' : undefined,
                  backgroundColor: selectedAddressId === address.id ? 'rgba(34, 197, 94, 0.1)' : undefined
                }}
                onClick={() => handleAddressSelection(address.id)}
                hoverable
              >
                <Space direction="vertical" size={1} style={{ width: '100%' }}>
                  <Text strong>{address.name || 'Không có tên'}</Text>
                  <Space size={4}>
                    <PhoneOutlined />
                    <Text>{address.phone || 'Không có SĐT'}</Text>
                  </Space>
                  <Space size={4} align="start">
                    <EnvironmentOutlined style={{ marginTop: 4 }} />
                    <Text>{formattedAddress}</Text>
                  </Space>
                </Space>
              </Card>
            )
          });
        } catch (error) {
          console.error("Error processing address:", error);
        }
      });
    }

    return addressOptions;
  };

  // Xử lý lưu địa chỉ mặc định từ form nhập liệu
  const handleSaveDefaultAddress = async () => {
    try {
      // Validate form để đảm bảo đã chọn đủ thông tin địa chỉ
      await form.validateFields(['provinces', 'district', 'ward', 'streetAddress']);

      // Lấy dữ liệu từ form
      const province = provinces.find(p => p.value === form.getFieldValue('provinces'));
      const district = districts.find(d => d.value === form.getFieldValue('district'));
      const ward = wards.find(w => w.value === form.getFieldValue('ward'));
      const streetAddress = form.getFieldValue('streetAddress');

      if (!province || !district || !ward || !streetAddress) {
        message.error('Vui lòng nhập đầy đủ thông tin địa chỉ');
        return;
      }

      // Tạo chuỗi địa chỉ đầy đủ
      const fullAddressStr = `${streetAddress}|${ward.label}|${district.label}|${province.label}`;

      setSavingDefaultAddress(true);

      // Cập nhật địa chỉ mặc định vào tài khoản
      await updateUserAddress(fullAddressStr);

      // Cập nhật vào localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.address = fullAddressStr;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Cập nhật state
      setUserAddress(fullAddressStr);

      // Parse address
      const parsed = {
        streetAddress,
        ward: ward.label,
        district: district.label,
        province: province.label
      };
      setParsedAddress(parsed);

      // Cập nhật currentSelectedAddress
      setCurrentSelectedAddress({
        id: 'default',
        name: user?.name || '',
        phone: userPhone || user?.phone || '',
        address: parsed,
        isDefault: true,
        fullAddress: fullAddressStr
      });

      // Thông báo cho component cha biết rằng địa chỉ đã được lưu và có thể sử dụng
      onAddressChange({
        useDefaultAddress: true,
        province: { label: province.label },
        district: { label: district.label },
        ward: { label: ward.label },
        streetAddress: streetAddress,
        name: user?.name || '',
        phone: userPhone || user?.phone || '',
        isFormOnly: false // Đã lưu, có thể sử dụng
      });

      message.success('Đã lưu địa chỉ mặc định thành công');
    } catch (error) {
      console.error('Lỗi khi lưu địa chỉ mặc định:', error);
      message.error('Không thể lưu địa chỉ mặc định. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSavingDefaultAddress(false);
    }
  };

  // Modal thay đổi địa chỉ mặc định
  <Modal
    title="Cập nhật địa chỉ mặc định"
    open={showAddDefaultAddressModal}
    onCancel={() => setShowAddDefaultAddressModal(false)}
    footer={null}
  >
    <Form
      form={defaultAddressForm}
      layout="vertical"
      onFinish={async (values) => {
        try {
          if (!values.provinces || !values.district || !values.ward || !values.streetAddress) {
            message.error('Vui lòng nhập đầy đủ thông tin địa chỉ');
            return;
          }

          setSavingDefaultAddress(true);

          // Tạo chuỗi địa chỉ đầy đủ
          const province = provinces.find(p => p.value === values.provinces);
          const district = districts.find(d => d.value === values.district);
          const ward = wards.find(w => w.value === values.ward);

          if (!province || !district || !ward) {
            message.error('Thông tin địa chỉ không hợp lệ');
            return;
          }

          const fullAddressStr = `${values.streetAddress}|${ward.label}|${district.label}|${province.label}`;

          // Cập nhật địa chỉ mặc định vào tài khoản
          await updateUserAddress(fullAddressStr);

          // Cập nhật vào localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            userData.address = fullAddressStr;
            localStorage.setItem('user', JSON.stringify(userData));
          }

          // Cập nhật state
          setUserAddress(fullAddressStr);

          // Parse address
          const parsed = {
            streetAddress: values.streetAddress,
            ward: ward.label,
            district: district.label,
            province: province.label
          };
          setParsedAddress(parsed);

          // Cập nhật currentSelectedAddress
          setCurrentSelectedAddress({
            id: 'default',
            name: user?.name || '',
            phone: userPhone || user?.phone || '',
            address: parsed,
            isDefault: true,
            fullAddress: fullAddressStr
          });

          message.success('Đã thay đổi địa chỉ mặc định thành công');
          setShowAddDefaultAddressModal(false);
        } catch (error) {
          console.error('Lỗi khi thay đổi địa chỉ mặc định:', error);
          message.error('Không thể thay đổi địa chỉ mặc định');
        } finally {
          setSavingDefaultAddress(false);
        }
      }}
    >
      <Alert
        message="Lưu ý"
        description={
          <>
            <p>Địa chỉ mặc định sẽ sử dụng thông tin tên và số điện thoại từ tài khoản của bạn.</p>
            <p style={{ color: '#ff4d4f', marginTop: 8 }}>Hệ thống hiện chỉ phục vụ khu vực thành phố Hồ Chí Minh.</p>
          </>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        name="provinces"
        label="Tỉnh/Thành phố"
        rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
      >
        <Select
          showSearch
          loading={loadingProvinces}
          placeholder="Chọn tỉnh/thành phố"
          optionFilterProp="label"
          options={provinces}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          onChange={(value) => {
            handleProvinceChange(value);
          }}
        />
      </Form.Item>

      <Form.Item
        name="district"
        label="Quận/Huyện"
        rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
      >
        <Select
          showSearch
          loading={loadingDistricts}
          placeholder="Chọn quận/huyện"
          optionFilterProp="label"
          options={districts}
          disabled={!defaultAddressForm.getFieldValue("provinces")}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          onChange={(value) => {
            handleDistrictChange(value);
          }}
        />
      </Form.Item>

      <Form.Item
        name="ward"
        label="Phường/Xã"
        rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
      >
        <Select
          showSearch
          loading={loadingWards}
          placeholder="Chọn phường/xã"
          optionFilterProp="label"
          options={wards}
          disabled={!defaultAddressForm.getFieldValue("district")}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item
        name="streetAddress"
        label="Số nhà, tên đường"
        rules={[{ required: true, message: "Vui lòng nhập số nhà, tên đường" }]}
      >
        <Input
          prefix={<HomeOutlined className="site-form-item-icon" />}
          placeholder="Ví dụ: 123 Đường Lê Lợi"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={savingDefaultAddress}
          block
        >
          Lưu địa chỉ mặc định
        </Button>
      </Form.Item>
    </Form>
  </Modal>

  return (
    <Form.Item noStyle shouldUpdate>
      {() => (
        <>
          {useExistingAddress ? (
            // Kiểm tra nếu có địa chỉ đã chọn hoặc địa chỉ mặc định
            (currentSelectedAddress || userAddress) && !showDefaultAddressForm ? (
              // Hiển thị địa chỉ đã chọn
              <>
                <div className="default-address-section">
                  {getSelectedAddressCard()}
                </div>

                {/* Address selection drawer */}
                <Drawer
                  title={
                    <Space size="middle">
                      <Text strong>Chọn địa chỉ giao hàng</Text>
                      {/* <Badge
                        count={addresses?.length || 0}
                        style={{ backgroundColor: '#52c41a' }}
                        showZero
                        overflowCount={MAX_ADDRESSES}
                        title={`${addresses?.length || 0}/${MAX_ADDRESSES} địa chỉ`}
                      /> */}
                    </Space>
                  }
                  placement="right"
                  onClose={() => setShowAddressDrawer(false)}
                  open={showAddressDrawer}
                  width={350}
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddNewAddressClick}
                      disabled={addresses?.length >= MAX_ADDRESSES}
                    >
                      Thêm địa chỉ
                    </Button>
                  }
                >
                  {loadingAddresses ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Spin />
                      <div style={{ marginTop: 8 }}>Đang tải địa chỉ...</div>
                    </div>
                  ) : (
                    <div className="address-options-container">
                      {renderAddressOptions().map(option => (
                        <div key={option.id}>{option.value}</div>
                      ))}

                      {renderAddressOptions().length === 0 && (
                        <Empty description="Bạn chưa có địa chỉ nào" />
                      )}
                    </div>
                  )}
                </Drawer>

                {/* Add address modal - chỉ để thêm địa chỉ tùy chọn */}
                <AddAddressModal
                  visible={addAddressModalVisible}
                  onClose={() => setAddAddressModalVisible(false)}
                  onAddressAdded={handleAddressAdded}
                />

                {/* Modal thay đổi địa chỉ mặc định */}
                <Modal
                  title="Cập nhật địa chỉ mặc định"
                  open={showAddDefaultAddressModal}
                  onCancel={() => setShowAddDefaultAddressModal(false)}
                  footer={null}
                >
                  <Form
                    form={defaultAddressForm}
                    layout="vertical"
                    onFinish={async (values) => {
                      try {
                        if (!values.provinces || !values.district || !values.ward || !values.streetAddress) {
                          message.error('Vui lòng nhập đầy đủ thông tin địa chỉ');
                          return;
                        }

                        setSavingDefaultAddress(true);

                        // Tạo chuỗi địa chỉ đầy đủ
                        const province = provinces.find(p => p.value === values.provinces);
                        const district = districts.find(d => d.value === values.district);
                        const ward = wards.find(w => w.value === values.ward);

                        if (!province || !district || !ward) {
                          message.error('Thông tin địa chỉ không hợp lệ');
                          return;
                        }

                        const fullAddressStr = `${values.streetAddress}|${ward.label}|${district.label}|${province.label}`;

                        // Cập nhật địa chỉ mặc định vào tài khoản
                        await updateUserAddress(fullAddressStr);

                        // Cập nhật vào localStorage
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                          const userData = JSON.parse(userStr);
                          userData.address = fullAddressStr;
                          localStorage.setItem('user', JSON.stringify(userData));
                        }

                        // Cập nhật state
                        setUserAddress(fullAddressStr);

                        // Parse address
                        const parsed = {
                          streetAddress: values.streetAddress,
                          ward: ward.label,
                          district: district.label,
                          province: province.label
                        };
                        setParsedAddress(parsed);

                        // Cập nhật currentSelectedAddress
                        setCurrentSelectedAddress({
                          id: 'default',
                          name: user?.name || '',
                          phone: userPhone || user?.phone || '',
                          address: parsed,
                          isDefault: true,
                          fullAddress: fullAddressStr
                        });

                        message.success('Đã thay đổi địa chỉ mặc định thành công');
                        setShowAddDefaultAddressModal(false);
                      } catch (error) {
                        console.error('Lỗi khi thay đổi địa chỉ mặc định:', error);
                        message.error('Không thể thay đổi địa chỉ mặc định');
                      } finally {
                        setSavingDefaultAddress(false);
                      }
                    }}
                  >
                    <Alert
                      message="Lưu ý"
                      description={
                        <>
                          <p>Địa chỉ mặc định sẽ sử dụng thông tin tên và số điện thoại từ tài khoản của bạn.</p>
                          <p style={{ color: '#ff4d4f', marginTop: 8 }}>Hệ thống hiện chỉ phục vụ khu vực thành phố Hồ Chí Minh.</p>
                        </>
                      }
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />

                    <Form.Item
                      name="provinces"
                      label="Tỉnh/Thành phố"
                      rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
                    >
                      <Select
                        showSearch
                        loading={loadingProvinces}
                        placeholder="Chọn tỉnh/thành phố"
                        optionFilterProp="label"
                        options={provinces}
                        filterOption={(input, option) =>
                          option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value) => {
                          handleProvinceChange(value);
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="district"
                      label="Quận/Huyện"
                      rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
                    >
                      <Select
                        showSearch
                        loading={loadingDistricts}
                        placeholder="Chọn quận/huyện"
                        optionFilterProp="label"
                        options={districts}
                        disabled={!defaultAddressForm.getFieldValue("provinces")}
                        filterOption={(input, option) =>
                          option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value) => {
                          handleDistrictChange(value);
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="ward"
                      label="Phường/Xã"
                      rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
                    >
                      <Select
                        showSearch
                        loading={loadingWards}
                        placeholder="Chọn phường/xã"
                        optionFilterProp="label"
                        options={wards}
                        disabled={!defaultAddressForm.getFieldValue("district")}
                        filterOption={(input, option) =>
                          option.label.toLowerCase().includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      name="streetAddress"
                      label="Số nhà, tên đường"
                      rules={[{ required: true, message: "Vui lòng nhập số nhà, tên đường" }]}
                    >
                      <Input
                        prefix={<HomeOutlined className="site-form-item-icon" />}
                        placeholder="Ví dụ: 123 Đường Lê Lợi"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={savingDefaultAddress}
                        block
                      >
                        Lưu địa chỉ mặc định
                      </Button>
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            ) : (
              // Nếu chưa có địa chỉ nào hoặc hiển thị form nhập địa chỉ mặc định
              <div>
                <Alert
                  message="Nhập địa chỉ mặc định"
                  description={
                    addresses && addresses.length > 0
                      ? "Bạn có thể nhập địa chỉ mặc định hoặc chọn từ địa chỉ đã lưu để giao hàng."
                      : "Vui lòng nhập địa chỉ mặc định bên dưới hoặc thêm địa chỉ tùy chọn."
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  action={
                    <Space>
                      {/* Nếu đã có địa chỉ option và đang hiển thị form địa chỉ mặc định, hiển thị nút quay lại */}
                      {showDefaultAddressForm && currentSelectedAddress && !currentSelectedAddress.isDefault && (
                        <Button
                          type="default"
                          size="small"
                          onClick={() => setShowDefaultAddressForm(false)}
                        >
                          Quay lại
                        </Button>
                      )}
                      {/* Nếu đã có địa chỉ option, hiển thị nút chọn địa chỉ */}
                      {addresses && addresses.length > 0 && !showDefaultAddressForm && (
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => setShowAddressDrawer(true)}
                          icon={<SwapOutlined />}
                        >
                          Chọn địa chỉ đã lưu
                        </Button>
                      )}
                      <Button
                        type={addresses && addresses.length > 0 ? "default" : "primary"}
                        size="small"
                        onClick={() => setAddAddressModalVisible(true)}
                        icon={<PlusOutlined />}
                      >
                        Thêm địa chỉ tùy chọn
                      </Button>
                    </Space>
                  }
                />

                {/* Form nhập địa chỉ mặc định */}
                <Card
                  size="small"
                  title={<Text strong>Địa chỉ mặc định (sử dụng thông tin tài khoản)</Text>}
                  style={{ marginBottom: 16 }}
                >
                  {renderAddressInputForm(true)}

                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={() => handleSaveDefaultAddress()}
                      loading={savingDefaultAddress}
                    >
                      Lưu địa chỉ mặc định
                    </Button>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Địa chỉ này sẽ được lưu vào tài khoản của bạn
                    </Text>
                  </Form.Item>
                </Card>

                {/* Address selection drawer */}
                <Drawer
                  title={
                    <Space size="middle">
                      <Text strong>Chọn địa chỉ giao hàng</Text>
                      <Badge
                        count={addresses?.length || 0}
                        style={{ backgroundColor: '#52c41a' }}
                        showZero
                        overflowCount={MAX_ADDRESSES}
                        title={`${addresses?.length || 0}/${MAX_ADDRESSES} địa chỉ`}
                      />
                    </Space>
                  }
                  placement="right"
                  onClose={() => setShowAddressDrawer(false)}
                  open={showAddressDrawer}
                  width={350}
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddNewAddressClick}
                      disabled={addresses?.length >= MAX_ADDRESSES}
                    >
                      Thêm địa chỉ
                    </Button>
                  }
                >
                  {loadingAddresses ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Spin />
                      <div style={{ marginTop: 8 }}>Đang tải địa chỉ...</div>
                    </div>
                  ) : (
                    <div className="address-options-container">
                      {renderAddressOptions().map(option => (
                        <div key={option.id}>{option.value}</div>
                      ))}

                      {renderAddressOptions().length === 0 && (
                        <Empty description="Bạn chưa có địa chỉ nào" />
                      )}
                    </div>
                  )}
                </Drawer>

                {/* Add address modal - chỉ để thêm địa chỉ tùy chọn */}
                <AddAddressModal
                  visible={addAddressModalVisible}
                  onClose={() => setAddAddressModalVisible(false)}
                  onAddressAdded={handleAddressAdded}
                />
              </div>
            )
          ) : (
            // Always render manual input form when useExistingAddress is false
            // Không hiển thị thông tin người dùng trong modal
            renderAddressInputForm(false)
          )}
        </>
      )}
    </Form.Item>
  );
};

export default AddressForm;