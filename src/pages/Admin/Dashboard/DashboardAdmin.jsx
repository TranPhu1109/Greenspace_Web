import React, { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Card, Row, Col, Statistic, Tabs, Typography, Spin, Divider } from 'antd';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  DollarCircleOutlined,
  RiseOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  CloudOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import axios from '../../../api/api';
import useOrderStore from '../../../stores/orderStore';
import useProductStore from '../../../stores/useProductStore';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Nature-inspired colors for a green space theme with better diversity
const GREEN_COLORS = ['#2E7D32', '#FFA000', '#7B1FA2', '#1976D2', '#E64A19', '#00796B'];
const GRADIENT_COLORS = {
  daily: ['#FFB74D', '#FF9800'],
  weekly: ['#81D4FA', '#29B6F6'],
  monthly: ['#AED581', '#7CB342'],
  yearly: ['#FFE0B2', '#E65100']
};

// Format currency function
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0
  });
  const [filteredRevenue, setFilteredRevenue] = useState(0);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { orders, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch revenue data
        const revenueResponse = await axios.get('/api/report');
        if (revenueResponse.data) {
          setRevenueData({
            dailyRevenue: revenueResponse.data.dailyRevenue || 0,
            weeklyRevenue: revenueResponse.data.weeklyRevenue || 0,
            monthlyRevenue: revenueResponse.data.monthlyRevenue || 0,
            yearlyRevenue: revenueResponse.data.yearlyRevenue || 0
          });
        }

        // Fetch orders and products
        await fetchOrders();
        await fetchProducts();

        // Calculate best selling products
        const productSales = {};
        if (orders && orders.length > 0) {
          orders.forEach(order => {
            if (order.orderDetails && Array.isArray(order.orderDetails)) {
              order.orderDetails.forEach(item => {
                const productId = item.productId;
                // Find product info from products array
                const productInfo = products.find(p => p.id === productId);
                
                if (!productSales[productId]) {
                  productSales[productId] = {
                    id: productId,
                    name: productInfo ? productInfo.name : 'Sản phẩm không tên',
                    quantity: 0,
                    revenue: 0
                  };
                }
                productSales[productId].quantity += item.quantity || 0;
                productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
              });
            }
          });

          const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

          setBestSellingProducts(sortedProducts);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values in case of error
        setRevenueData({
          dailyRevenue: 0,
          weeklyRevenue: 0,
          monthlyRevenue: 0,
          yearlyRevenue: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchOrders, fetchProducts]);

  const handleFilterChange = async (date, month, year) => {
    try {
      const response = await axios.get('/api/report/filter', {
        params: { date, month, year }
      });
      setFilteredRevenue(response.data?.revenue || 0);
    } catch (error) {
      console.error('Error fetching filtered revenue:', error);
      setFilteredRevenue(0);
    }
  };

  // Ensure revenueData is defined before using it
  const revenueChartData = [
    { name: 'Hôm nay', value: revenueData?.dailyRevenue || 0 },
    { name: 'Tuần này', value: revenueData?.weeklyRevenue || 0 },
    { name: 'Tháng này', value: revenueData?.monthlyRevenue || 0 },
    { name: 'Năm nay', value: revenueData?.yearlyRevenue || 0 }
  ];

  const bestSellingChartData = bestSellingProducts.map(product => ({
    name: product.name || '',
    quantity: product.quantity || 0,
    revenue: product.revenue || 0
  }));

  // Pie chart data for revenue distribution
  const revenuePieData = [
    { name: 'Hôm nay', value: revenueData?.dailyRevenue || 0 },
    { name: 'Tuần này', value: (revenueData?.weeklyRevenue || 0) - (revenueData?.dailyRevenue || 0) },
    { name: 'Tháng này', value: (revenueData?.monthlyRevenue || 0) - (revenueData?.weeklyRevenue || 0) },
    { name: 'Năm nay', value: (revenueData?.yearlyRevenue || 0) - (revenueData?.monthlyRevenue || 0) }
  ].filter(item => item.value > 0);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #C8E6C9',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, color: '#2E7D32' }}><strong>{label}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '5px 0', color: entry.color || GREEN_COLORS[index % GREEN_COLORS.length] }}>
              {entry.name}: {entry.name === 'Doanh thu' || entry.dataKey === 'revenue' 
                ? formatCurrency(entry.value) 
                : `${entry.value} sản phẩm`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(to right, #F5F5F5, #E0F7FA)',
      }}>
        <div style={{ 
          padding: '30px', 
          backgroundColor: 'white', 
          borderRadius: '10px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <Text style={{ color: '#455A64' }}>Đang tải dữ liệu...</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#FAFAFA',
      minHeight: '100vh'
    }}>
      <div style={{ 
        background: 'linear-gradient(120deg, #43A047 0%, #1E88E5 100%)',
        borderRadius: '10px',
        padding: '20px 30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements to represent plants */}
        <div style={{ 
          position: 'absolute', 
          right: 15, 
          top: 10, 
          fontSize: 64, 
          opacity: 0.2, 
          color: '#fff' 
        }}>
          <ApartmentOutlined rotate={90} />
        </div>
        <div style={{ 
          position: 'absolute', 
          left: 15, 
          bottom: 10, 
          fontSize: 40, 
          opacity: 0.2, 
          color: '#fff' 
        }}>
          <CloudOutlined />
        </div>
        
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          <EnvironmentOutlined style={{ marginRight: '12px' }} />
          Không Gian Xanh Dashboard
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Thống kê doanh thu và sản phẩm từ không gian xanh của bạn
        </Text>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #FFE0B2'
            }}
            bodyStyle={{
              background: `linear-gradient(120deg, ${GRADIENT_COLORS.daily[0]}, ${GRADIENT_COLORS.daily[1]})`,
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>Thu nhập hôm nay</Text>
                <Title level={3} style={{ color: '#fff', margin: '4px 0 0 0' }}>
                  {formatCurrency(revenueData?.dailyRevenue || 0)}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #BBDEFB'
            }}
            bodyStyle={{
              background: `linear-gradient(120deg, ${GRADIENT_COLORS.weekly[0]}, ${GRADIENT_COLORS.weekly[1]})`,
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RiseOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>Thu nhập tuần</Text>
                <Title level={3} style={{ color: '#fff', margin: '4px 0 0 0' }}>
                  {formatCurrency(revenueData?.weeklyRevenue || 0)}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #DCEDC8'
            }}
            bodyStyle={{
              background: `linear-gradient(120deg, ${GRADIENT_COLORS.monthly[0]}, ${GRADIENT_COLORS.monthly[1]})`,
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>Thu nhập tháng</Text>
                <Title level={3} style={{ color: '#fff', margin: '4px 0 0 0' }}>
                  {formatCurrency(revenueData?.monthlyRevenue || 0)}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #FFCCBC'
            }}
            bodyStyle={{
              background: `linear-gradient(120deg, ${GRADIENT_COLORS.yearly[0]}, ${GRADIENT_COLORS.yearly[1]})`,
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>Thu nhập năm</Text>
                <Title level={3} style={{ color: '#fff', margin: '4px 0 0 0' }}>
                  {formatCurrency(revenueData?.yearlyRevenue || 0)}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '30px' }}>
        <Tabs 
          defaultActiveKey="revenue" 
          type="card"
          style={{ 
            background: '#fff', 
            padding: '16px', 
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #EEEEEE'
          }}
        >
          <TabPane 
            tab={<span><LineChartOutlined style={{ marginRight: '8px' }} />Doanh Thu Không Gian Xanh</span>} 
            key="revenue"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        background: '#43A047',
                        marginRight: '8px'
                      }}></div>
                      <span>Biểu đồ doanh thu từ sản phẩm</span>
                    </div>
                  }
                  style={{ 
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #EEEEEE'
                  }}
                  headStyle={{ 
                    borderBottom: '1px solid #EEEEEE',
                    fontWeight: 600,
                    color: '#455A64'
                  }}
                >
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={revenueChartData}
                        margin={{ left: 50, right: 20, top: 20, bottom: 10 }}
                      >
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#43A047" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#43A047" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          name="Doanh thu" 
                          stroke="#43A047" 
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        background: '#1976D2',
                        marginRight: '8px'
                      }}></div>
                      <span>Phân bổ doanh thu theo thời gian</span>
                    </div>
                  }
                  style={{ 
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    height: '100%',
                    border: '1px solid #EEEEEE'
                  }}
                  headStyle={{ 
                    borderBottom: '1px solid #EEEEEE',
                    fontWeight: 600,
                    color: '#455A64'
                  }}
                >
                  <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {revenuePieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ left: 45, right: 20, top: 20, bottom: 20 }}>
                          <defs>
                            <filter id="shadow" height="200%">
                              <feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="0.1" />
                            </filter>
                          </defs>
                          <Pie
                            data={revenuePieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            innerRadius={70}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={3}
                            label={false}
                            filter="url(#shadow)"
                          >
                            {revenuePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={GREEN_COLORS[index % GREEN_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <text
                            x="52%"
                            y="47%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontWeight: 'bold', fontSize: '18px', fill: '#455A64' }}
                          >
                            {formatCurrency(revenuePieData.reduce((sum, item) => sum + item.value, 0))}
                          </text>
                          <text
                            x="55%"
                            y="85%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontSize: '14px', fill: '#78909C' }}
                          >
                            Doanh thu không gian xanh
                          </text>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Text style={{ color: '#455A64' }}>Không có dữ liệu phân phối</Text>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane 
            tab={<span><AppstoreOutlined style={{ marginRight: '8px' }} />Sản Phẩm Sinh Thái Bán Chạy</span>} 
            key="products"
          >
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: '#FFA000',
                    marginRight: '8px'
                  }}></div>
                  <span>Top 5 sản phẩm bán chạy nhất</span>
                </div>
              }
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #EEEEEE'
              }}
              headStyle={{ 
                borderBottom: '1px solid #EEEEEE',
                fontWeight: 600,
                color: '#455A64'
              }}
            >
              <div style={{ height: '400px' }}>
                {bestSellingProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={bestSellingChartData}
                      layout="vertical"
                      margin={{ left: 150, right: 30, top: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#EEEEEE" />
                      <XAxis 
                        type="number" 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="quantity" 
                        name="Số lượng" 
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                        fill="url(#colorQuantity)" 
                      />
                      <Bar 
                        dataKey="revenue" 
                        name="Doanh thu" 
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                        fill="url(#colorRevenue)" 
                      />
                      <defs>
                        <linearGradient id="colorQuantity" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#FFA000" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FFA000" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#1976D2" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#1976D2" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Text style={{ color: '#455A64' }}>Không có dữ liệu sản phẩm</Text>
                  </div>
                )}
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
      {/* <Analytics /> */}
    </div>
  );
};

export default Dashboard;