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
  Typography
} from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined
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
  Legend
} from "recharts";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useNavigate } from "react-router-dom";
import "./styles.css";

dayjs.extend(weekOfYear);
const { Title } = Typography;

/* ---------- PIE LABEL ---------- */
const renderPieLabel = ({ name, percent }) =>
  `${name} (${(percent * 100).toFixed(0)}%)`;

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

  const groupedData = Object.values(grouped);

  /* ---------- BALANCE TREND ---------- */
  let runningBalance = 0;
  const balanceTrend = groupedData.map(d => {
    runningBalance += d.income - d.expense;
    return { date: d.date, balance: runningBalance };
  });

  /* ---------- CATEGORY & PAYMENT PIE ---------- */
  const categoryMap = {};
  const paymentMap = {};

  data.forEach(e => {
    if (e.type === "OUT") {
      if (e.category) {
        categoryMap[e.category] =
          (categoryMap[e.category] || 0) + e.amount;
      }
      if (e.paymentMode) {
        paymentMap[e.paymentMode] =
          (paymentMap[e.paymentMode] || 0) + e.amount;
      }
    }
  });

  const categoryData = Object.keys(categoryMap).map(k => ({
    name: k.replace("_", " "),
    value: categoryMap[k]
  }));

  const paymentData = Object.keys(paymentMap).map(k => ({
    name: k.replace("_", " "),
    value: paymentMap[k]
  }));

  /* ---------- MONTHLY COMPARISON ---------- */
  const monthlyComparison = useMemo(() => {
    const map = {};

    data.forEach(e => {
      const month = dayjs(e.entryDate).format("MMM YYYY");

      if (!map[month]) {
        map[month] = { month, income: 0, expense: 0 };
      }

      e.type === "IN"
        ? (map[month].income += e.amount)
        : (map[month].expense += e.amount);
    });

    return Object.values(map).sort(
      (a, b) => dayjs(a.month).valueOf() - dayjs(b.month).valueOf()
    );
  }, [data]);

  return (
    <div className="dashboard-page">
      {/* ---------- HEADER ---------- */}
      <div className="dashboard-top">
        <Title level={3}>Dashboard</Title>

        <div className="dashboard-actions">
          <DatePicker.RangePicker
            onChange={d =>
              d
                ? setRange([
                    d[0].startOf("day").toISOString(),
                    d[1].endOf("day").toISOString()
                  ])
                : setRange([])
            }
          />

          <Radio.Group
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
          >
            <Radio.Button value="daily">Daily</Radio.Button>
            <Radio.Button value="weekly">Weekly</Radio.Button>
          </Radio.Group>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => nav("/add")}
          >
            Add
          </Button>
        </div>
      </div>

      {/* ---------- STATS ---------- */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="stat-card income">
            <Statistic title="Income" value={income} prefix={<ArrowUpOutlined />} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="stat-card expense">
            <Statistic title="Expense" value={expense} prefix={<ArrowDownOutlined />} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="stat-card balance">
            <Statistic title="Balance" value={balance} prefix={<WalletOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* ---------- DAILY / WEEKLY ---------- */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Expense Overview">
            <ResponsiveContainer height={280}>
              <BarChart data={groupedData}>
                <XAxis dataKey="date" />
                <Tooltip />
                <Bar dataKey="expense" fill="#ff4d4f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Balance Trend">
            <ResponsiveContainer height={280}>
              <LineChart data={balanceTrend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#1677ff"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ---------- MONTHLY COMPARISON ---------- */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Monthly Income vs Expense">
            <ResponsiveContainer height={320}>
              <BarChart data={monthlyComparison}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={v => `₹ ${v}`} />
                <Legend />
                <Bar dataKey="income" fill="#52c41a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#ff4d4f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ---------- PIE CHARTS ---------- */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Expense by Category">
            <ResponsiveContainer height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
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
          <Card title="Expense by Payment Mode">
            <ResponsiveContainer height={280}>
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
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
