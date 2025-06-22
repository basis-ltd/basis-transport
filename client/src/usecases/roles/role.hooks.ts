import { useLazyFetchRolesQuery } from '@/api/queries/apiQuerySlice';
import { useAppDispatch } from '@/states/hooks';
import { setRolesList } from '@/states/slices/roleSlice';
import { useEffect } from 'react';
import { usePagination } from '../common/pagination.hooks';

export const useFetchRoles = () => {
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
    totalCount,
    totalPages,
    setPage,
    setSize,
    setTotalCount,
    setTotalPages,
  } = usePagination();

  // MUTATION
  const [
    fetchRoles,
    {
      data: rolesData,
      isFetching: rolesIsFetching,
      isError: rolesIsError,
      isSuccess: rolesIsSuccess,
    },
  ] = useLazyFetchRolesQuery();

  useEffect(() => {
    if (rolesIsSuccess) {
      setTotalCount(rolesData?.data?.totalCount);
      setTotalPages(rolesData?.data?.totalPages);
      dispatch(setRolesList(rolesData?.data?.rows));
    }
  }, [
    rolesIsSuccess,
    rolesData?.data?.rows,
    rolesData?.data?.totalCount,
    rolesData?.data?.totalPages,
    dispatch,
    setTotalCount,
    setTotalPages,
  ]);

  return {
    fetchRoles,
    rolesData,
    rolesIsFetching,
    rolesIsError,
    page,
    size,
    totalCount,
    totalPages,
    setPage,
    setSize,
  };
};
