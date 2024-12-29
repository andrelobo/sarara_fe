import PropTypes from 'prop-types';

const ErrorFallback = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-error p-8 rounded-lg shadow-lg text-text">
        <h1 className="text-2xl font-bold mb-4">Oops! Algo deu errado.</h1>
        <p className="mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary-light text-text px-4 py-2 rounded transition duration-300"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
  }).isRequired,
};

export default ErrorFallback;

