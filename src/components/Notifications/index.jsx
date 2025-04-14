import React from 'react';
import { Dropdown, Menu, Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import './styles.scss';


const Notifications = ({ count = 0, notifications = [], onNotificationClick, onViewAllClick }) => {

  const handleItemClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    // Optional: Add logic to navigate or mark as read here
  };

  const menu = (
    <Menu>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <Menu.Item key={notification.id || index} onClick={() => handleItemClick(notification)}>
            <div className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
              <div className="notification-title">{notification.title || 'Notification'}</div>
              <div className="notification-content">{notification.message}</div>
              {notification.timestamp && <div className="notification-time">{notification.timestamp}</div>}
            </div>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item key="no-notifications" disabled style={{ textAlign: 'center', cursor: 'default' }}>
          Không có thông báo mới
        </Menu.Item>
      )}
      {notifications.length > 0 && <Menu.Divider />}
      <Menu.Item key="viewAll" onClick={onViewAllClick} style={{ textAlign: 'center' }}>
        <span className="view-all">Xem tất cả</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      placement="bottomRight"
      overlayClassName="notification-dropdown" // Add class for specific styling
    >
      {/* Use a button or div for better accessibility and styling control */}
      <div className="notification-trigger">
        <Badge count={count} size="small" className="notification-badge">
          <BellOutlined className="header-icon" />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default Notifications; 