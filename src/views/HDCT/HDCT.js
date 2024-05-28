import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import logo from "../../assets/images/logo.png";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./HDCT.css";

function HDCT() {
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "invoice_details"));
        if (!querySnapshot.empty) {
          const details = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setInvoiceDetails(details);
        } else {
          setError("Không tìm thấy chi tiết hóa đơn.");
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
        setError("Lỗi khi tải dữ liệu.");
      }
    };

    fetchInvoiceDetails();
  }, []);

  const navigateToAdminPage = () => {
    navigate("/admin");
  };

  const handleDropdownItemClick = (itemName) => {
    console.log("Dropdown item clicked: ", itemName);
    // Thêm logic điều hướng hoặc xử lý khác tại đây nếu cần
  };

  return (
    <div>
      <div className="header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="user-icon">
          <Link to="/order" className="home-text">
            Order
          </Link>
          <Link to="/hoa-don-chi-tiet" className="bill-text">
            Hóa Đơn Chi Tiết
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
              onClick={() => handleDropdownItemClick("Nhân viên")}
            >
              Nhân viên
            </div>
            <div
              className="dropdown-item"
              onClick={() => handleDropdownItemClick("Khách hàng")}
            >
              Khách hàng
            </div>
          </div>

          <Link to="/admin" className="icon">
            <FontAwesomeIcon icon={faUser} color="white" />
          </Link>
        </div>
      </div>
      <div className="table-container">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>HD_ID</th>
                <th>SP_ID</th>
                <th>Giá</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {invoiceDetails.map((detail) => (
                <tr key={detail.id}>
                  <td>{detail.id}</td>
                  <td>{detail.invoice_id}</td>
                  <td>{detail.product_id}</td> {/* Thay đổi tại đây */}
                  <td>{detail.price}</td>
                  <td>{detail.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default HDCT;
