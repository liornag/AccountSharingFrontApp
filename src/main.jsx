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
import AppLayout from "./pages/AppLayout.jsx"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import Join from "./pages/Join.jsx"

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
          <Route path="/" element={<ProtectedRoute ><Home /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/uploadBill" element={<ProtectedRoute><UploadBill /></ProtectedRoute>} />
          <Route path="/select-items" element={<ProtectedRoute><SelectItems /></ProtectedRoute>} />,
          <Route path="/bill/:sessionId" element={<ProtectedRoute><Bill/></ProtectedRoute>} />
          <Route path="/join" element={<Join/>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);