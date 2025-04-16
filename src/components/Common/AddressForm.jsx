import React, { useState, useEffect } from 'react';
import { Form, Input, Select, message, Checkbox, Alert, Space, Radio, Button, Spin, Card, Typography } from 'antd';
import { HomeOutlined, PlusOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/services/ghnService';
import useAddressStore from '../../stores/useAddressStore';
import useAuthStore from '../../stores/useAuthStore';
import AddAddressModal from './AddAddressModal';

const { Text } = Typography;

const AddressForm = ({ form, onAddressChange, useExistingAddress = true, initialAddress = null }) => {
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

  const { addresses, loading: loadingAddresses, fetchUserAddresses } = useAddressStore();
  const { user } = useAuthStore();

  // Fetch user's addresses from API
  useEffect(() => {
    if (useExistingAddress && user && user.id) {
      fetchUserAddresses(user.id);
    }
  }, [useExistingAddress, user, fetchUserAddresses]);

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
              setParsedAddress({
                streetAddress: addressParts[0],
                ward: addressParts[1],
                district: addressParts[2],
                province: addressParts[3]
              });
            }
          }
        }
      } catch (error) {
        console.error("Error reading user information:", error);
      }
    }
  }, [useExistingAddress]);

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

  const notifyAddressChange = () => {
    const province = provinces.find(
      (p) => p.value === form.getFieldValue("provinces")
    );
    const district = districts.find(
      (d) => d.value === form.getFieldValue("district")
    );
    const ward = wards.find((w) => w.value === form.getFieldValue("ward"));

    if (province && district && ward) {
      onAddressChange({
        province,
        district,
        ward,
        streetAddress: form.getFieldValue("streetAddress"),
        useDefaultAddress,
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
        
        // Notify with default address data
        onAddressChange({
          useDefaultAddress: true,
          province: { label: parsedAddress.province },
          district: { label: parsedAddress.district },
          ward: { label: parsedAddress.ward },
          streetAddress: parsedAddress.streetAddress,
          name: user?.name || '',
          phone: userPhone || ''
        });
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
            
            // Notify with selected address data
            onAddressChange({
              useDefaultAddress: false,
              province: { label: provinceName },
              district: { label: districtName },
              ward: { label: wardName },
              streetAddress: street,
              name: selectedAddress.name || '',
              phone: selectedAddress.phone || ''
            });
          }
        }
      }
    }
  };

  // Render the address form for manual input
  const renderAddressInputForm = () => {
    return (
      <>
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
          />
        </Form.Item>
      </>
    );
  };

  const handleAddressAdded = () => {
    // Refresh addresses list
    if (user && user.id) {
      fetchUserAddresses(user.id);
    }
  };
  
  const handleAddNewAddressClick = () => {
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

  // Render address selection options
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
              borderColor: selectedAddressId === 'default' ? '#1890ff' : undefined,
              backgroundColor: selectedAddressId === 'default' ? '#f0f8ff' : undefined
            }}
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
              <Text>{`${parsedAddress.streetAddress || ''}, ${parsedAddress.ward || ''}, ${parsedAddress.district || ''}, ${parsedAddress.province || ''}`}</Text>
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
                  borderColor: selectedAddressId === address.id ? '#1890ff' : undefined,
                  backgroundColor: selectedAddressId === address.id ? '#f0f8ff' : undefined
                }}
              >
                <Space direction="vertical" size={1} style={{ width: '100%' }}>
                  <Text strong>{address.name || 'Không có tên'}</Text>
                  <Space size={4}>
                    <PhoneOutlined />
                    <Text>{address.phone || 'Không có SĐT'}</Text>
                  </Space>
                  <Text>{formattedAddress}</Text>
                </Space>
              </Card>
            )
          });
        } catch (error) {
          console.error("Error processing address:", error);
        }
      });
    }
    
    return (
      <div style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', marginBottom: 8, justifyContent: 'space-between' }}>
          <Text strong>Chọn địa chỉ giao hàng:</Text>
          <Button 
            type="dashed"
            icon={<PlusOutlined />} 
            onClick={handleAddNewAddressClick}
            style={{ padding: '0 8px' }}
          >
            Thêm địa chỉ mới
          </Button>
        </Space>
        
        {loadingAddresses ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin />
            <div style={{ marginTop: 8 }}>Đang tải địa chỉ...</div>
          </div>
        ) : (
          <Radio.Group 
            style={{ width: '100%' }} 
            onChange={(e) => handleAddressSelection(e.target.value)}
            value={selectedAddressId || 'default'}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {addressOptions.map(option => (
                <Radio key={option.id} value={option.id} style={{ width: '100%', marginBottom: 8 }}>
                  {option.value}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        )}
      </div>
    );
  };

  return (
    <Form.Item noStyle shouldUpdate>
      {() => (
        <>
          {useExistingAddress ? (
            // Render address selection UI
            <>
              {renderAddressOptions()}
              
              {/* Only render manual input form if no addresses available */}
              {!userAddress && addresses.length === 0 && !loadingAddresses && renderAddressInputForm()}
              
              {/* Add address modal */}
              <AddAddressModal
                visible={addAddressModalVisible}
                onClose={() => setAddAddressModalVisible(false)}
                onAddressAdded={handleAddressAdded}
              />
            </>
          ) : (
            // Always render manual input form when useExistingAddress is false
            renderAddressInputForm()
          )}
        </>
      )}
    </Form.Item>
  );
};

export default AddressForm;