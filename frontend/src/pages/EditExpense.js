import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Form, Input, Select, Button, message } from "antd";
import api from "../services/api";

export default function EditExpense() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    api.get("/expenses").then(res => {
      const e = res.data.find(x => x._id === id);
      if (e) form.setFieldsValue(e);
    });
  }, [id, form]);

  const onFinish = async v => {
    await api.put(`/expenses/${id}`, v);
    message.success("Updated");
    nav("/dashboard");
  };

  return (
    <Card title="Edit Expense" style={{ maxWidth: 400, margin: "24px auto" }}>
      <Form.Item name="category" label="Category">
        <Select
          options={[
            { label: "Food", value: "FOOD" },
            { label: "Accommodation", value: "ACCOMMODATION" },
            { label: "Shopping", value: "SHOPPING" },
            { label: "Personal Care", value: "PERSONAL_CARE" }
          ]}
        />
      </Form.Item>

      <Form.Item name="paymentMode" label="Payment Mode">
        <Select
          options={[
            { label: "Credit Card", value: "CREDIT_CARD" },
            { label: "Bank Transfer", value: "BANK_TRANSFER" }
          ]}
        />
      </Form.Item>

    </Card>
  );
}
