import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "./Toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const sessionId = localStorage.getItem('session_id') || 
    (() => {
      const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', newId);
      return newId;
    })();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Auto slideshow effect
  useEffect(() => {
    if (!product || !isAutoPlaying) return;
    
    const allImages = [product.image_url, ...(product.additional_images || [])];
    if (allImages.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImage(current => 
        current >= allImages.length - 1 ? 0 : current + 1
      );
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [product, isAutoPlaying]);

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

  const calculateTotalPrice = () => {
    if (!selectedSize) return 0;
    const sizeOption = product.size_options.find(option => option.size === selectedSize);
    return sizeOption ? sizeOption.price * quantity : 0;
  };

  const getCurrentStock = () => {
    if (!selectedSize || !product.size_options) return 0;
    const sizeOption = product.size_options.find(option => option.size === selectedSize.size);
    return sizeOption ? sizeOption.stock : 0;
  };

  const getSelectedSizePrice = () => {
    if (!selectedSize || !product.size_options) return { price: 0, original_price: null };
    const sizeOption = product.size_options.find(option => option.size === selectedSize.size);
    return sizeOption ? { price: sizeOption.price, original_price: sizeOption.original_price } : { price: 0, original_price: null };
  };

  const getCurrentPrice = () => {
    if (!selectedSize || !product.size_options) return product.price;
    const sizeOption = product.size_options.find(option => option.size === selectedSize.size);
    return sizeOption ? sizeOption.price : product.price;
  };

  const getCurrentOriginalPrice = () => {
    if (!selectedSize || !product.size_options) return product.original_price;
    const sizeOption = product.size_options.find(option => option.size === selectedSize.size);
    return sizeOption ? sizeOption.original_price : product.original_price;
  };

  const getTotalPrice = () => {
    return getCurrentPrice() * quantity;
  };

  const getDiscount = () => {
    const currentPrice = getCurrentPrice();
    const originalPrice = getCurrentOriginalPrice();
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const addToCart = async () => {
    if (!selectedSize) {
      showToast('⚠️ Vui lòng chọn kích thước sản phẩm', 'warning');
      return;
    }

    if (getCurrentStock() < quantity) {
      showToast('❌ Số lượng vượt quá hàng có sẵn', 'error');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cart/${sessionId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          size: selectedSize.size,
          quantity: quantity
        })
      });

      if (response.ok) {
        showToast(`🛒 Đã thêm ${product.name} (${selectedSize.size}) vào giỏ hàng!`, 'success');
      } else {
        const errorData = await response.json();
        showToast(`❌ Lỗi: ${errorData.detail}`, 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('❌ Có lỗi xảy ra khi thêm vào giỏ hàng', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    if (!selectedSize) {
      showToast('⚠️ Vui lòng chọn kích thước sản phẩm', 'warning');
      return;
    }

    if (getCurrentStock() < quantity) {
      showToast('❌ Số lượng vượt quá hàng có sẵn', 'error');
      return;
    }

    // Add to cart first, then navigate to checkout
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cart/${sessionId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          size: selectedSize.size,
          quantity: quantity
        })
      });

      if (response.ok) {
        showToast('🚀 Đã thêm sản phẩm vào giỏ hàng. Chuyển đến thanh toán...', 'success');
        setTimeout(() => {
          navigate('/checkout');
        }, 1500);
      } else {
        const errorData = await response.json();
        showToast(`❌ Lỗi: ${errorData.detail}`, 'error');
      }
    } catch (error) {
      console.error('Error during buy now:', error);
      showToast('❌ Có lỗi xảy ra khi mua hàng', 'error');
    }
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
    setShowImageModal(true);
    setIsAutoPlaying(false); // Stop auto play when modal opens
  };

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
    setIsAutoPlaying(false); // Stop auto play when user manually selects
    // Resume auto play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleImageHover = (hovering) => {
    setIsAutoPlaying(!hovering);
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
      {/* Main Product Detail */}
      <div className="product-detail-main">
        <div className="container">
          <div className="product-detail-layout">
            
            {/* Product Images */}
            <div className="product-detail-images">
              <div 
                className="main-image-container"
                onMouseEnter={() => handleImageHover(true)}
                onMouseLeave={() => handleImageHover(false)}
              >
                <img 
                  src={allImages[selectedImage]} 
                  alt={product.name}
                  className="main-product-image"
                  onClick={() => handleImageClick(selectedImage)}
                />
                {getDiscount() > 0 && (
                  <div className="discount-badge-detail">
                    <span className="discount-text">GIẢM</span>
                    <span className="discount-percentage">{getDiscount()}%</span>
                  </div>
                )}
                <button 
                  className="image-zoom-btn"
                  onClick={() => handleImageClick(selectedImage)}
                  aria-label="Phóng to ảnh"
                >
                  <ion-icon name="expand-outline"></ion-icon>
                </button>
                

              </div>
              
              {allImages.length > 1 && (
                <div className="thumbnail-images">
                  {allImages.map((image, index) => (
                    <div 
                      key={index}
                      className={`thumbnail-item ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} />
                      {selectedImage === index && (
                        <div className="thumbnail-active-indicator">
                          <ion-icon name="checkmark-circle"></ion-icon>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-detail-info">
              <div className="product-header">
                <div className="product-category-detail">
                  <ion-icon name="pricetag-outline"></ion-icon>
                  {product.category}
                </div>
                <h1 className="product-title-detail">{product.name}</h1>
                
                {/* Rating */}
                <div className="product-rating-detail">
                  <div className="stars">
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                    <ion-icon name="star"></ion-icon>
                  </div>
                  <span className="rating-text">(4.9/5 - 127 đánh giá)</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="price-section-detail">
                <div className="price-main">
                  <div className="current-price-detail">
                    {formatPrice(getCurrentPrice())}
                    {selectedSize && (
                      <span className="price-unit">/{selectedSize.size}</span>
                    )}
                  </div>
                  {getCurrentOriginalPrice() && (
                    <div className="original-price-detail">
                      {formatPrice(getCurrentOriginalPrice())}
                    </div>
                  )}
                </div>
                {getDiscount() > 0 && (
                  <div className="discount-info">
                    <span className="save-amount">
                      <ion-icon name="pricetag-outline"></ion-icon>
                      Tiết kiệm {formatPrice(getCurrentOriginalPrice() - getCurrentPrice())}
                    </span>
                  </div>
                )}
              </div>

              {/* Size Selection */}
              {product.size_options && product.size_options.length > 0 && (
                <div className="size-selection-section">
                  <h3 className="section-title">
                    <ion-icon name="resize-outline"></ion-icon>
                    Chọn Kích Thước
                  </h3>
                  <div className="size-options">
                    {product.size_options.map((size, index) => (
                      <button
                        key={index}
                        className={`size-option ${selectedSize && selectedSize.size === size.size ? 'selected' : ''} ${size.stock === 0 ? 'out-of-stock' : ''}`}
                        onClick={() => handleSizeChange(size)}
                        disabled={size.stock === 0}
                      >
                        <div className="size-content">
                          <span className="size-name">{size.size}</span>
                          <span className="size-price">{formatPrice(size.price)}</span>
                          <span className="size-stock">
                            {size.stock > 0 ? `Còn ${size.stock}` : 'Hết hàng'}
                          </span>
                        </div>
                        {selectedSize && selectedSize.size === size.size && (
                          <div className="size-selected-indicator">
                            <ion-icon name="checkmark-circle"></ion-icon>
                          </div>
                        )}
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
                <h3 className="section-title">
                  <ion-icon name="calculator-outline"></ion-icon>
                  Số Lượng
                </h3>
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
                <div className="quantity-total">
                  <span>Tổng: {formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-actions-detail">
                <button 
                  className="btn-add-cart-detail"
                  disabled={getCurrentStock() === 0}
                  onClick={addToCart}
                >
                  <ion-icon name="bag-add-outline"></ion-icon>
                  <span>Thêm Vào Giỏ Hàng</span>
                </button>
                <button 
                  className="btn-buy-now-detail"
                  disabled={getCurrentStock() === 0}
                  onClick={buyNow}
                >
                  <ion-icon name="flash-outline"></ion-icon>
                  <span>Mua Ngay</span>
                </button>
              </div>

              {/* Product Description */}
              <div className="product-description-detail">
                <h3 className="section-title">
                  <ion-icon name="document-text-outline"></ion-icon>
                  Mô Tả Sản Phẩm
                </h3>
                <p>{product.description}</p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="product-specifications">
                  <h3 className="section-title">
                    <ion-icon name="list-outline"></ion-icon>
                    Thông Số Kỹ Thuật
                  </h3>
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

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={() => {
          setShowImageModal(false);
          setIsAutoPlaying(true); // Resume auto play when modal closes
        }}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="image-modal-close" 
              onClick={() => {
                setShowImageModal(false);
                setIsAutoPlaying(true); // Resume auto play when modal closes
              }}
              aria-label="Đóng"
            >
              <ion-icon name="close-outline"></ion-icon>
            </button>
            <div className="image-modal-content">
              <img 
                src={allImages[selectedImage]} 
                alt={product.name}
                className="modal-image"
              />
              <div className="image-modal-navigation">
                <button 
                  className="image-nav-btn prev"
                  onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : allImages.length - 1)}
                  disabled={allImages.length <= 1}
                >
                  <ion-icon name="chevron-back-outline"></ion-icon>
                </button>
                <span className="image-counter">{selectedImage + 1} / {allImages.length}</span>
                <button 
                  className="image-nav-btn next"
                  onClick={() => setSelectedImage(selectedImage < allImages.length - 1 ? selectedImage + 1 : 0)}
                  disabled={allImages.length <= 1}
                >
                  <ion-icon name="chevron-forward-outline"></ion-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.show} 
        onClose={hideToast}
      />
    </div>
  );
};

export default ProductDetail;