import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // If order data is passed via location state (from checkout)
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
      // Show celebration for new orders
      if (location.state?.isNewOrder) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } else {
      // Fetch order data from API
      fetchOrder();
    }
  }, [orderId, location.state]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
      } else {
        setError('Không tìm thấy đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Có lỗi xảy ra khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method) => {
    return method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng';
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'processing': 'Đang xử lý',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ thanh toán',
      'paid': 'Đã thanh toán',
      'failed': 'Thanh toán thất bại'
    };
    return statusMap[status] || status;
  };

  const getDiscountPercentage = (currentPrice, originalPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="order-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="order-error">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <h2>Có lỗi xảy ra</h2>
            <p>{error}</p>
            <Link to="/" className="back-home-btn">
              <ion-icon name="home-outline"></ion-icon>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Đặt hàng thành công - Khang Trầm Hương | Cảm ơn quý khách</title>
        <meta name="description" content="Đặt hàng trầm hương thành công. Cảm ơn quý khách đã tin tưởng Khang Trầm Hương. Đơn hàng sẽ được xử lý trong 2-4 giờ." />
        <meta name="keywords" content="đặt hàng thành công, xác nhận đơn hàng, trầm hương, cảm ơn khách hàng" />
        <meta property="og:title" content="Đặt hàng thành công - Khang Trầm Hương" />
        <meta property="og:description" content="Cảm ơn quý khách đã đặt hàng thành công tại Khang Trầm Hương" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-icon">
              <ion-icon name="checkmark-circle"></ion-icon>
            </div>
            <div className="celebration-text">
              <h2>🎉 Đặt hàng thành công!</h2>
              <p>Cảm ơn bạn đã tin tưởng Khang Trầm Hương</p>
            </div>
            <div className="celebration-sparkles">
              <div className="sparkle sparkle-1">✨</div>
              <div className="sparkle sparkle-2">⭐</div>
              <div className="sparkle sparkle-3">💫</div>
              <div className="sparkle sparkle-4">✨</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="order-confirmation-page-luxury">
      {/* Enhanced Success Banner */}
      <div className="success-banner-luxury">
        <div className="container">
          <div className="success-content-luxury">
            <div className="success-icon-luxury">
              <div className="icon-circle">
                <ion-icon name="checkmark-circle"></ion-icon>
              </div>
              <div className="success-ripple"></div>
            </div>
            <div className="success-text-luxury">
              <h1>Đặt hàng thành công!</h1>
              <p>Cảm ơn bạn đã tin tưởng và đặt hàng tại <span className="brand-highlight">Khang Trầm Hương</span></p>
              <div className="order-number-highlight">
                Mã đơn hàng: <strong>#{order.order_number}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="order-details-content-luxury">
        <div className="container">
          <div className="order-layout-luxury">
            {/* Order Information */}
            <div className="order-main-luxury">
              <div className="order-header-luxury">
                <div className="order-number-card">
                  <h2>
                    <ion-icon name="receipt-outline"></ion-icon>
                    Thông tin đơn hàng
                  </h2>
                  <div className="order-meta-luxury">
                    <span className="order-date-luxury">
                      <ion-icon name="calendar-outline"></ion-icon>
                      Ngày đặt: {formatDate(order.created_at)}
                    </span>
                    <span className={`order-status-luxury status-${order.order_status}`}>
                      <ion-icon name="information-circle-outline"></ion-icon>
                      {getOrderStatusText(order.order_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="info-section">
                <h3>
                  <ion-icon name="person-outline"></ion-icon>
                  Thông tin khách hàng
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Họ tên:</label>
                    <span>{order.customer_info.full_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Số điện thoại:</label>
                    <span>{order.customer_info.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{order.customer_info.email}</span>
                  </div>
                  <div className="info-item full-width">
                    <label>Địa chỉ giao hàng:</label>
                    <span>
                      {order.customer_info.address}, {order.customer_info.ward}, {order.customer_info.district}, {order.customer_info.city}
                    </span>
                  </div>
                  {order.customer_info.notes && (
                    <div className="info-item full-width">
                      <label>Ghi chú:</label>
                      <span>{order.customer_info.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="info-section">
                <h3>
                  <ion-icon name="bag-outline"></ion-icon>
                  Sản phẩm đã đặt
                </h3>
                <div className="order-items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="order-item-image">
                        <img src={item.product_image} alt={item.product_name} />
                        <span className="order-item-quantity">{item.quantity}</span>
                        {item.original_price && item.original_price > item.size_price && (
                          <div className="order-item-discount">
                            -{getDiscountPercentage(item.size_price, item.original_price)}%
                          </div>
                        )}
                      </div>
                      
                      <div className="order-item-details">
                        <h4>{item.product_name}</h4>
                        <div className="order-item-specs">
                          <span className="item-size">
                            <ion-icon name="resize-outline"></ion-icon>
                            Kích thước: {item.size}
                          </span>
                          <span className="item-price">
                            <span className="current-price">{formatPrice(item.size_price)}</span>
                            {item.original_price && item.original_price > item.size_price && (
                              <span className="original-price">{formatPrice(item.original_price)}</span>
                            )}
                          </span>
                        </div>
                        <div className="item-total">
                          Thành tiền: <strong>{formatPrice(item.total_price)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="info-section">
                <h3>
                  <ion-icon name="card-outline"></ion-icon>
                  Thông tin thanh toán
                </h3>
                <div className="payment-info">
                  <div className="payment-method">
                    <label>Phương thức thanh toán:</label>
                    <span>
                      {order.payment_method === 'cod' ? (
                        <>
                          <ion-icon name="cash-outline"></ion-icon>
                          {getPaymentMethodText(order.payment_method)}
                        </>
                      ) : (
                        <>
                          <ion-icon name="card-outline"></ion-icon>
                          {getPaymentMethodText(order.payment_method)}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="payment-status">
                    <label>Trạng thái thanh toán:</label>
                    <span className={`status-${order.payment_status}`}>
                      {getPaymentStatusText(order.payment_status)}
                    </span>
                  </div>
                </div>

                {order.payment_method === 'bank_transfer' && order.payment_status === 'pending' && (
                  <div className="bank-transfer-info">
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
                      <div className="bank-item highlight">
                        <strong>Nội dung chuyển khoản:</strong> Thanh toan don hang {order.order_number}
                      </div>
                      <div className="bank-item highlight">
                        <strong>Số tiền:</strong> {formatPrice(order.total_amount)}
                      </div>
                    </div>
                    <p className="bank-note">
                      <ion-icon name="information-circle-outline"></ion-icon>
                      Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xử lý nhanh chóng.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="order-sidebar">
              <div className="order-summary-card">
                <h3>
                  <ion-icon name="calculator-outline"></ion-icon>
                  Tóm tắt đơn hàng
                </h3>
                
                <div className="summary-calculations">
                  <div className="calc-row">
                    <span>Tạm tính ({order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="calc-row">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(order.shipping_fee)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="calc-row discount-row">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="calc-divider"></div>
                  <div className="calc-row total-row">
                    <span>Tổng cộng</span>
                    <span className="total-amount">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="order-actions">
                <Link to="/products" className="continue-shopping-btn">
                  <ion-icon name="arrow-back-outline"></ion-icon>
                  Tiếp tục mua sắm
                </Link>
                <Link to="/" className="back-home-btn">
                  <ion-icon name="home-outline"></ion-icon>
                  Về trang chủ
                </Link>
              </div>

              <div className="order-support">
                <h4>
                  <ion-icon name="headset-outline"></ion-icon>
                  Cần hỗ trợ?
                </h4>
                <div className="support-contacts">
                  <a href="tel:0123456789" className="support-item">
                    <ion-icon name="call-outline"></ion-icon>
                    <div>
                      <strong>Hotline</strong>
                      <span>0123 456 789</span>
                    </div>
                  </a>
                  <a href="mailto:support@khangtramhuong.com" className="support-item">
                    <ion-icon name="mail-outline"></ion-icon>
                    <div>
                      <strong>Email</strong>
                      <span>support@khangtramhuong.com</span>
                    </div>
                  </a>
                </div>
              </div>

              <div className="order-next-steps">
                <h4>
                  <ion-icon name="list-outline"></ion-icon>
                  Các bước tiếp theo
                </h4>
                <ul>
                  <li>
                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                    Chúng tôi sẽ xác nhận đơn hàng trong 2-4 giờ
                  </li>
                  <li>
                    <ion-icon name="cube-outline"></ion-icon>
                    Đóng gói và chuẩn bị hàng trong 1-2 ngày
                  </li>
                  <li>
                    <ion-icon name="car-outline"></ion-icon>
                    Giao hàng trong 3-7 ngày làm việc
                  </li>
                  <li>
                    <ion-icon name="star-outline"></ion-icon>
                    Đánh giá sản phẩm sau khi nhận hàng
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;