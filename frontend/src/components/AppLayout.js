import { Layout, Menu, Button, Drawer, Grid } from "antd";
import {
  DashboardOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  MenuOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { logout } from "../utils/auth";
import { useState } from "react";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function AppLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/add", icon: <PlusCircleOutlined />, label: "Add Expense" },
    { key: "/expenses", icon: <UnorderedListOutlined />, label: "All Expenses" }
  ];

  const MenuContent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[loc.pathname]}
      onClick={(e) => {
        nav(e.key);
        setDrawerOpen(false);
      }}
      items={menuItems}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider collapsible>
          <div className="logo">💰 ExpensePro</div>
          {MenuContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          bodyStyle={{ padding: 0 }}
        >
          <div className="logo" style={{ color: "#000" }}>
            💰 ExpensePro
          </div>
          {MenuContent}
        </Drawer>
      )}

      <Layout>
        {/* Header */}
        <Header className="header">
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{ fontSize: 18 }}
            />
          )}

          <div style={{ flex: 1 }} />

          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={logout}
          >
            Logout
          </Button>
        </Header>

        {/* Page Content */}
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
