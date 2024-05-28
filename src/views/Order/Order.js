import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Order.css";
import logo from "../../assets/images/logo.png";
import { db } from "../../firebaseConfig";
// Đường dẫn tới file cấu hình Firebase của bạn
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
function Order() {
  const itemsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState(""); // Khai báo searchTerm
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownFontSize, setDropdownFontSize] = useState("initial");

  // Bạn sẽ cần thêm state cho ngày hóa đơn và số hóa đơn
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [employeeCode, setEmployeeCode] = useState("");
  const [customerCode, setCustomerCode] = useState("");

  const navigate = useNavigate();
  const navigateToAdminPage = () => {
    navigate("/admin");
  };

  const totalAmount = selectedProducts.reduce((total, product) => {
    return total + product.quantity * product.price;
  }, 0);

  const [customer, setCustomer] = useState({
    name: "",
    phone_number: "",
    customer_id: "",
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;

    // Cập nhật giá trị vào state cho mỗi trường
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Khi thay đổi số điện thoại, kiểm tra trong Firestore
    if (name === "phone_number") {
      const customerInfo = await fetchCustomerInfoByPhone(value);
      if (customerInfo) {
        // Nếu tìm thấy, cập nhật thông tin khách hàng vào state
        setCustomer(customerInfo);
      }
    }
  };

  // Hàm kiểm tra mã khách hàng có tồn tại hay không
  const checkIfCustomerCodeExists = async (customer_code) => {
    // Thực hiện logic kiểm tra mã trong cơ sở dữ liệu của bạn
    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("customer_code", "==", customer_code));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Trả về true nếu mã tồn tại, ngược lại trả về false
  };
  // Hàm kiểm tra mã nv có tồn tại hay không
  const checkIfEmployeeCodeExists = async (employee_code) => {
    const employeesRef = collection(db, "employees");
    const q = query(employeesRef, where("employee_code", "==", employee_code));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Trả về true nếu tồn tại
  };
  const fetchCustomerInfoByPhone = async (phoneNumber) => {
    const q = query(
      collection(db, "customers"),
      where("phone_number", "==", phoneNumber)
    );
    const querySnapshot = await getDocs(q);
    const customerData = [];
    querySnapshot.forEach((doc) => {
      customerData.push({ id: doc.id, ...doc.data() });
    });
    return customerData.length > 0 ? customerData[0] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Hàm để ẩn thông báo sau 3 giây
    const hideNotification = () => {
      setShowError(false);
      setShowSuccess(false);
    };
    if (
      typeof customer.customer_code === "undefined" ||
      !customer.customer_code.trim() ||
      typeof customer.name === "undefined" ||
      !customer.name.trim() ||
      typeof customer.phone_number === "undefined" ||
      !customer.phone_number.trim()
    ) {
      // Trường hợp dữ liệu nhập không đầy đủ
      setErrorMessage("Lỗi! Bạn chưa nhập đủ thông tin.");
      setShowError(true);
      setTimeout(hideNotification, 3000);
    } else {
      const idExists = await checkIfCustomerCodeExists(customer.customer_code);
      if (idExists) {
        // Trường hợp mã khách hàng đã tồn tại
        setErrorMessage("Mã khách hàng đã tồn tại. Vui lòng sử dụng mã khác.");
        setShowError(true);
        setTimeout(hideNotification, 3000);
      } else {
        try {
          // Lấy `customer_id` lớn nhất hiện có từ Firestore
          const querySnapshot = await getDocs(
            query(
              collection(db, "customers"),
              orderBy("customer_id", "desc"),
              limit(1)
            )
          );
          let maxCustomerId = 0;
          querySnapshot.forEach((doc) => {
            maxCustomerId = doc.data().customer_id;
          });
          const newCustomerId = maxCustomerId + 1;

          // Thêm thông tin khách hàng vào Firestore
          const docRef = await addDoc(collection(db, "customers"), {
            customer_id: newCustomerId,
            customer_code: customer.customer_code, // Đảm bảo trường này phù hợp với schema trong Firestore
            name: customer.name,
            phone_number: customer.phone_number,
          });
          setCustomer({
            customer_code: "",
            name: "",
            phone_number: "",
          });
          setShowSuccess(true); // Thông báo thành công
          setTimeout(hideNotification, 3000);
        } catch (e) {
          console.error("Error adding document: ", e);
          setErrorMessage("Lỗi khi lưu thông tin vào cơ sở dữ liệu.");
          setShowError(true);
          setTimeout(hideNotification, 3000);
        }
      }
    }
  };

  // Hàm này trả về ID hóa đơn mới dựa trên ID lớn nhất hiện có
  // Đảm bảo rằng bạn đã định nghĩa các hàm này ở ngoài và trước hàm handlePayment
  const getNewInvoiceId = async () => {
    const invoicesRef = collection(db, "invoices");
    const q = query(invoicesRef, orderBy("invoice_id", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    const lastInvoice = querySnapshot.docs[0]?.data();
    return lastInvoice ? parseInt(lastInvoice.invoice_id) + 1 : 1;
  };

  const getNewInvoiceNumber = async () => {
    const invoicesRef = collection(db, "invoices");
    const q = query(invoicesRef, orderBy("invoice_number", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    const lastInvoice = querySnapshot.docs[0]?.data();
    return lastInvoice ? parseInt(lastInvoice.invoice_number) + 1 : 1;
  };

  const handlePayment = async () => {
    if (!selectedProducts.length) {
      alert("Không có sản phẩm trong giỏ hàng.");
      return;
    }

    const doesCustomerExist = await checkIfCustomerCodeExists(customerCode);
    const doesEmployeeExist = await checkIfEmployeeCodeExists(employeeCode);

    if (!doesCustomerExist || !doesEmployeeExist) {
      alert("Thông tin khách hàng hoặc nhân viên không tồn tại.");
      return;
    }

    // Đảm bảo rằng invoiceDate là một đối tượng Date hợp lệ
    const validInvoiceDate =
      invoiceDate instanceof Date ? invoiceDate : new Date(invoiceDate);
    const invoiceDateString = validInvoiceDate.toISOString();

    const newInvoiceId = await getNewInvoiceId();
    const newInvoiceNumber = await getNewInvoiceNumber();

    const invoiceData = {
      invoice_id: newInvoiceId,
      invoice_number: newInvoiceNumber,
      customer_code: customerCode,
      employee_code: employeeCode,
      invoice_date: invoiceDateString,
      total_amount: totalAmount,
    };

    try {
      const invoiceRef = await addDoc(collection(db, "invoices"), invoiceData);

      const invoiceDetailsPromises = selectedProducts.map((product) =>
        addDoc(collection(db, "invoice_details"), {
          invoice_id: invoiceRef.id,
          product_id: product.id,
          price: product.price,
          quantity: product.quantity,
        })
      );

      await Promise.all(invoiceDetailsPromises);

      alert("Thanh toán thành công và hóa đơn cùng chi tiết đã được lưu!");
      navigate("/hoa-don-chi-tiet"); // Chuyển hướng người dùng sau khi thành công
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn: ", error);
      alert("Lỗi khi tạo hóa đơn: " + error.message);
    }
  };
  const createNewInvoice = async () => {
    const invoicesRef = collection(db, "invoices");
    const lastInvoiceQuery = query(
      invoicesRef,
      orderBy("invoice_id", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(lastInvoiceQuery);

    let newInvoiceId = 1; // Bắt đầu từ 1 nếu không tìm thấy hóa đơn nào
    if (!querySnapshot.empty) {
      const lastInvoice = querySnapshot.docs[0].data();
      newInvoiceId = lastInvoice.invoice_id + 1; // Tăng giá trị invoice_id
    }

    // Tạo hóa đơn mới với invoice_id mới
    await addDoc(invoicesRef, {
      invoice_id: newInvoiceId,
      // Các trường dữ liệu khác...
    });

    return newInvoiceId; // Trả về invoice_id mới để sử dụng cho chi tiết hóa đơn
  };

  // Đảm bảo bạn có định nghĩa hàm getNewInvoiceId và bạn đã import addDoc từ firebase/firestore

  const handleDropdownItemClick = (path) => {
    setDropdownFontSize("small");
    navigate(path);
    // Thêm logic điều hướng hoặc xử lý khác ở đây nếu cần
  };

  const selectProduct = (product) => {
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const productExists = selectedProducts.find((p) => p.id === product.id);
    if (productExists) {
      // Nếu sản phẩm đã có, tăng số lượng
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      // Nếu sản phẩm chưa có, thêm vào với số lượng là 1
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, "products"); // Tham chiếu tới collection "products"
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((b, a) => a["product code"].localeCompare(b["product code"]));
      setProducts(productList);
    };

    fetchProducts();
  }, []);
  // Lọc sản phẩm theo searchTerm và phân trang
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính tổng số trang dựa trên số sản phẩm sau khi lọc
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  // Lấy ra các sản phẩm cho trang hiện tại
  const productsToShow = filteredProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Chuyển đến trang cụ thể
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const removeProduct = (productId) => {
    setSelectedProducts(
      selectedProducts.filter((product) => product.id !== productId)
    );
  };

  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity > 0) {
      setSelectedProducts(
        selectedProducts.map((product) =>
          product.id === productId
            ? { ...product, quantity: newQuantity }
            : product
        )
      );
    } else {
      // Xóa sản phẩm nếu số lượng là 0
      removeProduct(productId);
    }
  };

  // Hàm xử lý sự kiện khi nút 'Xóa' được nhấn
  const handleClearPaymentInfo = () => {
    // Đặt lại tổng tiền về 0 hoặc giá trị mặc định nào đó
    // setTotalAmount(0);
    // Đặt lại danh sách sản phẩm đã chọn về mảng rỗng hoặc cách bạn quản lý danh sách sản phẩm
    setSelectedProducts([]);
    setEmployeeCode("");
    setCustomerCode("");
  };

  return (
    <div className="container">
      <div className="header">
        <img src={logo} className="App-logo" alt="logo" />
        <input
          type="search"
          className="search-input"
          placeholder="Tìm mặt hàng theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="user-icon">
          {/* Sử dụng icon người dùng */}
          <span className="home-text">Order</span>

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
      <div className="main-contentn">
        <div className="sidebar-dm">
          <h3>Danh Mục</h3>
          {/* Categories could be dynamically listed here */}

          <div className="content">
            {productsToShow
              // .filter((product) =>
              //   product.name.toLowerCase().includes(searchTerm.toLowerCase())
              // )
              .map((product) => (
                <div
                  className="product"
                  key={product.id}
                  onClick={() => selectProduct(product)}
                >
                  <img src={product.image} alt={product.name} />
                  <div className="name">{product.name}</div>
                  <div className="price">
                    {product.price.toLocaleString("vi-VN")}
                  </div>
                </div>
              ))}
          </div>
          <div className="pagination">
            {/* Nút Trang trước */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Trang trước
            </button>
            {/* Hiển thị các số trang để chọn trực tiếp */}
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={currentPage === index ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}

            {/* Nút Trang sau */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pageCount - 1}
            >
              Trang sau
            </button>
          </div>
        </div>

        <div className="order-summary">
          <h3>Hóa đơn</h3>
          <div className="invoice-details">
            <div className="invoice-field">
              <label htmlFor="invoice-date">Ngày hóa đơn:</label>
              <input
                type="date"
                id="invoice-date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div className="invoice-field">
              <label htmlFor="invoice-number">Số hóa đơn:</label>
              <input
                type="text"
                id="invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="order-items">
            {selectedProducts.map((product, index) => (
              <div className="order-item" key={index}>
                <button
                  className="x-btn"
                  onClick={() => removeProduct(product.id)}
                >
                  X
                </button>
                <span className="product-name">{product.name}</span>
                <span className="product-price">
                  {product.price.toLocaleString()} VND
                </span>
                <button
                  type="text"
                  onClick={() =>
                    updateProductQuantity(product.id, product.quantity - 1)
                  }
                >
                  -
                </button>
                <input
                  className="input"
                  // type="number"
                  value={product.quantity}
                  // onChange={(e) =>
                  //   updateProductQuantity(product.id, parseInt(e.target.value))
                  // }
                />
                <button
                  type="text"
                  onClick={() =>
                    updateProductQuantity(product.id, product.quantity + 1)
                  }
                >
                  +
                </button>
                <span className="product-total">
                  {(product.quantity * product.price).toLocaleString()} VND
                </span>
              </div>
            ))}
          </div>
          <div className="payment-section">
            <div className="customer-info-section">
              {/* Phần thông tin khách hàng */}
              <h3>Thông Tin Khách Hàng</h3>

              <form onSubmit={handleSubmit}>
                <label className="lbl-phone" htmlFor="phone_number">
                  Phone:
                </label>
                <input
                  className="in-phone"
                  type="t"
                  id="phone_number"
                  name="phone_number"
                  value={customer.phone_number}
                  onChange={handleChange}
                />
                <label className="lbl-name" htmlFor="name">
                  Name:
                </label>
                <input
                  className="in-name"
                  type="t"
                  id="name"
                  name="name"
                  value={customer.name}
                  onChange={handleChange}
                />
                <label className="lbl-id" htmlFor="id">
                  Mã KH:
                </label>
                <input
                  className="in-id"
                  type="t"
                  id="id"
                  name="customer_code"
                  value={customer.customer_code}
                  onChange={handleChange}
                />

                <div>
                  {showSuccess && (
                    <div className="success-kh">
                      Lưu thông tin khách hàng thành công.
                    </div>
                  )}
                  {showError && <div className="error-kh">{errorMessage}</div>}
                </div>
                <button className="save-btn" type="submit">
                  Save
                </button>
              </form>
            </div>
            <div className="payment-info-section">
              {/* Phần thông tin thanh toán */}
              <h3>Thông Tin Thanh Toán</h3>
              <div className="employee-info">
                {/* Thông tin nhân viên ghi hóa đơn */}
                <label htmlFor="employee-id" className="lbl-nv">
                  Nhân viên ghi:
                </label>
                <input
                  type="text"
                  className="in-nv"
                  id="employee-id"
                  name="employeeId"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                />
                <label htmlFor="employee-name" className="lbl-kh">
                  Mã KH:
                </label>
                <input
                  type="text"
                  className="in-kh"
                  id="employee-kh"
                  name="employeeKH"
                  value={customerCode}
                  onChange={(e) => setCustomerCode(e.target.value)}
                />
              </div>
              <div className="total-amount">
                <p>Tổng tiền: {totalAmount.toLocaleString("vi-VN")} VND</p>
              </div>

              <div className="order-actions">
                <button className="delete-btn" onClick={handleClearPaymentInfo}>
                  Xóa
                </button>
                <button className="pay-btn" onClick={handlePayment}>
                  Thanh Toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;
