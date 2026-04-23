import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ZenoCompiler from './ZenoCompiler';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ZenoCompiler />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
