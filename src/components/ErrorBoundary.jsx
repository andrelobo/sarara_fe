import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="bg-error p-8 rounded-lg shadow-lg text-text">
            <h1 className="text-2xl font-bold mb-4">Oops! Algo deu errado.</h1>
            <p className="mb-4">{this.state.error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary-light text-text px-4 py-2 rounded transition duration-300"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
ErrorBoundary.propTypes = {
  children: PropTypes.node
};

export default ErrorBoundary;

