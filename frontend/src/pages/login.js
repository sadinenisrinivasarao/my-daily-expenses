import { Card, Input, Button, Typography, message } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./styles.css";
import { setAuth } from "../utils/auth";

const { Title, Text } = Typography;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const login = () => {
    if (!email || !password) {
      message.warning("Please enter email and password");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const envEmail = process.env.REACT_APP_EMAIL;
      const envPsd = process.env.REACT_APP_PSD;
      const envEmail2 = process.env.REACT_APP_EMAIL2;
      const envPsd2 = process.env.REACT_APP_PSD2;

      const isEnvUser = email === envEmail && password === envPsd;
      const isEnvUser2 = email === envEmail2 && password === envPsd2;

      if (isEnvUser || isEnvUser2) {
        message.success("Welcome back 👋");
        setAuth(email);
        nav("/dashboard");
      } else {
        message.error("Invalid credentials");
      }
      setLoading(false);
    }, 900);
  };

  return (
    <div className="login-bg">
      <Card className="login-card">
        <div className="login-logo">💰 ExpensePro</div>

        <Title level={3} style={{ textAlign: "center" }}>
          Sign In
        </Title>
        <Text type="secondary" style={{ display: "block", textAlign: "center" }}>
          Manage your expenses smartly
        </Text>

        <Input
          size="large"
          placeholder="Email"
          prefix={<MailOutlined />}
          style={{ marginTop: 24 }}
          onChange={e => setEmail(e.target.value)}
        />

        <Input.Password
          size="large"
          placeholder="Password"
          prefix={<LockOutlined />}
          style={{ marginTop: 16 }}
          onChange={e => setPassword(e.target.value)}
        />

        <Button
          type="primary"
          size="large"
          icon={<LoginOutlined />}
          loading={loading}
          block
          style={{ marginTop: 24 }}
          onClick={login}
        >
          Login
        </Button>
      </Card>
    </div>
  );
}
