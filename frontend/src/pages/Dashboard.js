import { useEffect, useState } from "react";
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
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LineChart,
  Line,
  YAxis,
  ResponsiveContainer
} from "recharts";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useNavigate } from "react-router-dom";
import "./styles.css";

dayjs.extend(weekOfYear);
const { Title } = Typography;

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [range, setRange] = useState([]);
  const [groupBy, setGroupBy] = useState("daily");
  const nav = useNavigate();

  useEffect(() => {
    let url = "/expenses";
    if (range.length === 2) {
      url += `?startDate=${range[0]}&endDate=${range[1]}`;
    }
    api.get(url).then(res => setData(res.data));
  }, [range]);

  const income = data.filter(d => d.type === "IN").reduce((a, b) => a + b.amount, 0);
  const expense = data.filter(d => d.type === "OUT").reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

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

  let runningBalance = 0;
  const balanceTrend = groupedData.map(d => {
    runningBalance += d.income - d.expense;
    return { date: d.date, balance: runningBalance };
  });

  return (
    <div className="dashboard-page">
      {/* Header */}
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

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="stat-card income">
            <Statistic
              title="Income"
              value={income}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="stat-card expense">
            <Statistic
              title="Expense"
              value={expense}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="stat-card balance">
            <Statistic
              title="Balance"
              value={balance}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
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
    </div>
  );
}
