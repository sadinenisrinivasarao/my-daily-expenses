import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import {
  Card,
  Row,
  Col,
  Button,
  Statistic,
  DatePicker,
  Radio,
  Typography,
  Space,
} from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  LineChart,
  Line,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useNavigate } from "react-router-dom";
import "./styles.css";

dayjs.extend(weekOfYear);
const { Title, Text } = Typography;

/* ---------- COLORS ---------- */
const COLORS = {
  income: "#52c41a",
  expense: "#ff4d4f",
  balance: "#1677ff",
};

/* ---------- PIE LABEL ---------- */
const renderPieLabel = ({ name, percent }) =>
  `${name} ${(percent * 100).toFixed(0)}%`;

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [range, setRange] = useState([]);
  const [groupBy, setGroupBy] = useState("daily");
  const nav = useNavigate();

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    let url = "/expenses";
    if (range.length === 2) {
      url += `?startDate=${range[0]}&endDate=${range[1]}`;
    }
    api.get(url).then(res => setData(res.data));
  }, [range]);

  /* ---------- STATS ---------- */
  const income = data
    .filter(d => d.type === "IN")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const expense = data
    .filter(d => d.type === "OUT")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const balance = income - expense;

  /* ---------- DAILY / WEEKLY GROUP ---------- */
  const groupedData = useMemo(() => {
    const grouped = {};
    data.forEach(e => {
      const key =
        groupBy === "daily"
          ? dayjs(e.entryDate).format("DD MMM")
          : `W${dayjs(e.entryDate).week()}`;

      if (!grouped[key]) grouped[key] = { date: key, income: 0, expense: 0 };
      e.type === "IN"
        ? (grouped[key].income += e.amount)
        : (grouped[key].expense += e.amount);
    });
    return Object.values(grouped);
  }, [data, groupBy]);

  /* ---------- BALANCE TREND ---------- */
  let running = 0;
  const balanceTrend = groupedData.map(d => {
    running += d.income - d.expense;
    return { date: d.date, balance: running };
  });

  /* ---------- PIE DATA ---------- */
  const categoryData = useMemo(() => {
    const map = {};
    data.forEach(e => {
      if (e.type === "OUT" && e.category) {
        map[e.category] = (map[e.category] || 0) + e.amount;
      }
    });
    return Object.keys(map).map(k => ({
      name: k.replace("_", " "),
      value: map[k],
    }));
  }, [data]);

  const paymentData = useMemo(() => {
    const map = {};
    data.forEach(e => {
      if (e.type === "OUT" && e.paymentMode) {
        map[e.paymentMode] = (map[e.paymentMode] || 0) + e.amount;
      }
    });
    return Object.keys(map).map(k => ({
      name: k.replace("_", " "),
      value: map[k],
    }));
  }, [data]);

  return (
    <div className="dashboard-page">
      {/* ---------- HEADER ---------- */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          paddingBottom: 16,
          marginBottom: 24,
        }}
      >
        <Row justify="space-between" align="middle">
          <div>
            <Title level={3} style={{ marginBottom: 0 }}>
              Dashboard
            </Title>
            <Text type="secondary">Your financial overview</Text>
          </div>

          <Space wrap>
            <DatePicker.RangePicker
              size="large"
              onChange={d =>
                d
                  ? setRange([
                      d[0].startOf("day").toISOString(),
                      d[1].endOf("day").toISOString(),
                    ])
                  : setRange([])
              }
            />

            <Radio.Group
              size="large"
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
            >
              <Radio.Button value="daily">Daily</Radio.Button>
              <Radio.Button value="weekly">Weekly</Radio.Button>
            </Radio.Group>

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => nav("/add")}
            >
              Add
            </Button>
          </Space>
        </Row>
      </div>

      {/* ---------- STATS ---------- */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 16 }}>
            <Statistic
              title="Income"
              value={income}
              valueStyle={{ color: COLORS.income }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 16 }}>
            <Statistic
              title="Expense"
              value={expense}
              valueStyle={{ color: COLORS.expense }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 16 }}>
            <Statistic
              title="Balance"
              value={balance}
              valueStyle={{ color: COLORS.balance }}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* ---------- CHARTS ---------- */}
      <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
        <Col xs={24} lg={12}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card title="Expense Overview" bordered={false} style={{ borderRadius: 16 }}>
              <ResponsiveContainer height={280}>
                <BarChart data={groupedData}>
                  <XAxis dataKey="date" />
                  <Tooltip />
                  <Bar
                    dataKey="expense"
                    fill={COLORS.expense}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card title="Balance Trend" bordered={false} style={{ borderRadius: 16 }}>
              <ResponsiveContainer height={280}>
                <LineChart data={balanceTrend}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke={COLORS.balance}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* ---------- PIE CHARTS ---------- */}
      <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
        <Col xs={24} md={12}>
          <Card title="Expense by Category" bordered={false} style={{ borderRadius: 16 }}>
            <ResponsiveContainer height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  outerRadius={100}
                  label={renderPieLabel}
                >
                  {categoryData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"][i % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={v => `₹ ${v}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Expense by Payment Mode" bordered={false} style={{ borderRadius: 16 }}>
            <ResponsiveContainer height={280}>
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  outerRadius={100}
                  label={renderPieLabel}
                >
                  {paymentData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={["#722ed1", "#13c2c2", "#fa8c16"][i % 3]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={v => `₹ ${v}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
