import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  if (!isOpen) return null;

  const getStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          header: 'bg-red-50',
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white'
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          header: 'bg-yellow-50',
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white'
        };
      case 'info':
      default:
        return {
          icon: 'text-blue-500',
          header: 'bg-blue-50',
          confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white'
        };
    }
  };

  const styles = getStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md border border-gray-100 animate-fade-in">
        {/* Header */}
        <div className={`${styles.header} p-6 rounded-t-xl border-b border-gray-100`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle size={24} className={styles.icon} />
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 pt-0">
          <button
            onClick={handleConfirm}
            className={`flex-1 ${styles.confirmButton} py-3 rounded-lg font-medium transition-colors shadow-sm`}
          >
            {confirmText}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-lg font-medium transition-colors border border-gray-200"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;