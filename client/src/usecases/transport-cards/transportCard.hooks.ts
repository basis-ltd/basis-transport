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

  // STATE VARIABLES
  const dispatch = useAppDispatch();

  const {
    page,
    size,
    setPage,
    setSize,
  } = usePagination();

  const [fetchTransportCards, { data, isFetching, error, isSuccess }] = useLazyFetchTransportCardsQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setTransportCardsList(data?.data?.rows));
    }
  }, [dispatch, isSuccess, data?.data?.rows]);

  return {
    fetchTransportCards,
    data,
    isFetching,
    error,
    page,
    size,
    setPage,
    setSize,
    totalCount: data?.data?.totalCount ?? 0,
    totalPages: data?.data?.totalPages ?? 0,
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
