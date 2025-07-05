import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      const productData = response.data;
      setProduct(productData);
      // Set default size to first available size
      if (productData.size_options && productData.size_options.length > 0) {
        setSelectedSize(productData.size_options[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Không thể tải thông tin sản phẩm");
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setQuantity(1); // Reset quantity when size changes
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const maxStock = selectedSize ? selectedSize.stock : product.stock;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const getCurrentPrice = () => {
    return selectedSize ? selectedSize.price : product.price;
  };

  const getCurrentOriginalPrice = () => {
    return selectedSize ? selectedSize.original_price : product.original_price;
  };

  const getCurrentStock = () => {
    return selectedSize ? selectedSize.stock : product.stock;
  };

  const getDiscount = () => {
    const currentPrice = getCurrentPrice();
    const originalPrice = getCurrentOriginalPrice();
    if (originalPrice && originalPrice > currentPrice) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-error">
        <div className="error-content">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <h3>Oops! Có lỗi xảy ra</h3>
          <p>{error || "Không tìm thấy sản phẩm"}</p>
          <Link to="/products" className="btn-back-products">Quay Lại Danh Sách</Link>
        </div>
      </div>
    );
  }

  const allImages = [product.image_url, ...(product.additional_images || [])];

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <Link to="/" className="breadcrumb-link">Trang Chủ</Link>
            </li>
            <span className="breadcrumb-separator">›</span>
            <li className="breadcrumb-item">
              <Link to="/products" className="breadcrumb-link">Sản Phẩm</Link>
            </li>
            <span className="breadcrumb-separator">›</span>
            <li className="breadcrumb-item">
              <span className="breadcrumb-current">{product.name}</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Main Product Detail */}
      <div className="product-detail-main">
        <div className="container">
          <div className="product-detail-layout">
            
            {/* Product Images */}
            <div className="product-detail-images">
              <div className="main-image-container">
                <img 
                  src={allImages[selectedImage]} 
                  alt={product.name}
                  className="main-product-image"
                />
                {getDiscount() > 0 && (
                  <div className="discount-badge-detail">-{getDiscount()}%</div>
                )}
              </div>
              
              {allImages.length > 1 && (
                <div className="thumbnail-images">
                  {allImages.map((image, index) => (
                    <div 
                      key={index}
                      className={`thumbnail-item ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-detail-info">
              <div className="product-category-detail">{product.category}</div>
              <h1 className="product-title-detail">{product.name}</h1>
              
              {/* Price Section */}
              <div className="price-section-detail">
                <div className="price-main">
                  <span className="current-price-detail">{formatPrice(getCurrentPrice())}</span>
                  {getCurrentOriginalPrice() && (
                    <span className="original-price-detail">{formatPrice(getCurrentOriginalPrice())}</span>
                  )}
                </div>
                {getDiscount() > 0 && (
                  <div className="discount-info">
                    <span className="save-amount">Tiết kiệm {formatPrice(getCurrentOriginalPrice() - getCurrentPrice())}</span>
                  </div>
                )}
              </div>

              {/* Size Selection */}
              {product.size_options && product.size_options.length > 0 && (
                <div className="size-selection-section">
                  <h3 className="section-title">Kích Thước:</h3>
                  <div className="size-options">
                    {product.size_options.map((size, index) => (
                      <button
                        key={index}
                        className={`size-option ${selectedSize && selectedSize.size === size.size ? 'selected' : ''} ${size.stock === 0 ? 'out-of-stock' : ''}`}
                        onClick={() => handleSizeChange(size)}
                        disabled={size.stock === 0}
                      >
                        <span className="size-name">{size.size}</span>
                        <span className="size-price">{formatPrice(size.price)}</span>
                        {size.stock === 0 && <span className="out-of-stock-label">Hết hàng</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Info */}
              <div className="stock-info-detail">
                <div className={`stock-status ${getCurrentStock() > 10 ? 'in-stock' : getCurrentStock() > 0 ? 'low-stock' : 'out-of-stock'}`}>
                  <ion-icon name={getCurrentStock() > 0 ? "checkmark-circle" : "close-circle"}></ion-icon>
                  <span>
                    {getCurrentStock() > 10 ? `Còn hàng (${getCurrentStock()} sản phẩm)` :
                     getCurrentStock() > 0 ? `Sắp hết hàng (${getCurrentStock()} sản phẩm)` :
                     'Tạm hết hàng'}
                  </span>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="quantity-section">
                <h3 className="section-title">Số Lượng:</h3>
                <div className="quantity-selector">
                  <button 
                    className="quantity-btn minus" 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <ion-icon name="remove"></ion-icon>
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    className="quantity-btn plus" 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= getCurrentStock()}
                  >
                    <ion-icon name="add"></ion-icon>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-actions-detail">
                <button 
                  className="btn-add-cart-detail"
                  disabled={getCurrentStock() === 0}
                >
                  <ion-icon name="bag-add-outline"></ion-icon>
                  Thêm Vào Giỏ Hàng
                </button>
                <button 
                  className="btn-buy-now-detail"
                  disabled={getCurrentStock() === 0}
                >
                  <ion-icon name="flash-outline"></ion-icon>
                  Mua Ngay
                </button>
              </div>

              {/* Product Description */}
              <div className="product-description-detail">
                <h3 className="section-title">Mô Tả Sản Phẩm</h3>
                <p>{product.description}</p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="product-specifications">
                  <h3 className="section-title">Thông Số Kỹ Thuật</h3>
                  <div className="specs-grid">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <span className="spec-label">
                          {key === 'origin' ? 'Xuất xứ' :
                           key === 'age' ? 'Tuổi cây' :
                           key === 'oil_content' ? 'Hàm lượng dầu' :
                           key === 'fragrance_notes' ? 'Hương thơm' :
                           key === 'certification' ? 'Chứng nhận' :
                           key === 'processing' ? 'Chế biến' :
                           key === 'usage' ? 'Công dụng' : key}:
                        </span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;