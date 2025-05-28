import Login from '@/pages/auth/Login';
import Home from '@/pages/common/Home';
import UserDashboard from '@/pages/dashboard/UserDashboard';
import TripsPage from '@/pages/trips/TripsPage';
import { Routes, Route } from 'react-router-dom';
import AuthenticatedRoutes from './outlets/AuthenticatedRoutes';
import TripDetailsPage from '@/pages/trips/TripDetailsPage';

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
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
