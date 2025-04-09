import React, { useState, useEffect } from 'react';
import { Form, Input, Select, message, Checkbox, Alert, Space } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/services/ghnService';

const AddressForm = ({ form, onAddressChange, useExistingAddress = false }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [parsedAddress, setParsedAddress] = useState(null);

  // Lấy thông tin địa chỉ từ user trong localStorage nếu có
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.address && user.address.trim() !== "") {
          setUserAddress(user.address);
          
          // Parse địa chỉ từ chuỗi "đường|phường/xã|quận/huyện|tỉnh/thành phố"
          const addressParts = user.address.split('|');
          if (addressParts.length === 4) {
            setParsedAddress({
              streetAddress: addressParts[0],
              ward: addressParts[1],
              district: addressParts[2],
              province: addressParts[3]
            });
          }
        }
      } catch (error) {
        console.error("Lỗi khi đọc thông tin người dùng:", error);
      }
    }
  }, []);

  useEffect(() => {
    const getProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (error) {
        message.error("Không thể tải danh sách tỉnh thành");
      } finally {
        setLoadingProvinces(false);
      }
    };
    getProvinces();
  }, []);

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

  // Xử lý khi người dùng chọn sử dụng địa chỉ mặc định
  const handleUseDefaultAddress = (e) => {
    const checked = e.target.checked;
    setUseDefaultAddress(checked);
    
    if (checked && parsedAddress) {
      console.log("User chose to use saved address:", parsedAddress);
      
      // Gọi notifyAddressChange ngay lập tức với thông tin địa chỉ mặc định
      // Cần đảm bảo đủ thông tin cho việc tính phí vận chuyển
      const addressData = {
        useDefaultAddress: true,
        province: { label: parsedAddress.province },
        district: { label: parsedAddress.district },
        ward: { label: parsedAddress.ward },
        streetAddress: parsedAddress.streetAddress
      };
      
      console.log("Sending address data:", addressData);
      onAddressChange(addressData);
      
      // Tìm province, district, ward dựa trên tên
      const foundProvince = provinces.find(p => p.label === parsedAddress.province);
      
      if (foundProvince) {
        form.setFieldValue("provinces", foundProvince.value);
        form.setFieldValue("streetAddress", parsedAddress.streetAddress);
        
        // Load districts theo province đã chọn và tiếp tục với district và ward
        const loadDistrictsAndWards = async () => {
          try {
            const districtData = await fetchDistricts(foundProvince.value);
            setDistricts(districtData);
            
            const foundDistrict = districtData.find(d => d.label === parsedAddress.district);
            if (foundDistrict) {
              form.setFieldValue("district", foundDistrict.value);
              
              const wardData = await fetchWards(foundDistrict.value);
              setWards(wardData);
              
              const foundWard = wardData.find(w => w.label === parsedAddress.ward);
              if (foundWard) {
                form.setFieldValue("ward", foundWard.value);
              }
            }
          } catch (error) {
            console.error("Lỗi khi tải dữ liệu địa chỉ:", error);
          }
        };
        
        loadDistrictsAndWards();
      }
    } else if (!checked) {
      // Nếu bỏ chọn, reset form và thông báo không sử dụng địa chỉ mặc định
      console.log("User unchecked use default address - resetting form");
      
      // Reset các trường địa chỉ về giá trị ban đầu
      form.setFieldsValue({
        provinces: undefined,
        district: undefined,
        ward: undefined,
        streetAddress: ""
      });
      
      // Reset danh sách districts và wards
      setDistricts([]);
      setWards([]);
      
      // Thông báo thay đổi với useDefaultAddress = false
      onAddressChange({
        useDefaultAddress: false,
        province: null,
        district: null,
        ward: null,
        streetAddress: ""
      });
    }
  };

  return (
    <Form.Item noStyle shouldUpdate>
      {() => (
        <>
          {userAddress && (
            <Form.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="Thông tin địa chỉ đã lưu"
                  description={parsedAddress ? `${parsedAddress.streetAddress}, ${parsedAddress.ward}, ${parsedAddress.district}, ${parsedAddress.province}` : userAddress}
                  type="info"
                  showIcon
                />
                
                <Checkbox 
                  onChange={handleUseDefaultAddress}
                  checked={useDefaultAddress}
                >
                  Sử dụng địa chỉ đã lưu
                </Checkbox>
              </Space>
            </Form.Item>
          )}

          {(!useDefaultAddress || !userAddress) && (
            <>
              <Form.Item
                name="provinces"
                label="Tỉnh/Thành phố"
                rules={[{ required: !useDefaultAddress, message: "Vui lòng chọn tỉnh/thành phố" }]}
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
                rules={[{ required: !useDefaultAddress, message: "Vui lòng chọn quận/huyện" }]}
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
                rules={[{ required: !useDefaultAddress, message: "Vui lòng chọn phường/xã" }]}
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
                rules={[{ required: !useDefaultAddress, message: "Vui lòng nhập số nhà, tên đường" }]}
              >
                <Input
                  prefix={<HomeOutlined className="site-form-item-icon" />}
                  placeholder="Ví dụ: 123 Đường Lê Lợi"
                  onChange={() => notifyAddressChange()}
                />
              </Form.Item>
            </>
          )}
        </>
      )}
    </Form.Item>
  );
};

export default AddressForm;