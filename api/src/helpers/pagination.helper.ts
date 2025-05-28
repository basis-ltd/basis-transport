export interface Pagination<T = object> {
  size?: number;
  page?: number;
  rows: Array<T>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const getPagination = ({
  page,
  size,
}: {
  page?: number;
  size?: number;
}) => {
  const take = size ? +size : 10;
  const skip = page ? page * take : 0;

  return { take, skip };
};

export const getPagingData = ({
  data,
  size = 10,
  page = 0,
}: {
  data: any;
  size?: number;
  page?: number;
}) => {
  return {
    rows: data && data[0],
    totalCount: data && data[1],
    totalPages: Math.ceil(data && Number(data[1]) / Number(size)),
    currentPage: Number(page) + 1,
  };
};
