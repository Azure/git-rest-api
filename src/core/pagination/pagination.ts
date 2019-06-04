export interface Pagination {
  page?: number;
}

/**
 * Return the given page for the given pagination
 * @param pagination
 */
export function getPage(pagination: Pagination | undefined) {
  return pagination === undefined || pagination.page === undefined ? 1 : Math.max(pagination.page, 1);
}

/**
 * Return the number of items to skip using the given pagination object
 * @param pagination
 */
export function getPaginationSkip(pagination: Pagination | undefined, perPage: number) {
  const page = getPage(pagination);
  return (page - 1) * perPage;
}
