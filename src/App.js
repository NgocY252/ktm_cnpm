import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Import tất cả các components và views của bạn
import Home from "./views/Home/Home.js";
import "./App.css";
import Login from "./views/Login/Login";
import Order from "./views/Order/Order";
import Admin from "./views/Admin/Admin.js";
import HDCT from "./views/HDCT/HDCT.js";
import AddProduct from "./views/AddProduct/AddProduct.js";
import EditProduct from "./views/EditProduct/EditProduct.js";
import EmployeePage from "./views/EmployeePage/EmployeePage.js";
import CustomerPage from "./views/CustomerPage/CustomerPage.js";
import EditEmployee from "./views/EditEmployee/EditEmployee.js";
import AddEmployee from "./views/AddEmployee/AddEmployee.js";
import Invoice from "./views/Invoice/Invoice.js";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/order" element={<Order />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/hoa-don-chi-tiet" element={<HDCT />} />
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/edit-product/:productId" element={<EditProduct />} />
          <Route path="/edit-employee/:id" element={<EditEmployee />} />
          <Route path="/add-employee" element={<AddEmployee />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
