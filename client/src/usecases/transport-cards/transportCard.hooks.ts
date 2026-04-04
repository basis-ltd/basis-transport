import {
  useLazyFetchTransportCardsQuery,
  useLazyGetTransportCardByIdQuery,
} from "@/api/queries/apiQuerySlice";
import { useAppDispatch } from "@/states/hooks";
import {
  setTransportCard,
  setTransportCardsList,
} from "@/states/slices/transportCardSlice";
import { useEffect } from "react";
import { usePagination } from "../common/pagination.hooks";

/**
 * FETCH TRANSPORT CARDS
 */
export const useFetchTransportCards = () => {
  const dispatch = useAppDispatch();

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

  // MUTATION
  const [
    fetchTransportCards,
    {
      data,
      isFetching,
      error,
      isSuccess,
    },
  ] = useLazyFetchTransportCardsQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setTransportCardsList(data?.data?.rows));
      setTotalCount(data?.data?.totalCount);
      setTotalPages(data?.data?.totalPages);
    }
  }, [
    dispatch,
    setTotalCount,
    setTotalPages,
    isSuccess,
    data?.data?.rows,
    data?.data?.totalCount,
    data?.data?.totalPages,
  ]);

  return {
    fetchTransportCards,
    data,
    isFetching,
    error,
    page,
    size,
    setPage,
    setSize,
    totalCount,
    totalPages,
  };
};

/**
 * FETCH TRANSPORT CARD BY ID
 */
export const useFetchTransportCardById = () => {
  const dispatch = useAppDispatch();

  const [
    fetchTransportCardById,
    {
      data,
      isFetching,
      error,
      isSuccess,
    },
  ] = useLazyGetTransportCardByIdQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setTransportCard(data?.data));
    }
  }, [dispatch, isSuccess, data?.data]);

  return {
    fetchTransportCardById,
    data,
    isFetching,
    error,
    isSuccess,
  };
};
