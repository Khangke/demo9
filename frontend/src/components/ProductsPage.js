import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cập nhật hình ảnh sản phẩm với các ảnh đẹp từ vision expert
  const productImages = [
    "https://images.pexels.com/photos/3639806/pexels-photo-3639806.jpeg",
    "https://images.pexels.com/photos/248032/pexels-photo-248032.jpeg",
    "https://images.unsplash.com/photo-1551690935-a9e6f0a7e788?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxpbmNlbnNlfGVufDB8fHx8MTc1MTY4Mjk5MXww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1639390167093-9c62311fe84d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxpbmNlbnNlfGVufDB8fHx8MTc1MTY4Mjk5MXww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1669823446464-17d36384e126?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBpbmNlbnNlfGVufDB8fHx8MTc1MTY4Mjk5Nnww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1675000958126-0dd0ebb6ae33?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBpbmNlbnNlfGVufDB8fHx8MTc1MTY4Mjk5Nnww&ixlib=rb-4.1.0&q=85"
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy, priceRange, searchQuery]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      // Cập nhật hình ảnh cho các sản phẩm
      const updatedProducts = response.data.map((product, index) => ({
        ...product,
        image_url: productImages[index % productImages.length]
      }));
      setProducts(updatedProducts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCategories = () => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories;
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setShowModal(false);
  };

  return (
    <div className="products-page">
      {/* Hero Section */}
      <section className="products-hero">
        <div className="container">
          <div className="products-hero-content">
            <h1>Bộ Sưu Tập Trầm Hương</h1>
            <p>Khám phá đầy đủ các sản phẩm trầm hương cao cấp với chất lượng vượt trội</p>
            <div className="products-stats">
              <div className="stat-item">
                <span className="stat-number">{products.length}</span>
                <span className="stat-label">Sản Phẩm</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{getCategories().length}</span>
                <span className="stat-label">Danh Mục</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15+</span>
                <span className="stat-label">Năm Kinh Nghiệm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="products-filters">
        <div className="container">
          <div className="filters-wrapper">
            {/* Search Bar */}
            <div className="search-section">
              <div className="search-bar">
                <ion-icon name="search-outline"></ion-icon>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              {/* Category Filter */}
              <div className="filter-group">
                <label>Danh Mục:</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất Cả</option>
                  {getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="filter-group">
                <label>Sắp Xếp:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Mới Nhất</option>
                  <option value="price_low">Giá Thấp → Cao</option>
                  <option value="price_high">Giá Cao → Thấp</option>
                  <option value="name">Tên A → Z</option>
                  <option value="featured">Nổi Bật</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-group price-filter">
                <label>Khoảng Giá:</label>
                <div className="price-range">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="price-slider"
                  />
                  <div className="price-labels">
                    <span>0đ</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* View Mode */}
              <div className="filter-group view-mode">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <ion-icon name="grid-outline"></ion-icon>
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <ion-icon name="list-outline"></ion-icon>
                </button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="results-info">
            <p>Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm</p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-catalog">
        <div className="container">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <ion-icon name="search-outline"></ion-icon>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <div className={`products-grid ${viewMode}-view`}>
              {filteredProducts.map(product => (
                <div key={product.id} className={`product-card-advanced ${viewMode}-card`}>
                  <div className="product-image-advanced">
                    <img src={product.image_url} alt={product.name} />
                    {product.featured && <div className="product-badge">Nổi Bật</div>}
                    {product.original_price && (
                      <div className="discount-badge">
                        -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                      </div>
                    )}
                    <div className="product-overlay-advanced">
                      <button 
                        className="quick-view-btn-advanced"
                        onClick={() => openProductModal(product)}
                      >
                        <ion-icon name="eye-outline"></ion-icon>
                        Xem Chi Tiết
                      </button>
                      <button className="add-to-cart-btn-advanced">
                        <ion-icon name="bag-add-outline"></ion-icon>
                        Thêm Giỏ Hàng
                      </button>
                    </div>
                  </div>
                  <div className="product-info-advanced">
                    <div className="product-category-advanced">{product.category}</div>
                    <h3 className="product-name-advanced">{product.name}</h3>
                    <p className="product-description-advanced">{product.description}</p>
                    <div className="product-rating-advanced">
                      <div className="stars">
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                      </div>
                      <span className="rating-text">(4.9/5)</span>
                    </div>
                    <div className="product-price-advanced">
                      <span className="current-price">{formatPrice(product.price)}</span>
                      {product.original_price && (
                        <span className="original-price">{formatPrice(product.original_price)}</span>
                      )}
                    </div>
                    <div className="product-stock">
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      <span>Còn {product.stock} sản phẩm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeProductModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProductModal}>
              <ion-icon name="close-outline"></ion-icon>
            </button>
            <div className="modal-content">
              <div className="modal-image">
                <img src={selectedProduct.image_url} alt={selectedProduct.name} />
                {selectedProduct.featured && <div className="product-badge">Nổi Bật</div>}
              </div>
              <div className="modal-info">
                <div className="product-category-modal">{selectedProduct.category}</div>
                <h2>{selectedProduct.name}</h2>
                <div className="product-rating-modal">
                  <div className="stars">
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                  </div>
                  <span>(4.9/5 - 127 đánh giá)</span>
                </div>
                <div className="product-price-modal">
                  <span className="current-price">{formatPrice(selectedProduct.price)}</span>
                  {selectedProduct.original_price && (
                    <span className="original-price">{formatPrice(selectedProduct.original_price)}</span>
                  )}
                </div>
                <div className="product-description-modal">
                  <h4>Mô Tả Sản Phẩm</h4>
                  <p>{selectedProduct.description}</p>
                </div>
                <div className="product-features">
                  <h4>Đặc Điểm Nổi Bật</h4>
                  <ul>
                    <li><ion-icon name="checkmark-outline"></ion-icon> 100% tự nhiên từ rừng Việt Nam</li>
                    <li><ion-icon name="checkmark-outline"></ion-icon> Hương thơm bền lâu, tinh khiết</li>
                    <li><ion-icon name="checkmark-outline"></ion-icon> Không chất bảo quản, an toàn sức khỏe</li>
                    <li><ion-icon name="checkmark-outline"></ion-icon> Được chứng nhận chất lượng</li>
                  </ul>
                </div>
                <div className="product-stock-modal">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <span>Còn lại {selectedProduct.stock} sản phẩm</span>
                </div>
                <div className="modal-actions">
                  <button className="add-to-cart-modal">
                    <ion-icon name="bag-add-outline"></ion-icon>
                    Thêm Vào Giỏ Hàng
                  </button>
                  <button className="buy-now-modal">
                    <ion-icon name="flash-outline"></ion-icon>
                    Mua Ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;