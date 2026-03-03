import React from 'react';
import { AlertTriangle, RefreshCw, Folder } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-0 dark:bg-neutral-1000 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-0 mb-2 text-center">
              Oops! Something went wrong
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-center">
              The application encountered an unexpected error. Don't worry, your data is safe.
            </p>
            {this.state.retryCount > 0 && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 text-center">
                Retry attempt: {this.state.retryCount}
              </p>
            )}

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100">
                  Error details
                </summary>
                <div className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-mono text-red-700 dark:text-red-400 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <pre className="mt-2 text-neutral-600 dark:text-neutral-400">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg font-medium transition-colors"
              >
                Reload Application
              </button>
              <button
                onClick={() => {
                  if (window.electron) {
                    window.electron.app.getPath('userData').then(path => {
                      alert(`User data stored at: ${path}`);
                    });
                  }
                }}
                className="w-full py-2 px-4 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Folder className="w-4 h-4" />
                Show Data Location
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
