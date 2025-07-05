import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cart, setCart] = useState({ items: [], total_amount: 0, total_items: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: '',
    payment_method: 'cod'
  });

  const [errors, setErrors] = useState({});

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
        if (cartData.items.length === 0) {
          navigate('/cart');
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!formData.city.trim()) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    if (!formData.district.trim()) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!formData.ward.trim()) newErrors.ward = 'Vui lòng chọn phường/xã';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    
    try {
      const orderData = {
        customer_info: {
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          notes: formData.notes
        },
        items: cart.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          size: item.size,
          size_price: item.size_price,
          original_price: item.original_price,
          quantity: item.quantity,
          total_price: item.total_price
        })),
        payment_method: formData.payment_method,
        session_id: sessionId
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        navigate(`/order-confirmation/${order.id}`, { 
          state: { order, isNewOrder: true }
        });
      } else {
        const errorData = await response.json();
        alert(`Lỗi đặt hàng: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateShipping = () => {
    return formData.payment_method === 'cod' ? 30000 : 0;
  };

  const calculateTotal = () => {
    return cart.total_amount + calculateShipping();
  };

  const getDiscountPercentage = (currentPrice, originalPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <div className="container">
          <nav>
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item">
                <span className="breadcrumb-link">
                  <ion-icon name="home-outline"></ion-icon>
                  Trang chủ
                </span>
              </li>
              <li className="breadcrumb-separator">
                <ion-icon name="chevron-forward-outline"></ion-icon>
              </li>
              <li className="breadcrumb-item">
                <span className="breadcrumb-link">
                  <ion-icon name="bag-outline"></ion-icon>
                  Giỏ hàng
                </span>
              </li>
              <li className="breadcrumb-separator">
                <ion-icon name="chevron-forward-outline"></ion-icon>
              </li>
              <li className="breadcrumb-current">
                <ion-icon name="card-outline"></ion-icon>
                Thanh toán
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Checkout Steps */}
      <div className="checkout-steps">
        <div className="container">
          <div className="steps-progress">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Thông tin giao hàng</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Phương thức thanh toán</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Xác nhận đơn hàng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="checkout-content">
        <div className="container">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-layout">
              <div className="checkout-main">
                {/* Step 1: Shipping Information */}
                <div className={`checkout-section ${currentStep === 1 ? 'active' : ''}`}>
                  <div className="section-header">
                    <h2>
                      <ion-icon name="location-outline"></ion-icon>
                      Thông tin giao hàng
                    </h2>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="full_name">
                        Họ và tên <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={errors.full_name ? 'error' : ''}
                        placeholder="Nhập họ và tên đầy đủ"
                      />
                      {errors.full_name && <span className="error-message">{errors.full_name}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">
                        Số điện thoại <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? 'error' : ''}
                        placeholder="Nhập số điện thoại"
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="email">
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="Nhập địa chỉ email"
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="city">
                        Tỉnh/Thành phố <span className="required">*</span>
                      </label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={errors.city ? 'error' : ''}
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                        <option value="Khánh Hòa">Khánh Hòa</option>
                        <option value="Quảng Nam">Quảng Nam</option>
                        <option value="Khác">Tỉnh/thành phố khác</option>
                      </select>
                      {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="district">
                        Quận/Huyện <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className={errors.district ? 'error' : ''}
                        placeholder="Nhập quận/huyện"
                      />
                      {errors.district && <span className="error-message">{errors.district}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="ward">
                        Phường/Xã <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="ward"
                        name="ward"
                        value={formData.ward}
                        onChange={handleInputChange}
                        className={errors.ward ? 'error' : ''}
                        placeholder="Nhập phường/xã"
                      />
                      {errors.ward && <span className="error-message">{errors.ward}</span>}
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="address">
                        Địa chỉ cụ thể <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={errors.address ? 'error' : ''}
                        placeholder="Số nhà, tên đường..."
                      />
                      {errors.address && <span className="error-message">{errors.address}</span>}
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="notes">
                        Ghi chú đơn hàng
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  <div className="section-actions">
                    <button 
                      type="button" 
                      onClick={() => setCurrentStep(2)}
                      className="next-step-btn"
                      disabled={!formData.full_name || !formData.phone || !formData.email || !formData.address}
                    >
                      Tiếp tục
                      <ion-icon name="arrow-forward-outline"></ion-icon>
                    </button>
                  </div>
                </div>

                {/* Step 2: Payment Method */}
                <div className={`checkout-section ${currentStep === 2 ? 'active' : ''}`}>
                  <div className="section-header">
                    <h2>
                      <ion-icon name="card-outline"></ion-icon>
                      Phương thức thanh toán
                    </h2>
                  </div>

                  <div className="payment-methods">
                    <div className="payment-option">
                      <label className="payment-option-label">
                        <input
                          type="radio"
                          name="payment_method"
                          value="cod"
                          checked={formData.payment_method === 'cod'}
                          onChange={handleInputChange}
                        />
                        <div className="payment-option-content">
                          <div className="payment-icon">
                            <ion-icon name="cash-outline"></ion-icon>
                          </div>
                          <div className="payment-info">
                            <h3>Thanh toán khi nhận hàng (COD)</h3>
                            <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                            <span className="payment-fee">Phí COD: +30.000đ</span>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="payment-option">
                      <label className="payment-option-label">
                        <input
                          type="radio"
                          name="payment_method"
                          value="bank_transfer"
                          checked={formData.payment_method === 'bank_transfer'}
                          onChange={handleInputChange}
                        />
                        <div className="payment-option-content">
                          <div className="payment-icon">
                            <ion-icon name="card-outline"></ion-icon>
                          </div>
                          <div className="payment-info">
                            <h3>Chuyển khoản ngân hàng</h3>
                            <p>Chuyển khoản trước khi giao hàng</p>
                            <span className="payment-benefit">Miễn phí vận chuyển</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.payment_method === 'bank_transfer' && (
                    <div className="bank-info">
                      <h4>
                        <ion-icon name="information-circle-outline"></ion-icon>
                        Thông tin chuyển khoản
                      </h4>
                      <div className="bank-details">
                        <div className="bank-item">
                          <strong>Ngân hàng:</strong> Vietcombank
                        </div>
                        <div className="bank-item">
                          <strong>Số tài khoản:</strong> 1234567890
                        </div>
                        <div className="bank-item">
                          <strong>Chủ tài khoản:</strong> KHANG TRAM HUONG
                        </div>
                        <div className="bank-item">
                          <strong>Nội dung:</strong> Thanh toán đơn hàng [Mã đơn hàng]
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="section-actions">
                    <button 
                      type="button" 
                      onClick={() => setCurrentStep(1)}
                      className="prev-step-btn"
                    >
                      <ion-icon name="arrow-back-outline"></ion-icon>
                      Quay lại
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setCurrentStep(3)}
                      className="next-step-btn"
                    >
                      Tiếp tục
                      <ion-icon name="arrow-forward-outline"></ion-icon>
                    </button>
                  </div>
                </div>

                {/* Step 3: Order Review */}
                <div className={`checkout-section ${currentStep === 3 ? 'active' : ''}`}>
                  <div className="section-header">
                    <h2>
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      Xác nhận đơn hàng
                    </h2>
                  </div>

                  <div className="order-review">
                    <div className="review-section">
                      <h3>Thông tin giao hàng</h3>
                      <div className="review-info">
                        <p><strong>{formData.full_name}</strong></p>
                        <p>{formData.phone}</p>
                        <p>{formData.email}</p>
                        <p>{formData.address}, {formData.ward}, {formData.district}, {formData.city}</p>
                        {formData.notes && <p><em>Ghi chú: {formData.notes}</em></p>}
                      </div>
                    </div>

                    <div className="review-section">
                      <h3>Phương thức thanh toán</h3>
                      <div className="review-payment">
                        {formData.payment_method === 'cod' ? (
                          <p>
                            <ion-icon name="cash-outline"></ion-icon>
                            Thanh toán khi nhận hàng (COD)
                          </p>
                        ) : (
                          <p>
                            <ion-icon name="card-outline"></ion-icon>
                            Chuyển khoản ngân hàng
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="section-actions">
                    <button 
                      type="button" 
                      onClick={() => setCurrentStep(2)}
                      className="prev-step-btn"
                    >
                      <ion-icon name="arrow-back-outline"></ion-icon>
                      Quay lại
                    </button>
                    <button 
                      type="submit" 
                      className="place-order-btn"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="spinner"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <ion-icon name="checkmark-outline"></ion-icon>
                          Đặt hàng
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="checkout-sidebar">
                <div className="order-summary-card">
                  <h3>
                    <ion-icon name="receipt-outline"></ion-icon>
                    Tóm tắt đơn hàng
                  </h3>

                  <div className="order-items">
                    {cart.items.map((item) => (
                      <div key={`${item.product_id}-${item.size}`} className="order-item">
                        <div className="order-item-image">
                          <img src={item.product_image} alt={item.product_name} />
                          <span className="order-item-quantity">{item.quantity}</span>
                        </div>
                        <div className="order-item-info">
                          <h4>{item.product_name}</h4>
                          <p>Kích thước: {item.size}</p>
                          <div className="order-item-price">
                            <span className="current-price">{formatPrice(item.total_price)}</span>
                            {item.original_price && item.original_price > item.size_price && (
                              <span className="discount-badge">
                                -{getDiscountPercentage(item.size_price, item.original_price)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-calculations">
                    <div className="calc-row">
                      <span>Tạm tính ({cart.total_items} sản phẩm)</span>
                      <span>{formatPrice(cart.total_amount)}</span>
                    </div>
                    <div className="calc-row">
                      <span>Phí vận chuyển</span>
                      <span>{formatPrice(calculateShipping())}</span>
                    </div>
                    <div className="calc-divider"></div>
                    <div className="calc-row total-row">
                      <span>Tổng cộng</span>
                      <span className="total-amount">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                <div className="checkout-security">
                  <h4>
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                    Bảo mật thanh toán
                  </h4>
                  <ul>
                    <li>
                      <ion-icon name="lock-closed-outline"></ion-icon>
                      Thông tin được mã hóa SSL
                    </li>
                    <li>
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      Đảm bảo an toàn 100%
                    </li>
                    <li>
                      <ion-icon name="shield-outline"></ion-icon>
                      Chính sách bảo mật nghiêm ngặt
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;