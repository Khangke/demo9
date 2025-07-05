import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

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
    <>
      <Helmet>
        <title>Thanh toán đơn hàng - Khang Trầm Hương | Trầm hương cao cấp Việt Nam</title>
        <meta name="description" content="Hoàn tất đơn hàng trầm hương cao cấp với thanh toán an toàn. Hỗ trợ COD và chuyển khoản ngân hàng. Giao hàng toàn quốc." />
        <meta name="keywords" content="thanh toán trầm hương, đặt hàng trầm hương, thanh toán an toàn, COD trầm hương" />
        <meta property="og:title" content="Thanh toán đơn hàng - Khang Trầm Hương" />
        <meta property="og:description" content="Hoàn tất đơn hàng trầm hương cao cấp với thanh toán an toàn" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${window.location.origin}/checkout`} />
      </Helmet>
      
      <div className="checkout-page"
           itemScope 
           itemType="https://schema.org/CheckoutPage">
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
            <form onSubmit={handleSubmit} 
                  className="checkout-form"
                  itemScope 
                  itemType="https://schema.org/Order">
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

                    <div className="form-grid" 
                         itemScope 
                         itemType="https://schema.org/PostalAddress">
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
                          itemProp="name"
                          required
                          aria-describedby={errors.full_name ? "full_name_error" : undefined}
                        />
                        {errors.full_name && <span id="full_name_error" className="error-message" role="alert">{errors.full_name}</span>}
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
                          itemProp="telephone"
                          required
                          aria-describedby={errors.phone ? "phone_error" : undefined}
                        />
                        {errors.phone && <span id="phone_error" className="error-message" role="alert">{errors.phone}</span>}
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
                          itemProp="email"
                          required
                          aria-describedby={errors.email ? "email_error" : undefined}
                        />
                        {errors.email && <span id="email_error" className="error-message" role="alert">{errors.email}</span>}
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
                          itemProp="addressLocality"
                          required
                          aria-describedby={errors.city ? "city_error" : undefined}
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
                        {errors.city && <span id="city_error" className="error-message" role="alert">{errors.city}</span>}
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
                          itemProp="addressRegion"
                          required
                          aria-describedby={errors.district ? "district_error" : undefined}
                        />
                        {errors.district && <span id="district_error" className="error-message" role="alert">{errors.district}</span>}
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
                          required
                          aria-describedby={errors.ward ? "ward_error" : undefined}
                        />
                        {errors.ward && <span id="ward_error" className="error-message" role="alert">{errors.ward}</span>}
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
                          itemProp="streetAddress"
                          required
                          aria-describedby={errors.address ? "address_error" : undefined}
                        />
                        {errors.address && <span id="address_error" className="error-message" role="alert">{errors.address}</span>}
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
                          itemProp="description"
                        ></textarea>
                      </div>
                    </div>

                    <div className="section-actions">
                      <button 
                        type="button" 
                        onClick={() => setCurrentStep(2)}
                        className="next-step-btn"
                        disabled={!formData.full_name || !formData.phone || !formData.email || !formData.address}
                        aria-label="Tiếp tục đến bước chọn phương thức thanh toán"
                      >
                        Tiếp tục
                        <ion-icon name="arrow-forward-outline"></ion-icon>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Payment Method - Optimized */}
                  <div className={`checkout-section checkout-section-compact ${currentStep === 2 ? 'active' : ''}`}>
                    <div className="section-header section-header-compact">
                      <h2>
                        <ion-icon name="card-outline"></ion-icon>
                        Phương thức thanh toán
                      </h2>
                      <p className="section-subtitle">Chọn cách thức thanh toán phù hợp với bạn</p>
                    </div>

                    <div className="payment-methods payment-methods-optimized"
                         itemScope 
                         itemType="https://schema.org/PaymentMethod">
                      <div className="payment-option payment-option-enhanced">
                        <label className="payment-option-label payment-option-label-compact">
                          <input
                            type="radio"
                            name="payment_method"
                            value="cod"
                            checked={formData.payment_method === 'cod'}
                            onChange={handleInputChange}
                            className="payment-radio"
                            aria-describedby="cod_description"
                          />
                          <div className="payment-option-content payment-content-compact">
                            <div className="payment-icon payment-icon-subtle">
                              <ion-icon name="cash-outline"></ion-icon>
                            </div>
                            <div className="payment-info payment-info-compact">
                              <h3>Thanh toán khi nhận hàng</h3>
                              <p id="cod_description">Thanh toán tiền mặt khi nhận hàng tại nhà</p>
                              <div className="payment-details">
                                <span className="payment-fee payment-fee-compact">
                                  <ion-icon name="add-circle-outline"></ion-icon>
                                  Phí COD: 30.000đ
                                </span>
                                <span className="delivery-time">
                                  <ion-icon name="time-outline"></ion-icon>
                                  3-7 ngày
                                </span>
                              </div>
                            </div>
                            <div className="payment-badge payment-badge-popular">
                              <span>Phổ biến</span>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="payment-option payment-option-enhanced">
                        <label className="payment-option-label payment-option-label-compact">
                          <input
                            type="radio"
                            name="payment_method"
                            value="bank_transfer"
                            checked={formData.payment_method === 'bank_transfer'}
                            onChange={handleInputChange}
                            className="payment-radio"
                            aria-describedby="bank_description"
                          />
                          <div className="payment-option-content payment-content-compact">
                            <div className="payment-icon payment-icon-subtle">
                              <ion-icon name="card-outline"></ion-icon>
                            </div>
                            <div className="payment-info payment-info-compact">
                              <h3>Chuyển khoản ngân hàng</h3>
                              <p id="bank_description">Chuyển khoản qua internet banking hoặc ATM</p>
                              <div className="payment-details">
                                <span className="payment-benefit payment-benefit-compact">
                                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                                  Miễn phí vận chuyển
                                </span>
                                <span className="delivery-time">
                                  <ion-icon name="flash-outline"></ion-icon>
                                  Nhanh hơn
                                </span>
                              </div>
                            </div>
                            <div className="payment-badge payment-badge-recommended">
                              <span>Khuyến nghị</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {formData.payment_method === 'bank_transfer' && (
                      <div className="bank-info bank-info-compact"
                           itemScope 
                           itemType="https://schema.org/BankAccount">
                        <div className="bank-info-header">
                          <ion-icon name="information-circle-outline"></ion-icon>
                          <h4>Thông tin chuyển khoản</h4>
                        </div>
                        <div className="bank-details bank-details-grid">
                          <div className="bank-row">
                            <span className="bank-label">Ngân hàng</span>
                            <span className="bank-value" itemProp="name">Vietcombank</span>
                          </div>
                          <div className="bank-row">
                            <span className="bank-label">Số tài khoản</span>
                            <span className="bank-value bank-account" itemProp="accountNumber">1234567890</span>
                          </div>
                          <div className="bank-row">
                            <span className="bank-label">Chủ tài khoản</span>
                            <span className="bank-value" itemProp="accountHolder">KHANG TRAM HUONG</span>
                          </div>
                          <div className="bank-row bank-row-highlight">
                            <span className="bank-label">Nội dung CK</span>
                            <span className="bank-value">Thanh toán đơn hàng [Mã đơn hàng]</span>
                          </div>
                        </div>
                        <div className="bank-note">
                          <ion-icon name="bulb-outline"></ion-icon>
                          <span>Vui lòng chuyển khoản đúng nội dung để xử lý nhanh chóng</span>
                        </div>
                      </div>
                    )}

                    <div className="section-actions section-actions-compact">
                      <button 
                        type="button" 
                        onClick={() => setCurrentStep(1)}
                        className="prev-step-btn step-btn-subtle"
                        aria-label="Quay lại bước thông tin giao hàng"
                      >
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        <span>Quay lại</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCurrentStep(3)}
                        className="next-step-btn step-btn-primary"
                        aria-label="Tiếp tục đến bước xác nhận đơn hàng"
                      >
                        <span>Tiếp tục</span>
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
                        aria-label="Quay lại bước chọn phương thức thanh toán"
                      >
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        Quay lại
                      </button>
                      <button 
                        type="submit" 
                        className="place-order-btn"
                        disabled={submitting}
                        aria-label="Đặt hàng và hoàn tất thanh toán"
                      >
                        {submitting ? (
                          <>
                            <div className="spinner" role="status" aria-label="Đang xử lý đơn hàng"></div>
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

                {/* Order Summary Sidebar - Optimized */}
                <div className="checkout-sidebar checkout-sidebar-compact">
                  <div className="order-summary-card order-summary-compact"
                       itemScope 
                       itemType="https://schema.org/Invoice">
                    <div className="summary-header">
                      <h3>
                        <ion-icon name="receipt-outline"></ion-icon>
                        Tóm tắt đơn hàng
                      </h3>
                      <div className="summary-stats">
                        <span className="items-count" itemProp="totalItems">{cart.total_items} sản phẩm</span>
                      </div>
                    </div>

                    <div className="order-items order-items-compact">
                      {cart.items.map((item) => (
                        <div key={`${item.product_id}-${item.size}`} 
                             className="order-item order-item-mini"
                             itemScope 
                             itemType="https://schema.org/OrderItem">
                          <div className="order-item-image order-image-small">
                            <img src={item.product_image} 
                                 alt={item.product_name}
                                 itemProp="image" />
                            <span className="order-item-quantity quantity-badge" itemProp="quantity">{item.quantity}</span>
                          </div>
                          <div className="order-item-info order-info-compact">
                            <h4 className="item-name-truncated" itemProp="name">{item.product_name}</h4>
                            <div className="item-details-row">
                              <span className="item-size-compact">
                                <ion-icon name="resize-outline"></ion-icon>
                                {item.size}
                              </span>
                              <div className="item-price-compact">
                                <span className="current-price price-compact" itemProp="price">{formatPrice(item.total_price)}</span>
                                {item.original_price && item.original_price > item.size_price && (
                                  <span className="discount-badge discount-mini">
                                    -{getDiscountPercentage(item.size_price, item.original_price)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-calculations order-calc-compact">
                      <div className="calc-row calc-row-mini">
                        <span className="calc-label">Tạm tính</span>
                        <span className="calc-value" itemProp="totalPrice">{formatPrice(cart.total_amount)}</span>
                      </div>
                      <div className="calc-row calc-row-mini">
                        <span className="calc-label">
                          Phí vận chuyển
                          {formData.payment_method === 'bank_transfer' && (
                            <span className="shipping-note">(Miễn phí)</span>
                          )}
                        </span>
                        <span className="calc-value">{formatPrice(calculateShipping())}</span>
                      </div>
                      <div className="calc-divider calc-divider-thin"></div>
                      <div className="calc-row total-row calc-total-compact">
                        <span className="total-label">Tổng cộng</span>
                        <span className="total-amount total-amount-compact" itemProp="totalPaymentDue">{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>

                    {/* Payment Security - Compact */}
                    <div className="payment-security payment-security-compact">
                      <div className="security-header">
                        <ion-icon name="shield-checkmark-outline"></ion-icon>
                        <span>Thanh toán an toàn</span>
                      </div>
                      <div className="security-features">
                        <div className="security-item">
                          <ion-icon name="lock-closed-outline"></ion-icon>
                          <span>Mã hóa SSL 256-bit</span>
                        </div>
                        <div className="security-item">
                          <ion-icon name="checkmark-circle-outline"></ion-icon>
                          <span>Bảo mật thông tin</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;