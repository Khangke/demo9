import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Checkout = () => {
  const [cart, setCart] = useState({ 
    items: [
      {
        product_id: "09553d01-665a-449b-a2ec-6fed738291f3",
        product_name: "Trầm Hương Kỳ Nam Cao Cấp",
        product_image: "https://images.unsplash.com/photo-1613750255797-7d4f877615df",
        size: "Vừa (10g)",
        size_price: 2500000.0,
        original_price: 3000000.0,
        quantity: 1,
        total_price: 2500000.0
      }
    ], 
    total_amount: 2500000.0, 
    total_items: 1 
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidation, setShowValidation] = useState(false);
  const [completedFields, setCompletedFields] = useState(new Set());
  const [addressType, setAddressType] = useState('home');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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
  const [fieldFocus, setFieldFocus] = useState({});

  const sessionId = localStorage.getItem('session_id') || 'test_session_checkout';

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    // For demo purposes, use mock data instead of API
    setLoading(false);
    return;
    
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
    
    // Mark field as completed when it has value
    if (value.trim()) {
      setCompletedFields(prev => new Set([...prev, name]));
    } else {
      setCompletedFields(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(name);
        return newSet;
      });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInputFocus = (fieldName) => {
    setFieldFocus(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleInputBlur = (fieldName) => {
    setFieldFocus(prev => ({
      ...prev,
      [fieldName]: false
    }));
    
    // Validate field on blur if validation is shown
    if (showValidation) {
      validateSingleField(fieldName);
    }
  };

  const validateSingleField = (fieldName) => {
    const newErrors = { ...errors };
    const value = formData[fieldName];

    switch (fieldName) {
      case 'full_name':
        if (!value.trim()) newErrors.full_name = 'Vui lòng nhập họ tên';
        else delete newErrors.full_name;
        break;
      case 'phone':
        if (!value.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
        else if (!/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
          newErrors.phone = 'Số điện thoại không hợp lệ';
        } else delete newErrors.phone;
        break;
      case 'email':
        if (!value.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email không hợp lệ';
        } else delete newErrors.email;
        break;
      case 'address':
        if (!value.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
        else delete newErrors.address;
        break;
      case 'city':
        if (!value.trim()) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
        else delete newErrors.city;
        break;
      case 'district':
        if (!value.trim()) newErrors.district = 'Vui lòng chọn quận/huyện';
        else delete newErrors.district;
        break;
      case 'ward':
        if (!value.trim()) newErrors.ward = 'Vui lòng chọn phường/xã';
        else delete newErrors.ward;
        break;
    }

    setErrors(newErrors);
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
    setShowValidation(true);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate form completion percentage
  const calculateProgress = () => {
    const requiredFields = ['full_name', 'phone', 'email', 'address', 'city', 'district', 'ward'];
    const completedCount = requiredFields.filter(field => formData[field].trim()).length;
    return Math.round((completedCount / requiredFields.length) * 100);
  };

  // Get field status for styling
  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return 'error';
    if (completedFields.has(fieldName)) return 'success';
    if (fieldFocus[fieldName]) return 'focus';
    return 'default';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    
    // Show success message first for better UX
    setShowSuccessMessage(true);
    
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
          notes: formData.notes,
          address_type: addressType
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

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

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
        setShowSuccessMessage(false);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      setShowSuccessMessage(false);
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
              
              {/* Progress Indicator */}
              <div className="checkout-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  <span>Hoàn thành: {calculateProgress()}%</span>
                  {calculateProgress() === 100 && (
                    <span className="progress-complete">
                      <ion-icon name="checkmark-circle"></ion-icon>
                      Sẵn sàng đặt hàng
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} 
                  className="checkout-form-optimized"
                  itemScope 
                  itemType="https://schema.org/Order">
              <div className="checkout-layout-optimized">
                <div className="checkout-main-optimized">
                  
                  {/* Shipping Information Section */}
                  <div className="checkout-section-optimized">
                    <div className="section-header-compact">
                      <h3>
                        <ion-icon name="location-outline"></ion-icon>
                        Thông tin giao hàng
                      </h3>
                    </div>

                    <div className="form-grid-compact" 
                         itemScope 
                         itemType="https://schema.org/PostalAddress">

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="full_name" className="form-label-enhanced">
                            <span className="label-text">
                              Họ và tên <span className="required">*</span>
                            </span>
                            {getFieldStatus('full_name') === 'success' && (
                              <ion-icon name="checkmark-circle" className="field-success-icon"></ion-icon>
                            )}
                          </label>
                          <div className="input-wrapper">
                            <input
                              type="text"
                              id="full_name"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              onFocus={() => handleInputFocus('full_name')}
                              onBlur={() => handleInputBlur('full_name')}
                              className={`form-input-enhanced ${getFieldStatus('full_name')}`}
                              placeholder="Nhập họ và tên đầy đủ"
                              itemProp="name"
                              required
                            />
                            <div className="input-border"></div>
                          </div>
                          {errors.full_name && (
                            <span className="error-message-enhanced">
                              <ion-icon name="alert-circle"></ion-icon>
                              {errors.full_name}
                            </span>
                          )}
                          {fieldFocus.full_name && !errors.full_name && (
                            <span className="help-text">Nhập họ và tên đầy đủ như trên CMND/CCCD</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="phone" className="form-label-enhanced">
                            <span className="label-text">
                              Số điện thoại <span className="required">*</span>
                            </span>
                            {getFieldStatus('phone') === 'success' && (
                              <ion-icon name="checkmark-circle" className="field-success-icon"></ion-icon>
                            )}
                          </label>
                          <div className="input-wrapper">
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              onFocus={() => handleInputFocus('phone')}
                              onBlur={() => handleInputBlur('phone')}
                              className={`form-input-enhanced ${getFieldStatus('phone')}`}
                              placeholder="0xxx xxx xxx"
                              itemProp="telephone"
                              required
                            />
                            <div className="input-border"></div>
                          </div>
                          {errors.phone && (
                            <span className="error-message-enhanced">
                              <ion-icon name="alert-circle"></ion-icon>
                              {errors.phone}
                            </span>
                          )}
                          {fieldFocus.phone && !errors.phone && (
                            <span className="help-text">Số điện thoại để liên hệ giao hàng</span>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="email" className="form-label-enhanced">
                          <span className="label-text">
                            Email <span className="required">*</span>
                          </span>
                          {getFieldStatus('email') === 'success' && (
                            <ion-icon name="checkmark-circle" className="field-success-icon"></ion-icon>
                          )}
                        </label>
                        <div className="input-wrapper">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={() => handleInputFocus('email')}
                            onBlur={() => handleInputBlur('email')}
                            className={`form-input-enhanced ${getFieldStatus('email')}`}
                            placeholder="your@email.com"
                            itemProp="email"
                            required
                          />
                          <div className="input-border"></div>
                        </div>
                        {errors.email && (
                          <span className="error-message-enhanced">
                            <ion-icon name="alert-circle"></ion-icon>
                            {errors.email}
                          </span>
                        )}
                        {fieldFocus.email && !errors.email && (
                          <span className="help-text">Email để nhận thông tin đơn hàng</span>
                        )}
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
                            <option value="">Chọn tỉnh/thành</option>
                            <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                            <option value="Hà Nội">Hà Nội</option>
                            <option value="Đà Nẵng">Đà Nẵng</option>
                            <option value="Cần Thơ">Cần Thơ</option>
                            <option value="Khánh Hòa">Khánh Hòa</option>
                            <option value="Quảng Nam">Quảng Nam</option>
                            <option value="Bình Dương">Bình Dương</option>
                            <option value="Đồng Nai">Đồng Nai</option>
                            <option value="Bà Rịa - Vũng Tàu">Bà Rịa - Vũng Tàu</option>
                            <option value="An Giang">An Giang</option>
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

                  {/* Payment Method Section */}
                  <div className="checkout-section-optimized">
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

                    {/* Enhanced Order Button */}
                    <button 
                      type="submit" 
                      className={`place-order-btn-enhanced ${calculateProgress() === 100 ? 'ready' : 'not-ready'}`}
                      disabled={submitting || calculateProgress() !== 100}
                    >
                      {submitting ? (
                        <>
                          <div className="spinner-enhanced"></div>
                          <span>Đang xử lý đơn hàng...</span>
                        </>
                      ) : calculateProgress() === 100 ? (
                        <>
                          <ion-icon name="checkmark-circle-outline"></ion-icon>
                          <span>Xác nhận đặt hàng</span>
                          <div className="button-shine"></div>
                        </>
                      ) : (
                        <>
                          <ion-icon name="information-circle-outline"></ion-icon>
                          <span>Vui lòng điền đầy đủ thông tin ({calculateProgress()}%)</span>
                        </>
                      )}
                    </button>

                    {/* Order Security Features */}
                    <div className="order-security-enhanced">
                      <div className="security-features">
                        <div className="security-item">
                          <ion-icon name="shield-checkmark"></ion-icon>
                          <span>Thanh toán an toàn 256-bit SSL</span>
                        </div>
                        <div className="security-item">
                          <ion-icon name="time"></ion-icon>
                          <span>Giao hàng trong 24-48h</span>
                        </div>
                        <div className="security-item">
                          <ion-icon name="return-up-back"></ion-icon>
                          <span>Đổi trả miễn phí trong 7 ngày</span>
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