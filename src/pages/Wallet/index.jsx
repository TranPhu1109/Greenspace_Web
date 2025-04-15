import React, { useState } from 'react';
import { Layout, Card, Tabs, message } from "antd";
import { WalletOutlined, TransactionOutlined, DollarOutlined, HistoryOutlined } from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletBalance from "./components/WalletBalance";
import RechargeForm from "./components/RechargeForm";
import TransactionHistory from "./components/TransactionHistory";
import PaymentHistory from "./components/PaymentHistory";
import "./styles.scss";

const { Content } = Layout;

const WalletPage = () => {
  const handleRecharge = (values) => {
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
                    key: 'deposit-history',
                    label: (
                      <span className="tab-label">
                        <TransactionOutlined />
                        <span>Lịch sử nạp tiền</span>
                      </span>
                    ),
                    children: <TransactionHistory />,
                  },
                  {
                    key: 'payment-history',
                    label: (
                      <span className="tab-label">
                        <DollarOutlined />
                        <span>Lịch sử thanh toán</span>
                      </span>
                    ),
                    children: <PaymentHistory />,
                  },
                  // {
                  //   key: 'all-history',
                  //   label: (
                  //     <span className="tab-label">
                  //       <HistoryOutlined />
                  //       <span>Tất cả giao dịch</span>
                  //     </span>
                  //   ),
                  //   children: (
                  //     <div className="history-tabs">
                  //       <Tabs 
                  //         defaultActiveKey="deposit"
                  //         items={[
                  //           {
                  //             key: 'deposit',
                  //             label: 'Nạp tiền',
                  //             children: <TransactionHistory />
                  //           },
                  //           {
                  //             key: 'payment',
                  //             label: 'Thanh toán',
                  //             children: <PaymentHistory />
                  //           }
                  //         ]}
                  //       />
                  //     </div>
                  //   ),
                  // },
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