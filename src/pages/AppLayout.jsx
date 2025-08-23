import { Layout, Drawer, Menu, Button, Avatar } from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { LogoutOutlined } from "@ant-design/icons";
import { FileAddOutlined } from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import stringToColor from "../lib/utils";

const { Header, Content } = Layout;

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const initials = user?.username?.slice(0, 2)?.toUpperCase() || "";
  const bgColor = stringToColor(initials);

  const items = [
    { key: "dashboard", icon: <HomeOutlined />, label: "Dashboard" },
    { key: "bills", icon: <FileTextOutlined />, label: "Bills" },
    { key: "friends", icon: <TeamOutlined />, label: "Friends" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
  ];

  const handleNavigate = (path) => {
    navigate(`/${path}`);
    setDrawerOpen(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          padding: "0 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      >
        {user && user.username ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Avatar style={{ backgroundColor: bgColor }}>{initials}</Avatar>
            <div style={{ fontWeight: "bold", fontSize: 18 }}>
              {user.username}
            </div>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => { 
                logout()
              }} 
            />
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button type="link" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button type="primary" onClick={() => navigate("/register")}>
              Register
            </Button>
          </div>
        )}
        {/* Desktop menu */}
        <div
          className="desktop-menu"
          style={{ display: "none", flex: 1, marginLeft: 24 }}
        >
          <Menu
            mode="horizontal"
            items={items}
            selectedKeys={[location.pathname]}
            onClick={(e) => handleNavigate(e.key)}
          />
        </div>

        {/* Mobile hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            type="text"
            icon={<HomeOutlined style={{ fontSize: 20 }} />}
            onClick={() => navigate("/")}
          />
          <Button
            type="text"
            icon={<FileAddOutlined style={{ fontSize: 20 }} />}
            onClick={() => navigate("/uploadBill")}
          />
        </div>
      </Header>

      {/* Drawer for mobile */}
      <Drawer
        title="Menu"
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Menu
          mode="inline"
          items={items}
          selectedKeys={[location.pathname]}
          onClick={(e) => handleNavigate(e.key)}
        />
      </Drawer>

      {/* Page Content */}
      <Content style={{ padding: 16, background: "#f5f5f5" }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
