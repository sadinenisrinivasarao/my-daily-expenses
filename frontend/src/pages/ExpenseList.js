import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Card,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Space,
  Grid,
  Divider,
} from "antd";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  CoffeeOutlined,
  HomeOutlined,
  ShoppingOutlined,
  SkinOutlined,
  CarOutlined,
  DollarOutlined,
  AppstoreOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

/* ---------- CATEGORY THEME ---------- */
const categoryTheme = {
  FOOD: { color: "#1677ff", bg: "#e6f4ff", icon: <CoffeeOutlined /> },
  ACCOMMODATION: { color: "#722ed1", bg: "#f9f0ff", icon: <HomeOutlined /> },
  SHOPPING: { color: "#fa8c16", bg: "#fff7e6", icon: <ShoppingOutlined /> },
  PERSONAL_CARE: { color: "#13c2c2", bg: "#e6fffb", icon: <SkinOutlined /> },
  TRAVEL: { color: "#52c41a", bg: "#f6ffed", icon: <CarOutlined /> },
  SALARY: { color: "#389e0d", bg: "#f6ffed", icon: <DollarOutlined /> },
  OTHER_INCOME: { color: "#389e0d", bg: "#f6ffed", icon: <DollarOutlined /> },
  OTHERS: { color: "#595959", bg: "#fafafa", icon: <AppstoreOutlined /> },
};

export default function ExpenseList() {
  const [data, setData] = useState([]);
  const [paymentMode, setPaymentMode] = useState();
  const [dateRange, setDateRange] = useState([]);
  const [openCats, setOpenCats] = useState({});
  const nav = useNavigate();
  const screens = useBreakpoint();

  useEffect(() => {
    api.get("/expenses").then(res => setData(res.data));
  }, []);

  /* ---------- FILTER ---------- */
  const filteredData = useMemo(() => {
    return data.filter(e => {
      const pmMatch = paymentMode ? e.paymentMode === paymentMode : true;
      const dateMatch =
        dateRange?.length === 2 && e.entryDate
          ? dayjs(e.entryDate).isBetween(
              dateRange[0],
              dateRange[1],
              "day",
              "[]"
            )
          : true;
      return pmMatch && dateMatch;
    });
  }, [data, paymentMode, dateRange]);

  /* ---------- GROUP ---------- */
  const groupedByCategory = useMemo(() => {
    return filteredData.reduce((acc, e) => {
      const cat = e.category || "OTHERS";
      acc[cat] = acc[cat] || [];
      acc[cat].push(e);
      return acc;
    }, {});
  }, [filteredData]);

  /* ---------- NET TOTAL ---------- */
  const monthlyTotal = useMemo(() => {
    return filteredData.reduce((sum, e) => {
      const amt = e.amount || 0;
      return e.type === "IN" ? sum + amt : sum - amt;
    }, 0);
  }, [filteredData]);

  const toggleCategory = cat =>
    setOpenCats(p => ({ ...p, [cat]: !p[cat] }));

  /* ---------- TABLE ---------- */
  const columns = [
    {
      title: "Date",
      dataIndex: "entryDate",
      render: d => dayjs(d).format("DD MMM YYYY"),
    },
    { title: "Description", dataIndex: "description" },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (v, r) => (
        <strong style={{ color: r.type === "IN" ? "#52c41a" : "#ff4d4f" }}>
          ₹ {v}
        </strong>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      render: t => (
        <span style={{ color: t === "IN" ? "#52c41a" : "#ff4d4f" }}>
          {t === "IN" ? "Income" : "Paid Out"}
        </span>
      ),
    },
    {
      title: "Action",
      render: (_, r) => (
        <Button type="link" onClick={() => nav(`/edit/${r._id}`)}>
          Edit
        </Button>
      ),
    },
  ];

  /* ---------- MOBILE CARDS ---------- */
  const MobileCards = ({ items }) => (
    <Space direction="vertical" style={{ width: "100%" }}>
      {items.map(e => {
        const theme = categoryTheme[e.category] || categoryTheme.OTHERS;

        return (
          <motion.div
            key={e._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ display: "flex", overflowX: "auto", borderRadius: 12 }}
          >
            <Card
              size="small"
              style={{ minWidth: "100%", background: theme.bg }}
            >
              <Row justify="space-between">
                <strong>{e.description}</strong>
                <strong
                  style={{ color: e.type === "IN" ? "#52c41a" : "#ff4d4f" }}
                >
                  ₹ {e.amount}
                </strong>
              </Row>
              <div style={{ fontSize: 12 }}>
                {theme.icon} {e.category} •{" "}
                {e.paymentMode?.replace("_", " ")}
              </div>
              <div style={{ fontSize: 12, color: "#777" }}>
                {dayjs(e.entryDate).format("DD MMM YYYY")}
              </div>
            </Card>

            <div
              style={{
                minWidth: 140,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Button type="link" onClick={() => nav(`/edit/${e._id}`)}>
                Edit
              </Button>
              <Button danger type="link">
                Delete
              </Button>
            </div>
          </motion.div>
        );
      })}
    </Space>
  );

  return (
    <div className="page">
      <Card title="Transactions" style={{ borderRadius: 16 }}>
        {/* ---------- STICKY FILTER ---------- */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#fff",
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={8}>
              <Select
                size="large"
                allowClear
                placeholder="Payment mode"
                style={{ width: "100%" }}
                onChange={setPaymentMode}
                options={[
                  { label: "Cash", value: "CASH" },
                  { label: "Credit Card", value: "CREDIT_CARD" },
                  { label: "Bank Transfer", value: "BANK_TRANSFER" },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={10}>
              <RangePicker
                size="large"
                style={{ width: "100%" }}
                onChange={setDateRange}
              />
            </Col>
          </Row>
        </div>

        {/* ---------- CATEGORIES ---------- */}
        {Object.keys(groupedByCategory).map(cat => {
          const items = groupedByCategory[cat];
          const theme = categoryTheme[cat] || categoryTheme.OTHERS;
          const total = items.reduce((s, e) => s + (e.amount || 0), 0);
          const isOpen = openCats[cat] !== false;

          return (
            <Card
              key={cat}
              type="inner"
              style={{ marginBottom: 16, borderRadius: 14 }}
              title={
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleCategory(cat)}
                >
                  <Space>
                    <span style={{ color: theme.color }}>{theme.icon}</span>
                    <strong>{cat.replace("_", " ")}</strong>
                  </Space>
                  <Space>
                    <span style={{ color: theme.color }}>₹ {total}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <DownOutlined />
                    </motion.span>
                  </Space>
                </Row>
              }
            >
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 22 }}
                  >
                    {screens.md ? (
                      <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={items}
                        pagination={false}
                      />
                    ) : (
                      <MobileCards items={items} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}

        <Divider />
        <Row justify="space-between">
          <strong>Net Total ({dayjs().format("MMMM YYYY")})</strong>
          <strong
            style={{
              color: monthlyTotal >= 0 ? "#52c41a" : "#ff4d4f",
              fontSize: 18,
            }}
          >
            ₹ {monthlyTotal}
          </strong>
        </Row>
      </Card>
    </div>
  );
}
