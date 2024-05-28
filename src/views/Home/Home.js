import React from "react";
import logo from "../../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaw, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <nav className="App-nav">
          <Link to="/login" className="App-link">
            Login
          </Link>

          <a href="/language" className="App-link">
            <FontAwesomeIcon icon={faGlobe} />
          </a>
        </nav>
      </header>
      <main className="App-main">
        <div className="App-title-container">
          <FontAwesomeIcon
            icon={faPaw}
            size="3x"
            style={{ color: "#b552bc" }}
          />
          <h1>Phần mềm bán hàng BUNNY</h1>
        </div>
        {/* Nội dung khác của trang Home */}
      </main>
    </div>
  );
}

export default Home;
