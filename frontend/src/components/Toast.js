import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-show' : ''}`}>
      <div className="toast-content">
        <ion-icon name={getToastIcon()}></ion-icon>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>
          <ion-icon name="close"></ion-icon>
        </button>
      </div>
    </div>
  );
};

export default Toast;