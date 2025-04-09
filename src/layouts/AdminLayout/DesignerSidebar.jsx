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
  
  // Xác định selectedKey dựa trên pathname
  const getSelectedKey = () => {
    const path = location.pathname;
    
    // Nếu đang ở trang task detail, vẫn chọn menu "Công việc"
    if (path.startsWith('/designer/tasks/')) {
      return '/designer/tasks';
    }
    
    return path;
  };
  
  return (
    <Sider trigger={null} collapsible collapsed={collapsed} width={250} theme='light'>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        {/* {!collapsed && <span className="logo-text">GreenSpace</span>} */}
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        defaultOpenKeys={collapsed ? [] : ['submenu-projects', 'submenu-designs']}
      >
        <Menu.Item key="/designer/dashboard" icon={<DashboardOutlined />}>
          <Link to="/designer/dashboard">Dashboard</Link>
        </Menu.Item>
        
        <SubMenu key="submenu-projects" icon={<ProjectOutlined />} title="Dự án">
          <Menu.Item key="/designer/tasks">
            <Link to="/designer/tasks">Công việc</Link>
          </Menu.Item>
          {/* <Menu.Item key="/designer/projects/active">
            <Link to="/designer/projects/active">Dự án đang thực hiện</Link>
          </Menu.Item>
          <Menu.Item key="/designer/projects/completed">
            <Link to="/designer/projects/completed">Dự án đã hoàn thành</Link>
          </Menu.Item>
          <Menu.Item key="/designer/projects/new">
            <Link to="/designer/projects/new">Dự án mới</Link>
          </Menu.Item> */}
        </SubMenu>
        
        <SubMenu key="submenu-designs" icon={<FileImageOutlined />} title="Thiết kế">
          <Menu.Item key="/designer/designs/templates">
            <Link to="/designer/designs/templates">Mẫu thiết kế</Link>
          </Menu.Item>
          <Menu.Item key="/designer/designs/categories">
            <Link to="/designer/designs/categories">Danh mục thiết kế</Link>
          </Menu.Item>
        </SubMenu>
        
        

        <Menu.Item key="/designer/schedule" icon={<CalendarOutlined />}>
          <Link to="/designer/schedule">Lịch làm việc</Link>
        </Menu.Item>

        <Menu.Item key="/designer/settings" icon={<SettingOutlined />}>
          <Link to="/designer/settings">Cài đặt</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default DesignerSidebar;