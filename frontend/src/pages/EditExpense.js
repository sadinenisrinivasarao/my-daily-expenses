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
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="description"><Input /></Form.Item>
        <Form.Item name="amount"><Input type="number" /></Form.Item>
        <Form.Item name="type">
          <Select options={[
            { label: "Income", value: "IN" },
            { label: "Expense", value: "OUT" }
          ]} />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>Save</Button>
      </Form>
    </Card>
  );
}
