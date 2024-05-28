import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CustomerPage.css";
import logo from "../../assets/images/logo.png";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
function CustomerPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownFontSize, setDropdownFontSize] = useState("initial");
  const handleDropdownItemClick = (path) => {
    setDropdownFontSize("small");
    navigate(path);
    // Thêm logic điều hướng hoặc xử lý khác ở đây nếu cần
  };
  const navigateToAdminPage = () => {
    navigate("/admin");
  };
  const handleDelete = async (customer_id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
      try {
        // Trước tiên, tìm document ID dựa trên customer_id
        const customersRef = collection(db, "customers");
        const q = query(customersRef, where("customer_id", "==", customer_id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Giả định rằng customer_id là duy nhất và chỉ tìm thấy một document
          const docToDelete = querySnapshot.docs[0];
          await deleteDoc(doc(db, "customers", docToDelete.id));

          // Cập nhật state để loại bỏ khách hàng khỏi danh sách
          setCustomers(
            customers.filter((customer) => customer.customer_id !== customer_id)
          );
          alert("Xóa khách hàng thành công!");
        } else {
          alert("Không tìm thấy khách hàng với ID: " + customer_id);
        }
      } catch (error) {
        console.error("Lỗi khi xóa khách hàng: ", error);
        alert("Không thể xóa khách hàng: " + error.message);
      }
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      const querySnapshot = await getDocs(collection(db, "customers"));
      const customersList = querySnapshot.docs
        .map((doc) => ({
          ...doc.data(),
          // Chú ý rằng bạn cần phải sử dụng doc.data().customer_id để lấy customer_id từ dữ liệu của document.
          id: doc.data().customer_id,
        }))
        .sort((a, b) => a.id - b.id);
      setCustomers(customersList);
    };

    fetchCustomers();
  }, []);
  return (
    <div className="container">
      <div className="header">
        <img src={logo} className="App-logo" alt="logo" />
        <input
          type="search"
          className="search-input"
          placeholder="Tìm theo mã khách hàng"
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
      <div className="customer-list">
        <h2>Danh sách khách hàng</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã KH</th>
              <th>Tên</th>
              <th>Số Điện Thoại</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {customers
              .filter((customer) =>
                customer.customer_code
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.customer_id}</td>
                  <td>{customer.customer_code}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone_number}</td>
                  <td>
                    <button
                      className="btn-delete-customer"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerPage;
