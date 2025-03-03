import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileImageOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  TeamOutlined,
  MessageOutlined,
  CalendarOutlined,
  SettingOutlined
} from '@ant-design/icons';
import logo from '../../assets/logo.png';

const { Sider } = Layout;
const { SubMenu } = Menu;

const DesignerSidebar = ({ collapsed }) => {
  const location = useLocation();
  
  return (
    <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        {/* {!collapsed && <span className="logo-text">GreenSpace</span>} */}
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={collapsed ? [] : ['projects', 'designs']}
      >
        <Menu.Item key="/admin/dashboard" icon={<DashboardOutlined />}>
          <Link to="/admin/dashboard">Dashboard</Link>
        </Menu.Item>
        
        <SubMenu key="projects" icon={<ProjectOutlined />} title="Dự án">
          <Menu.Item key="/admin/projects/active">
            <Link to="/admin/projects/active">Dự án đang thực hiện</Link>
          </Menu.Item>
          <Menu.Item key="/admin/projects/completed">
            <Link to="/admin/projects/completed">Dự án đã hoàn thành</Link>
          </Menu.Item>
          <Menu.Item key="/admin/projects/new">
            <Link to="/admin/projects/new">Dự án mới</Link>
          </Menu.Item>
        </SubMenu>
        
        <SubMenu key="designs" icon={<FileImageOutlined />} title="Thiết kế">
          <Menu.Item key="/admin/designs/templates">
            <Link to="/admin/designs/templates">Mẫu thiết kế</Link>
          </Menu.Item>
          <Menu.Item key="/admin/designs/gallery">
            <Link to="/admin/designs/gallery">Thư viện</Link>
          </Menu.Item>
          <Menu.Item key="/admin/designs/tools">
            <Link to="/admin/designs/tools">Công cụ thiết kế</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="/admin/products" icon={<AppstoreOutlined />}>
          <Link to="/admin/products">Sản phẩm</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/clients" icon={<TeamOutlined />}>
          <Link to="/admin/clients">Khách hàng</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/messages" icon={<MessageOutlined />}>
          <Link to="/admin/messages">Tin nhắn</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/schedule" icon={<CalendarOutlined />}>
          <Link to="/admin/schedule">Lịch làm việc</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/settings" icon={<SettingOutlined />}>
          <Link to="/admin/settings">Cài đặt</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default DesignerSidebar; 