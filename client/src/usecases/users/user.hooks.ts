import {
  useFetchUsersQuery,
  useLazyGetUserByIdQuery,
} from '@/api/queries/apiQuerySlice';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setAddUserToUsersList,
  setUser,
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
  const {
    page,
    size,
    setPage,
    setSize,
  } = usePagination();
  const { isHydrated, token } = useAppSelector((state) => state.auth);

  const {
    data: usersData,
    isFetching: usersIsFetching,
    isError: usersIsError,
  } = useFetchUsersQuery({ page, size }, { skip: !isHydrated || !token });

  return {
    usersList: usersData?.data?.rows ?? [],
    usersData,
    usersIsFetching,
    usersIsError,
    page,
    size,
    totalCount: usersData?.data?.totalCount ?? 0,
    totalPages: usersData?.data?.totalPages ?? 0,
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
