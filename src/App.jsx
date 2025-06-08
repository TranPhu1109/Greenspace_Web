import { App as AntApp } from 'antd';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from "./routes";
import ScrollToTop from './components/ScrollToTop';
import SignalRStatus from './components/Common/SignalRStatus';

function App() {
  return (
    <AntApp>
      <Router>
        <ScrollToTop />
        <SignalRStatus showInProduction={false} />
        <div className="p-4">
          <AppRoutes />
        </div>
      </Router>
    </AntApp>
  );
}

export default App;
