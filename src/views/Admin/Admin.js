import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import "./Admin.css";
import logo from "../../assets/images/logo.png";

function Admin() {
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn không cho form gửi theo cách truyền thống
    // Kiểm tra nếu có editingCategory, tức là đang ở trạng thái sửa
    if (editingCategory) {
      saveCategory(); // Gọi hàm cập nhật
    } else {
      addCategory(); // Ngược lại, gọi hàm thêm mới
    }
  };

  const [showAddForm, setShowAddForm] = useState(false);

  const handleShowEditForm = () => {
    setShowAddForm(true); // Giả sử bạn tái sử dụng trạng thái này để kiểm soát việc hiển thị form sửa
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  // Function to handle the Cancel button click, which hides the form and resets form data
  const handleCancelAdd = () => {
    setShowAddForm(false);
    setFormData({ code: "", name: "" });
  };
  const [activeSection, setActiveSection] = useState("home");
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ code: "", name: "" });
  const categoriesCollectionRef = collection(db, "categories");
  const navigate = useNavigate();
  const [maxId, setMaxId] = useState(0);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const querySnapshot = await getDocs(categoriesCollectionRef);
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const highestId =
          categoriesData.length > 0
            ? Math.max(...categoriesData.map((c) => Number(c.id)))
            : 0;

        setCategories(categoriesData);
        setMaxId(highestId);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    getCategories();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Khi thêm mới category
  const addCategory = async () => {
    if (!formData.code || !formData.name) return;

    // Kiểm tra xem mã loại sản phẩm đã tồn tại chưa
    const codeExists = categories.some(
      (category) => category.code === formData.code
    );

    if (codeExists) {
      // Nếu mã loại sản phẩm đã tồn tại, hiển thị thông báo lỗi và ngăn chặn thêm mới
      alert("Mã loại sản phẩm đã tồn tại. Vui lòng sử dụng mã khác.");
      return;
    }

    try {
      const docRef = await addDoc(categoriesCollectionRef, {
        code: formData.code,
        name: formData.name,
      });
      console.log("New document added with ID: ", docRef.id);
      setCategories([
        ...categories,
        { code: formData.code, name: formData.name, id: docRef.id },
      ]);
      setFormData({ code: "", name: "" }); // Reset form
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Khi cập nhật category
  // Khi cập nhật category
  const saveCategory = async () => {
    if (!formData.code || !formData.name || !editingCategory) return;

    // Kiểm tra xem mã loại sản phẩm mới có trùng với mã của các loại sản phẩm khác đã tồn tại hay không
    const codeExists = categories.some(
      (category) =>
        category.code === formData.code && category.id !== editingCategory.id
    );

    if (codeExists) {
      // Nếu mã loại sản phẩm mới trùng với mã của loại sản phẩm khác đã tồn tại, hiển thị thông báo lỗi
      alert("Mã loại sản phẩm đã tồn tại. Vui lòng sử dụng mã khác.");
      return;
    }

    const categoryDocRef = doc(db, "categories", editingCategory.id);
    try {
      await updateDoc(categoryDocRef, {
        code: formData.code,
        name: formData.name,
      });
      console.log("Document successfully updated!");
      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id
          ? { ...cat, code: formData.code, name: formData.name }
          : cat
      );
      setCategories(updatedCategories);
      setEditingCategory(null); // Reset editing state
      setFormData({ code: "", name: "" }); // Clear form
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Khi xóa category
  // Khi xóa category
  const deleteCategory = async (id) => {
    // Sử dụng hàm confirm để hiển thị thông báo xác nhận
    const isConfirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa loại sản phẩm này không?"
    );
    if (!isConfirmed) {
      // Nếu người dùng nhấn Cancel, hủy bỏ hành động xóa
      return;
    }

    try {
      await deleteDoc(doc(db, "categories", id));
      console.log("Document successfully deleted!");
      setCategories(categories.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Khi chọn một category để chỉnh sửa
  const editCategory = (category) => {
    setEditingCategory(category); // Đặt category hiện tại để chỉnh sửa
    setFormData({ code: category.code, name: category.name }); // Cập nhật formData với thông tin của category
    handleShowEditForm(); // Gọi hàm hiển thị form
  };
  const resetForm = () => {
    setEditingCategory(null); // Reset về null
    // Reset các trạng thái form khác về giá trị ban đầu nếu cần
  };

  const renderCategoriesTable = () => (
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Mã</th>
          <th>Tên</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            <td>{category.id}</td>
            <td>{category.code}</td>
            <td>{category.name}</td>
            <td>
              <button
                className="edit-btn"
                onClick={() => editCategory(category)}
              >
                Sửa
              </button>
              <button onClick={() => deleteCategory(category.id)} type="a">
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const getProducts = async () => {
      const productsCollectionRef = collection(db, "products"); // Giả sử tên collection là "products"

      try {
        const querySnapshot = await getDocs(productsCollectionRef);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    getProducts();
  }, []); // Đảm bảo rằng effect này chỉ chạy một lần khi component mount

  const navigateToAddProduct = () => {
    navigate("/add-product"); // Đảm bảo rằng đường dẫn này khớp với Route bạn đã định nghĩa
  };

  const navigateToEditProduct = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      await deleteDoc(doc(db, "products", productId));
      setProducts(products.filter((product) => product.id !== productId));
    }
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Lọc products dựa trên từ khóa tìm kiếm
  const filteredProducts =
    searchTerm.length === 0
      ? products
      : products.filter((product) => {
          return (
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product["product code"]
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        });
  const renderProductsTable = () => (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Mã LSP</th>
          <th>Mã SP</th>
          <th>Hình Ảnh</th>
          <th>Tên sản phẩm</th>
          <th>Mô tả</th>
          <th>Giá</th>
          <th>Đơn vị</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {filteredProducts.map(
          (
            product // Sử dụng filteredProducts thay vì products
          ) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.categories}</td>
              <td>{product["product code"]}</td>
              <td className="image-column">
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: "100%", height: "auto" }}
                />
              </td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price.toLocaleString()}</td>
              <td>{product.unit}</td>
              <td>
                <button
                  type="a"
                  className="edit-button"
                  onClick={() => navigateToEditProduct(product.id)}
                >
                  Sửa
                </button>
                <button
                  type="a"
                  className="delete-button"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );

  return (
    <div className="admin-container">
      <div className="sidebar">
        <img src={logo} alt="logo" />
        <button type="l" onClick={() => setActiveSection("home")}>
          Home
        </button>
        <button type="l" onClick={() => setActiveSection("categories")}>
          Loại sản phẩm
        </button>
        <button type="l" onClick={() => setActiveSection("products")}>
          Sản phẩm
        </button>
      </div>
      <div className="main-content">
        {activeSection === "home" && (
          <div>Chào mừng bạn đến với trang quản trị!</div>
        )}
        {activeSection === "categories" && (
          <div>
            <h2>Quản lý loại sản phẩm</h2>
            {showAddForm && (
              <form className="form-qlsp" onSubmit={handleSubmit}>
                <input
                  className="code-input"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Mã loại sản phẩm"
                />
                <input
                  className="name-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tên loại sản phẩm"
                />
                <button type="a">Lưu</button>
                <button type="a" onClick={handleCancelAdd}>
                  Hủy
                </button>
              </form>
            )}
            {!showAddForm && (
              <button onClick={handleShowAddForm} type="a">
                Thêm Loại Sản Phẩm
              </button>
            )}
            {renderCategoriesTable()}
          </div>
        )}

        {activeSection === "products" && (
          <div>
            <h2>Danh sách sản phẩm</h2>
            <button onClick={navigateToAddProduct} type="a">
              Thêm Sản Phẩm
            </button>
            <input
              type="text"
              className="serch-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {renderProductsTable()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
