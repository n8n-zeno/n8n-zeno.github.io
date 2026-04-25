import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ZenoCompiler from './ZenoCompiler';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Checkout from './pages/Checkout';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/" element={<ZenoCompiler />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;