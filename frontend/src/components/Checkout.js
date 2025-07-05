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

  // Predefined address options
  const addressOptions = [
    { value: '', label: 'Chọn địa chỉ có sẵn (tùy chọn)' },
    { value: 'home', label: '🏠 Nhà riêng', details: 'Giao hàng tận nhà' },
    { value: 'office', label: '🏢 Văn phòng', details: 'Giao hàng giờ hành chính' },
    { value: 'other', label: '📍 Địa chỉ khác', details: 'Nhập địa chỉ cụ thể' }
  ];

  const [selectedAddressType, setSelectedAddressType] = useState('');

  const [errors, setErrors] = useState({});

  const sessionId = localStorage.getItem('session_id') || 'test_session_checkout';

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

  const handleAddressTypeChange = (type) => {
    setSelectedAddressType(type);
    
    if (type === 'home') {
      setFormData(prev => ({
        ...prev,
        address: 'Nhà riêng'
      }));
    } else if (type === 'office') {
      setFormData(prev => ({
        ...prev,
        address: 'Văn phòng'
      }));
    } else if (type === 'other') {
      setFormData(prev => ({
        ...prev,
        address: ''
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
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
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
      
      <div className="checkout-page checkout-page-optimized"
           itemScope 
           itemType="https://schema.org/CheckoutPage">
        
        {/* Checkout Content */}
        <div className="checkout-content">
          <div className="container">
            <div className="checkout-header">
              <h1 className="checkout-title">
                <ion-icon name="basket-outline"></ion-icon>
                Hoàn tất đặt hàng
              </h1>
              <p className="checkout-subtitle">Vui lòng điền thông tin để hoàn tất đơn hàng</p>
            </div>

            <form onSubmit={handleSubmit} 
                  className="checkout-form-optimized"
                  itemScope 
                  itemType="https://schema.org/Order">
              <div className="checkout-layout-optimized">
                <div className="checkout-main-optimized">
                  
                  {/* Combined Information Section */}
                  <div className="checkout-section-optimized">
                    <div className="section-grid">
                      
                      {/* Shipping Information */}
                      <div className="info-section">
                        <div className="section-header-compact">
                          <h3>
                            <ion-icon name="location-outline"></ion-icon>
                            Thông tin giao hàng
                          </h3>
                        </div>

                        <div className="form-grid-compact" 
                             itemScope 
                             itemType="https://schema.org/PostalAddress">
                          
                          {/* Address Type Selection */}
                          <div className="form-group-full">
                            <label className="form-label-compact">
                              Loại địa chỉ <span className="optional-badge">Tùy chọn</span>
                            </label>
                            <div className="address-type-selector">
                              {addressOptions.slice(1).map((option) => (
                                <div 
                                  key={option.value}
                                  className={`address-type-option ${selectedAddressType === option.value ? 'selected' : ''}`}
                                  onClick={() => handleAddressTypeChange(option.value)}
                                >
                                  <div className="address-type-icon">
                                    {option.label.split(' ')[0]}
                                  </div>
                                  <div className="address-type-info">
                                    <span className="address-type-name">{option.label.split(' ').slice(1).join(' ')}</span>
                                    <span className="address-type-desc">{option.details}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="full_name" className="form-label-compact">
                                Họ và tên <span className="required">*</span>
                              </label>
                              <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                className={`form-input-compact ${errors.full_name ? 'error' : ''}`}
                                placeholder="Nhập họ và tên"
                                itemProp="name"
                                required
                              />
                              {errors.full_name && <span className="error-message-compact">{errors.full_name}</span>}
                            </div>

                            <div className="form-group">
                              <label htmlFor="phone" className="form-label-compact">
                                Số điện thoại <span className="required">*</span>
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`form-input-compact ${errors.phone ? 'error' : ''}`}
                                placeholder="Nhập số điện thoại"
                                itemProp="telephone"
                                required
                              />
                              {errors.phone && <span className="error-message-compact">{errors.phone}</span>}
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="email" className="form-label-compact">
                              Email <span className="required">*</span>
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`form-input-compact ${errors.email ? 'error' : ''}`}
                              placeholder="Nhập địa chỉ email"
                              itemProp="email"
                              required
                            />
                            {errors.email && <span className="error-message-compact">{errors.email}</span>}
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="city" className="form-label-compact">
                                Tỉnh/Thành phố <span className="required">*</span>
                              </label>
                              <select
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={`form-input-compact ${errors.city ? 'error' : ''}`}
                                itemProp="addressLocality"
                                required
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
                              {errors.city && <span className="error-message-compact">{errors.city}</span>}
                            </div>

                            <div className="form-group">
                              <label htmlFor="district" className="form-label-compact">
                                Quận/Huyện <span className="required">*</span>
                              </label>
                              <input
                                type="text"
                                id="district"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className={`form-input-compact ${errors.district ? 'error' : ''}`}
                                placeholder="Nhập quận/huyện"
                                itemProp="addressRegion"
                                required
                              />
                              {errors.district && <span className="error-message-compact">{errors.district}</span>}
                            </div>

                            <div className="form-group">
                              <label htmlFor="ward" className="form-label-compact">
                                Phường/Xã <span className="required">*</span>
                              </label>
                              <input
                                type="text"
                                id="ward"
                                name="ward"
                                value={formData.ward}
                                onChange={handleInputChange}
                                className={`form-input-compact ${errors.ward ? 'error' : ''}`}
                                placeholder="Nhập phường/xã"
                                required
                              />
                              {errors.ward && <span className="error-message-compact">{errors.ward}</span>}
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="address" className="form-label-compact">
                              Địa chỉ cụ thể <span className="required">*</span>
                            </label>
                            <input
                              type="text"
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className={`form-input-compact ${errors.address ? 'error' : ''}`}
                              placeholder="Số nhà, tên đường..."
                              itemProp="streetAddress"
                              required
                            />
                            {errors.address && <span className="error-message-compact">{errors.address}</span>}
                          </div>

                          <div className="form-group">
                            <label htmlFor="notes" className="form-label-compact">
                              Ghi chú đơn hàng
                            </label>
                            <textarea
                              id="notes"
                              name="notes"
                              value={formData.notes}
                              onChange={handleInputChange}
                              className="form-textarea-compact"
                              placeholder="Ghi chú thêm (không bắt buộc)"
                              rows="2"
                              itemProp="description"
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="info-section">
                        <div className="section-header-compact">
                          <h3>
                            <ion-icon name="card-outline"></ion-icon>
                            Phương thức thanh toán
                          </h3>
                        </div>

                        <div className="payment-methods-compact"
                             itemScope 
                             itemType="https://schema.org/PaymentMethod">
                          <div className="payment-option-compact">
                            <label className="payment-label-compact">
                              <input
                                type="radio"
                                name="payment_method"
                                value="cod"
                                checked={formData.payment_method === 'cod'}
                                onChange={handleInputChange}
                                className="payment-radio-compact"
                              />
                              <div className="payment-content-compact">
                                <div className="payment-icon-compact">
                                  <ion-icon name="cash-outline"></ion-icon>
                                </div>
                                <div className="payment-info-compact">
                                  <span className="payment-name">Thanh toán khi nhận hàng</span>
                                  <span className="payment-desc">Phí COD: 30,000 VNĐ</span>
                                </div>
                                <div className="payment-badge-compact popular">Phổ biến</div>
                              </div>
                            </label>
                          </div>

                          <div className="payment-option-compact">
                            <label className="payment-label-compact">
                              <input
                                type="radio"
                                name="payment_method"
                                value="bank_transfer"
                                checked={formData.payment_method === 'bank_transfer'}
                                onChange={handleInputChange}
                                className="payment-radio-compact"
                              />
                              <div className="payment-content-compact">
                                <div className="payment-icon-compact">
                                  <ion-icon name="card-outline"></ion-icon>
                                </div>
                                <div className="payment-info-compact">
                                  <span className="payment-name">Chuyển khoản ngân hàng</span>
                                  <span className="payment-desc">Miễn phí vận chuyển</span>
                                </div>
                                <div className="payment-badge-compact recommended">Khuyến nghị</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {formData.payment_method === 'bank_transfer' && (
                          <div className="bank-info-compact">
                            <div className="bank-info-header-compact">
                              <ion-icon name="information-circle-outline"></ion-icon>
                              <span>Thông tin chuyển khoản</span>
                            </div>
                            <div className="bank-details-compact">
                              <div className="bank-item-compact">
                                <span className="bank-label-compact">Ngân hàng:</span>
                                <span className="bank-value-compact">Vietcombank</span>
                              </div>
                              <div className="bank-item-compact">
                                <span className="bank-label-compact">Số TK:</span>
                                <span className="bank-value-compact">1234567890</span>
                              </div>
                              <div className="bank-item-compact">
                                <span className="bank-label-compact">Chủ TK:</span>
                                <span className="bank-value-compact">KHANG TRAM HUONG</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="checkout-sidebar-optimized">
                  <div className="order-summary-card-optimized">
                    <div className="summary-header-compact">
                      <h3>
                        <ion-icon name="receipt-outline"></ion-icon>
                        Tóm tắt đơn hàng
                      </h3>
                      <div className="summary-badge">{cart.total_items} sản phẩm</div>
                    </div>

                    <div className="order-items-compact">
                      {cart.items.map((item) => (
                        <div key={`${item.product_id}-${item.size}`} 
                             className="order-item-compact">
                          <div className="order-item-image-compact">
                            <img src={item.product_image} 
                                 alt={item.product_name} />
                            <span className="item-quantity-badge">{item.quantity}</span>
                          </div>
                          <div className="order-item-details-compact">
                            <span className="item-name-compact">{item.product_name}</span>
                            <div className="item-specs-compact">
                              <span className="item-size-compact">{item.size}</span>
                              <span className="item-price-compact">{formatPrice(item.total_price)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-summary-compact">
                      <div className="summary-row-compact">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(cart.total_amount)}</span>
                      </div>
                      <div className="summary-row-compact">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(calculateShipping())}</span>
                      </div>
                      <div className="summary-divider-compact"></div>
                      <div className="summary-total-compact">
                        <span>Tổng cộng:</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>

                    {/* Single Order Button */}
                    <button 
                      type="submit" 
                      className="place-order-btn-optimized"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="spinner-compact"></div>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <ion-icon name="checkmark-circle-outline"></ion-icon>
                          <span>Xác nhận đặt hàng</span>
                        </>
                      )}
                    </button>

                    <div className="payment-security-compact">
                      <div className="security-items-compact">
                        <div className="security-item-compact">
                          <ion-icon name="shield-checkmark-outline"></ion-icon>
                          <span>Bảo mật SSL</span>
                        </div>
                        <div className="security-item-compact">
                          <ion-icon name="lock-closed-outline"></ion-icon>
                          <span>Thông tin an toàn</span>
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