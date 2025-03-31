import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, AutoComplete, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { searchProducts, searchDesigns } from '../../../services/searchService';
import { analyzeSearchQuery } from '../../../services/searchService';
import reactLogo from '../../../assets/logo.png';
import './styles/MainHeader.scss';

function MainHeader() {
  const navigate = useNavigate();
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearchInput = (value) => {
    setSearchValue(value);
    // Clear options when input changes
    setOptions([]);
  };

  const performSearch = React.useCallback(async () => {
    if (!searchValue.trim()) {
      return;
    }

    setLoading(true);
    try {
      // First analyze the search query
      const searchParams = await analyzeSearchQuery(searchValue);
      console.log('Search analysis:', searchParams);

      // Search both products and designs with analyzed parameters
      const [productsResponse, designsResponse] = await Promise.all([
        searchProducts(searchValue, searchParams),
        searchDesigns(searchValue, searchParams)
      ]);

      const searchResults = [];

      // Add products to results
      if (productsResponse?.length) {
        searchResults.push(...productsResponse.map(item => ({
          value: `product-${item.id}`,
          label: (
            <div className="search-result-item">
              <div className="item-image">
                <img src={item.image.imageUrl} alt={item.name} />
              </div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-category">{item.categoryName}</div>
                <div className="item-price">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(item.price)}
                </div>
                <div className="item-type">Sản phẩm</div>
              </div>
            </div>
          )
        })));
      }

      // Add designs to results
      if (designsResponse?.length) {
        searchResults.push(...designsResponse.map(item => ({
          value: `design-${item.id}`,
          label: (
            <div className="search-result-item">
              <div className="item-image">
                <img src={item.image.imageUrl} alt={item.name} />
              </div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-category">{item.categoryName}</div>
                <div className="item-price">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(item.price)}
                </div>
                <div className="item-type">Ý tưởng thiết kế</div>
              </div>
            </div>
          )
        })));
      }

      if (searchResults.length === 0) {
        message.info('Không tìm thấy kết quả phù hợp');
      }

      setOptions(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      message.error('Có lỗi xảy ra trong quá trình tìm kiếm');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [searchValue]);

  const handleSelect = React.useCallback((value) => {
    const [type, id] = value.split('-');
    navigate(type === 'product' ? `/products/${id}` : `/designs/${id}`);
  }, [navigate]);

  // Handle Enter key press
  const handleKeyPress = React.useCallback((e) => {
    if (e.key === 'Enter' && !loading) {
      performSearch();
    }
  }, [performSearch, loading]);

  return (
    <div className="header-main">
      <div className="container">
        {/* Logo */}
        <div>
          <Link to="/">
            <img src={reactLogo} alt="Logo" className="logo" />
          </Link>
        </div>

        {/* Search section */}
        <div className="search-section">
          <div className="search-container">
            <AutoComplete
              value={searchValue}
              options={options}
              onChange={handleSearchInput}
              onSelect={handleSelect}
              onKeyPress={handleKeyPress}
              loading={loading}
              placeholder="Tìm kiếm sản phẩm hoặc ý tưởng thiết kế..."
              size="large"
              className="search-autocomplete"
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="large"
            className="search-button"
            loading={loading}
            onClick={performSearch}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(MainHeader); 