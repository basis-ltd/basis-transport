import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../rootApi';

export const apiQuerySlice=createApi({
  reducerPath:'apiQuery',baseQuery,tagTypes:['Users','Roles','Audit','Dashboard'],
  endpoints:builder=>({
    fetchUsers:builder.query({query:({page=0,size=20})=>({url:'/users',params:{page,size}})}),
    getUserById:builder.query({query:(id)=>({url:'/users/'+id})}),
    fetchRoles:builder.query({query:()=>({url:'/roles'})}),
    getRoleById:builder.query({query:(id)=>({url:'/roles/'+id})}),
    fetchAuditLogsByEntityId:builder.query({query:({entityType,entityId,page=0,size=20})=>({url:'/audit-logs/entity/'+encodeURIComponent(entityType)+'/'+encodeURIComponent(entityId),params:{page,size}})}),
    getCommuterSummary:builder.query({query:()=>({url:'/insights/commuter'}),providesTags:['Dashboard']}),
    getDriverSummary:builder.query({query:()=>({url:'/insights/driver'}),providesTags:['Dashboard']}),
    getOverviewSummary:builder.query({query:()=>({url:'/insights/overview'}),providesTags:['Dashboard']}),
  })
});
export const {useFetchUsersQuery,useLazyFetchUsersQuery,useGetUserByIdQuery,useLazyGetUserByIdQuery,useFetchRolesQuery,useLazyFetchRolesQuery,useGetRoleByIdQuery,useLazyGetRoleByIdQuery,useFetchAuditLogsByEntityIdQuery,useLazyFetchAuditLogsByEntityIdQuery,useGetCommuterSummaryQuery,useLazyGetCommuterSummaryQuery,useGetDriverSummaryQuery,useLazyGetDriverSummaryQuery,useGetOverviewSummaryQuery,useLazyGetOverviewSummaryQuery}=apiQuerySlice;
