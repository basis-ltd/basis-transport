import Login from '@/pages/auth/Login';
import Home from '@/pages/common/Home';
import UserDashboard from '@/pages/dashboard/UserDashboard';
import TripsPage from '@/pages/trips/TripsPage';
import { Routes, Route } from 'react-router-dom';
import AuthenticatedRoutes from './outlets/AuthenticatedRoutes';
import TripDetailsPage from '@/pages/trips/TripDetailsPage';
import CreateTripPage from '@/pages/trips/CreateTripPage';
import Signup from '@/pages/auth/Signup';
import UsersPage from '@/pages/users/UsersPage';
import UserDetailsPage from '@/pages/users/UserDetailsPage';
import UserProfilePage from '@/pages/profile/UserProfilePage';
import TransportCardsPage from '@/pages/profile/TransportCardsPage';
import UserTripsPage from '@/pages/user-trips/UserTripsPage';
import UserTripDetailsPage from '@/pages/user-trips/UserTripDetailsPage';

const Router = () => {
  return (
    <Routes>
      {/*Home*/}
      <Route path="/" element={<Home />} />

      {/**
       * AUTH
       */}
      <Route path="/auth">
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Signup />} />
      </Route>

      {/**
       * AUTHENTICATED ROUTES
       */}
      <Route element={<AuthenticatedRoutes />}>
        {/**
         * DASHBOARD
         */}
        <Route path="/dashboard">
          <Route path="" element={<UserDashboard />} />
        </Route>

        {/**
         * TRIPS
         */}
        <Route path="/trips">
          <Route path="" element={<TripsPage />} />
          <Route path=":id" element={<TripDetailsPage />} />
          <Route path="create" element={<CreateTripPage />} />
        </Route>

        {/**
         * USERS
         */}
        <Route path="/users">
          <Route path="" element={<UsersPage />} />
          <Route path=":id" element={<UserDetailsPage />} />
        </Route>

        {/**
         * USER TRIPS
         */}
        <Route path="/user-trips">
          <Route path="" element={<UserTripsPage />} />
          <Route path=":id" element={<UserTripDetailsPage />} />
        </Route>

        {/**
         * PROFILE
         */}
        <Route path="/account">
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="transport-cards" element={<TransportCardsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
