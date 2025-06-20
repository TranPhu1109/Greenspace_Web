import React from 'react';
import { Tabs } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import TemplateOrdersList from '../../../components/Staff/TemplateOrders/TemplateOrdersList';
import CustomTemplateOrdersList from '../../../components/Staff/CustomTemplateOrders/CustomTemplateOrdersList';
import CustomOrdersList from './CustomOrders/CustomOrdersList';
import NewDesignOrdersList from '../../../components/Staff/NewDesignOrders/NewDesignOrdersList';



const DesignOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (key) => {
    switch(key) {
      case 'template':
        navigate('/admin/design-orders/template-orders');
        break;
      case 'custom-template':
        navigate('/admin/design-orders/custom-template-orders');
        break;
      case 'custom':
        navigate('/admin/design-orders/custom-orders');
        break;
      case 'new-design':
        navigate('/admin/design-orders/new-design-orders');
        break;
      default:
        navigate('/admin/design-orders');
    }
  };

  return (
    <div className="design-orders-container">
      <Tabs
        defaultActiveKey="template"
        onChange={handleTabChange}
        type="card"
        items={[
          {
            key: "template",
            label: "Đơn đặt theo mẫu",
            children: <TemplateOrdersList />
          },
          {
            key: "custom-template",
            label: "Đơn custom từ mẫu",
            children: <CustomTemplateOrdersList />
          },
          {
            key: "custom",
            label: "Đơn thiết kế mới",
            children: <CustomOrdersList />
          },
          {
            key: "new-design",
            label: "Đơn thiết kế mới",
            children: <NewDesignOrdersList />
          }
        ]}
      />
    </div>
  );
};

export default DesignOrders; 