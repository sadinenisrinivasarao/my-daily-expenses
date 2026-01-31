import { useEffect, useState } from "react";
import { Table, Card, Button } from "antd";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ExpenseList() {
  const [data, setData] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/expenses").then(res => setData(res.data));
  }, []);

return (
  <div className="page">
    <Card title="All Expenses">
      <Table
        rowKey="_id"
        pagination={{ pageSize: 6 }}
        dataSource={data}
        columns={[
          { title: "Description", dataIndex: "description" },
          {
            title: "Amount",
            dataIndex: "amount",
            render: v => <strong>₹ {v}</strong>
          },
          {
            title: "Type",
            dataIndex: "type",
            render: t => (
              <span style={{ color: t === "IN" ? "green" : "red" }}>
                {t}
              </span>
            )
          },
          {
            title: "Action",
            render: (_, r) => (
              <Button type="link" onClick={() => nav(`/edit/${r._id}`)}>
                Edit
              </Button>
            )
          }
        ]}
      />
    </Card>
  </div>
);

}
