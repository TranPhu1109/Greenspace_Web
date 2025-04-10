import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useServiceOrderStore from "@/stores/useServiceOrderStore";
import useProductStore from "@/stores/useProductStore";
import useRecordStore from "@/stores/useRecordStore";
import useDesignOrderStore from "@/stores/useDesignOrderStore";
import {
    Typography,
    Spin,
    Alert,
    Card,
    Row,
    Col,
    Tag,
    Image,
    Button,
    Descriptions,
    Space,
    Breadcrumb,
    Empty,
    Table,
    Timeline,
    message,
    Popconfirm,
} from "antd";
import { format } from "date-fns";
import {
    ArrowLeftOutlined,
    HomeOutlined,
    UserOutlined,
    FileTextOutlined,
    PictureOutlined,
    ShoppingOutlined,
    ProjectOutlined,
    TagsOutlined,
    HistoryOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    FilePdfOutlined,
    PlayCircleOutlined,
    EditOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const NewDesignOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        selectedOrder,
        loading: orderLoading,
        error: orderError,
        getServiceOrderById,
    } = useServiceOrderStore();
    const { getProductById } = useProductStore();
    const { sketchRecords, designRecords, getRecordSketch, getRecordDesign, isLoading: recordLoading } = useRecordStore();
    const { updateStatus } = useDesignOrderStore();
    const [localError, setLocalError] = useState(null);
    const [productDetailsMap, setProductDetailsMap] = useState({});
    const [fetchingProducts, setFetchingProducts] = useState(false);

    useEffect(() => {
        const fetchOrderDetailAndRelatedData = async () => {
            if (!id) return;

            // Reset local states on new ID
            setLocalError(null);
            setFetchingProducts(false);
            setProductDetailsMap({});

            try {
                console.log(`[Effect] Fetching order details for ID: ${id}`);
                // Trigger the main order fetch (updates store's selectedOrder, loading, error)
                await getServiceOrderById(id);

                // Get the result directly from the store *after* the fetch
                const freshlyFetchedOrder = useServiceOrderStore.getState().selectedOrder;
                console.log('[Effect] Fetched order details result:', freshlyFetchedOrder);

                // Fetch related data only if the main fetch was successful and matches the current ID
                if (freshlyFetchedOrder && freshlyFetchedOrder.id === id) {
                    // Fetch records based on status
                    if (freshlyFetchedOrder.status === 'ConsultingAndSketching') {
                        console.log('[Effect] Fetching sketch records...');
                        getRecordSketch(id);
                    } else if (freshlyFetchedOrder.status === 'DoneDesign') {
                        console.log('[Effect] Fetching design records...');
                        getRecordDesign(id);
                    }

                    // Fetch product details
                    if (freshlyFetchedOrder.serviceOrderDetails && freshlyFetchedOrder.serviceOrderDetails.length > 0) {
                        console.log('[Effect] Triggering product details fetch...');
                        fetchProductDetails(freshlyFetchedOrder.serviceOrderDetails);
                    } else {
                        console.log('[Effect] No product details to fetch.');
                    }
                } else if (!freshlyFetchedOrder) {
                    console.warn('[Effect] Order not found after fetch.');
                } else if (freshlyFetchedOrder.id !== id) {
                    console.warn('[Effect] Fetched order ID mismatch. URL ID:', id, 'Fetched ID:', freshlyFetchedOrder.id);
                }
            } catch (error) {
                // Errors from getServiceOrderById are set in the store (orderError)
                console.error("[Effect] Error during getServiceOrderById call:", error);
            }
        };

        fetchOrderDetailAndRelatedData();

        // Cleanup function
        return () => {
            console.log('[Effect Cleanup] Cleaning up for ID:', id);
            // Reset local component states
            setProductDetailsMap({});
            setFetchingProducts(false);
            setLocalError(null);
            // Optionally clear store state if needed on unmount
            // useServiceOrderStore.setState({ selectedOrder: null, error: null });
        };
    }, [id, getServiceOrderById, getRecordSketch, getRecordDesign]);

    const formatPrice = (price) => {
        if (typeof price !== 'number') return 'N/A';
        return price.toLocaleString("vi-VN") + " VNĐ";
    };

    const fetchProductDetails = async (details) => {
        if (fetchingProducts) {
            console.log('[fetchProductDetails] Already fetching, skipping.');
            return;
        }
        setFetchingProducts(true);
        console.log('[fetchProductDetails] Starting fetch...');
        try {
            const productPromises = details.map(detail => getProductById(detail.productId));
            const productResults = await Promise.all(productPromises);
            const detailsMap = {};
            productResults.forEach((product, index) => {
                if (product) {
                    detailsMap[details[index].productId] = product;
                }
            });
            console.log('[fetchProductDetails] Fetched details map:', detailsMap);
            setProductDetailsMap(detailsMap);
        } catch (error) {
            console.error("[fetchProductDetails] Error fetching product details:", error);
            setLocalError("Lỗi khi tải chi tiết sản phẩm.");
        } finally {
            console.log('[fetchProductDetails] Setting fetchingProducts to false.');
            setFetchingProducts(false);
        }
    };

    const handleStatusUpdate = async (orderId, status, successMessage, errorMessagePrefix) => {
        if (!orderId) return;
        try {
            await updateStatus(orderId, status);
            message.success(successMessage);
            await getServiceOrderById(orderId);
        } catch (err) {
            message.error(`${errorMessagePrefix}: ${err.message}`);
        }
    };

    const handleApprovePrice = () => {
        handleStatusUpdate(
            selectedOrder?.id,
            22,
            'Đã duyệt giá thiết kế thành công.',
            'Lỗi duyệt giá'
        );
    };

    const handleRejectPrice = () => {
        handleStatusUpdate(
            selectedOrder?.id,
            24,
            'Đã yêu cầu xác định lại giá thiết kế.',
            'Lỗi yêu cầu sửa giá'
        );
    };

    const getStatusColor = (status) => {
        const statusColors = {
            Pending: "orange",
            ConsultingAndSketching: "blue",
            DeterminingDesignPrice: "purple",
            DoneDeterminingDesignPrice: "green",
            ReDeterminingDesignPrice: "red",
        };
        return statusColors[status] || "default";
    };

    const getStatusText = (status) => {
        const statusTexts = {
            Pending: "Chờ xử lý",
            ConsultingAndSketching: "Đang tư vấn & phác thảo",
            DeterminingDesignPrice: "Chờ xác định giá",
            DoneDeterminingDesignPrice: "Đã duyệt giá thiết kế",
            ReDeterminingDesignPrice: "Yêu cầu sửa giá TK",
        };
        return statusTexts[status] || status;
    };

    if (orderLoading) {
        console.log("Render: Loading state (orderLoading is true)");
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
                <Spin size="large" tip="Đang tải thông tin đơn hàng..." />
            </div>
        );
    }

    const displayError = orderError || localError;
    if (displayError) {
        console.error("Render: Error state", { displayError, orderError, localError });
        return (
            <div className="container mx-auto px-4 py-8" style={{ paddingTop: "20px" }}>
                <Alert
                    type="error"
                    message="Lỗi"
                    description={displayError || "Không thể tải thông tin đơn hàng. Vui lòng thử lại."}
                    className="mb-4"
                />
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/manager/new-design-orders")}
                >
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    if (!selectedOrder || selectedOrder.id !== id) {
        console.warn(`Render: Data not ready or mismatch. URL ID: ${id}, selectedOrder ID: ${selectedOrder?.id}. Showing loading/wait state.`);
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
                <Spin size="large" tip={`Đang tải dữ liệu cho đơn hàng ${id ? id.substring(0,8) : ''}...`} />
            </div>
        );
    }

    console.log("Render: Rendering main content for order:", selectedOrder.id);
    const currentOrder = selectedOrder;
    const hasImages = currentOrder.image && (currentOrder.image.imageUrl || currentOrder.image.image2 || currentOrder.image.image3);

    const productColumns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            render: (_, record) => {
                const product = productDetailsMap[record.productId];
                return (
                    <Space>
                        <Image
                            src={product?.image?.imageUrl || '/placeholder.png'}
                            alt={product?.name || 'Sản phẩm'}
                            width={50}
                            height={50}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                            preview={false}
                        />
                        <Text strong>{product?.name || 'Không tìm thấy tên'}</Text>
                    </Space>
                );
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            render: (text) => <Text>{text}</Text>,
        },
        {
            title: 'Đơn giá',
            key: 'price',
            align: 'right',
            render: (_, record) => {
                const product = productDetailsMap[record.productId];
                const displayPrice = typeof record.price === 'number' && record.price > 0
                    ? record.price
                    : product?.price;
                return <Text>{formatPrice(displayPrice)}</Text>;
            },
        },
        {
            title: 'Thành tiền',
            key: 'totalPrice',
            align: 'right',
            render: (_, record) => {
                if (typeof record.totalPrice === 'number' && record.totalPrice > 0) {
                    return <Text strong style={{ color: '#4caf50' }}>{formatPrice(record.totalPrice)}</Text>;
                }
                const product = productDetailsMap[record.productId];
                const price = typeof record.price === 'number' && record.price > 0
                    ? record.price
                    : product?.price;
                const quantity = record.quantity;
                const calculatedTotalPrice = (typeof price === 'number' && typeof quantity === 'number')
                    ? price * quantity
                    : 0;
                return <Text strong style={{ color: '#4caf50' }}>{formatPrice(calculatedTotalPrice)}</Text>;
            },
        },
        {
            title: 'Hướng dẫn',
            key: 'guide',
            align: 'center',
            render: (_, record) => {
                const product = productDetailsMap[record.productId];
                const guideUrl = product?.designImage1URL;
                if (guideUrl) {
                    const isPdf = guideUrl.toLowerCase().endsWith('.pdf');
                    const buttonText = isPdf ? 'Xem PDF' : 'Xem Video';
                    return (
                        <Button
                            type="link"
                            href={guideUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            icon={isPdf ? <FilePdfOutlined /> : <PlayCircleOutlined />}
                        >
                            {buttonText}
                        </Button>
                    );
                }
                return <Text type="secondary">-</Text>;
            },
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8" style={{ paddingTop: "20px" }}>
            <Breadcrumb
                items={[
                    {
                        title: (
                            <Link to="/manager/dashboard">
                                <Space>
                                    <HomeOutlined style={{ fontSize: '18px' }} />
                                    <span style={{ fontSize: '16px' }}>Dashboard</span>
                                </Space>
                            </Link>
                        ),
                    },
                    {
                        title: (
                            <Link to="/manager/new-design-orders">
                                <Space>
                                    <ProjectOutlined style={{ fontSize: '18px' }} />
                                    <span style={{ fontSize: '16px' }}>Đơn đặt thiết kế mới</span>
                                </Space>
                            </Link>
                        ),
                    },
                    {
                        title: (
                            <Space>
                                <ShoppingOutlined style={{ fontSize: '18px' }} />
                                <span style={{ fontSize: '16px' }}>Chi tiết đơn #{id.substring(0, 8)}</span>
                            </Space>
                        ),
                    },
                ]}
                style={{
                    marginBottom: '16px',
                    padding: '12px 16px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            />

            <Card
                className="shadow-md mb-6"
                style={{
                    marginBottom: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Button
                            type="primary"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/manager/new-design-orders")}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            Quay lại
                        </Button>
                        <Title level={4} style={{ margin: 0 }}>
                            Chi tiết đơn <span style={{ color: '#4caf50' }}>#{id.substring(0, 8)}</span>
                        </Title>
                    </div>
                }
                extra={
                    <Tag color={getStatusColor(currentOrder.status)} size="large">
                        {getStatusText(currentOrder.status)}
                    </Tag>
                }
            >
                <Row gutter={[24, 24]} style={{ marginBottom: '15px' }}>
                    <Col xs={24} md={12}>
                        <Card
                            title={
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#4caf50',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <UserOutlined />
                                    Thông tin khách hàng
                                </span>
                            }
                            style={{ height: '100%', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)' }}
                        >
                            <Descriptions column={1} size="middle">
                                <Descriptions.Item label="Tên">{currentOrder.userName}</Descriptions.Item>
                                <Descriptions.Item label="Email">{currentOrder.email}</Descriptions.Item>
                                <Descriptions.Item label="SĐT">{currentOrder.cusPhone}</Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">{currentOrder.address?.replace(/\|/g, ', ') ?? 'N/A'}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card
                            title={
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#4caf50',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <HomeOutlined />
                                    Thông tin yêu cầu
                                </span>
                            }
                            style={{ height: '100%', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)' }}
                        >
                            <Descriptions column={1} size="middle">
                                <Descriptions.Item label="Kích thước">{currentOrder.length}m x {currentOrder.width}m</Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">{format(new Date(currentOrder.creationDate), "dd/MM/yyyy HH:mm")}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>

                {(currentOrder.status === 'ConsultingAndSketching' && sketchRecords.length > 0) ||
                    (currentOrder.status === 'DoneDesign' && designRecords.length > 0) ? (
                    <Card
                        title={
                            <span style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#4caf50',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <PictureOutlined />
                                {currentOrder.status === 'ConsultingAndSketching' ? 'Bản vẽ phác thảo' : 'Bản vẽ thiết kế'}
                            </span>
                        }
                        style={{
                            borderRadius: '8px',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                            marginBottom: '24px'
                        }}
                        loading={recordLoading}
                    >
                        {[0, 1, 2].map(phase => {
                            const recordsInPhase = (currentOrder.status === 'ConsultingAndSketching' ? sketchRecords : designRecords)
                                                .filter(record => record.phase === phase);
                            if (recordsInPhase.length === 0) return null;

                            const phaseTitle = phase === 0
                                ? "Ảnh khách hàng cung cấp"
                                : `${currentOrder.status === 'ConsultingAndSketching' ? 'Bản phác thảo' : 'Bản thiết kế'} lần ${phase}`;
                            const isSelectedPhase = recordsInPhase.some(record => record.isSelected);

                            return (
                                <div key={phase} style={{ marginBottom: '20px' }}>
                                    <Title level={5} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                        {phaseTitle}
                                        {isSelectedPhase && <Tag color="green" style={{ marginLeft: 8 }}>Đã chọn</Tag>}
                                    </Title>
                                    <Row gutter={[16, 16]}>
                                        {recordsInPhase.map(record => (
                                            <Col xs={24} sm={8} key={record.id}>
                                                <Card hoverable style={record.isSelected ? { border: '2px solid #52c41a' } : {}} bodyStyle={{ padding: 0 }}>
                                                    <Image src={record.image?.imageUrl || '/placeholder.png'} alt={`Ảnh ${phaseTitle} 1`} style={{ width: '100%', height: '200px', objectFit: 'cover' }}/>
                                                    {record.image?.image2 && <Image src={record.image.image2} alt={`Ảnh ${phaseTitle} 2`} style={{ width: '100%', height: '200px', objectFit: 'cover', marginTop: '8px' }}/>}
                                                    {record.image?.image3 && <Image src={record.image.image3} alt={`Ảnh ${phaseTitle} 3`} style={{ width: '100%', height: '200px', objectFit: 'cover', marginTop: '8px' }}/>}
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            );
                        })}
                        {(currentOrder.status === 'ConsultingAndSketching' && sketchRecords.length === 0 && !recordLoading) ||
                         (currentOrder.status === 'DoneDesign' && designRecords.length === 0 && !recordLoading) ? (
                             <Empty description={`Chưa có ${currentOrder.status === 'ConsultingAndSketching' ? 'bản phác thảo' : 'bản thiết kế'} nào được tải lên.`} />
                        ) : null}
                    </Card>
                ) : (
                    hasImages && (
                        <Card
                            title={
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#4caf50',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <PictureOutlined />
                                    Hình ảnh khách hàng cung cấp
                                </span>
                            }
                            style={{
                                borderRadius: '8px',
                                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                                marginBottom: '24px'
                            }}
                        >
                            <Row gutter={[16, 16]}>
                                {currentOrder.image.imageUrl && (
                                    <Col xs={24} sm={8}>
                                        <Image src={currentOrder.image.imageUrl} alt="Hình ảnh 1" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </Col>
                                )}
                                {currentOrder.image.image2 && (
                                    <Col xs={24} sm={8}>
                                        <Image src={currentOrder.image.image2} alt="Hình ảnh 2" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </Col>
                                )}
                                {currentOrder.image.image3 && (
                                    <Col xs={24} sm={8}>
                                        <Image src={currentOrder.image.image3} alt="Hình ảnh 3" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </Col>
                                )}
                                {!currentOrder.image.imageUrl && !currentOrder.image.image2 && !currentOrder.image.image3 && (
                                    <Col span={24}>
                                        <Empty description="Khách hàng không cung cấp hình ảnh." />
                                    </Col>
                                )}
                            </Row>
                        </Card>
                    )
                )}

                {currentOrder.description && (
                    <Card
                        title={
                            <span style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#4caf50',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FileTextOutlined />
                                Mô tả yêu cầu
                            </span>
                        }
                        style={{
                            borderRadius: '8px',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                            marginBottom: '24px'
                        }}
                    >
                        <div dangerouslySetInnerHTML={{ __html: currentOrder.description }} />
                    </Card>
                )}

                {currentOrder.serviceOrderDetails && currentOrder.serviceOrderDetails.length > 0 && (
                    <Card
                        title={
                            <span style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#4caf50',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <TagsOutlined />
                                Danh sách vật liệu dự kiến
                            </span>
                        }
                        style={{
                            borderRadius: '8px',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                            marginBottom: '24px'
                        }}
                        loading={fetchingProducts}
                    >
                        <Table
                            columns={productColumns}
                            dataSource={currentOrder.serviceOrderDetails}
                            pagination={false}
                            rowKey={(record, index) => `${record.productId}-${index}`}
                            summary={() => {
                                let totalMaterialCost = 0;
                                currentOrder.serviceOrderDetails.forEach(detail => {
                                    const product = productDetailsMap[detail.productId];
                                    const price = typeof detail.price === 'number' && detail.price > 0
                                        ? detail.price
                                        : product?.price;
                                    const quantity = detail.quantity;
                                    if (typeof price === 'number' && typeof quantity === 'number') {
                                        totalMaterialCost += price * quantity;
                                    }
                                });
                                return (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={4} align="right">
                                            <Text strong>Tổng tiền vật liệu (dự kiến):</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="right">
                                            <Text strong style={{ color: '#cf1322' }}>{formatPrice(totalMaterialCost)}</Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                );
                            }}
                        />
                    </Card>
                )}

                {currentOrder.report && (
                    <Card
                        title={
                            <span style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#4caf50',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <EditOutlined />
                                Ghi chú / Báo cáo từ Designer
                            </span>
                        }
                        style={{
                            borderRadius: '8px',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                            marginBottom: '24px'
                        }}
                    >
                        <div dangerouslySetInnerHTML={{ __html: currentOrder.report }} />
                    </Card>
                )}

                {(currentOrder.designPrice || currentOrder.materialPrice) && (
                    <Card
                        title={
                            <span style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#4caf50',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <DollarOutlined />
                                Chi phí
                            </span>
                        }
                        style={{
                            borderRadius: '8px',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                            marginBottom: '24px'
                        }}
                    >
                        <Descriptions column={1} size="middle">
                            {typeof currentOrder.designPrice === 'number' && (
                                <Descriptions.Item label="Giá thiết kế">{formatPrice(currentOrder.designPrice)}</Descriptions.Item>
                            )}
                            {typeof currentOrder.materialPrice === 'number' && (
                                <Descriptions.Item label="Giá vật liệu">{formatPrice(currentOrder.materialPrice)}</Descriptions.Item>
                            )}
                            <Descriptions.Item label="Tổng cộng">
                                <Text strong style={{ fontSize: '1.1em', color: '#cf1322' }}>
                                    {formatPrice(currentOrder.totalCost)}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}

                {currentOrder?.status === 'DeterminingDesignPrice' && currentOrder?.designPrice > 0 && (
                    <Card
                        title="Xác nhận giá thiết kế"
                        style={{
                            borderRadius: '8px',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                            marginTop: '24px'
                        }}
                        bodyStyle={{ textAlign: 'right' }}
                    >
                        <Space size="middle">
                            <Popconfirm
                                title="Bạn chắc chắn muốn YÊU CẦU SỬA mức giá này?"
                                onConfirm={handleRejectPrice}
                                okText="Đúng, yêu cầu sửa"
                                cancelText="Hủy"
                            >
                                <Button danger icon={<CloseCircleOutlined />}>
                                    Yêu cầu sửa giá
                                </Button>
                            </Popconfirm>

                            <Popconfirm
                                title="Bạn chắc chắn muốn DUYỆT mức giá thiết kế này?"
                                onConfirm={handleApprovePrice}
                                okText="Duyệt"
                                cancelText="Hủy"
                            >
                                <Button type="primary" icon={<CheckCircleOutlined />}>
                                    Duyệt giá thiết kế
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Card>
                )}

            </Card>
        </div>
    );
};

export default NewDesignOrderDetail; 