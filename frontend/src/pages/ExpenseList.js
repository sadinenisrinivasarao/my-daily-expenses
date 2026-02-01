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

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

export default function ExpenseList() {
  const [data, setData] = useState([]);
  const [paymentMode, setPaymentMode] = useState();
  const [dateRange, setDateRange] = useState([]);
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

  /* ---------- GROUP BY CATEGORY ---------- */
  const groupedByCategory = useMemo(() => {
    return filteredData.reduce((acc, e) => {
      const cat = e.category || "Others";
      acc[cat] = acc[cat] || [];
      acc[cat].push(e);
      return acc;
    }, {});
  }, [filteredData]);

  /* ---------- MONTHLY TOTAL ---------- */
  const monthlyTotal = useMemo(() => {
    const month = dayjs().month();
    const year = dayjs().year();

    return filteredData
      .filter(
        e =>
          e.entryDate &&
          dayjs(e.entryDate).month() === month &&
          dayjs(e.entryDate).year() === year
      )
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [filteredData]);

  /* ---------- TABLE COLUMNS ---------- */
  const columns = [
    {
      title: "Date",
      dataIndex: "entryDate",
      render: d => (d ? dayjs(d).format("DD MMM YYYY") : "-"),
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Payment",
      dataIndex: "paymentMode",
      render: pm => (pm ? pm.replace("_", " ") : "-"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: v => <strong>₹ {v ?? 0}</strong>,
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

  /* ---------- MOBILE CARD ---------- */
  const MobileCards = ({ items }) => (
    <Space direction="vertical" style={{ width: "100%" }}>
      {items.map(e => (
        <Card key={e._id} size="small">
          <Row justify="space-between">
            <strong>{e.description || "-"}</strong>
            <strong>₹ {e.amount ?? 0}</strong>
          </Row>
          <div style={{ fontSize: 12, color: "#777" }}>
            {e.paymentMode?.replace("_", " ")}
          </div>
          <div style={{ fontSize: 12 }}>
            {e.entryDate ? dayjs(e.entryDate).format("DD MMM YYYY") : "-"}
          </div>
          <Button type="link" onClick={() => nav(`/edit/${e._id}`)}>
            Edit
          </Button>
        </Card>
      ))}
    </Space>
  );

  return (
    <div className="page">
      <Card title="All Expenses">
        {/* -------- FILTERS -------- */}
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Select
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
            <RangePicker style={{ width: "100%" }} onChange={setDateRange} />
          </Col>
        </Row>

        {/* -------- GROUPED VIEW -------- */}
        {Object.keys(groupedByCategory).map(category => {
          const items = groupedByCategory[category];
          const categoryTotal = items.reduce(
            (sum, e) => sum + (e.amount || 0),
            0
          );

          return (
            <Card
              key={category}
              type="inner"
              title={`${category} — ₹ ${categoryTotal}`}
              style={{ marginBottom: 16 }}
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
            </Card>
          );
        })}

        {/* -------- MONTHLY TOTAL -------- */}
        <Divider />
        <Row justify="space-between">
          <strong>Total ({dayjs().format("MMMM YYYY")})</strong>
          <strong>₹ {monthlyTotal}</strong>
        </Row>
      </Card>
    </div>
  );
}
