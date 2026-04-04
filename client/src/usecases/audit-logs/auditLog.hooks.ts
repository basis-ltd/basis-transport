import { useLazyFetchAuditLogsByEntityIdQuery } from "@/api/queries/apiQuerySlice";

export const useFetchAuditLogsByEntityId = () => {
  const [fetchAuditLogsByEntityId, { data, isFetching, error, isSuccess, reset }] =
    useLazyFetchAuditLogsByEntityIdQuery();

  return {
    fetchAuditLogsByEntityId,
    data,
    isFetching,
    error,
    isSuccess,
    reset,
  };
};
