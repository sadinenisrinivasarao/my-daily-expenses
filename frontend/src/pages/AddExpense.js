import { Card, Input, Select, DatePicker, Button, Form, message } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AddExpense() {
  const nav = useNavigate();

  const onFinish = async (v) => {
    await api.post("/expenses", { ...v, entryDate: v.entryDate.toDate() });
    message.success("Expense added successfully");
    nav("/dashboard");
  };

  return (
    <div className="page">
      <Card title="Add Expense" style={{ maxWidth: 420, margin: "0 auto" }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Description" name="description" rules={[{ required: true }]}>
            <Input placeholder="Groceries, Rent, Salary…" />
          </Form.Item>

          <Form.Item label="Amount" name="amount" rules={[{ required: true }]}>
            <Input type="number" placeholder="₹ Amount" />
          </Form.Item>

          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Income", value: "IN" },
                { label: "Expense", value: "OUT" }
              ]}
            />
          </Form.Item>

          <Form.Item label="Date" name="entryDate" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            htmlType="submit"
            block
            size="large"
          >
            Save Expense
          </Button>
        </Form>
      </Card>
    </div>
  );
}
