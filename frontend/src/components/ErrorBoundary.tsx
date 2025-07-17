import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-300 mb-4">
              ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองรีเฟรชหน้าเว็บ
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              รีเฟรชหน้า
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-blue-400">รายละเอียดข้อผิดพลาด (Development)</summary>
                <pre className="mt-2 text-xs bg-gray-700 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 