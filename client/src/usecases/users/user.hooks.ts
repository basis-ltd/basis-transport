import {
  useLazyFetchUsersQuery,
  useLazyGetUserByIdQuery,
} from '@/api/queries/apiQuerySlice';
import { useAppDispatch } from '@/states/hooks';
import {
  setAddUserToUsersList,
  setUser,
  setUsersList,
} from '@/states/slices/userSlice';
import { useEffect } from 'react';
import { usePagination } from '../common/pagination.hooks';
import { useCreateUserMutation } from '@/api/mutations/apiSlice';

/**
 * FETCH USERS
 */
export const useFetchUsers = () => {
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

  const [
    fetchUsers,
    { data: usersData, isFetching: usersIsFetching, isError: usersIsError },
  ] = useLazyFetchUsersQuery();

  useEffect(() => {
    if (usersData) {
      dispatch(setUsersList(usersData?.data?.rows));
      setTotalCount(usersData?.data?.totalCount);
      setTotalPages(usersData?.data?.totalPages);
    }
  }, [usersData, dispatch, setTotalCount, setTotalPages]);

  return {
    fetchUsers,
    usersData,
    usersIsFetching,
    usersIsError,
    page,
    size,
    totalCount,
    totalPages,
    setPage,
    setSize,
  };
};

/**
 * GET USER BY ID
 */
export const useGetUserById = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  const [
    getUserById,
    {
      data: userData,
      isFetching: userIsFetching,
      isError: userIsError,
      isSuccess: userIsSuccess,
    },
  ] = useLazyGetUserByIdQuery();

  useEffect(() => {
    if (userIsSuccess) {
      dispatch(setUser(userData?.data));
    } else {
      dispatch(setUser(undefined));
    }
  }, [userIsSuccess, userData, dispatch]);

  return {
    getUserById,
    userData,
    userIsFetching,
    userIsError,
    userIsSuccess,
  };
};

/**
 * CREATE USER
 */
export const useCreateUser = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  const [
    createUser,
    {
      data: createUserData,
      isLoading: createUserIsLoading,
      isError: createUserIsError,
      isSuccess: createUserIsSuccess,
      reset: createUserReset,
    },
  ] = useCreateUserMutation();

  useEffect(() => {
    if (createUserIsSuccess) {
      dispatch(setAddUserToUsersList(createUserData?.data));
      createUserReset();
    }
  }, [createUserIsSuccess, createUserData, dispatch, createUserReset]);

  return {
    createUser,
    createUserIsLoading,
    createUserIsError,
    createUserIsSuccess,
    createUserReset,
  };
};
