import React, { useState, useEffect } from "react";
import "./EditEmployee.css";
import logo from "../../assets/images/logo.png";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employee_code: "",
    name: "",
    address: "",
    phone_number: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchEmployeeData = async () => {
      try {
        const docRef = doc(db, "employees", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          alert("Không tìm thấy nhân viên!");
          navigate("/employee");
        }
      } catch (error) {
        console.error("Error fetching employee data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id, navigate]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const docRef = doc(db, "employees", id);
      await updateDoc(docRef, formData);
      alert("Cập nhật thông tin nhân viên thành công!");
      navigate("/employee");
    } catch (error) {
      console.error("Error updating employee: ", error);
      alert("Cập nhật thông tin nhân viên thất bại: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return <p>Loading...</p>;
  }
  return (
    <div className="container container-employee">
      <div className="header">
        <img src={logo} className="App-logo-employee" alt="logo" />
      </div>
      <form onSubmit={handleSubmit} className="edit-employee-form">
        <h2>Chỉnh Sửa Thông Tin Nhân Viên</h2>

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
          <button type="submit" disabled={isLoading}>
            Cập nhật
          </button>
          <button type="button" onClick={() => navigate("/employee")}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEmployee;
