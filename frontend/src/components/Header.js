import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Khang Trầm Hương</h1>
            <span className="tagline">Tinh hoa trầm hương Việt Nam</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul>
              <li><Link to="/" className={isActive('/') ? 'active' : ''}>Trang Chủ</Link></li>
              <li><Link to="/products" className={isActive('/products') ? 'active' : ''}>Sản Phẩm</Link></li>
              <li><a href="#about">Giới Thiệu</a></li>
              <li><a href="#news">Tin Tức</a></li>
              <li><a href="#contact">Liên Hệ</a></li>
            </ul>
          </nav>

          <div className="header-actions">
            <div className="header-icons">
              <button className="header-icon-btn" aria-label="Giỏ hàng">
                <ion-icon name="bag-outline" class="icon"></ion-icon>
                <span className="badge">0</span>
              </button>
              <button className="header-icon-btn" aria-label="Tài khoản">
                <ion-icon name="person-outline" class="icon"></ion-icon>
              </button>
            </div>
            <button className="header-cta-btn">Liên Hệ Ngay</button>
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="mobile-nav">
            <ul>
              <li><Link to="/" onClick={toggleMobileMenu}>Trang Chủ</Link></li>
              <li><Link to="/products" onClick={toggleMobileMenu}>Sản Phẩm</Link></li>
              <li><a href="#about" onClick={toggleMobileMenu}>Giới Thiệu</a></li>
              <li><a href="#news" onClick={toggleMobileMenu}>Tin Tức</a></li>
              <li><a href="#contact" onClick={toggleMobileMenu}>Liên Hệ</a></li>
              <li><a href="#cart" onClick={toggleMobileMenu}>Giỏ Hàng</a></li>
              <li><a href="#account" onClick={toggleMobileMenu}>Tài Khoản</a></li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;