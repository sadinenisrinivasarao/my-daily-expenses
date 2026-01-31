import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import ExpenseList from "./pages/ExpenseList";
import EditExpense from "./pages/EditExpense";
import AppLayout from "./components/AppLayout";

const Protected = ({ children }) =>
  localStorage.getItem("auth") === "true"
    ? children
    : <Navigate to="/" />;

export default function App() {
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
