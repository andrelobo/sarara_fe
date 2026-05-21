import PropTypes from "prop-types"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null
  }

  const pageNumbers = []
  for (let index = 1; index <= totalPages; index += 1) {
    pageNumbers.push(index)
  }

  return (
    <nav aria-label="Paginacao" className="mt-6 flex justify-center">
      <ul className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-surface/70 px-3 py-2 shadow-ambient">
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              aria-current={currentPage === number ? "page" : undefined}
              className={[
                "h-10 min-w-10 rounded-full px-3 font-ui text-sm font-semibold transition",
                currentPage === number ? "bg-primary text-background" : "text-text-dark hover:bg-white/8 hover:text-text",
              ].join(" ")}
              onClick={() => onPageChange(number)}
              type="button"
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
}

export default Pagination
