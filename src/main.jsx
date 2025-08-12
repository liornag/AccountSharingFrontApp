import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import UploadBill from "./pages/UploadBill.jsx";
import Register from "./pages/Register.jsx";
import SelectItems from './pages/SelectItems';
import { AuthProvider } from "./hooks/useAuth";
import Bill from "./pages/Bill.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/uploadBill" element={<ProtectedRoute><UploadBill /></ProtectedRoute>} />
          <Route path="/select-items" element={<ProtectedRoute><SelectItems /></ProtectedRoute>} />,
          <Route path="/bill/:sessionId" element={<ProtectedRoute><Bill/></ProtectedRoute>} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);