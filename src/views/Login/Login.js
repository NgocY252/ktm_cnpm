import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Đảm bảo đường dẫn đúng
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        // Đăng nhập thành công, chuyển hướng đến trang đặt hàng
        navigate("/order");
      })
      .catch((error) => {
        // Đăng nhập không thành công, hiển thị thông báo lỗi
        setError("Mật khẩu hoặc tên đăng nhập bạn đã nhập sai.");
      });
  };

  return (
    <div className="login-form-container">
      <h2>WELCOME BACK!</h2>
      <p>You need to Log In first</p>
      {error && <p className="error">{error}</p>}{" "}
      {/* Display error message if any */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username, Email or Phone Number"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="login-form-footer">
          <label>
            <input type="checkbox" /> Remember Me
          </label>
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;
