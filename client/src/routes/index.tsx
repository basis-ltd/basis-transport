import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import PhoneResetOtp from '@/pages/auth/PhoneResetOtp';
import ResetPassword from '@/pages/auth/ResetPassword';
import LandingPage from '@/pages/common/LandingPage';
import TravelGuidancePage from '@/pages/common/TravelGuidancePage';
import NotFoundPage from '@/pages/common/NotFoundPage';
import ContactUsPage from '@/pages/common/ContactUsPage';
import PrivacyPolicyPage from '@/pages/common/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/common/TermsOfServicePage';
import CookiesPolicyPage from '@/pages/common/CookiesPolicyPage';
import AboutPage from '@/pages/common/AboutPage';
import HelpCenterPage from '@/pages/common/HelpCenterPage';
import SupportedCitiesPage from '@/pages/common/SupportedCitiesPage';
import UserDashboard from '@/pages/dashboard/UserDashboard';
import TripsPage from '@/pages/trips/TripsPage';
import { Routes, Route } from 'react-router-dom';
import AuthenticatedRoutes from './outlets/AuthenticatedRoutes';
import TripDetailsPage from '@/pages/trips/TripDetailsPage';
import CreateTripPage from '@/pages/trips/CreateTripPage';
import Signup from '@/pages/auth/Signup';
import CompleteRegistration from '@/pages/auth/CompleteRegistration';
import UsersPage from '@/pages/users/UsersPage';
import UserDetailsPage from '@/pages/users/UserDetailsPage';
import UserProfilePage from '@/pages/profile/UserProfilePage';
import TransportCardsPage from '@/pages/profile/TransportCardsPage';
import UserTripsPage from '@/pages/user-trips/UserTripsPage';
import UserTripDetailsPage from '@/pages/user-trips/UserTripDetailsPage';
import LocationsPage from '@/pages/locations/LocationsPage';
import LocationDetailsPage from '@/pages/locations/LocationDetailsPage';
import CreateLocationPage from '@/pages/locations/CreateLocationPage';
import CreateUserPage from '@/pages/users/CreateUserPage';
import TransportCardDetailsPage from '@/pages/profile/TransportCardDetailsPage';

const Router = () => {
  return (
    <Routes>
      {/*Home*/}
      <Route path="/" element={<LandingPage />} />
      <Route path="/travel" element={<TravelGuidancePage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/cookies" element={<CookiesPolicyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/help" element={<HelpCenterPage />} />
      <Route path="/cities" element={<SupportedCitiesPage />} />

      {/**
       * AUTH
       */}
      <Route path="/auth">
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-phone-otp" element={<PhoneResetOtp />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="complete-registration" element={<CompleteRegistration />} />
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
          <Route path="create" element={<CreateUserPage />} />
        </Route>

        {/**
         * USER TRIPS
         */}
        <Route path="/user-trips">
          <Route path="" element={<UserTripsPage />} />
          <Route path=":id" element={<UserTripDetailsPage />} />
        </Route>

        {/**
         * LOCATIONS
         */}
        <Route path="/locations">
          <Route path="" element={<LocationsPage />} />
          <Route path=":id" element={<LocationDetailsPage />} />
          <Route path="create" element={<CreateLocationPage />} />
        </Route>

        {/**
         * PROFILE
         */}
        <Route path="/account">
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="transport-cards" element={<TransportCardsPage />} />
          <Route path="transport-cards/:id" element={<TransportCardDetailsPage />} />
        </Route>
      </Route>

      {/**
       * UNMATCHED
       *
       * Sits outside the authenticated guard on purpose. Inside it, an unknown
       * public address would redirect to sign-in — telling the reader they are
       * not allowed in, when the truth is that the page does not exist. The
       * page picks the app frame or the public frame from the auth state.
       */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Router;
