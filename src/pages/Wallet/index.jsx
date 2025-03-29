import React from "react";
import { Layout, Card, Tabs, message } from "antd";
import { WalletOutlined, TransactionOutlined } from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletBalance from "./components/WalletBalance";
import RechargeForm from "./components/RechargeForm";
import TransactionHistory from "./components/TransactionHistory";
import "./styles.scss";

const { Content } = Layout;
const { TabPane } = Tabs;

const WalletPage = () => {
  // Mock data
  const mockTransactions = [
    {
      key: '1',
      date: '2024-03-15',
      type: 'Nạp tiền',
      amount: '+500,000đ',
      status: 'Thành công',
      method: 'Chuyển khoản ngân hàng'
    },
    {
      key: '2',
      date: '2024-03-14',
      type: 'Thanh toán',
      amount: '-200,000đ',
      status: 'Thành công',
      method: 'Ví điện tử'
    },
  ];

  const handleRecharge = (values) => {
    console.log("Form values:", values);
    message.info("Đang tạo mã QR VNPay...");
  };

  return (
    <Layout className="wallet-layout">
      <Header />
      <Content>
        <div className="wallet-content">
          <div className="container">
            <Card className="wallet-card">
              <Tabs defaultActiveKey="recharge">
                <TabPane 
                  tab={
                    <span>
                      <WalletOutlined /> Nạp tiền
                    </span>
                  } 
                  key="recharge"
                >
                  <WalletBalance balance={0} />
                  <RechargeForm onFinish={handleRecharge} />
                </TabPane>
                <TabPane 
                  tab={
                    <span>
                      <TransactionOutlined /> Lịch sử giao dịch
                    </span>
                  } 
                  key="history"
                >
                  <TransactionHistory transactions={mockTransactions} />
                </TabPane>
              </Tabs>
            </Card>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default WalletPage; 