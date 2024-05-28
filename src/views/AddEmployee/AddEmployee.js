import React, { useState, useEffect } from "react";
import "./AddEmployee.css";
import logo from "../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  orderBy,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
function AddEmployee() {
  const [formData, setFormData] = useState({
    employee_code: "",
    name: "",
    address: "",
    phone_number: "",
  });

  const navigate = useNavigate();

  const incrementEmployeeId = async () => {
    // Tìm employee_id lớn nhất từ nhân viên hiện có
    const employeesQuery = query(
      collection(db, "employees"),
      orderBy("employee_id", "desc"),
      limit(1)
    );
    const employeesSnapshot = await getDocs(employeesQuery);
    const lastEmployeeDoc = employeesSnapshot.docs[0];

    let newId = 1; // Giả định bắt đầu từ 1 nếu không có nhân viên nào
    if (lastEmployeeDoc) {
      const lastEmployeeId = lastEmployeeDoc.data().employee_id;
      if (typeof lastEmployeeId === "number") {
        newId = lastEmployeeId + 1;
      }
    }

    return newId;
  };

  // Rest of your component logic

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra xem các trường thông tin có được điền đầy đủ không
    if (
      !formData.employee_code.trim() ||
      formData.employee_code.trim().length === 0
    ) {
      alert("Bạn phải nhập mã nhân viên.");
      return;
    }
    if (!formData.name.trim() || formData.name.trim().length === 0) {
      alert("Bạn phải nhập tên nhân viên.");
      return;
    }
    if (
      !formData.phone_number.trim() ||
      formData.phone_number.trim().length === 0
    ) {
      alert("Bạn phải nhập số điện thoại nhân viên.");
      return;
    }

    if (formData.phone_number.length !== 10) {
      alert("Số điện thoại phải đúng 10 số.");
      return;
    }

    const employeeCodeRef = collection(db, "employees");
    const q = query(
      employeeCodeRef,
      where("employee_code", "==", formData.employee_code)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert(
        "Mã nhân viên đã tồn tại trong hệ thống. Vui lòng sử dụng mã khác."
      );
      return;
    }

    try {
      const newEmployeeId = await incrementEmployeeId();

      const newEmployeeData = {
        ...formData,
        employee_id: newEmployeeId, // Sử dụng employee_id mới
      };

      await addDoc(collection(db, "employees"), newEmployeeData);

      alert("Nhân viên đã được thêm thành công!");
      navigate("/employee");
    } catch (error) {
      console.error("Error adding employee: ", error);
      alert("Có lỗi xảy ra khi thêm nhân viên: " + error.message);
    }
  };
  return (
    <div className="container container-employee">
      <div className="header">
        <img src={logo} className="App-logo-employee" alt="logo" />
      </div>
      <form onSubmit={handleSubmit} className="edit-employee-form">
        <h2>Thêm Thông Tin Nhân Viên</h2>

        {/* Các trường form tương tự như form chỉnh sửa */}
        <div className="form-group-employee">
          <label htmlFor="employee_code">Mã Nhân Viên</label>
          <input
            className="input-group-employee"
            id="employee_code"
            type="text"
            name="employee_code"
            value={formData.employee_code}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group-employee">
          <label htmlFor="name">Tên Nhân Viên</label>
          <input
            className="input-group-employee"
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group-employee">
          <label htmlFor="address">ĐC Nhân Viên</label>
          <input
            className="input-group-employee"
            id="address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group-employee">
          <label htmlFor="phone_number">Số Điện Thoại</label>
          <input
            className="input-group-employee"
            id="phone_number"
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-actions-employee">
          <button type="submit" onClick={handleSubmit}>
            Thêm
          </button>
          <button type="button" onClick={() => navigate("/employee")}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
export default AddEmployee;
