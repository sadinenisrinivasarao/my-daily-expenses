import { useState, useEffect } from "react";
import {
  Card,
  Select,
  DatePicker,
  Button,
  Form,
  message,
  InputNumber,
  Input,
  Switch,
  Upload,
  Tag,
  Space,
  Divider,
} from "antd";
import {
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";
import dayjs from "dayjs";

/* ---------- CATEGORY MAP ---------- */
const CATEGORY_MAP = {
  OUT: [
    { label: "Food", value: "FOOD" },
    { label: "Accommodation", value: "ACCOMMODATION" },
    { label: "Shopping", value: "SHOPPING" },
    { label: "Travel", value: "TRAVEL" },
    { label: "Personal Care", value: "PERSONAL_CARE" },
    { label: "Family", value: "FAMILY" },
    { label: "Others", value: "OTHERS" },
  ],
  IN: [
    { label: "Salary", value: "SALARY" },
    { label: "Other Income", value: "OTHER_INCOME" },
    { label: "Refund", value: "REFUND" },
  ],
};

export default function AddExpense() {
  const nav = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("OUT");
  const [recurring, setRecurring] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  /* ---------- LOAD CURRENT BALANCE ---------- */
  useEffect(() => {
    const start = dayjs().startOf("month").startOf("day").toISOString();
    const end = dayjs().endOf("month").endOf("day").toISOString();

    api
      .get(`/expenses/summary?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`)
      .then((res) => {
        setCurrentBalance(res.data.balance || 0);
      })
      .catch(() => {});
  }, []);

  /* ---------- BALANCE PREVIEW ---------- */
  const amount = Form.useWatch("amount", form);
  const previewBalance =
    type === "IN"
      ? currentBalance + (amount || 0)
      : currentBalance - (amount || 0);

  /* ---------- SUBMIT ---------- */
  const onFinish = async (values, addAnother = false) => {
    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(values).forEach(key => {
        if (key === "entryDate") {
          formData.append(key, values.entryDate.toDate());
        } else if (key === "receipt" && values.receipt?.file) {
          formData.append("receipt", values.receipt.file.originFileObj);
        } else {
          formData.append(key, values[key]);
        }
      });

      await api.post("/expenses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Transaction saved successfully");

      if (addAnother) {
        form.resetFields();
      } else {
        nav("/dashboard");
      }
    } catch (err) {
      message.error("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          title="Add Transaction"
          style={{ maxWidth: 520, margin: "0 auto", borderRadius: 18 }}
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={values => onFinish(values, false)}
            initialValues={{
              type: "OUT",
              entryDate: dayjs(),
            }}
          >
            {/* TYPE */}
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Select
                size="large"
                onChange={v => setType(v)}
                options={[
                  { label: "Paid Out", value: "OUT" },
                  { label: "Income", value: "IN" },
                ]}
              />
            </Form.Item>

            {/* PAYMENT MODE */}
            <Form.Item
              name="paymentMode"
              label="Payment Mode"
              rules={[{ required: true }]}
            >
              <Select
                size="large"
                options={[
                  { label: "Credit Card", value: "CREDIT_CARD" },
                  { label: "Bank Transfer", value: "BANK_TRANSFER" },
                  { label: "Cash", value: "CASH" },
                ]}
              />
            </Form.Item>

            {/* CATEGORY (SMART) */}
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true }]}
            >
              <Select
                size="large"
                options={CATEGORY_MAP[type]}
              />
            </Form.Item>

            {/* DESCRIPTION */}
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            {/* AMOUNT */}
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true }]}
            >
              <InputNumber
                size="large"
                min={0}
                style={{ width: "100%" }}
                prefix="₹"
              />
            </Form.Item>

            {/* BALANCE PREVIEW */}
            <Divider />
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>Current Balance: ₹ {currentBalance}</div>
              <div>
                After Transaction:{" "}
                <strong style={{ color: previewBalance < 0 ? "red" : "green" }}>
                  ₹ {previewBalance}
                </strong>
              </div>
            </Space>
            <Divider />

            {/* DATE */}
            <Form.Item
              name="entryDate"
              label="Date"
              rules={[{ required: true }]}
            >
              <DatePicker size="large" style={{ width: "100%" }} />
            </Form.Item>

            {/* TAGS */}
            <Form.Item name="tags" label="Tags">
              <Select mode="tags" size="large" placeholder="Add tags..." />
            </Form.Item>

            {/* RECEIPT UPLOAD */}
            <Form.Item name="receipt" label="Upload Receipt">
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>
                  Attach Bill / Receipt
                </Button>
              </Upload>
            </Form.Item>

            {/* RECURRING */}
            <Form.Item label="Recurring">
              <Switch checked={recurring} onChange={setRecurring} />
            </Form.Item>

            {recurring && (
              <Form.Item
                name="frequency"
                label="Frequency"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  options={[
                    { label: "Daily", value: "DAILY" },
                    { label: "Weekly", value: "WEEKLY" },
                    { label: "Monthly", value: "MONTHLY" },
                  ]}
                />
              </Form.Item>
            )}

            {/* ACTION BUTTONS */}
            <Space style={{ width: "100%" }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                icon={<PlusCircleOutlined />}
                loading={loading}
              >
                Save
              </Button>

              <Button
                block
                size="large"
                disabled={loading}
                onClick={() => form.submit() || onFinish(form.getFieldsValue(), true)}
              >
                Save & Add Another
              </Button>
            </Space>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}