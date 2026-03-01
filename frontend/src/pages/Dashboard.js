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
  Select,
  Spin,
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
  const nav = useNavigate();

  const currentYear = dayjs().year();
  const currentMonth = dayjs().month();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [range, setRange] = useState([]);
  const [groupBy, setGroupBy] = useState("daily");
  const [data, setData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- MONTH & YEAR OPTIONS ---------- */
  const monthOptions = dayjs.months().map((m, i) => ({
    label: m,
    value: i,
  }));

  const yearOptions = Array.from({ length: 5 }).map((_, i) => {
    const year = currentYear - i;
    return { label: year, value: year };
  });

  /* ---------- UPDATE RANGE WHEN MONTH/YEAR CHANGES ---------- */
  useEffect(() => {
    const start = dayjs()
      .year(selectedYear)
      .month(selectedMonth)
      .startOf("month")
      .startOf("day")
      .toISOString();

    const end = dayjs()
      .year(selectedYear)
      .month(selectedMonth)
      .endOf("month")
      .endOf("day")
      .toISOString();

    setRange([start, end]);
  }, [selectedMonth, selectedYear]);

  /* ---------- PREVIOUS MONTH RANGE ---------- */
  const previousMonthRange = useMemo(() => {
    if (!range.length) return [];
    const prevStart = dayjs(range[0]).subtract(1, "month").startOf("month");
    const prevEnd = dayjs(range[0]).subtract(1, "month").endOf("month");
    return [prevStart.toISOString(), prevEnd.toISOString()];
  }, [range]);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (!range.length) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [currentRes, prevRes] = await Promise.all([
          api.get(
            `/expenses?startDate=${range[0]}&endDate=${range[1]}`
          ),
          api.get(
            `/expenses?startDate=${previousMonthRange[0]}&endDate=${previousMonthRange[1]}`
          ),
        ]);

        setData(currentRes.data);
        setPreviousData(prevRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [range]);

  /* ---------- STATS ---------- */
  const income = data
    .filter(d => d.type === "IN")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const expense = data
    .filter(d => d.type === "OUT")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const balance = income - expense;

  const previousIncome = previousData
    .filter(d => d.type === "IN")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const previousExpense = previousData
    .filter(d => d.type === "OUT")
    .reduce((a, b) => a + (b.amount || 0), 0);

  const incomeGrowth =
    previousIncome === 0
      ? 100
      : ((income - previousIncome) / previousIncome) * 100;

  const expenseGrowth =
    previousExpense === 0
      ? 100
      : ((expense - previousExpense) / previousExpense) * 100;

  /* ---------- GROUP DATA ---------- */
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
      <Spin spinning={loading} tip="Loading dashboard...">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* HEADER */}
          <Row justify="space-between" align="middle">
            <div>
              <Title level={3}>Dashboard</Title>
              <Text type="secondary">
                {dayjs(range[0]).format("MMMM YYYY")} Overview
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

              <DatePicker.RangePicker
                size="large"
                onChange={d =>
                  d &&
                  setRange([
                    d[0].startOf("day").toISOString(),
                    d[1].endOf("day").toISOString(),
                  ])
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

          {/* STATS */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 16 }}>
                <Statistic
                  title="Income"
                  value={income}
                  valueStyle={{ color: COLORS.income }}
                  prefix={<ArrowUpOutlined />}
                  suffix={
                    <Text type={incomeGrowth >= 0 ? "success" : "danger"}>
                      {incomeGrowth.toFixed(1)}%
                    </Text>
                  }
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
                  suffix={
                    <Text type={expenseGrowth <= 0 ? "success" : "danger"}>
                      {expenseGrowth.toFixed(1)}%
                    </Text>
                  }
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

          {/* CHARTS */}
          <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
            <Col xs={24} lg={12}>
              <Card title="Expense Overview" bordered={false}>
                <ResponsiveContainer height={280}>
                  <BarChart data={groupedData}>
                    <XAxis dataKey="date" />
                    <Tooltip />
                    <Bar dataKey="expense" fill={COLORS.expense} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Balance Trend" bordered={false}>
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
            </Col>
          </Row>

          {/* PIE CHARTS */}
          <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
            <Col xs={24} md={12}>
              <Card title="Expense by Category" bordered={false}>
                <ResponsiveContainer height={280}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" outerRadius={100} label={renderPieLabel}>
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
              <Card title="Expense by Payment Mode" bordered={false}>
                <ResponsiveContainer height={280}>
                  <PieChart>
                    <Pie data={paymentData} dataKey="value" outerRadius={100} label={renderPieLabel}>
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
        </motion.div>
      </Spin>
    </div>
  );
}