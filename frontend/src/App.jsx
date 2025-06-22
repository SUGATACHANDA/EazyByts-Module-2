import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecentTrackedStocks from "./pages/RecentTrackedStock";
import RealTimeStockChart from "./components/RealTimeStockChart";
import StockTracker from "./pages/StockTracker";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StockTracker />} />
        <Route path="/recent" element={<RecentTrackedStocks />} />
      </Routes>
    </Router>
  );
}

export default App;
