import { Card, Input, Select, DatePicker, Button, Form, message } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AddExpense() {
  const nav = useNavigate();

  const onFinish = async (v) => {
    try {
      await api.post("/expenses", {
        ...v,
        entryDate: v.entryDate.toDate(), // dayjs → JS Date
      });

      message.success("Expense added successfully");
      nav("/dashboard");
    } catch (err) {
      message.error("Failed to add expense");
    }
  };

  return (
    <div className="page">
      <Card title="Add Expense" style={{ maxWidth: 420, margin: "0 auto" }}>
        <Form layout="vertical" onFinish={onFinish}>
          
          {/* Payment Mode */}
          <Form.Item
            label="Payment Mode"
            name="paymentMode"
            rules={[{ required: true, message: "Select payment mode" }]}
          >
            <Select
              placeholder="Select payment mode"
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
            rules={[{ required: true, message: "Select category" }]}
          >
            <Select
              placeholder="Select category"
              options={[
                { label: "Food", value: "FOOD" },
                { label: "Accommodation", value: "ACCOMMODATION" },
                { label: "Shopping", value: "SHOPPING" },
                { label: "Personal Care", value: "PERSONAL_CARE" },
                { label: "Travel", value: "TRAVEL" },
              ]}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Enter description" },
              { max: 100, message: "Max 100 characters" },
            ]}
          >
            <Input placeholder="e.g. Lunch at restaurant" />
          </Form.Item>

          {/* Amount */}
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Enter amount" }]}
          >
            <Input type="number" min={0} placeholder="Enter amount" />
          </Form.Item>

          {/* Date */}
          <Form.Item
            label="Date"
            name="entryDate"
            rules={[{ required: true, message: "Select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {/* Submit */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusCircleOutlined />}
              block
            >
              Add Expense
            </Button>
          </Form.Item>

        </Form>
      </Card>
    </div>
  );
}
