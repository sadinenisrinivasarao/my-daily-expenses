import { useEffect, useState } from "react";
import { Table, Card, Button } from "antd";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

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
            {
              title: "Date",
              dataIndex: "entryDate",
              render: d => dayjs(d).format("DD MMM YYYY")
            },
            {
              title: "Description",
              dataIndex: "description"
            },
            {
              title: "Payment Mode",
              dataIndex: "paymentMode",
              render: pm => pm.replace("_", " ")
            },
            {
              title: "Amount",
              dataIndex: "amount",
              render: v => <strong>₹ {v}</strong>
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
