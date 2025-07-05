import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hours: 15,
    minutes: 30,
    seconds: 45
  });

  useEffect(() => {
    fetchProducts();
    
    // Countdown timer effect
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        let { days, hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          seconds = 59;
          minutes--;
        } else if (hours > 0) {
          seconds = 59;
          minutes = 59;
          hours--;
        } else if (days > 0) {
          seconds = 59;
          minutes = 59;
          hours = 23;
          days--;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
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

  return (
    <>
      {/* Hero Banner */}
      <section className="hero" id="home">
        <div className="hero-background">
          <img src="https://images.unsplash.com/photo-1613750255797-7d4f877615df" alt="Trầm hương cao cấp đang cháy tỏa hương thơm" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1>Trầm Hương Cao Cấp Khang</h1>
          <p>Khám phá vẻ đẹp tinh túy của trầm hương Việt Nam với chất lượng vượt trội và hương thơm đặc trưng từ rừng tự nhiên</p>
          <div className="hero-cta">
            <Link to="/products" className="cta-primary">Khám Phá Ngay</Link>
            <button className="cta-secondary">Tư Vấn Miễn Phí</button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products" id="products">
        <div className="container">
          <div className="section-header">
            <h2>Sản Phẩm Nổi Bật</h2>
            <p>Những sản phẩm trầm hương chất lượng cao được khách hàng yêu thích nhất</p>
          </div>
          
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.filter(product => product.featured).slice(0, 3).map(product => (
                <Link key={product.id} to={`/product/${product.id}`} className="product-card-link">
                  <div className="product-card">
                    <div className="product-image">
                      <img src={product.image_url} alt={product.name} />
                      <div className="product-badge">Nổi Bật</div>
                      <div className="product-overlay">
                        <span className="quick-view-btn">Xem Chi Tiết</span>
                      </div>
                    </div>
                    <div className="product-info">
                      <div className="product-category">{product.category}</div>
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="product-price">
                        <span className="current-price">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="original-price">{formatPrice(product.original_price)}</span>
                        )}
                      </div>
                      <div className="product-rating">
                        <div className="stars">
                          <ion-icon name="star"></ion-icon>
                          <ion-icon name="star"></ion-icon>
                          <ion-icon name="star"></ion-icon>
                          <ion-icon name="star"></ion-icon>
                          <ion-icon name="star"></ion-icon>
                        </div>
                        <span className="rating-text">(4.9/5)</span>
                      </div>
                      <button className="add-to-cart-btn" onClick={(e) => e.preventDefault()}>Thêm Vào Giỏ Hàng</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="products-cta">
            <Link to="/products" className="view-all-btn">Xem Tất Cả Sản Phẩm</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us" id="about">
        <div className="container">
          <div className="section-header">
            <h2>Tại Sao Lựa Chọn Trầm Hương Khang?</h2>
            <p>Chúng tôi cam kết mang đến những sản phẩm trầm hương chất lượng cao nhất</p>
          </div>

          <div className="why-content">
            <div className="why-image">
              <img src="https://images.unsplash.com/photo-1600122646819-75abc00c88a6" alt="Trầm hương tự nhiên cao cấp" />
            </div>
            <div className="why-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <ion-icon name="leaf-outline"></ion-icon>
                </div>
                <div className="feature-content">
                  <h3>100% Tự Nhiên</h3>
                  <p>Được khai thác từ rừng tự nhiên Việt Nam, không chất bảo quản, không hóa chất độc hại</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <ion-icon name="trophy-outline"></ion-icon>
                </div>
                <div className="feature-content">
                  <h3>Chất Lượng Cao</h3>
                  <p>Quy trình tuyển chọn nghiêm ngặt, chỉ chọn những cây trầm già cỗi có độ dầu cao</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <ion-icon name="time-outline"></ion-icon>
                </div>
                <div className="feature-content">
                  <h3>Kinh Nghiệm Lâu Năm</h3>
                  <p>Hơn 15 năm kinh nghiệm trong ngành, được hàng nghìn khách hàng tin tưởng</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <ion-icon name="flower-outline"></ion-icon>
                </div>
                <div className="feature-content">
                  <h3>Hương Thơm Đặc Trưng</h3>
                  <p>Hương thơm tinh tế, bền lâu, mang lại cảm giác thư giãn và thanh tịnh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="reviews" id="reviews">
        <div className="container">
          <div className="section-header">
            <h2>Đánh Giá Khách Hàng</h2>
            <p>Cảm nhận thật từ những khách hàng đã sử dụng sản phẩm</p>
          </div>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    <ion-icon name="person"></ion-icon>
                  </div>
                  <div className="reviewer-details">
                    <h4>Nguyễn Văn A</h4>
                    <span className="reviewer-location">Hà Nội</span>
                  </div>
                </div>
                <div className="review-rating">
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                </div>
              </div>
              <p className="review-text">
                "Trầm hương ở đây thật sự rất chất lượng! Hương thơm rất đặc trưng và bền lâu. 
                Tôi đã mua nhiều lần và luôn hài lòng với sản phẩm."
              </p>
              <div className="review-date">2 tuần trước</div>
            </div>

            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    <ion-icon name="person"></ion-icon>
                  </div>
                  <div className="reviewer-details">
                    <h4>Trần Thị B</h4>
                    <span className="reviewer-location">TP. Hồ Chí Minh</span>
                  </div>
                </div>
                <div className="review-rating">
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                </div>
              </div>
              <p className="review-text">
                "Dịch vụ tuyệt vời, sản phẩm đúng như mô tả. Trầm hương có mùi rất thơm và tự nhiên. 
                Sẽ tiếp tục ủng hộ shop!"
              </p>
              <div className="review-date">1 tháng trước</div>
            </div>

            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    <ion-icon name="person"></ion-icon>
                  </div>
                  <div className="reviewer-details">
                    <h4>Lê Văn C</h4>
                    <span className="reviewer-location">Đà Nẵng</span>
                  </div>
                </div>
                <div className="review-rating">
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                  <ion-icon name="star"></ion-icon>
                </div>
              </div>
              <p className="review-text">
                "Chất lượng xuất sắc, đóng gói cẩn thận. Giao hàng nhanh chóng. 
                Trầm hương có mùi thơm rất đặc biệt, rất đáng để thử!"
              </p>
              <div className="review-date">3 tuần trước</div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section className="promotions">
        <div className="container">
          <div className="section-header">
            <h2>Ưu Đãi & Khuyến Mãi</h2>
            <p>Đừng bỏ lỡ những chương trình khuyến mãi hấp dẫn</p>
          </div>

          <div className="promotions-grid">
            <div className="promotion-card featured-promo">
              <div className="promo-badge">HOT</div>
              <div className="promo-content">
                <h3>Giảm 30% Tất Cả Sản Phẩm</h3>
                <p>Áp dụng cho đơn hàng từ 2 triệu đồng</p>
                <div className="promo-timer">
                  <span className="timer-text">Còn lại:</span>
                  <div className="timer">
                    <span className="timer-unit">{timeLeft.days}<small>ngày</small></span>
                    <span className="timer-unit">{timeLeft.hours}<small>giờ</small></span>
                    <span className="timer-unit">{timeLeft.minutes}<small>phút</small></span>
                    <span className="timer-unit">{timeLeft.seconds}<small>giây</small></span>
                  </div>
                </div>
                <div className="promo-buttons">
                  <Link to="/products" className="promo-btn promo-btn-primary">Mua Ngay</Link>
                </div>
              </div>
            </div>

            <div className="promotion-card">
              <div className="promo-content">
                <h3>Mua 2 Tặng 1</h3>
                <p>Áp dụng cho sản phẩm trầm hương sáng</p>
                <div className="promo-buttons">
                  <Link to="/products" className="promo-btn promo-btn-primary">Mua Ngay</Link>
                </div>
              </div>
            </div>

            <div className="promotion-card">
              <div className="promo-content">
                <h3>Miễn Phí Vận Chuyển</h3>
                <p>Cho đơn hàng trên 1 triệu đồng</p>
                <div className="promo-buttons">
                  <Link to="/products" className="promo-btn promo-btn-primary">Mua Ngay</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog/News */}
      <section className="blog" id="blog">
        <div className="container">
          <div className="section-header">
            <h2>Tin Tức & Kiến Thức</h2>
            <p>Cập nhật thông tin mới nhất về trầm hương và cách sử dụng</p>
          </div>

          <div className="blog-grid">
            <article className="blog-card">
              <div className="blog-image">
                <img src="https://images.unsplash.com/photo-1652719647182-094f5c442abc" alt="Cách nhận biết trầm hương thật giả" />
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">15 Tháng 12, 2024</span>
                  <span className="blog-category">Hướng Dẫn</span>
                </div>
                <h3>Cách Nhận Biết Trầm Hương Thật Giả</h3>
                <p>Hướng dẫn chi tiết cách phân biệt trầm hương thật và giả để bạn có thể lựa chọn được sản phẩm chất lượng...</p>
                <a href="#" className="read-more">Đọc Thêm →</a>
              </div>
            </article>

            <article className="blog-card">
              <div className="blog-image">
                <img src="https://images.pexels.com/photos/14146722/pexels-photo-14146722.jpeg" alt="Lợi ích của trầm hương với sức khỏe" />
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">10 Tháng 12, 2024</span>
                  <span className="blog-category">Sức Khỏe</span>
                </div>
                <h3>Lợi Ích Của Trầm Hương Với Sức Khỏe</h3>
                <p>Khám phá những lợi ích tuyệt vời mà trầm hương mang lại cho sức khỏe tinh thần và thể chất...</p>
                <a href="#" className="read-more">Đọc Thêm →</a>
              </div>
            </article>

            <article className="blog-card">
              <div className="blog-image">
                <img src="https://images.pexels.com/photos/5949262/pexels-photo-5949262.jpeg" alt="Cách bảo quản trầm hương đúng cách" />
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">5 Tháng 12, 2024</span>
                  <span className="blog-category">Bảo Quản</span>
                </div>
                <h3>Cách Bảo Quản Trầm Hương Đúng Cách</h3>
                <p>Những bí quyết giúp bạn bảo quản trầm hương đúng cách để giữ được chất lượng và hương thơm lâu nhất...</p>
                <a href="#" className="read-more">Đọc Thêm →</a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;