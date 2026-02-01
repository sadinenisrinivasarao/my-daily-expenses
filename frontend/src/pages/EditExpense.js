import { useEffect, useRef, useState } from "react";
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
} from "antd";
import {
  CheckCircleFilled,
  DeleteOutlined,
  CoffeeOutlined,
  HomeOutlined,
  ShoppingOutlined,
  SkinOutlined,
  CarOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- CATEGORY THEMES ---------- */
const categoryTheme = {
  FOOD: { color: "#1677ff", icon: <CoffeeOutlined /> },
  ACCOMMODATION: { color: "#722ed1", icon: <HomeOutlined /> },
  SHOPPING: { color: "#fa8c16", icon: <ShoppingOutlined /> },
  PERSONAL_CARE: { color: "#13c2c2", icon: <SkinOutlined /> },
  TRAVEL: { color: "#52c41a", icon: <CarOutlined /> },
  SALARY: { color: "#389e0d", icon: <DollarOutlined /> },
  OTHER_INCOME: { color: "#389e0d", icon: <DollarOutlined /> },
  OTHERS: { color: "#595959", icon: <AppstoreOutlined /> },
};

/* ---------- OVERLAY ANIMATIONS ---------- */
const overlayAnim = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 18 },
  },
};

export default function EditExpense() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [category, setCategory] = useState("OTHERS");

  const theme = categoryTheme[category] || categoryTheme.OTHERS;

  /* ---------- LOAD ---------- */
  useEffect(() => {
    api.get(`/expenses/${id}`).then(res => {
      setCategory(res.data.category || "OTHERS");
      form.setFieldsValue({
        ...res.data,
        entryDate: dayjs(res.data.entryDate),
      });
    });
  }, [id, form]);

  /* ---------- UPDATE ---------- */
  const onFinish = async v => {
    try {
      setLoading(true);
      await api.put(`/expenses/${id}`, {
        ...v,
        entryDate: v.entryDate.toDate(),
      });
      setSuccess(true);
      setTimeout(() => nav("/dashboard"), 1200);
    } catch {
      message.error("Update failed");
      setLoading(false);
    }
  };

  /* ---------- DELETE ---------- */
  const onDelete = () => {
    Modal.confirm({
      title: "Delete this transaction?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setDeleting(true);
        await api.delete(`/expenses/${id}`);
        setTimeout(() => nav("/dashboard"), 1200);
      },
    });
  };

  return (
    <div className="page">
      <Card
        title={
          <span style={{ color: theme.color }}>
            {theme.icon} Edit Transaction
          </span>
        }
        style={{
          maxWidth: 420,
          margin: "16px auto",
          borderRadius: 16,
          borderTop: `4px solid ${theme.color}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ---------- SUCCESS ---------- */}
        <AnimatePresence>
          {success && (
            <motion.div
              variants={overlayAnim}
              initial="hidden"
              animate="visible"
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.95)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleFilled style={{ fontSize: 72, color: "#52c41a" }} />
              <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600 }}>
                Updated Successfully
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- DELETE ---------- */}
        <AnimatePresence>
          {deleting && (
            <motion.div
              variants={overlayAnim}
              initial="hidden"
              animate="visible"
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,77,79,0.95)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <DeleteOutlined style={{ fontSize: 64 }} />
              <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600 }}>
                Deleted
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- FORM ---------- */}
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select size="large" />
          </Form.Item>

          <Form.Item
            label="Payment Mode"
            name="paymentMode"
            rules={[{ required: true }]}
          >
            <Select size="large" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true }]}
          >
            <Select
              size="large"
              onChange={v => setCategory(v)}
              options={Object.keys(categoryTheme).map(k => ({
                value: k,
                label: (
                  <span style={{ display: "flex", gap: 8 }}>
                    {categoryTheme[k].icon} {k.replace("_", " ")}
                  </span>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item label="Description" name="description" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>

          <Form.Item label="Amount" name="amount" rules={[{ required: true }]}>
            <Input size="large" type="number" min={0} />
          </Form.Item>

          <Form.Item label="Date" name="entryDate" rules={[{ required: true }]}>
            <DatePicker
              size="large"
              style={{ width: "100%" }}
              disabledDate={d => d && d > dayjs().endOf("day")}
            />
          </Form.Item>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              type="primary"
              block
              size="large"
              htmlType="submit"
              loading={loading}
              style={{ background: theme.color }}
            >
              Update
            </Button>
          </motion.div>

          <Button block size="large" onClick={() => nav("/dashboard")}>
            Cancel
          </Button>

          <Button
            danger
            block
            size="large"
            icon={<DeleteOutlined />}
            onClick={onDelete}
          >
            Delete Expense
          </Button>
        </Form>
      </Card>
    </div>
  );
}
