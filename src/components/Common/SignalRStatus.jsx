import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Button, Modal, Typography, Space, Divider } from 'antd';
import { 
  WifiOutlined, 
  DisconnectOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import signalRService from '../../services/signalRService';

const { Text, Paragraph } = Typography;

const SignalRStatus = ({ showInProduction = false }) => {
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Only show in development or when explicitly enabled for production
  const isProduction = import.meta.env.PROD;
  if (isProduction && !showInProduction) {
    return null;
  }

  useEffect(() => {
    const updateStatus = () => {
      const state = signalRService.getConnectionState();
      const connected = signalRService.isConnected();
      setConnectionState(state);
      setIsConnected(connected);
    };

    // Update status immediately
    updateStatus();

    // Update status every 2 seconds
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    } else if (connectionState === 'Connecting' || connectionState === 'Reconnecting') {
      return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    } else {
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    }
  };

  const getStatusColor = () => {
    if (isConnected) return 'success';
    if (connectionState === 'Connecting' || connectionState === 'Reconnecting') return 'processing';
    return 'error';
  };

  const handleShowDetails = async () => {
    setIsLoading(true);
    try {
      const health = await signalRService.healthCheck();
      const testResult = await signalRService.testConnection();
      setHealthData({ ...health, serverTest: testResult });
      setShowModal(true);
    } catch (error) {
      console.error('Failed to get SignalR details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = async () => {
    setIsLoading(true);
    try {
      await signalRService.resetConnection();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await signalRService.startConnection(user.id, user.roleName);
    } catch (error) {
      console.error('Failed to reconnect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ 
        position: 'fixed', 
        top: 20, 
        right: 20, 
        zIndex: 1000,
        background: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #d9d9d9'
      }}>
        <Space>
          <Tooltip title={`SignalR: ${connectionState}`}>
            <Badge 
              status={getStatusColor()} 
              text={
                <Space size={4}>
                  {getStatusIcon()}
                  <Text style={{ fontSize: '12px' }}>
                    SignalR: {connectionState}
                  </Text>
                </Space>
              }
            />
          </Tooltip>
          
          <Button 
            type="text" 
            size="small" 
            icon={<InfoCircleOutlined />}
            onClick={handleShowDetails}
            loading={isLoading}
          />
          
          <Button 
            type="text" 
            size="small" 
            icon={<ReloadOutlined />}
            onClick={handleReconnect}
            loading={isLoading}
            disabled={isConnected}
          />
        </Space>
      </div>

      <Modal
        title="SignalR Connection Details"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {healthData && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Connection Status:</Text>
                <br />
                <Badge 
                  status={getStatusColor()} 
                  text={`${healthData.connectionState} (${healthData.status})`}
                />
              </div>

              <div>
                <Text strong>Connection ID:</Text>
                <br />
                <Text code>{healthData.connectionId || 'N/A'}</Text>
              </div>

              <div>
                <Text strong>Hub URL:</Text>
                <br />
                <Text code>{healthData.hubUrl}</Text>
              </div>

              <div>
                <Text strong>Current User:</Text>
                <br />
                <Text>
                  ID: <Text code>{healthData.user?.userId || 'N/A'}</Text>
                  {' | '}
                  Role: <Text code>{healthData.user?.userRole || 'N/A'}</Text>
                </Text>
              </div>

              <div>
                <Text strong>Server Reachability:</Text>
                <br />
                <Badge 
                  status={healthData.serverTest?.reachable ? 'success' : 'error'} 
                  text={
                    healthData.serverTest?.reachable 
                      ? `Reachable (Status: ${healthData.serverTest.status})`
                      : `Not Reachable (${healthData.serverTest?.error || 'Unknown error'})`
                  }
                />
              </div>

              <div>
                <Text strong>Last Updated:</Text>
                <br />
                <Text>{new Date(healthData.timestamp).toLocaleString()}</Text>
              </div>

              <Divider />

              <div>
                <Text strong>Troubleshooting:</Text>
                <Paragraph style={{ marginTop: 8, fontSize: '12px' }}>
                  {!healthData.serverTest?.reachable && (
                    <>
                      • Check if backend server is running<br />
                      • Verify network connectivity<br />
                      • Check CORS configuration<br />
                    </>
                  )}
                  {healthData.serverTest?.reachable && !isConnected && (
                    <>
                      • Server is reachable but SignalR connection failed<br />
                      • Check SignalR Hub configuration<br />
                      • Verify WebSocket support<br />
                      • Check for proxy/firewall blocking<br />
                    </>
                  )}
                  {isConnected && (
                    <>
                      • Connection is healthy<br />
                      • Real-time updates should work normally<br />
                    </>
                  )}
                </Paragraph>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </>
  );
};

export default SignalRStatus;
