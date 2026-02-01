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
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: "Select category" }]}
        >
          <Select
            options={[
              { label: "Food", value: "FOOD" },
              { label: "Accommodation", value: "ACCOMMODATION" },
              { label: "Shopping", value: "SHOPPING" },
              { label: "Personal Care", value: "PERSONAL_CARE" }
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Payment Mode"
          name="paymentMode"
          rules={[{ required: true, message: "Select payment mode" }]}
        >
          <Select
            options={[
              { label: "Credit Card", value: "CREDIT_CARD" },
              { label: "Bank Transfer", value: "BANK_TRANSFER" }
            ]}
          />
        </Form.Item>

      </Card>
    </div>
  );
}
