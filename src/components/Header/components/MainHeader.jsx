import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import reactLogo from '../../../assets/logo.png';
import './styles/MainHeader.scss';

function MainHeader() {
  const handleSearch = React.useCallback((value) => {
    // TODO: Implement search functionality
    console.log('Search:', value);
  }, []);

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
            <Input 
              placeholder="Tìm kiếm sản phẩm..." 
              size="large"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="large"
            className="search-button"
            onClick={() => handleSearch(document.querySelector('.search-container input').value)}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(MainHeader); 