import { UnknownAction } from '@reduxjs/toolkit';
import { useState } from 'react';

export const usePagination = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  return {
    page,
    size,
    totalCount,
    totalPages,
    setPage: setPage as (page: number) => UnknownAction,
    setSize: setSize as (size: number) => UnknownAction,
    setTotalCount,
    setTotalPages,
  };
};
