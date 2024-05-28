import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Invoice.css";
import logo from "../../assets/images/logo.png";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownFontSize, setDropdownFontSize] = useState("initial");
  const navigate = useNavigate();
  const handleDropdownItemClick = (path) => {
    setDropdownFontSize("small");
    navigate(path);
    // Thêm logic điều hướng hoặc xử lý khác ở đây nếu cần
  };
  const navigateToAdminPage = () => {
    navigate("/admin");
  };

  useEffect(() => {
    // Hàm này sẽ được gọi khi component được mount
    const fetchInvoices = async () => {
      const invoicesCollection = collection(db, "invoices");
      // Sắp xếp dữ liệu theo 'customer_id' từ thấp đến cao
      const q = query(invoicesCollection, orderBy("invoice_id"));
      const invoicesSnapshot = await getDocs(q);
      const invoicesList = invoicesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setInvoices(invoicesList);
    };

    fetchInvoices();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <img src={logo} className="App-logo" alt="logo" />
        <input
          type="search"
          className="search-input"
          placeholder="Tìm theo mã hóa đơn"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="user-icon">
          {/* Sử dụng icon người dùng */}
          <Link to="/order" className="home-text">
            Order
          </Link>

          <Link to="/hoa-don-chi-tiet" className="bill-text">
            <span>Hóa Đơn Chi Tiết</span>
          </Link>
          <span
            className="manage-text"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Quản Lý
          </span>
          <div className={`dropdown-menu ${showDropdown ? "show" : ""}`}>
            <div
              className="dropdown-item"
              onClick={() => handleDropdownItemClick("/invoice")}
            >
              Hóa đơn
            </div>
            <div
              className="dropdown-item"
              onClick={() => handleDropdownItemClick("/employee")}
            >
              Nhân viên
            </div>
            <div
              className="dropdown-item"
              onClick={() => handleDropdownItemClick("/customer")}
            >
              Khách hàng
            </div>
          </div>

          <FontAwesomeIcon
            icon={faUser}
            color="white"
            onClick={navigateToAdminPage}
          />
        </div>
      </div>
      <div className="invoice-list">
        <h2>Danh sách hóa đơn</h2>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã KH</th>
              <th>Mã Nhân Viên</th>
              <th>Số Hóa Đơn</th>
              <th>Ngày Hóa Đơn</th>
              <th>Tổng Tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.invoice_id}>
                <td>{invoice.invoice_id}</td>
                <td>{invoice.customer_code}</td>
                <td>{invoice.employee_code}</td>
                <td>{invoice.invoice_number}</td>
                <td>{invoice.invoice_date}</td>
                <td>{invoice.total_amount.toLocaleString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Invoice;
