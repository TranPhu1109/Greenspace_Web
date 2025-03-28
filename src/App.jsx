import AppRoutes from "./routes";
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <div className="p-4">
        <AppRoutes />
      </div>
    </>
  );
}

export default App;
