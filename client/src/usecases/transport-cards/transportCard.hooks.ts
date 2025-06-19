import { useLazyFetchTransportCardsQuery } from '@/api/queries/apiQuerySlice';
import { useAppDispatch } from '@/states/hooks';
import { setTransportCardsList } from '@/states/slices/transportCardSlice';
import { useEffect } from 'react';
import { usePagination } from '../common/pagination.hooks';

/**
 * FETCH TRANSPORT CARDS
 */
export const useFetchTransportCards = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  /**
   * PAGINATION
   */
  const {
    page,
    size,
    setPage,
    setSize,
    setTotalCount,
    setTotalPages,
    totalCount,
    totalPages,
  } = usePagination();

  const [
    fetchTransportCards,
    {
      data: transportCardsData,
      isFetching: transportCardsIsFetching,
      error: transportCardsError,
    },
  ] = useLazyFetchTransportCardsQuery();

  useEffect(() => {
    if (transportCardsData) {
      dispatch(setTransportCardsList(transportCardsData?.data?.rows));
      setTotalCount(transportCardsData?.data?.totalCount);
      setTotalPages(transportCardsData?.data?.totalPages);
    }
  }, [dispatch, setTotalCount, setTotalPages, transportCardsData]);

  return {
    fetchTransportCards,
    transportCardsData,
    transportCardsIsFetching,
    transportCardsError,
    page,
    size,
    setPage,
    setSize,
    totalCount,
    totalPages,
  };
};
