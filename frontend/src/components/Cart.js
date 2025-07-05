import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], total_amount: 0, total_items: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const sessionId = localStorage.getItem('session_id') || 
    (() => {
      const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', newId);
      return newId;
    })();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cart/${sessionId}`);
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, size, quantity) => {
    setUpdating(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cart/${sessionId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, size, quantity })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId, size) => {
    setUpdating(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cart/${sessionId}/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, size })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cart/${sessionId}/clear`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCart({ items: [], total_amount: 0, total_items: 0 });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getDiscountPercentage = (currentPrice, originalPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <div className="container">
          <nav>
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item">
                <Link to="/" className="breadcrumb-link">
                  <ion-icon name="home-outline"></ion-icon>
                  Trang chủ
                </Link>
              </li>
              <li className="breadcrumb-separator">
                <ion-icon name="chevron-forward-outline"></ion-icon>
              </li>
              <li className="breadcrumb-current">
                <ion-icon name="bag-outline"></ion-icon>
                Giỏ hàng
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Cart Content */}
      <div className="cart-content">
        <div className="container">
          <div className="cart-header">
            <h1>
              <ion-icon name="bag-outline"></ion-icon>
              Giỏ hàng của bạn
            </h1>
            <div className="cart-summary">
              <span className="cart-count">{cart.total_items} sản phẩm</span>
              <span className="cart-total">{formatPrice(cart.total_amount)}</span>
            </div>
          </div>

          {cart.items.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-content">
                <ion-icon name="bag-outline"></ion-icon>
                <h3>Giỏ hàng trống</h3>
                <p>Hãy thêm những sản phẩm trầm hương tuyệt vời vào giỏ hàng của bạn</p>
                <Link to="/products" className="continue-shopping-btn">
                  <ion-icon name="arrow-back-outline"></ion-icon>
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                <div className="cart-items-header">
                  <h3>Sản phẩm đã chọn</h3>
                  <button 
                    onClick={clearCart} 
                    className="clear-cart-btn"
                    disabled={updating}
                  >
                    <ion-icon name="trash-outline"></ion-icon>
                    Xóa tất cả
                  </button>
                </div>

                <div className="cart-items-list">
                  {cart.items.map((item, index) => (
                    <div key={`${item.product_id}-${item.size}`} className="cart-item">
                      <div className="cart-item-image">
                        <img src={item.product_image} alt={item.product_name} />
                        {item.original_price && item.original_price > item.size_price && (
                          <div className="cart-item-discount">
                            -{getDiscountPercentage(item.size_price, item.original_price)}%
                          </div>
                        )}
                      </div>

                      <div className="cart-item-info">
                        <h4 className="cart-item-name">{item.product_name}</h4>
                        <div className="cart-item-size">
                          <ion-icon name="resize-outline"></ion-icon>
                          Kích thước: {item.size}
                        </div>
                        <div className="cart-item-price">
                          <span className="current-price">{formatPrice(item.size_price)}</span>
                          {item.original_price && item.original_price > item.size_price && (
                            <span className="original-price">{formatPrice(item.original_price)}</span>
                          )}
                        </div>
                      </div>

                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                            className="quantity-btn"
                          >
                            <ion-icon name="remove-outline"></ion-icon>
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                            disabled={updating}
                            className="quantity-btn"
                          >
                            <ion-icon name="add-outline"></ion-icon>
                          </button>
                        </div>
                        
                        <div className="cart-item-total">
                          {formatPrice(item.total_price)}
                        </div>

                        <button 
                          onClick={() => removeItem(item.product_id, item.size)}
                          disabled={updating}
                          className="remove-item-btn"
                        >
                          <ion-icon name="close-outline"></ion-icon>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cart-sidebar">
                <div className="cart-actions-simple">
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="checkout-btn"
                    disabled={updating}
                  >
                    <ion-icon name="card-outline"></ion-icon>
                    Tiến hành thanh toán
                  </button>
                  
                  <Link to="/products" className="continue-shopping-link">
                    <ion-icon name="arrow-back-outline"></ion-icon>
                    Tiếp tục mua sắm
                  </Link>
                </div>

                <div className="cart-benefits">
                  <h4>
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                    Lợi ích khi mua hàng
                  </h4>
                  <ul>
                    <li>
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      Miễn phí vận chuyển cho đơn hàng trên 1.000.000đ
                    </li>
                    <li>
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      Đảm bảo chất lượng 100% tự nhiên
                    </li>
                    <li>
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      Hỗ trợ đổi trả trong 7 ngày
                    </li>
                    <li>
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      Tư vấn miễn phí từ chuyên gia
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;