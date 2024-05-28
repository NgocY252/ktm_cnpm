import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import logo from "../../assets/images/logo.png";
import "./EditProduct.css";

function EditProduct() {
  const [product, setProduct] = useState(null);
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Product data:", docSnap.data());
        setProduct({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("Không tìm thấy sản phẩm!");
        navigate("/admin/products");
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prevent duplicate product codes
    const q = query(
      collection(db, "products"),
      where("product code", "==", product["product code"])
    );
    const querySnapshot = await getDocs(q);
    let isDuplicate = false;
    querySnapshot.forEach((doc) => {
      if (doc.id !== productId) {
        isDuplicate = true;
      }
    });

    if (isDuplicate) {
      alert(
        "A product with this code already exists. Please use a different code."
      );
      return;
    }

    // Proceed with the update if no duplicate
    const productRef = doc(db, "products", productId);
    try {
      await updateDoc(productRef, product);
      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-product-page">
      {/* Sidebar */}
      <div className="sidebar-product">
        <img src={logo} alt="Company Logo" className="logo" />
      </div>

      {/* Edit Product Form */}
      <div className="edit-product-form-container">
        <h1>Chỉnh sửa sản phẩm</h1>
        <form onSubmit={handleSubmit} className="edit-product-form">
          <div className="group-row">
            <div className="form-group">
              <label htmlFor="categories">Mã LSP</label>
              <input
                id="categories"
                type="text"
                name="categories"
                value={product.categories}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Giá</label>
              <input
                id="price"
                type="text"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
          <div className="group-row">
            <div className="form-group">
              <label htmlFor="product-code">Mã SP</label>
              <input
                id="product-code"
                type="text"
                name="product code" // Chú ý đến khoảng trắng giữa "product" và "code"
                value={product["product code"]} // Đây là cách bạn truy xuất giá trị nếu key có khoảng trắng
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Đơn vị</label>
              <input
                id="unit"
                type="text"
                name="unit"
                value={product.unit}
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
              value={product.image}
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
              value={product.name}
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
              value={product.description}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="edit-product-button">
            Cập nhật sản phẩm
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
