import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center mt-8" aria-label="Paginação">
      <ul className="flex space-x-2">
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={`px-4 py-2 rounded-md ${
                currentPage === number
                  ? 'bg-secondary text-background'
                  : 'bg-background-light text-text hover:bg-primary-light'
              }`}
              aria-current={currentPage === number ? 'page' : undefined}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;

