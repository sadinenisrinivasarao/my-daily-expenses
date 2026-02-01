import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  message,
  Modal,
  Space,
} from "antd";
import api from "../services/api";
import dayjs from "dayjs";

export default function EditExpense() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/expenses/${id}`).then(res => {
      form.setFieldsValue({
        ...res.data,
        entryDate: dayjs(res.data.entryDate),
      });
    });
  }, [id, form]);

  const onFinish = async v => {
    try {
      setLoading(true);
      await api.put(`/expenses/${id}`, {
        ...v,
        entryDate: v.entryDate.toDate(),
      });
      message.success("Expense updated");
      nav("/dashboard");
    } catch {
      message.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = () => {
    Modal.confirm({
      title: "Delete Expense?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await api.delete(`/expenses/${id}`);
        message.success("Expense deleted");
        nav("/dashboard");
      },
    });
  };

  return (
    <div className="page">
      <Card
        title="Edit Expense"
        style={{
          maxWidth: 420,
          margin: "16px auto",
        }}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
        >
          {/* Payment Mode */}
          <Form.Item
            label="Payment Mode"
            name="paymentMode"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Credit Card", value: "CREDIT_CARD" },
                { label: "Bank Transfer", value: "BANK_TRANSFER" },
                { label: "Cash", value: "CASH" },
              ]}
            />
          </Form.Item>

          {/* Category */}
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Food", value: "FOOD" },
                { label: "Accommodation", value: "ACCOMMODATION" },
                { label: "Shopping", value: "SHOPPING" },
                { label: "Personal Care", value: "PERSONAL_CARE" },
              ]}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          {/* Amount */}
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Paid Out", value: "OUT" },
                { label: "Income", value: "IN" },
              ]}
            />
          </Form.Item>


          {/* Date (future disabled) */}
          <Form.Item
            label="Date"
            name="entryDate"
            rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={d => d && d > dayjs().endOf("day")}
            />
          </Form.Item>

          {/* Actions */}
          <Form.Item>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                Update
              </Button>

              <Button onClick={() => nav("/dashboard")} block>
                Cancel
              </Button>

              <Button danger onClick={onDelete} block>
                Delete Expense
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
