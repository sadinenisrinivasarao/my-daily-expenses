import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import ExpenseList from "./pages/ExpenseList";
import EditExpense from "./pages/EditExpense";
import AppLayout from "./components/AppLayout";

import { isAuthenticated, touch } from "./utils/auth";

const Protected = ({ children }) => (isAuthenticated() ? children : <Navigate to="/" />);

export default function App() {
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const onActivity = () => touch();
    events.forEach(e => window.addEventListener(e, onActivity));

    const interval = setInterval(() => {
      if (!isAuthenticated()) {
        // force reload to kick user to login if session expired
        window.location.href = "/";
      }
    }, 30 * 1000); // check every 30s

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity));
      clearInterval(interval);
    };
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/" element={
          <Protected>
            <AppLayout />
          </Protected>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add" element={<AddExpense />} />
          <Route path="expenses" element={<ExpenseList />} />
          <Route path="edit/:id" element={<EditExpense />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
