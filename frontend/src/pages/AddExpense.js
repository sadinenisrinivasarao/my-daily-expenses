import { useState } from "react";
import {
  Card,
  Input,
  Select,
  DatePicker,
  Button,
  Form,
  message,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";

/* ---------- MOTION VARIANTS ---------- */
const container = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
};

export default function AddExpense() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async v => {
    try {
      setLoading(true);

      await api.post("/expenses", {
        ...v,
        entryDate: v.entryDate.toDate(),
      });

      message.success("Expense added successfully");
      nav("/dashboard");
    } catch {
      message.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <Card
          title="Add Transaction"
          style={{
            maxWidth: 420,
            margin: "0 auto",
            borderRadius: 16,
          }}
        >
          <Form
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ type: "OUT" }}
          >
            {/* TYPE */}
            <motion.div variants={item}>
              <Form.Item label="Type" name="type" rules={[{ required: true }]}>
                <Select
                  size="large"
                  options={[
                    { label: "Paid Out", value: "OUT" },
                    { label: "Income", value: "IN" },
                  ]}
                />
              </Form.Item>
            </motion.div>

            {/* PAYMENT MODE */}
            <motion.div variants={item}>
              <Form.Item
                label="Payment Mode"
                name="paymentMode"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  options={[
                    { label: "Credit Card", value: "CREDIT_CARD" },
                    { label: "Bank Transfer", value: "BANK_TRANSFER" },
                  ]}
                />
              </Form.Item>
            </motion.div>

            {/* CATEGORY */}
            <motion.div variants={item}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
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
            </motion.div>

            {/* DESCRIPTION */}
            <motion.div variants={item}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true }]}
              >
                <Input size="large" />
              </Form.Item>
            </motion.div>

            {/* AMOUNT */}
            <motion.div variants={item}>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[{ required: true }]}
              >
                <Input size="large" type="number" min={0} />
              </Form.Item>
            </motion.div>

            {/* DATE */}
            <motion.div variants={item}>
              <Form.Item
                label="Date"
                name="entryDate"
                rules={[{ required: true }]}
              >
                <DatePicker size="large" style={{ width: "100%" }} />
              </Form.Item>
            </motion.div>

            {/* SUBMIT */}
            <motion.div
              variants={item}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                icon={<PlusCircleOutlined />}
                loading={loading}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </motion.div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}
