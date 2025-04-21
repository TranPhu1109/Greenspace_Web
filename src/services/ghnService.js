const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN;

const fetchProvinces = async () => {
  try {
    const response = await fetch('https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Token': GHN_TOKEN
      }
    });

    const data = await response.json();
    if (data.code === 200) {
      return data.data
        .filter(province => province.ProvinceName.toLowerCase() === 'hồ chí minh')
        .map(province => ({
          value: province.ProvinceID,
          label: province.ProvinceName
        }));
    }
    throw new Error('Failed to fetch provinces');
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

const fetchDistricts = async (provinceId) => {
  try {
    const response = await fetch('https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': GHN_TOKEN
      },
      body: JSON.stringify({
        province_id: provinceId
      })
    });

    const data = await response.json();
    if (data.code === 200) {
      return data.data.map(district => ({
        value: district.DistrictID,
        label: district.DistrictName
      }));
    }
    throw new Error('Failed to fetch districts');
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

const fetchWards = async (districtId) => {
  try {
    const response = await fetch('https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': GHN_TOKEN
      },
      body: JSON.stringify({
        district_id: districtId
      })
    });

    const data = await response.json();
    if (data.code === 200) {
      return data.data.map(ward => ({
        value: ward.WardCode,
        label: ward.WardName
      }));
    }
    throw new Error('Failed to fetch wards');
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
};

export { fetchProvinces, fetchDistricts, fetchWards };