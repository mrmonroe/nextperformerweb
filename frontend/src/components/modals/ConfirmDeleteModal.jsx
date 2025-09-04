import { X, AlertTriangle } from 'lucide-react'

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  itemName = "",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false
}) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {message}
          </p>
          {itemName && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 font-medium">
                <span className="text-gray-500">Item:</span> {itemName}
              </p>
            </div>
          )}
          <p className="text-sm text-red-600 font-medium">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="btn-outline px-4 py-2 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="btn-primary bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 px-4 py-2 disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
