import React, { useEffect } from 'react';
import { Dropdown, Menu, Badge, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import useNotificationStore from '@/stores/useNotificationStore';
import './styles.scss';
import { getFormattedNotificationContent } from '@/utils/notificationUtils';

const Notifications = ({ onNotificationClick }) => {
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();

  useEffect(() => {
    // Fetch notifications when component mounts
    fetchNotifications();
    
    // Set up polling to fetch new notifications every 60 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleItemClick = (notification) => {
    // Mark notification as read when clicked
    markAsRead(notification.id);
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleViewAllClick = () => {
    // Mark all notifications as read
    markAllAsRead();
  };

  const menu = (
    <Menu className="notification-menu">
      <div className="notification-header">
        <span>Thông báo {unreadCount > 0 && `(${unreadCount})`}</span>
        {unreadCount > 0 && (
          <span className="mark-all-read" onClick={handleViewAllClick}>
            <CheckOutlined /> Đánh dấu tất cả đã đọc
          </span>
        )}
      </div>
      <Menu.Divider />
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Menu.Item key={notification.id} onClick={() => handleItemClick(notification)}>
              <div className={`notification-item ${!notification.isSeen ? 'unread' : ''}`}>
                <div className="notification-title">{notification.title || 'Thông báo'}</div>
                <div className="notification-content">{getFormattedNotificationContent(notification)}</div>
                {notification.createDate && (
                  <div className="notification-time">
                    {new Date(notification.createDate).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
            </Menu.Item>
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo"
            style={{ margin: '16px 0', fontSize: '12px' }}
          />
        )}
      </div>
      {notifications.length > 0 && (
        <>
          <Menu.Divider />
          <Menu.Item key="viewAll" onClick={handleViewAllClick}>
            <span className="view-all">Xem tất cả thông báo</span>
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      placement="bottomRight"
      overlayClassName="notification-dropdown"
    >
      <div className={`notification-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}>
        <Badge count={unreadCount} size="small" className="notification-badge">
          <BellOutlined className="header-icon" />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default Notifications; 