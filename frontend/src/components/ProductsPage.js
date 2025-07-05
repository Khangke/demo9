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

  // SEO Data
  const seoData = {
    title: "Trầm Hương Cao Cấp - Bộ Sưu Tập Đầy Đủ | Khang Trầm Hương",
    description: "Khám phá bộ sưu tập trầm hương cao cấp 100% tự nhiên. Kỳ Nam, Sáng, Truyền Thống với giá tốt nhất. Giao hàng toàn quốc, chất lượng đảm bảo.",
    url: "https://khangtramhuong.vn/san-pham",
    image: "https://images.pexels.com/photos/3639806/pexels-photo-3639806.jpeg",
    keywords: "trầm hương, kỳ nam, trầm hương cao cấp, trầm hương tự nhiên, mua trầm hương, trầm hương việt nam"
  };

  // Breadcrumb data
  const breadcrumbs = [
    { name: "Trang Chủ", url: "/" },
    { name: "Sản Phẩm", url: "/products" }
  ];

  // Related categories for internal linking
  const relatedCategories = [
    { name: "Kỳ Nam", slug: "ky-nam", description: "Trầm hương Kỳ Nam cao cấp nhất" },
    { name: "Tự Nhiên", slug: "tu-nhien", description: "Trầm hương tự nhiên chất lượng" },
    { name: "Truyền Thống", slug: "truyen-thong", description: "Trầm hương theo phương pháp truyền thống" },
    { name: "Sáng", slug: "sang", description: "Trầm hương sáng hương thơm nhẹ nhàng" }
  ];

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
    // Update URL without navigation for SEO
    window.history.pushState(null, '', `/products/${product.id}`);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setShowModal(false);
    // Restore original URL
    window.history.pushState(null, '', '/products');
  };

  // Generate structured data for SEO
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Bộ Sưu Tập Trầm Hương Cao Cấp",
      "description": "Danh sách các sản phẩm trầm hương cao cấp, tự nhiên 100% từ Việt Nam",
      "numberOfItems": filteredProducts.length,
      "itemListElement": filteredProducts.map((product, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": product.name,
        "description": product.description,
        "image": product.image_url,
        "brand": {
          "@type": "Brand",
          "name": "Khang Trầm Hương"
        },
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "VND",
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Khang Trầm Hương"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "127",
          "bestRating": "5",
          "worstRating": "1"
        }
      }))
    };

    if (selectedProduct) {
      const productStructuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": selectedProduct.name,
        "description": selectedProduct.description,
        "image": selectedProduct.image_url,
        "brand": {
          "@type": "Brand",
          "name": "Khang Trầm Hương"
        },
        "category": selectedProduct.category,
        "offers": {
          "@type": "Offer",
          "price": selectedProduct.price,
          "priceCurrency": "VND",
          "availability": selectedProduct.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Khang Trầm Hương"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "127",
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": [
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "Nguyễn Văn A"
            },
            "reviewBody": "Sản phẩm trầm hương chất lượng tuyệt vời, hương thơm rất đặc trưng và bền lâu."
          }
        ]
      };

      return [structuredData, productStructuredData];
    }

    return [structuredData];
  };

  const structuredDataArray = generateStructuredData();

  return (
    <div className="products-page">
      {/* SEO Optimization with Helmet */}
      <Helmet>
        <title>{selectedProduct ? `${selectedProduct.name} - Khang Trầm Hương` : seoData.title}</title>
        <meta name="description" content={selectedProduct ? `${selectedProduct.description} Giá: ${formatPrice(selectedProduct.price)}. Chất lượng cao, giao hàng nhanh.` : seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={selectedProduct ? `${seoData.url}/${selectedProduct.id}` : seoData.url} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={selectedProduct ? `${selectedProduct.name} - Khang Trầm Hương` : seoData.title} />
        <meta property="og:description" content={selectedProduct ? selectedProduct.description : seoData.description} />
        <meta property="og:image" content={selectedProduct ? selectedProduct.image_url : seoData.image} />
        <meta property="og:url" content={selectedProduct ? `${seoData.url}/${selectedProduct.id}` : seoData.url} />
        <meta property="og:type" content="product" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={selectedProduct ? `${selectedProduct.name} - Khang Trầm Hương` : seoData.title} />
        <meta name="twitter:description" content={selectedProduct ? selectedProduct.description : seoData.description} />
        <meta name="twitter:image" content={selectedProduct ? selectedProduct.image_url : seoData.image} />
        
        {/* Structured Data */}
        {structuredDataArray.map((data, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(data)}
          </script>
        ))}
      </Helmet>

      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="breadcrumb-item">
                {index === breadcrumbs.length - 1 ? (
                  <span className="breadcrumb-current" aria-current="page">{crumb.name}</span>
                ) : (
                  <>
                    <Link to={crumb.url} className="breadcrumb-link">{crumb.name}</Link>
                    <span className="breadcrumb-separator" aria-hidden="true">
                      <ion-icon name="chevron-forward-outline"></ion-icon>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="products-hero">
        <div className="container">
          <div className="products-hero-content">
            <h1>Bộ Sưu Tập Trầm Hương Cao Cấp</h1>
            <p>Khám phá đầy đủ các sản phẩm trầm hương cao cấp với chất lượng vượt trội từ rừng tự nhiên Việt Nam. Kỳ Nam, Sáng, Truyền Thống và nhiều loại khác.</p>

          </div>
        </div>
      </section>

      <div className="products-main">
        <div className="container">
          <div className="products-layout">
            {/* Sidebar Navigation */}
            <aside className="products-sidebar">
              <div className="sidebar-section">
                <h3>Danh Mục Sản Phẩm</h3>
                <ul className="category-links">
                  <li>
                    <button 
                      className={`category-link ${selectedCategory === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      <ion-icon name="list-outline"></ion-icon>
                      Tất Cả Sản Phẩm ({products.length})
                    </button>
                  </li>
                  {relatedCategories.map(category => {
                    const count = products.filter(p => p.category === category.name).length;
                    return (
                      <li key={category.slug}>
                        <button 
                          className={`category-link ${selectedCategory === category.name ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(category.name)}
                        >
                          <ion-icon name="leaf-outline"></ion-icon>
                          {category.name} ({count})
                        </button>
                        <small className="category-desc">{category.description}</small>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="sidebar-section">
                <h3>Bài Viết Liên Quan</h3>
                <ul className="related-links">
                  <li>
                    <a href="/blog/cach-nhan-biet-tram-huong-that-gia" className="related-link">
                      <ion-icon name="document-text-outline"></ion-icon>
                      Cách Nhận Biết Trầm Hương Thật Giả
                    </a>
                  </li>
                  <li>
                    <a href="/blog/loi-ich-tram-huong-suc-khoe" className="related-link">
                      <ion-icon name="heart-outline"></ion-icon>
                      Lợi Ích Trầm Hương Với Sức Khỏe
                    </a>
                  </li>
                  <li>
                    <a href="/blog/huong-dan-bao-quan-tram-huong" className="related-link">
                      <ion-icon name="shield-checkmark-outline"></ion-icon>
                      Hướng Dẫn Bảo Quản Trầm Hương
                    </a>
                  </li>
                </ul>
              </div>

              <div className="sidebar-section">
                <h3>Hỗ Trợ Khách Hàng</h3>
                <div className="support-info">
                  <div className="support-item">
                    <ion-icon name="call-outline"></ion-icon>
                    <div>
                      <strong>Hotline</strong>
                      <span>(+84) 123 456 789</span>
                    </div>
                  </div>
                  <div className="support-item">
                    <ion-icon name="time-outline"></ion-icon>
                    <div>
                      <strong>Giờ làm việc</strong>
                      <span>8:00 - 22:00 hàng ngày</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="products-content">
              {/* Filters & Search */}
              <section className="products-filters">
                <div className="filters-wrapper">
                  {/* Search Bar */}
                  <div className="search-section">
                    <div className="search-bar">
                      <ion-icon name="search-outline"></ion-icon>
                      <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm trầm hương..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Tìm kiếm sản phẩm"
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="filters-section">
                    {/* Sort Filter */}
                    <div className="filter-group">
                      <label>Sắp Xếp:</label>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                        aria-label="Sắp xếp sản phẩm"
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
                          aria-label="Chọn khoảng giá"
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
                        aria-label="Xem dạng lưới"
                      >
                        <ion-icon name="grid-outline"></ion-icon>
                      </button>
                      <button 
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        aria-label="Xem dạng danh sách"
                      >
                        <ion-icon name="list-outline"></ion-icon>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results Info */}
                <div className="results-info">
                  <p>Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm trầm hương</p>
                </div>
              </section>

              {/* Products Grid */}
              <section className="products-catalog">
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
                      <article key={product.id} className={`product-card-advanced ${viewMode}-card`}>
                        <div className="product-image-advanced">
                          <img 
                            src={product.image_url} 
                            alt={`${product.name} - Trầm hương ${product.category} cao cấp`}
                            loading="lazy"
                            width="350"
                            height="280"
                          />
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
                              aria-label={`Xem chi tiết ${product.name}`}
                            >
                              <ion-icon name="eye-outline"></ion-icon>
                              Xem Chi Tiết
                            </button>
                            <button 
                              className="add-to-cart-btn-advanced"
                              aria-label={`Thêm ${product.name} vào giỏ hàng`}
                            >
                              <ion-icon name="bag-add-outline"></ion-icon>
                              Thêm Giỏ Hàng
                            </button>
                          </div>
                        </div>
                        <div className="product-info-advanced">
                          <div className="product-category-advanced">{product.category}</div>
                          <h2 className="product-name-advanced">{product.name}</h2>
                          <p className="product-description-advanced">{product.description}</p>
                          <div className="product-rating-advanced" itemScope itemType="https://schema.org/AggregateRating">
                            <div className="stars" role="img" aria-label="4.9 sao trên 5 sao">
                              <ion-icon name="star"></ion-icon>
                              <ion-icon name="star"></ion-icon>
                              <ion-icon name="star"></ion-icon>
                              <ion-icon name="star"></ion-icon>
                              <ion-icon name="star"></ion-icon>
                            </div>
                            <span className="rating-text">
                              (<span itemProp="ratingValue">4.9</span>/<span itemProp="bestRating">5</span> - <span itemProp="reviewCount">127</span> đánh giá)
                            </span>
                          </div>
                          <div className="product-price-advanced" itemScope itemType="https://schema.org/Offer">
                            <span className="current-price" itemProp="price">{formatPrice(product.price)}</span>
                            <meta itemProp="priceCurrency" content="VND" />
                            <meta itemProp="availability" content={product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                            {product.original_price && (
                              <span className="original-price">{formatPrice(product.original_price)}</span>
                            )}
                          </div>
                          <div className="product-stock">
                            <ion-icon name="checkmark-circle-outline"></ion-icon>
                            <span>Còn {product.stock} sản phẩm</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeProductModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProductModal} aria-label="Đóng">
              <ion-icon name="close-outline"></ion-icon>
            </button>
            <div className="modal-content">
              <div className="modal-image">
                <img 
                  src={selectedProduct.image_url} 
                  alt={`${selectedProduct.name} - Trầm hương ${selectedProduct.category} cao cấp`}
                  width="400"
                  height="400"
                />
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
                  <p>Trầm hương {selectedProduct.category} cao cấp được chọn lọc kỹ càng từ những cây trầm già cỗi trong rừng tự nhiên Việt Nam. Sản phẩm mang lại hương thơm đặc trưng, tinh khiết và bền lâu, phù hợp cho việc thưởng trà, meditation hoặc tạo không gian thư giãn.</p>
                </div>
                <div className="product-features">
                  <h4>Đặc Điểm Nổi Bật</h4>
                  <ul>
                    <li><ion-icon name="checkmark-outline"></ion-icon> 100% tự nhiên từ rừng Việt Nam</li>
                    <li><ion-icon name="checkmark-outline"></ion-icon> Hương thơm bền lâu, tinh khiết</li>
                    <li><ion-icon name="checkmark-outline"></ion-icon> Không chất bảo quản, an toàn sức khỏe</li>
                    <li><ion-icon name="checkmark-outline"></ion-icon> Được chứng nhận chất lượng</li>
                    <li><ion-icon name="checkmark-outline"></ion-icon> Giao hàng toàn quốc, đóng gói cẩn thận</li>
                  </ul>
                </div>
                
                {/* Customer Reviews Section */}
                <div className="customer-reviews">
                  <h4>Đánh Giá Khách Hàng</h4>
                  <div className="review-item" itemScope itemType="https://schema.org/Review">
                    <div className="review-header">
                      <strong itemProp="author">Nguyễn Văn A</strong>
                      <div className="review-stars" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                        <meta itemProp="ratingValue" content="5" />
                        <meta itemProp="bestRating" content="5" />
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                      </div>
                    </div>
                    <p itemProp="reviewBody">"Sản phẩm trầm hương chất lượng tuyệt vời, hương thơm rất đặc trưng và bền lâu. Đóng gói cẩn thận, giao hàng nhanh."</p>
                  </div>
                  <div className="review-item" itemScope itemType="https://schema.org/Review">
                    <div className="review-header">
                      <strong itemProp="author">Trần Thị B</strong>
                      <div className="review-stars" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                        <meta itemProp="ratingValue" content="5" />
                        <meta itemProp="bestRating" content="5" />
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                        <ion-icon name="star"></ion-icon>
                      </div>
                    </div>
                    <p itemProp="reviewBody">"Trầm hương tự nhiên, không pha tạp. Hương thơm thanh khiết, rất phù hợp để thiền định."</p>
                  </div>
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

      {/* Related Products Section */}
      <section className="related-products">
        <div className="container">
          <div className="section-header">
            <h2>Sản Phẩm Liên Quan</h2>
            <p>Khám phá thêm những sản phẩm trầm hương chất lượng cao khác</p>
          </div>
          
          {!loading && filteredProducts.length > 0 && (
            <div className="related-products-grid">
              {products
                .filter(product => 
                  selectedCategory !== 'all' 
                    ? product.category === selectedCategory 
                    : product.featured
                )
                .slice(0, 4)
                .map(product => (
                  <article key={`related-${product.id}`} className="related-product-card">
                    <div className="related-product-image">
                      <img 
                        src={product.image_url} 
                        alt={`${product.name} - Trầm hương ${product.category} cao cấp`}
                        loading="lazy"
                        width="280"
                        height="200"
                      />
                      {product.featured && <div className="product-badge">Nổi Bật</div>}
                      {product.original_price && (
                        <div className="discount-badge">
                          -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                        </div>
                      )}
                      <div className="related-product-overlay">
                        <button 
                          className="quick-view-btn"
                          onClick={() => openProductModal(product)}
                          aria-label={`Xem chi tiết ${product.name}`}
                        >
                          <ion-icon name="eye-outline"></ion-icon>
                          Xem Chi Tiết
                        </button>
                      </div>
                    </div>
                    <div className="related-product-info">
                      <div className="product-category">{product.category}</div>
                      <h3>{product.name}</h3>
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
                      <div className="product-price">
                        <span className="current-price">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="original-price">{formatPrice(product.original_price)}</span>
                        )}
                      </div>
                      <button 
                        className="add-to-cart-btn"
                        aria-label={`Thêm ${product.name} vào giỏ hàng`}
                      >
                        <ion-icon name="bag-add-outline"></ion-icon>
                        Thêm Vào Giỏ
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          )}

          <div className="related-products-cta">
            <Link to="/" className="view-all-btn">
              <ion-icon name="arrow-back-outline"></ion-icon>
              Về Trang Chủ
            </Link>
            <button 
              className="view-all-btn secondary"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setPriceRange([0, 5000000]);
                setSortBy('newest');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ion-icon name="refresh-outline"></ion-icon>
              Xem Tất Cả Sản Phẩm
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;