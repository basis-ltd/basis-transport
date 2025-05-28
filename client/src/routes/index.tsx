import Login from '@/pages/auth/Login';
import Home from '@/pages/common/Home';
import UserDashboard from '@/pages/dashboard/UserDashboard';
import TripsPage from '@/pages/trips/TripsPage';
import { Routes, Route } from 'react-router-dom';
import AuthenticatedRoutes from './outlets/AuthenticatedRoutes';
import TripDetailsPage from '@/pages/trips/TripDetailsPage';
import CreateTripPage from '@/pages/trips/CreateTripPage';
import Signup from '@/pages/auth/Signup';

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
      </Route>
    </Routes>
  );
};

export default Router;
