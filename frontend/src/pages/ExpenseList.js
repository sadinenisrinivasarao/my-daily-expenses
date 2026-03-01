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
  Typography,
  Spin,
} from "antd";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
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
  TeamOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

/* ---------- CATEGORY THEME (INCLUDING FAMILY) ---------- */
const categoryTheme = {
  FOOD: { color: "#1677ff", bg: "#e6f4ff", icon: <CoffeeOutlined /> },
  ACCOMMODATION: { color: "#722ed1", bg: "#f9f0ff", icon: <HomeOutlined /> },
  SHOPPING: { color: "#fa8c16", bg: "#fff7e6", icon: <ShoppingOutlined /> },
  PERSONAL_CARE: { color: "#13c2c2", bg: "#e6fffb", icon: <SkinOutlined /> },
  TRAVEL: { color: "#52c41a", bg: "#f6ffed", icon: <CarOutlined /> },

  /* ✅ FAMILY CATEGORY */
  FAMILY: {
    color: "#eb2f96",
    bg: "#fff0f6",
    icon: <TeamOutlined />,
  },

  SALARY: { color: "#389e0d", bg: "#f6ffed", icon: <DollarOutlined /> },
  OTHER_INCOME: { color: "#389e0d", bg: "#f6ffed", icon: <DollarOutlined /> },
  OTHERS: { color: "#595959", bg: "#fafafa", icon: <AppstoreOutlined /> },
};

export default function ExpenseList() {
  const [data, setData] = useState([]);
  const [paymentMode, setPaymentMode] = useState();
  const [dateRange, setDateRange] = useState([]);
  const [openCats, setOpenCats] = useState({});
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const screens = useBreakpoint();

  /* ---------- MONTH + YEAR ---------- */
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const monthOptions = dayjs.months().map((m, i) => ({
    label: m,
    value: i,
  }));

  const yearOptions = Array.from({ length: 5 }).map((_, i) => {
    const y = currentYear - i;
    return { label: y, value: y };
  });

  /* ---------- AUTO SET MONTH RANGE ---------- */
  useEffect(() => {
    const start = dayjs()
      .year(selectedYear)
      .month(selectedMonth)
      .startOf("month")
      .startOf("day");

    const end = dayjs()
      .year(selectedYear)
      .month(selectedMonth)
      .endOf("month")
      .endOf("day");

    setDateRange([start, end]);
  }, [selectedMonth, selectedYear]);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    setLoading(true);
    api.get("/expenses").then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  /* ---------- FILTER ---------- */
  const filteredData = useMemo(() => {
    return data.filter(e => {
      const pmMatch = paymentMode ? e.paymentMode === paymentMode : true;

      const dateMatch =
        dateRange?.length === 2
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

  /* ---------- GROUP BY CATEGORY ---------- */
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
      return e.type === "IN"
        ? sum + (e.amount || 0)
        : sum - (e.amount || 0);
    }, 0);
  }, [filteredData]);

  const toggleCategory = cat =>
    setOpenCats(p => ({ ...p, [cat]: !p[cat] }));

  /* ---------- TABLE COLUMNS ---------- */
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
      title: "Action",
      render: (_, r) => (
        <Button type="link" onClick={() => nav(`/edit/${r._id}`)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <Spin spinning={loading}>
        <Card style={{ borderRadius: 18 }}>
          {/* ---------- HEADER ---------- */}
          <Row justify="space-between" align="middle">
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Monthly Transactions
              </Title>
              <Text type="secondary">
                {dateRange.length
                  ? dayjs(dateRange[0]).format("MMMM YYYY")
                  : ""}
              </Text>
            </div>

            <Space wrap>
              <Select
                size="large"
                options={monthOptions}
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 140 }}
              />

              <Select
                size="large"
                options={yearOptions}
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 120 }}
              />

              <Select
                size="large"
                allowClear
                placeholder="Payment mode"
                style={{ width: 160 }}
                onChange={setPaymentMode}
                options={[
                  { label: "Cash", value: "CASH" },
                  { label: "Credit Card", value: "CREDIT_CARD" },
                  { label: "Bank Transfer", value: "BANK_TRANSFER" },
                ]}
              />

              <RangePicker
                size="large"
                onChange={setDateRange}
              />
            </Space>
          </Row>

          <Divider />

          {/* ---------- CATEGORY DASHBOARD CARDS ---------- */}
          {Object.keys(groupedByCategory).map(cat => {
            const items = groupedByCategory[cat];
            const theme = categoryTheme[cat] || categoryTheme.OTHERS;
            const total = items.reduce(
              (s, e) => s + (e.amount || 0),
              0
            );
            const isOpen = openCats[cat] !== false;

            return (
              <Card
                key={cat}
                type="inner"
                style={{ marginBottom: 16, borderRadius: 14 }}
                title={
                  <Row
                    justify="space-between"
                    onClick={() => toggleCategory(cat)}
                    style={{ cursor: "pointer" }}
                  >
                    <Space>
                      <span style={{ color: theme.color }}>
                        {theme.icon}
                      </span>
                      <strong>{cat.replace("_", " ")}</strong>
                    </Space>

                    <Space>
                      <span style={{ color: theme.color }}>
                        ₹ {total}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
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
                    >
                      {screens.md ? (
                        <Table
                          rowKey="_id"
                          columns={columns}
                          dataSource={items}
                          pagination={false}
                        />
                      ) : (
                        items.map(e => (
                          <Card key={e._id} size="small" style={{ marginBottom: 8 }}>
                            {e.description} — ₹ {e.amount}
                          </Card>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}

          <Divider />

          {/* ---------- NET TOTAL ---------- */}
          <Row justify="space-between">
            <strong>
              Net Total (
              {dateRange.length
                ? dayjs(dateRange[0]).format("MMMM YYYY")
                : ""}
              )
            </strong>
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
      </Spin>
    </div>
  );
}