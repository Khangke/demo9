import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>Khang Trầm Hương</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <ul>
                <li><a href="#home">Trang Chủ</a></li>
                <li><a href="#products">Sản Phẩm</a></li>
                <li><a href="#about">Giới Thiệu</a></li>
                <li><a href="#news">Tin Tức</a></li>
                <li><a href="#contact">Liên Hệ</a></li>
              </ul>
            </nav>

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
                <li><a href="#home" onClick={toggleMobileMenu}>Trang Chủ</a></li>
                <li><a href="#products" onClick={toggleMobileMenu}>Sản Phẩm</a></li>
                <li><a href="#about" onClick={toggleMobileMenu}>Giới Thiệu</a></li>
                <li><a href="#news" onClick={toggleMobileMenu}>Tin Tức</a></li>
                <li><a href="#contact" onClick={toggleMobileMenu}>Liên Hệ</a></li>
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <img src="https://images.unsplash.com/photo-1613750255797-7d4f877615df" alt="Trầm hương đang cháy" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h2>Khám Phá Trầm Hương Cao Cấp</h2>
          <p>Trải nghiệm hương thơm thiên nhiên quý hiếm từ rừng Việt Nam</p>
          <button className="cta-button">Khám Phá Sản Phẩm</button>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="intro">
        <div className="container">
          <h2>Về Trầm Hương Khang</h2>
          <p>
            Chúng tôi chuyên cung cấp các sản phẩm trầm hương cao cấp, được khai thác và chế biến 
            theo phương pháp truyền thống. Mỗi sản phẩm đều mang trong mình hương thơm tinh tế 
            và chất lượng tuyệt vời từ thiên nhiên.
          </p>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <div className="container">
          <h2>Sản Phẩm Nổi Bật</h2>
          
          {loading ? (
            <div className="loading">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.filter(product => product.featured).map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image_url} alt={product.name} />
                    <div className="product-overlay">
                      <button className="quick-view-btn">Xem Nhanh</button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-price">
                      <span className="current-price">{formatPrice(product.price)}</span>
                      {product.original_price && (
                        <span className="original-price">{formatPrice(product.original_price)}</span>
                      )}
                    </div>
                    <div className="product-actions">
                      <button className="add-to-cart-btn">Thêm Vào Giỏ</button>
                      <button className="buy-now-btn">Mua Ngay</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-us">
        <div className="container">
          <h2>Về Chúng Tôi</h2>
          
          <div className="about-content">
            <div className="about-text">
              <div className="about-section">
                <h3>Câu Chuyện Của Chúng Tôi</h3>
                <p>
                  Khang Trầm Hương được thành lập với niềm đam mê mang đến những sản phẩm trầm hương 
                  chất lượng cao nhất từ rừng Việt Nam. Chúng tôi hiểu rằng trầm hương không chỉ là 
                  một loại hương thơm, mà còn là cầu nối giữa con người với thiên nhiên, giữa hiện tại 
                  và truyền thống.
                </p>
              </div>

              <div className="about-section">
                <h3>Cam Kết Chất Lượng</h3>
                <p>
                  Mỗi sản phẩm trầm hương của chúng tôi đều được tuyển chọn kỹ lưỡng từ những cây 
                  trầm già cỗi trong rừng tự nhiên. Chúng tôi áp dụng phương pháp chế biến truyền thống 
                  kết hợp với công nghệ hiện đại để bảo toàn hương thơm tinh tế và chất lượng vượt trội.
                </p>
              </div>

              <div className="about-section">
                <h3>Sứ Mệnh</h3>
                <p>
                  Chúng tôi mong muốn mang đến cho khách hàng những trải nghiệm tuyệt vời nhất với 
                  trầm hương cao cấp, góp phần bảo tồn và phát triển nền văn hóa trầm hương Việt Nam. 
                  Sự hài lòng của khách hàng chính là động lực để chúng tôi không ngừng cải tiến và phát triển.
                </p>
              </div>
            </div>

            <div className="about-features">
              <div className="feature-item">
                <div className="feature-icon">🌿</div>
                <div className="feature-content">
                  <h4>Nguồn Gốc Tự Nhiên</h4>
                  <p>100% từ rừng tự nhiên Việt Nam</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">🏆</div>
                <div className="feature-content">
                  <h4>Chất Lượng Cao</h4>
                  <p>Tuyển chọn và chế biến theo tiêu chuẩn nghiêm ngặt</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div className="feature-content">
                  <h4>Uy Tín Đáng Tin</h4>
                  <p>Nhiều năm kinh nghiệm trong ngành trầm hương</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">🚚</div>
                <div className="feature-content">
                  <h4>Giao Hàng Nhanh</h4>
                  <p>Đóng gói cẩn thận, giao hàng toàn quốc</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-cta">
            <h3>Khám Phá Bộ Sưu Tập Trầm Hương Của Chúng Tôi</h3>
            <p>Trải nghiệm hương thơm tinh tế từ thiên nhiên</p>
            <button className="cta-button">Xem Sản Phẩm</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Khang Trầm Hương</h3>
              <p>Chuyên cung cấp trầm hương cao cấp, chất lượng tuyệt vời từ thiên nhiên.</p>
            </div>
            
            <div className="footer-section">
              <h4>Liên Kết</h4>
              <ul>
                <li><a href="#home">Trang Chủ</a></li>
                <li><a href="#products">Sản Phẩm</a></li>
                <li><a href="#about">Giới Thiệu</a></li>
                <li><a href="#contact">Liên Hệ</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Thông Tin Liên Hệ</h4>
              <p>📧 contact@khangtramhuong.vn</p>
              <p>📞 (+84) 123 456 789</p>
              <p>📍 Việt Nam</p>
            </div>
            
            <div className="footer-section">
              <h4>Theo Dõi Chúng Tôi</h4>
              <div className="social-links">
                <a href="#" aria-label="Facebook" className="social-facebook">
                  <span className="social-icon">📘</span>
                  <span className="social-text">Facebook</span>
                </a>
                <a href="#" aria-label="Instagram" className="social-instagram">
                  <span className="social-icon">📷</span>
                  <span className="social-text">Instagram</span>
                </a>
                <a href="#" aria-label="Zalo" className="social-zalo">
                  <span className="social-icon">💬</span>
                  <span className="social-text">Zalo</span>
                </a>
                <a href="#" aria-label="YouTube" className="social-youtube">
                  <span className="social-icon">🎥</span>
                  <span className="social-text">YouTube</span>
                </a>
                <a href="#" aria-label="TikTok" className="social-tiktok">
                  <span className="social-icon">🎵</span>
                  <span className="social-text">TikTok</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Khang Trầm Hương. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;