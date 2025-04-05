import React, { useState, useEffect } from 'react';
import { Form, Input, Select, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/services/ghnService';

const AddressForm = ({ form, onAddressChange }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

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
      });
    }
  };

  return (
    <Form.Item noStyle shouldUpdate>
      {() => (
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
      )}
    </Form.Item>
  );
};

export default AddressForm;