import { useState } from "react";
import { Card, Input, Select, DatePicker, Button, Form, message } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AddExpense() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (v) => {
    try {
      setLoading(true); // 🔒 disable button

      await api.post("/expenses", {
        ...v,
        entryDate: v.entryDate.toDate(),
      });

      message.success("Expense added successfully");
      nav("/dashboard");
    } catch {
      message.error("Failed to add expense");
    } finally {
      setLoading(false); // 🔓 re-enable (in case of error)
    }
  };

  return (
    <div className="page">
      <Card title="Add Transaction" style={{ maxWidth: 420, margin: "0 auto" }}>
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: "OUT" }}
        >

          {/* Type */}
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Paid Out", value: "OUT" },
                { label: "Income", value: "IN" },
              ]}
            />
          </Form.Item>

          {/* Payment Mode */}
          <Form.Item label="Payment Mode" name="paymentMode" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Credit Card", value: "CREDIT_CARD" },
                { label: "Bank Transfer", value: "BANK_TRANSFER" },
              ]}
            />
          </Form.Item>

          {/* Category */}
          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Food", value: "FOOD" },
                { label: "Accommodation", value: "ACCOMMODATION" },
                { label: "Shopping", value: "SHOPPING" },
                { label: "Personal Care", value: "PERSONAL_CARE" },
                { label: "Travel", value: "TRAVEL" },
                { label: "Salary", value: "SALARY" },
                { label: "Other Income", value: "OTHER_INCOME" },
                { label: "Others", value: "OTHERS" },
              ]}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {/* Amount */}
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" min={0} />
          </Form.Item>

          {/* Date */}
          <Form.Item name="entryDate" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {/* Submit */}
          <Button
            type="primary"
            htmlType="submit"
            block
            icon={<PlusCircleOutlined />}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>

        </Form>
      </Card>
    </div>
  );
}
