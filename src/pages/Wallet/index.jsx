import React, { useState } from 'react';
import { Layout, Card, Tabs, message } from "antd";
import { WalletOutlined, TransactionOutlined } from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletBalance from "./components/WalletBalance";
import RechargeForm from "./components/RechargeForm";
import TransactionHistory from "./components/TransactionHistory";
import "./styles.scss";

const { Content } = Layout;

const WalletPage = () => {
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
              <Tabs 
                defaultActiveKey="recharge"
                className="wallet-tabs"
                items={[
                  {
                    key: 'recharge',
                    label: (
                      <span className="tab-label">
                        <WalletOutlined />
                        <span>Nạp tiền</span>
                      </span>
                    ),
                    children: (
                      <>
                        <WalletBalance />
                        <RechargeForm onFinish={handleRecharge} />
                      </>
                    ),
                  },
                  {
                    key: 'history',
                    label: (
                      <span className="tab-label">
                        <TransactionOutlined />
                        <span>Lịch sử giao dịch</span>
                      </span>
                    ),
                    children: <TransactionHistory />,
                  },
                ]}
              />
            </Card>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default WalletPage; 