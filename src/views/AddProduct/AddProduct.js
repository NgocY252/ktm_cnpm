import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import logo from "../../assets/images/logo.png";
import "./AddProduct.css";

function AddProduct() {
  const [newProduct, setNewProduct] = useState({
    categories: "",
    "product code": "",
    image: "",
    name: "",
    description: "",
    price: "",
    unit: "",
  });

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const checkProductCodeExists = async (productCode) => {
    const q = query(
      collection(db, "products"),
      where("product code", "==", productCode)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Trả về true nếu mã sản phẩm đã tồn tại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const exists = await checkProductCodeExists(newProduct["product code"]);
    if (exists) {
      alert("Mã sản phẩm đã tồn tại. Vui lòng sử dụng mã khác.");
      return;
    }
    try {
      await addDoc(collection(db, "products"), newProduct);
      alert("Product added successfully!");
      setNewProduct({
        categories: "",
        "product code": "",
        image: "",
        name: "",
        description: "",
        price: "",
        unit: "",
      }); // Reset form after submission
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="add-product-page">
      <div className="sidebar-product ">
        <img src={logo} alt="logo" className="logo" />
        {/* Add your sidebar navigation links here */}
      </div>
      <div className="add-product-content">
        <h1>Thêm sản phẩm mới</h1>
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="group-row">
            <div className="form-group">
              <label htmlFor="categories">Mã LSP</label>
              <input
                id="categories"
                type="text"
                name="categories"
                value={newProduct.categories}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Giá</label>
              <input
                id="price"
                type="text"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
          <div className="group-row">
            <div className="form-group">
              <label htmlFor="productCode">Mã SP</label>
              <input
                type="text"
                name="product code" // Sử dụng tên trường chính xác như bạn muốn lưu vào Firestore
                value={newProduct["product code"]} // Truy cập state bằng cách sử dụng bracket notation
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="unit">Đơn vị</label>
              <input
                id="unit"
                type="text"
                name="unit"
                value={newProduct.unit}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="image">URL Hình Ảnh</label>
            <input
              id="image"
              type="text"
              name="image"
              value={newProduct.image}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Tên sản phẩm</label>
            <input
              id="name"
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Mô tả sản phẩm</label>
            <textarea
              id="description"
              name="description"
              value={newProduct.description}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="add-product-button">
            Thêm sản phẩm
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
