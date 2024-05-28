import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import "./EmployeePage.css";
function EmployeePage() {
  const [employee, setEmployee] = useState([]);
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
  const handleAddEmployee = () => {
    navigate("/add-employee");
  };

  // Hàm xử lý sự kiện sửa nhân viên
  const handleEdit = (employeeId) => {
    navigate(`/edit-employee/${employeeId}`);
  };

  const handleDelete = async (employeeCode) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) {
      try {
        // Query để tìm document dựa trên employee_code
        const employeesRef = collection(db, "employees");
        const queryByCode = query(
          employeesRef,
          where("employee_code", "==", employeeCode)
        );
        const querySnapshot = await getDocs(queryByCode);

        // Nếu tìm thấy document, thực hiện xóa
        if (!querySnapshot.empty) {
          const documentToDelete = querySnapshot.docs[0]; // Lấy document đầu tiên (chúng ta giả định rằng mã nhân viên là duy nhất)
          await deleteDoc(doc(db, "employees", documentToDelete.id));
          alert("Nhân viên đã được xóa thành công!");

          // Cập nhật lại danh sách nhân viên trong UI
          setEmployee((prevEmployees) =>
            prevEmployees.filter((emp) => emp.employee_code !== employeeCode)
          );
        } else {
          alert("Không tìm thấy nhân viên với mã nhân viên: " + employeeCode);
        }
      } catch (error) {
        console.error("Error deleting employee: ", error);
        alert("Không thể xóa nhân viên: " + error.message);
      }
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "employees"));
        const employeesList = querySnapshot.docs.map((doc) => {
          const employeeData = doc.data();
          return {
            id: employeeData.employee_id, // Sử dụng trường employee_id từ Firestore làm key id
            employee_code: employeeData.employee_code,
            name: employeeData.name,
            address: employeeData.address,
            phone_number: employeeData.phone_number,
          };
        });

        // Sắp xếp employeesList theo employee_id nếu cần
        employeesList.sort((a, b) => a.id - b.id);

        setEmployee(employeesList);
      } catch (error) {
        console.error("Error fetching employees: ", error);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <img src={logo} className="App-logo" alt="logo" />
        <input
          type="search"
          className="search-input"
          placeholder="Tìm nhân viên theo mã nv"
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
      <div className="employee">
        <h2>Quản lý nhân viên</h2>
        <button className="btn-addemployee" onClick={handleAddEmployee}>
          Thêm Nhân Viên
        </button>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Mã nhân viên</th>
              <th>Tên nhân viên</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {employee
              .filter((emp) =>
                emp.employee_code
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.employee_code}</td>
                  <td>{emp.name}</td>
                  <td>{emp.address}</td>
                  <td>{emp.phone_number}</td>
                  <td>
                    <button
                      className="btn-editemployee"
                      onClick={() => handleEdit(emp.id)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn-deleteemployee"
                      onClick={() => handleDelete(emp.employee_code)}
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

export default EmployeePage;
