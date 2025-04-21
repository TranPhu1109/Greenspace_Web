import { Button, Carousel, Card, Row, Col, Typography, Divider } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import Header from '../components/Header/index';
import Footer from '../components/Footer/index';

const { Title, Paragraph } = Typography;

const Home = () => {
  // Dữ liệu mẫu cho carousel
  const carouselItems = [
    {
      id: 1,
      title: 'Không gian xanh cho cuộc sống hiện đại',
      description: 'Tạo không gian sống hài hòa với thiên nhiên',
      image: 'https://images.unsplash.com/photo-1545165375-1b744b9ed444?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 2,
      title: 'Thiết kế bền vững',
      description: 'Giải pháp thiết kế thân thiện với môi trường',
      image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 3,
      title: 'Sản phẩm chất lượng cao',
      description: 'Đa dạng sản phẩm cho không gian xanh của bạn',
      image: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
  ];

  // Dữ liệu mẫu cho các sản phẩm nổi bật
  const featuredProducts = [
    {
      id: 1,
      title: 'Cây cảnh nội thất',
      description: 'Các loại cây phù hợp với không gian trong nhà',
      image: 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 2,
      title: 'Chậu cây thiết kế',
      description: 'Chậu cây với thiết kế hiện đại và độc đáo',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 3,
      title: 'Vật liệu trang trí',
      description: 'Các vật liệu trang trí từ thiên nhiên',
      image: 'https://images.unsplash.com/photo-1517848568502-d03fa74e1964?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 4,
      title: 'Dịch vụ thiết kế',
      description: 'Dịch vụ tư vấn và thiết kế không gian xanh',
      image: 'https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Carousel */}
        <Carousel autoplay effect="fade">
          {carouselItems.map((item) => (
            <div key={item.id}>
              <div 
                className="h-[500px] relative bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-xl text-white">
                      <h1 className="text-4xl md:text-5xl font-bold mb-4">{item.title}</h1>
                      <p className="text-xl mb-6">{item.description}</p>
                      <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700">
                        Tìm hiểu thêm
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        {/* Giới thiệu */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <Title level={2} className="mb-6">Chào mừng đến với GreenSpace</Title>
              <Paragraph className="text-lg text-gray-600 mb-8">
                GreenSpace là đơn vị tiên phong trong lĩnh vực thiết kế và cung cấp các giải pháp không gian xanh. 
                Chúng tôi tin rằng mỗi không gian sống đều xứng đáng được kết nối với thiên nhiên, mang lại sự cân bằng 
                và hài hòa cho cuộc sống hiện đại.
              </Paragraph>
              <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700">
                Về chúng tôi <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        </section>

        {/* Sản phẩm nổi bật */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Title level={2} className="text-center mb-12">Sản phẩm nổi bật</Title>
            <Row gutter={[24, 24]}>
              {featuredProducts.map((product) => (
                <Col xs={24} sm={12} lg={6} key={product.id}>
                  <Card
                    hoverable
                    cover={<img alt={product.title} src={product.image} className="h-64 object-cover" />}
                    className="h-full flex flex-col"
                  >
                    <Card.Meta 
                      title={product.title} 
                      description={product.description} 
                    />
                    <div className="mt-4 pt-4 border-t">
                      <Button type="link" className="text-green-600 p-0">
                        Xem chi tiết <ArrowRightOutlined />
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <div className="text-center mt-10">
              <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700">
                Xem tất cả sản phẩm
              </Button>
            </div>
          </div>
        </section>

        {/* Dịch vụ */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1558616629-899031969d5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Dịch vụ thiết kế" 
                    className="w-full h-auto"
                  />
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <Title level={2} className="mb-6">Dịch vụ thiết kế không gian xanh</Title>
                <Paragraph className="text-lg text-gray-600 mb-6">
                  Chúng tôi cung cấp dịch vụ thiết kế không gian xanh chuyên nghiệp, từ tư vấn ban đầu đến triển khai 
                  và bảo trì. Đội ngũ thiết kế của chúng tôi sẽ làm việc chặt chẽ với bạn để tạo ra không gian xanh 
                  phù hợp với phong cách và nhu cầu của bạn.
                </Paragraph>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="bg-green-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Tư vấn và thiết kế không gian xanh</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Lựa chọn và cung cấp cây cảnh phù hợp</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Triển khai và lắp đặt</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Dịch vụ bảo trì và chăm sóc định kỳ</span>
                  </li>
                </ul>
                <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700">
                  Đặt lịch tư vấn
                </Button>
              </Col>
            </Row>
          </div>
        </section>

        {/* Đăng ký nhận tin */}
        {/* <section className="py-16 bg-green-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <Title level={2} className="text-white mb-4">Đăng ký nhận thông tin mới nhất</Title>
            <Paragraph className="text-lg mb-8 max-w-2xl mx-auto">
              Hãy đăng ký để nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và các mẹo chăm sóc cây cảnh.
            </Paragraph>
            <div className="max-w-md mx-auto flex">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="px-4 py-3 w-full text-gray-800 rounded-l focus:outline-none"
              />
              <button className="bg-gray-800 hover:bg-gray-900 px-6 py-3 rounded-r transition duration-300">
                Đăng ký
              </button>
            </div>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  );
};

export default Home; 