import React, { useState, useEffect } from "react";
import { Card, Button, Space, Tag, message, Modal, Image, Divider, Input, Typography, Form, Spin, Steps, Alert, Collapse, notification } from "antd";
import { FileTextOutlined, ReloadOutlined, CheckCircleOutlined, UploadOutlined, CloseCircleOutlined, UserOutlined, MailOutlined, PhoneOutlined, DollarOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import AddressForm from "@/components/Common/AddressForm"; // Import AddressForm
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useNavigate } from "react-router-dom";

const { Text, Title, Paragraph } = Typography;
const { Step } = Steps;

const ContractSection = ({
  contract,            // Existing contract data from store (if any)
  selectedOrder,     // The current order details
  contractLoading,   // Loading state from store
  getContractByServiceOrder, // Func to fetch contract
  contractVisibleStatuses,
  contractVisibleStatusCodes,
  uploadImages,      // Func to upload images (signature)
  signContract,      // Func to sign the contract API
  updateStatus,      // Func to update order status API
  formatPrice,       // Util for formatting price
  api,               // Axios instance
  generateContract,  // Func to generate contract API
  refreshAllData,    // Func to refresh all order data
  updateTaskOrder,    // Func to update workTask status
  getServiceOrderById, // Func to get service order by id
  data,
  fetchBalance
}) => {
  const [form] = Form.useForm(); // Form instance for user info
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null); // Store the actual file
  const [uploading, setUploading] = useState(false);
  const [generatingContract, setGeneratingContract] = useState(false);
  const [signingAndPaying, setSigningAndPaying] = useState(false);
  const [localContractData, setLocalContractData] = useState(null); // Holds generated/fetched contract
  const [contracts, setContracts] = useState([]); // Array to store all contracts
  const [currentStep, setCurrentStep] = useState(0); // Modal steps
  const [addressInfo, setAddressInfo] = useState({}); // State for AddressForm data
  const [useSavedAddress, setUseSavedAddress] = useState(false); // Track if using saved address
  const [userInfo, setUserInfo] = useState({}); // User info from localStorage
  const [checkingExistingContracts, setCheckingExistingContracts] = useState(false);
  const navigate = useNavigate();
  // Check if current status is WaitDeposit
  const isWaitDepositStatus =
    selectedOrder?.status === "WaitDeposit" ||
    selectedOrder?.status === 21;

  // Use combined contract data (from props or local state)
  const activeContract = contract || localContractData;

  // Check for existing contracts when component mounts or order changes
  useEffect(() => {
    if (selectedOrder?.id) {
      checkForExistingContracts(selectedOrder.id);
    }
  }, [selectedOrder?.id, getContractByServiceOrder]);

  // New useEffect to check for selected sketches and fetch contract if needed
  useEffect(() => {
    const fetchContractForSelectedSketch = async () => {
      // Check if selectedOrder has sketchRecords with isSelected=true
      const hasSelectedSketch = selectedOrder?.recordSketches?.some(record => record.isSelected === true);

      if (hasSelectedSketch && selectedOrder?.id) {
        console.log("Found selected sketch in order data, fetching contract...");
        try {
          // Fetch latest contract data to ensure UI is up-to-date
          await checkForExistingContracts(selectedOrder.id);
        } catch (error) {
          console.error("Error fetching contract for selected sketch:", error);
        }
      }
    };

    fetchContractForSelectedSketch();
  }, [selectedOrder]);

  console.log("order", selectedOrder);

  // Function to check for existing contracts
  const checkForExistingContracts = async (orderId) => {
    try {
      setCheckingExistingContracts(true);
      const contractsData = await getContractByServiceOrder(orderId);

      // Handle if API returns a single object or an array
      if (Array.isArray(contractsData)) {
        console.log("Found", contractsData.length, "existing contracts");
        setContracts(contractsData);

        // Find any signed contract (with modificationDate)
        const signedContract = contractsData.find(c => c.modificationDate);

        if (signedContract) {
          console.log("Found signed contract:", signedContract.id);
          setLocalContractData(signedContract);
        } else if (contractsData.length > 0) {
          // Use most recent contract if none are signed
          const mostRecentContract = contractsData[0]; // Assuming array is ordered by creation date
          console.log("Using most recent unsigned contract:", mostRecentContract.id);
          setLocalContractData(mostRecentContract);
        }
      } else if (contractsData) {
        // Handle single contract object
        console.log("Found single contract:", contractsData.id);
        setContracts([contractsData]);
        setLocalContractData(contractsData);
      }
    } catch (error) {
      console.error("Error checking for existing contracts:", error);
      // If no contracts found, we'll proceed with normal flow
      setContracts([]);
      setLocalContractData(null);
    } finally {
      setCheckingExistingContracts(false);
    }
  };

  // Fetch user data from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserInfo(user || {});
        // Pre-fill form if modal opens later
        form.setFieldsValue({
          name: user?.name, // Changed from name to name
          email: user?.email,
          phone: user?.phone,
          // Address is handled by AddressForm
        });
      } catch (error) {
        console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", error);
      }
    }
    // Pre-fill design price (read-only)
    form.setFieldsValue({
      designPrice: selectedOrder?.designPrice
    });
  }, [form, selectedOrder?.designPrice]);

  // Reset address form to default values
  const resetAddressFormToDefault = () => {
    // Clear local address state
    setAddressInfo({});
    setUseSavedAddress(false);

    // Reset address form fields
    form.setFieldsValue({
      provinces: undefined,
      district: undefined,
      ward: undefined,
      streetAddress: "",
      // Thêm các trường khác nếu cần
      userName: userInfo?.name || "",
      userPhone: userInfo?.phone || ""
    });

    // Repopulate the user info fields only
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        form.setFieldsValue({
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          designPrice: selectedOrder?.designPrice
        });
      }
    } catch (error) {
      console.error("Lỗi khi đọc thông tin người dùng:", error);
    }
  };

  // Reset state when modal closes
  const handleCloseModal = () => {
    setIsContractModalVisible(false);
    setCurrentStep(0);
    setUploading(false);
    setGeneratingContract(false);
    setSigningAndPaying(false);
    setPreviewImage(null);
    setSignatureFile(null);

    // Don't reset localContractData to keep track of existing contracts

    // Reset form fields
    form.resetFields();

    // Re-populate with initial data
    form.setFieldsValue({
      name: userInfo?.name,
      email: userInfo?.email,
      phone: userInfo?.phone,
      designPrice: selectedOrder?.designPrice
    });

    // Reset address form fields
    resetAddressFormToDefault();
  };

  // When opening the modal, check if we should skip to signing step
  const handleOpenModal = async () => {
    try {
      // First ensure we have up-to-date contract data
      await checkForExistingContracts(selectedOrder.id);

      // Reset and prefill form for either step
      form.resetFields();

      // Repopulate the user info fields only
      form.setFieldsValue({
        name: userInfo?.name,
        email: userInfo?.email,
        phone: userInfo?.phone,
        designPrice: selectedOrder?.designPrice
      });

      // Reset address form fields to default (without resetting user info fields)
      setAddressInfo({});
      setUseSavedAddress(false);

      // If we have existing contracts and none are signed, skip to step 1 (signing)
      if (contracts.length > 0 && !contracts.some(c => c.modificationDate)) {
        console.log("Opening modal directly at step 1 (signing) with existing contract");
        setCurrentStep(1);
      } else if (contracts.some(c => c.modificationDate)) {
        // If we have a signed contract, go to step 2 (view)
        console.log("Opening modal at step 2 (view) with signed contract");
        setCurrentStep(2);
      } else {
        // Otherwise start at step 0 (info)
        console.log("Opening modal at step 0 (info) to create new contract");
        setCurrentStep(0);
      }

      setIsContractModalVisible(true);
    } catch (error) {
      console.error("Error preparing modal:", error);
      message.error("Không thể chuẩn bị hợp đồng. Vui lòng thử lại.");
    }
  };

  // Handler for AddressForm changes
  const handleAddressChange = (newAddress) => {
    console.log("Address changed in ContractSection:", newAddress);

    // Ghi log đầy đủ thông tin để debug
    console.log("New address details:", JSON.stringify(newAddress, null, 2));

    // Lưu trữ thông tin đầy đủ của địa chỉ
    setAddressInfo(newAddress);

    // Khi sử dụng useExistingAddress=false (form điền trực tiếp),
    // đặt useSavedAddress=false để không dùng địa chỉ đã lưu
    setUseSavedAddress(false);
  };

  // Step 1: Generate Contract
  const handleGenerateContract = async () => {
    try {
      await form.validateFields(); // Validate user info form
      const values = form.getFieldsValue();

      console.log("Current addressInfo state:", addressInfo);
      console.log("Current useSavedAddress state:", useSavedAddress);

      let finalAddress = "";
      // Nếu dùng địa chỉ đã lưu và có địa chỉ trong userInfo
      if (useSavedAddress && userInfo.address) {
        // Chuyển đổi định dạng địa chỉ từ '|' sang ', '
        finalAddress = userInfo.address.replace(/\|/g, ', ');
        console.log("Using saved address:", finalAddress);
      }
      // Nếu có đầy đủ thông tin địa chỉ từ AddressForm
      else if (addressInfo && addressInfo.streetAddress &&
        addressInfo.province && addressInfo.province.label &&
        addressInfo.district && addressInfo.district.label &&
        addressInfo.ward && addressInfo.ward.label) {
        // Construct address string from AddressForm
        finalAddress = `${addressInfo.streetAddress}, ${addressInfo.ward.label}, ${addressInfo.district.label}, ${addressInfo.province.label}`;
        console.log("Using form address:", finalAddress);
      }
      // Nếu dùng dữ liệu từ addressInfo.fullAddressData (định dạng khác)
      else if (addressInfo && addressInfo.fullAddressData) {
        const addrData = addressInfo.fullAddressData;
        if (addrData.addressInfo) {
          finalAddress = `${addrData.addressInfo.streetAddress}, ${addrData.addressInfo.ward}, ${addrData.addressInfo.district}, ${addrData.addressInfo.province}`;
          console.log("Using fullAddressData:", finalAddress);
        }
      }
      // Nếu không có địa chỉ hợp lệ
      else {
        message.error("Vui lòng cung cấp đầy đủ thông tin địa chỉ.");
        console.error("Invalid address data:", addressInfo);
        return;
      }

      setGeneratingContract(true);
      const contractPayload = {
        userId: userInfo?.id || selectedOrder?.userId, // Use ID from localStorage if available
        serviceOrderId: selectedOrder.id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: finalAddress,
        designPrice: selectedOrder.designPrice, // Use the price from the order
      };

      console.log("Contract payload:", contractPayload);
      const generated = await generateContract(contractPayload);
      // Force refresh contracts list after generating new one
      await checkForExistingContracts(selectedOrder.id);

      // Set localContractData to the newly generated contract
      setLocalContractData(generated);
      console.log("Generated contract:", localContractData);
      message.success("Đã tạo hợp đồng thành công!");
      setCurrentStep(1); // Move to the signing step
    } catch (error) {
      console.error("Error generating contract:", error);
      message.error("Tạo hợp đồng thất bại: " + (error.response?.data?.message || error.message));
    } finally {
      setGeneratingContract(false);
    }
  };

  // Step 2: Sign and Pay
  const handleSignAndPay = async () => {
    if (!signatureFile) {
      message.error("Vui lòng tải lên chữ ký của bạn.");
      return;
    }

    // Make sure we have a contract to sign
    const contractToSign = localContractData || (contracts.length > 0 ? contracts[0] : null);
    console.log("Contract to sign:", contractToSign);

    // Try to get ID from nested data or directly from the object
    const contractId = contractToSign?.data?.id || contractToSign?.id;

    if (!contractToSign || !contractId) { // Check if contract and ID exist
      message.error("Không tìm thấy thông tin hợp đồng. Vui lòng thử tạo lại.");
      return;
    }

    // Kiểm tra số dư ví trước khi tiến hành
    try {
      // Lấy thông tin ví từ local storage
      const walletStorage = localStorage.getItem("wallet-storage");
      if (!walletStorage) {
        message.error("Không tìm thấy thông tin ví.");
        return;
      }

      const walletData = JSON.parse(walletStorage);
      const walletId = walletData.state?.walletId;

      if (!walletId) {
        message.error("Không tìm thấy ID ví.");
        return;
      }

      // Tính số tiền cần thanh toán
      const depositAmount = selectedOrder.designPrice * (data?.depositPercentage || 50) / 100;

      // Lấy số dư trực tiếp từ localStorage thay vì gọi API
      const currentBalance = walletData.state?.balance || 0;

      console.log("Kiểm tra số dư:", {
        currentBalance,
        depositAmount,
        orderPrice: selectedOrder.designPrice,
        depositPercent: data?.depositPercentage || 50
      });

      // Nếu số dư không đủ
      if (currentBalance < depositAmount) {
        notification.error({
          message: "Số dư không đủ",
          description:
            `Số dư ví của bạn (${formatPrice(currentBalance)}) không đủ để thanh toán khoản đặt cọc ${formatPrice(depositAmount)}. Vui lòng nạp thêm tiền vào ví để tiếp tục.`,
          duration: 8,
        });
        return;
      }
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      message.error("Không thể kiểm tra số dư ví: " + (error.response?.data?.message || error.message));
      return;
    }

    setUploading(true);
    setSigningAndPaying(true);

    try {
      // 1. Upload Signature
      let signatureImageUrl = null;
      try {
        const uploadedUrls = await uploadImages([signatureFile]); // Pass the file object
        if (!uploadedUrls || uploadedUrls.length === 0) {
          throw new Error('Không nhận được URL chữ ký sau khi tải lên.');
        }
        signatureImageUrl = uploadedUrls[0];
        console.log("Signature uploaded:", signatureImageUrl);
      } catch (uploadError) {
        console.error("Signature upload error:", uploadError);
        throw new Error("Tải lên chữ ký thất bại: " + uploadError.message);
      }
      setUploading(false);
      console.log("Contract to sign:", contractToSign);
      // 2. Sign Contract API Call
      try {
        await signContract(contractId, signatureImageUrl); // Use the extracted contractId
      } catch (signError) {
        console.error("Sign contract error:", signError);
        throw new Error("Ký hợp đồng thất bại: " + (signError.response?.data?.message || signError.message));
      }

      // 3. Process Payment (50% deposit)
      try {
        const walletStorage = localStorage.getItem("wallet-storage");
        if (!walletStorage) throw new Error("Không tìm thấy thông tin ví.");
        const walletData = JSON.parse(walletStorage);
        const walletId = walletData.state?.walletId;
        if (!walletId) throw new Error("Không tìm thấy ID ví.");

        const amount = selectedOrder.designPrice * (data?.depositPercentage || 50) / 100;
        const paymentDescription = `Thanh toán ${data?.depositPercentage || 50}% phí thiết kế cho đơn hàng #${selectedOrder.id.slice(0, 8)}`;

        console.log("Processing payment:", { walletId, serviceOrderId: selectedOrder.id, amount, description: paymentDescription });

        await api.post("/api/bill", {
          walletId,
          serviceOrderId: selectedOrder.id,
          amount,
          description: paymentDescription,
        });

        await fetchBalance();

      } catch (paymentError) {
        console.error("Payment error:", paymentError);
        // Attempt to revert contract signing? Or notify admin? For now, just throw.
        throw new Error("Thanh toán thất bại: " + (paymentError.response?.data?.error || paymentError.message));
      }

      // 4. Update Order Status
      try {
        await updateStatus(selectedOrder.id, 3); // 3: DepositSuccessful
      } catch (statusError) {
        console.error("Status update error:", statusError);
        // Notify user that payment was made but status update failed
        message.warning("Thanh toán thành công nhưng cập nhật trạng thái đơn hàng thất bại. Vui lòng liên hệ hỗ trợ.");
        // Don't throw here, as payment was successful.
      }

      // 5. Update Task Order
      try {
        if (updateTaskOrder && selectedOrder?.id) {
          // Find the appropriate workTask to update
          let taskToUpdate = null;

          if (selectedOrder.workTasks && selectedOrder.workTasks.length > 0) {
            // First look for any task with status 1 (WaitDeposit or similar)
            taskToUpdate = selectedOrder.workTasks.find(task =>
              task.status === 1 || task.status === '1'
            );

            // If not found, get the one with the lowest status
            if (!taskToUpdate) {
              taskToUpdate = selectedOrder.workTasks.sort((a, b) => {
                const statusA = typeof a.status === 'number' ? a.status : parseInt(a.status, 10);
                const statusB = typeof b.status === 'number' ? b.status : parseInt(b.status, 10);
                return statusA - statusB;
              })[0];
            }
          }

          if (taskToUpdate && taskToUpdate.id) {
            const taskPayload = {
              serviceOrderId: selectedOrder.id,
              userId: taskToUpdate.userId || selectedOrder.userId,
              dateAppointment: selectedOrder.workTasks[0].dateAppointment,
              timeAppointment: selectedOrder.workTasks[0].timeAppointment,
              status: 2, // Design status (move from WaitDeposit to Design)
              note: "Đã thanh toán cọc và ký hợp đồng"
            };

            console.log("Updating task:", taskToUpdate.id, "with payload:", taskPayload);
            await updateTaskOrder(taskToUpdate.id, taskPayload);
          } else {
            console.warn("No valid workTask found to update for order:", selectedOrder.id);
          }
        } else {
          console.warn("Cannot update task: updateTaskOrder function or selectedOrder.id is missing");
        }
      } catch (taskError) {
        console.error("Task update error:", taskError);
        message.warning("Thanh toán thành công nhưng cập nhật trạng thái công việc thất bại: " +
          (taskError.response?.data?.message || taskError.message));
      }

      // 6. Refresh Data and Close Modal
      await checkForExistingContracts(selectedOrder.id); // Refresh contracts list

      if (refreshAllData) {
        await refreshAllData(selectedOrder.id);
      }
      message.success("🎉 Đã ký và đặt cọc thành công!");
      handleCloseModal();
      await getServiceOrderById(selectedOrder.id);

    } catch (error) {
      // Catch errors from upload, sign, or payment
      message.error(error.message || "Có lỗi xảy ra trong quá trình ký và thanh toán.");
    } finally {
      setUploading(false);
      setSigningAndPaying(false);
    }
  };

  const handleSignatureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        message.error('Kích thước ảnh chữ ký không được vượt quá 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        message.error('Vui lòng tải lên tệp hình ảnh (JPG, PNG, GIF, etc.).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result); // For display
        setSignatureFile(file); // Store the file object for upload
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        message.error('Không thể đọc tệp hình ảnh.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle contract refresh - now checks for existing contracts
  const handleRefreshContract = async () => {
    if (!selectedOrder?.id) {
      message.error("Không tìm thấy ID đơn hàng.");
      return;
    }

    // message.loading("Đang tải thông tin hợp đồng...");
    await checkForExistingContracts(selectedOrder.id);
    notification.success({
      message: "Đã tải lại thông tin hợp đồng thành công.",
    });
  };

  // Determine if the main contract section card should be shown
  const shouldShowContractCard =
    contractVisibleStatuses.includes(selectedOrder?.status) ||
    contractVisibleStatusCodes.includes(selectedOrder?.status) ||
    contracts.some(c => c.modificationDate); // Always show if there's a signed contract

  // Find a signed contract if it exists
  const signedContract = contracts.find(c => c.modificationDate);

  console.log("localContractData", localContractData);
  console.log("contracts", contracts);
  console.log("signedContract", signedContract);
  console.log("isWaitDepositStatus", isWaitDepositStatus);

  if (!shouldShowContractCard) {
    return null; // Don't render anything if status is not relevant
  }

  return (
    <>
      <Card
        title={
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined /> {signedContract ? 'Hợp đồng đã ký' : 'Hợp đồng & Đặt cọc'}
          </span>
        }
        style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginTop: '24px' }}
        loading={contractLoading && !contracts.length && checkingExistingContracts} // Show loading only if loading and no contracts
        extra={
          <Button type="link" onClick={handleRefreshContract} disabled={signingAndPaying}>
            <ReloadOutlined /> Làm mới
          </Button>
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Show View Signed Contract button if a signed contract exists */}
          {signedContract && (
            <>
              <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginBottom: 10 }}>
                Hợp đồng đã được ký vào {format(new Date(signedContract.modificationDate), "dd/MM/yyyy HH:mm")}
              </Tag>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setLocalContractData(signedContract);
                  setCurrentStep(2); // View signed contract
                  setIsContractModalVisible(true);
                }}
                style={{ width: '100%' }}
              >
                Xem hợp đồng đã ký
              </Button>
            </>
          )}

          {/* Show Sign Contract button only in WaitDeposit status AND if no signed contract */}
          {isWaitDepositStatus && !signedContract && (
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={handleOpenModal}
              style={{ width: '100%' }}
            >
              Ký hợp đồng & Thanh toán cọc
            </Button>
          )}

          {/* Message for statuses after WaitDeposit but before signed (shouldn't happen with new flow, but good fallback) */}
          {!isWaitDepositStatus && !signedContract &&
            (contractVisibleStatuses.includes(selectedOrder?.status) || contractVisibleStatusCodes.includes(selectedOrder?.status)) && (
              <Alert message="Hợp đồng chưa được ký. Vui lòng kiểm tra lại quy trình." type="warning" showIcon />
            )}
        </Space>
      </Card>

      {/* Combined Modal for Contract Generation, Signing, and Payment */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Hợp đồng & Thanh toán Đặt cọc</Title>}
        open={isContractModalVisible}
        onCancel={handleCloseModal}
        width="80%" // Wider modal
        style={{ top: 20 }}
        footer={null} // Custom footer buttons within steps
        maskClosable={!generatingContract && !signingAndPaying && !uploading} // Prevent closing during async ops
        destroyOnClose={false} // Don't destroy to preserve contract data
        styles={{
          body: {
            maxHeight: '85vh',   // 💥 Giới hạn chiều cao
            overflowY: 'auto',   // 💥 Cuộn bên trong
            paddingRight: '16px', // 💥 Không bị che scroll
            scrollbarWidth: 'thin', // 💥 Scrollbar nhỏ
            scrollbarColor: '#d9d9d9 #f5f5f5' // 💥 Màu scrollbar
          },
        }}
      >
        <Spin spinning={generatingContract || signingAndPaying || uploading || checkingExistingContracts}
          tip={
            uploading ? "Đang tải chữ ký..." :
              generatingContract ? "Đang tạo hợp đồng..." :
                checkingExistingContracts ? "Đang kiểm tra hợp đồng..." :
                  "Đang xử lý..."
          }
        >
          <Steps current={currentStep} style={{ marginBottom: 24 }}>
            <Step title="Xác nhận thông tin" />
            <Step title="Xem & Ký hợp đồng" />
            <Step title="Hoàn thành" />
          </Steps>

          {/* Step 0: Information Form */}
          {currentStep === 0 && (
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
              <Title level={5}>Bước 1: Xác nhận thông tin cá nhân</Title>
              <Paragraph type="secondary" style={{ fontSize: 14 }}>
                📝 <Text strong>Vui lòng kiểm tra và cập nhật thông tin cá nhân</Text> của bạn bên dưới. Thông tin này sẽ được sử dụng để tạo hợp đồng.
                <br />
                📦 <Text strong>Địa chỉ</Text> bạn cung cấp sẽ được dùng để giao hàng sau khi thiết kế hoàn tất.
              </Paragraph>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  name: userInfo?.name,
                  email: userInfo?.email,
                  phone: userInfo?.phone,
                  designPrice: selectedOrder?.designPrice
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, marginRight: '10px' }}>
                    <Title level={5} style={{ marginTop: 20 }}>Thông tin cá nhân</Title>
                    <Form.Item
                      name="name"
                      label="Họ và tên"
                      rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[{ required: true, type: 'email', message: "Vui lòng nhập email hợp lệ!" }]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="nguyenvana@example.com" />
                    </Form.Item>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[{ required: true, pattern: /^0\d{9}$/, message: "Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)!" }]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
                    </Form.Item>
                    <Form.Item
                      name="designPrice"
                      label="Phí thiết kế"
                    >
                      <Input
                        prefix={<DollarOutlined />}
                        readOnly
                        value={formatPrice(selectedOrder?.designPrice || 0)}
                        style={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.85)' }}
                        disabled
                      />
                    </Form.Item>
                    <Alert
                      // message={`Bạn sẽ thanh toán ${(selectedOrder.depositPercentage || 50)}% phí thiết kế (${formatPrice((selectedOrder?.designPrice || 0) * (selectedOrder.depositPercentage || 50) / 100)}) để đặt cọc.`}
                      message={`Bạn sẽ thanh toán ${(data?.depositPercentage || 50)}% phí thiết kế (${formatPrice(Math.round((selectedOrder?.designPrice || 0) * (data?.depositPercentage || 50) / 100))}) để đặt cọc.`}
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  </div>
                  <div style={{ flex: 1, marginLeft: '10px' }}>

                    {/* Address Form Integration */}
                    <Title level={5} style={{ marginTop: 20 }}>Địa chỉ giao hàng</Title>
                    <AddressForm
                      form={form}
                      onAddressChange={handleAddressChange}
                      useExistingAddress={false}
                      initialAddress={userInfo?.address || null}
                      showUserInfo={false}
                    />
                  </div>
                </div>
              </Form>

              <div style={{ textAlign: 'right', marginTop: 20 }}>
                <Button onClick={handleCloseModal} style={{ marginRight: 8 }}>Hủy</Button>
                <Button type="primary" onClick={handleGenerateContract} loading={generatingContract}>
                  Xác nhận thông tin
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Contract Preview & Signature */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Title level={5}>Bước 2: Xem lại và Ký hợp đồng</Title>
              <Paragraph type="secondary">
                Vui lòng xem kỹ nội dung hợp đồng dưới đây. Sau đó, tải lên chữ ký của bạn và xác nhận để hoàn tất việc đặt cọc.
              </Paragraph>

              {/* Contract PDF Display */}

              {contracts.length > 0 && contracts[0].description ? (
                <iframe
                  src={contracts[0].description}
                  style={{ width: "100%", height: "70vh", border: "1px solid #d9d9d9", marginBottom: 15, flexGrow: 1 }}
                  title="Contract PDF Preview"
                />
              ) : localContractData?.description ? (
                <iframe
                  src={localContractData.description}
                  style={{ width: "100%", height: "70vh", border: "1px solid #d9d9d9", marginBottom: 15, flexGrow: 1 }}
                  title="Contract PDF Preview"
                />
              ) : (
                <div style={{ height: "50vh", display: 'flex', alignItems: 'center', justifyContent: 'center', border: "1px solid #d9d9d9", marginBottom: 15 }}>
                  <Text type="secondary">Không tìm thấy hợp đồng. Vui lòng thử tạo lại.</Text>
                </div>
              )}

              <Divider>Chữ ký của bạn</Divider>
              <Text strong type="secondary" style={{ display: 'block', marginBottom: 10, color: '#1890ff' }}>
                📌 Vui lòng tải lên hình ảnh chữ ký của bạn (JPG, PNG) để xác nhận hợp đồng.
              </Text>
              <Collapse bordered={false} style={{ marginBottom: 24 }}>
                <Collapse.Panel header="📘 Hướng dẫn tạo và tải lên chữ ký" key="1">
                  <div style={{ padding: 8 }}>
                    <Typography.Title level={5} style={{ marginTop: 0 }}>🔹 Chuẩn bị hình ảnh chữ ký</Typography.Title>
                    <ul style={{ paddingLeft: 20 }}>
                      <li><Text strong>Ký trên giấy và chụp ảnh:</Text> Dùng giấy trắng và bút mực đen. Chụp rõ nét, đủ sáng.</li>
                      <li><Text strong>Quét (scan):</Text> Dùng máy scan chuyển chữ ký sang file ảnh.</li>
                      <li><Text strong>Ứng dụng vẽ:</Text> Vẽ chữ ký trên điện thoại/máy tính bảng rồi xuất ra ảnh PNG/JPG.</li>
                      <li><Text strong>Bảng vẽ điện tử:</Text> Tạo chữ ký số trực tiếp bằng bút vẽ.</li>
                    </ul>

                    <Typography.Title level={5} style={{ marginTop: 16 }}>🔹 Yêu cầu về hình ảnh chữ ký</Typography.Title>
                    <ul style={{ paddingLeft: 20 }}>
                      <li>Định dạng: <Text code>JPG</Text>, <Text code>PNG</Text>, <Text code>JPEG</Text>, <Text code>GIF</Text></li>
                      <li>Kích thước file tối đa: <Text strong>5MB</Text></li>
                      <li>Độ phân giải khuyến nghị: <Text strong>300 DPI+</Text></li>
                      <li>Nền: <Text>trắng hoặc trong suốt (ưu tiên)</Text></li>
                      <li>Màu sắc: <Text>đen hoặc xanh đậm</Text></li>
                    </ul>

                    <Typography.Title level={5} style={{ marginTop: 16 }}>🔹 Các bước tải lên chữ ký</Typography.Title>
                    <ol style={{ paddingLeft: 20 }}>
                      <li>Đọc kỹ hợp đồng bên trên.</li>
                      <li>Nhấn nút <Text code>Tải lên chữ ký (ảnh)</Text>.</li>
                      <li>Chọn file hình ảnh từ thiết bị.</li>
                      <li>Xem trước chữ ký, nhấn X để đổi nếu cần.</li>
                      <li>Nhấn <Text code>Xác nhận & Thanh toán cọc</Text> để hoàn tất.</li>
                    </ol>

                    <Typography.Title level={5} style={{ marginTop: 16 }}>🔹 Gặp sự cố?</Typography.Title>
                    <ul style={{ paddingLeft: 20 }}>
                      <li>Kiểm tra định dạng và kích thước ảnh.</li>
                      <li>Thử trình duyệt khác hoặc tải lại trang.</li>
                      <li>Kiểm tra kết nối internet.</li>
                      <li>Thử lại với hình ảnh khác nếu ảnh bị mờ.</li>
                    </ul>

                    <Divider style={{ marginTop: 24, marginBottom: 12 }}>📞 Hỗ trợ</Divider>
                    <Paragraph type="secondary">
                      Nếu bạn cần thêm hỗ trợ về việc tải lên chữ ký, vui lòng liên hệ với đội ngũ hỗ trợ khách hàng của chúng tôi qua:
                    </Paragraph>
                    <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                      <li>Email: <Text code>support@greenspace.vn</Text></li>
                      <li>Hotline: <Text code>1900-xxxx-xxx</Text> (8:00 - 18:00, Thứ Hai - Thứ Bảy)</li>
                    </ul>


                    <Alert
                      type="warning"
                      showIcon
                      message="Lưu ý pháp lý"
                      description="Chữ ký điện tử của bạn có giá trị pháp lý như chữ ký tay. Không sử dụng chữ ký của người khác."
                      style={{ marginTop: 16 }}
                    />
                  </div>
                </Collapse.Panel>
              </Collapse>


              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ marginBottom: 10, minHeight: '100px', border: '1px dashed #d9d9d9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', position: 'relative' }}>
                  {previewImage ? (
                    <>
                      <Image
                        src={previewImage}
                        alt="Chữ ký xem trước"
                        style={{ maxHeight: "100px", objectFit: "contain" }}
                        preview={false}
                      />
                      <Button
                        type="link"
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => { setPreviewImage(null); setSignatureFile(null); document.getElementById('signature-upload-input').value = null; }} // Reset file input too
                        style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,255,255,0.7)', borderRadius: '50%' }}
                      />
                    </>
                  ) : (
                    <Button
                      type="dashed"
                      icon={<UploadOutlined />}
                      onClick={() => document.getElementById('signature-upload-input').click()}
                    >
                      Tải lên chữ ký (ảnh)
                    </Button>
                  )}
                  <input
                    id="signature-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleSignatureUpload}
                  />
                </div>
              </div>

              <Alert
                type="warning"
                showIcon
                message="Xác nhận ký và thanh toán"
                description={
                  <>
                    <p>Bằng việc nhấn nút "Xác nhận & Thanh toán cọc", bạn đồng ý với các điều khoản trong hợp đồng và đồng ý thanh toán {formatPrice((selectedOrder?.designPrice || 0) * (data?.depositPercentage || 50) / 100)}.</p>
                    <p><strong>Lưu ý:</strong> Vui lòng đảm bảo tài khoản ví của bạn có đủ số dư để thanh toán khoản đặt cọc. Nếu không đủ, quá trình ký hợp đồng sẽ không thể hoàn tất.</p>
                    {/* Hiển thị số dư ví và số tiền cần thanh toán */}

                  </>
                }
                style={{ marginBottom: 16 }}
              />
              {(() => {
                const walletStr = localStorage.getItem("wallet-storage");
                const wallet = walletStr ? JSON.parse(walletStr) : null;
                const balance = wallet?.state?.balance || 0;
                const depositAmount = Math.round((selectedOrder?.designPrice || 0) * (data?.depositPercentage || 50) / 100);

                const isEnough = balance >= depositAmount;

                return (
                  <Card
                    type="inner"
                    title={
                      <span style={{ color: isEnough ? '#389e0d' : '#faad14' }}>
                        {isEnough ? ' Thông tin số dư ví' : '⚠️ Thông tin số dư ví'}
                      </span>
                    }
                    style={{
                      backgroundColor: isEnough ? '#f6ffed' : '#fffbe6',
                      borderColor: isEnough ? '#b7eb8f' : '#ffe58f',
                      marginTop: 16,
                      marginBottom: 16,
                      borderRadius: 8,
                    }}
                    styles={{
                      header: {
                        borderBottom: `1px solid ${isEnough ? '#b7eb8f' : '#ffe58f'}`,
                        fontWeight: 600,
                      },
                      body: { padding: '12px 16px' }
                    }}
                  >
                    <p><Text strong>Số dư ví hiện tại:</Text> {formatPrice(balance)}</p>
                    <p><Text strong>Số tiền cần đặt cọc:</Text> {formatPrice(depositAmount)}</p>

                    {balance < depositAmount ? (
                      <div style={{ marginTop: 12 }}>
                        <Alert
                          type="error"
                          message="Số dư không đủ để thanh toán. Vui lòng nạp thêm tiền để tiếp tục."
                          showIcon
                          style={{ marginBottom: 12 }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            type="primary"
                            danger
                            onClick={() => navigate("/userwallets")}
                          >
                            Nạp tiền vào ví
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Alert
                        type="success"
                        message="Số dư ví đủ để thanh toán đặt cọc."
                        showIcon
                        style={{ marginTop: 12 }}
                      />
                    )}
                  </Card>
                );
              })()}

              <div style={{ textAlign: 'right', marginTop: 'auto', paddingTop: 15, borderTop: '1px solid #f0f0f0' }}>
                <Button onClick={() => {
                  // Reset address form to default state
                  resetAddressFormToDefault();

                  // Move back to step 0
                  setCurrentStep(0);
                }} style={{ marginRight: 8 }} disabled={signingAndPaying}>
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  onClick={handleSignAndPay}
                  loading={signingAndPaying || uploading}
                  disabled={!previewImage || (!localContractData?.description && !contracts.length) ||
                    (() => {
                      const walletStr = localStorage.getItem("wallet-storage");
                      const wallet = walletStr ? JSON.parse(walletStr) : null;
                      const balance = wallet?.state?.balance || 0;
                      const depositAmount = Math.round((selectedOrder?.designPrice || 0) * (data?.depositPercentage || 50) / 100);
                      return balance < depositAmount;
                    })()} // Disable if no signature or contract
                >
                  {uploading ? "Đang tải chữ ký..." : "Xác nhận & Thanh toán cọc"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: View Signed Contract */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '75vh' }}>
              <Title level={5}>Hợp đồng đã ký</Title>

              {signedContract ? (
                <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginBottom: 10 }}>
                  Hợp đồng đã được ký vào {format(new Date(signedContract.modificationDate), "dd/MM/yyyy HH:mm")}
                </Tag>
              ) : (
                <Alert message="Chưa tìm thấy hợp đồng đã ký" type="info" showIcon style={{ marginBottom: 10 }} />
              )}

              {signedContract?.description ? (
                <iframe
                  src={signedContract.description}
                  style={{ width: "100%", flexGrow: 1, border: "1px solid #d9d9d9", marginBottom: 15 }}
                  title="Contract PDF Signed"
                />
              ) : (
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: "1px solid #d9d9d9", marginBottom: 15 }}>
                  <Text type="secondary">Không thể tải hợp đồng đã ký.</Text>
                </div>
              )}
              <div style={{ textAlign: 'right', marginTop: 'auto', paddingTop: 15, borderTop: '1px solid #f0f0f0' }}>
                <Button onClick={handleCloseModal} type="primary">Đóng</Button>
              </div>
            </div>
          )}
        </Spin>
      </Modal>

      {/* Separate Modal just for viewing already signed contract - removed in favor of the unified modal */}
    </>
  );
};

export default ContractSection; 