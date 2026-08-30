import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/common/LandingPage";
import AuthenticatedRoutes from "./outlets/AuthenticatedRoutes";
import StaffRoutes from "./outlets/StaffRoutes";

const Travel = lazy(() => import("@/pages/common/TravelGuidancePage"));
const Directory = lazy(() => import("@/pages/common/NetworkDirectoryPage"));
const Details = lazy(() => import("@/pages/common/NetworkDetailsPage"));
const Saved = lazy(() => import("@/pages/common/SavedJourneysPage"));
const Admin = lazy(() => import("@/pages/common/NetworkAdminPage"));
const Retired = lazy(() => import("@/pages/common/RetiredServicePage"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Signup = lazy(() => import("@/pages/auth/Signup"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const PhoneResetOtp = lazy(() => import("@/pages/auth/PhoneResetOtp"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const CompleteRegistration = lazy(
  () => import("@/pages/auth/CompleteRegistration"),
);
const UserProfile = lazy(() => import("@/pages/profile/UserProfilePage"));
const Users = lazy(() => import("@/pages/users/UsersPage"));
const UserDetails = lazy(() => import("@/pages/users/UserDetailsPage"));
const CreateUser = lazy(() => import("@/pages/users/CreateUserPage"));
const Contact = lazy(() => import("@/pages/common/ContactUsPage"));
const Privacy = lazy(() => import("@/pages/common/PrivacyPolicyPage"));
const Terms = lazy(() => import("@/pages/common/TermsOfServicePage"));
const Cookies = lazy(() => import("@/pages/common/CookiesPolicyPage"));
const About = lazy(() => import("@/pages/common/AboutPage"));
const Help = lazy(() => import("@/pages/common/HelpCenterPage"));
const Cities = lazy(() => import("@/pages/common/SupportedCitiesPage"));
const NotFound = lazy(() => import("@/pages/common/NotFoundPage"));

export default function Router() {
  return (
    <Suspense
      fallback={
        <div className="landing-container py-12" role="status">
          Loading Basis…
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/routes" element={<Directory kind="routes" />} />
        <Route path="/routes/:id" element={<Details kind="routes" />} />
        <Route path="/stops" element={<Directory kind="stops" />} />
        <Route path="/stops/:id" element={<Details kind="stops" />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/cities" element={<Cities />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-phone-otp" element={<PhoneResetOtp />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route
          path="/auth/complete-registration"
          element={<CompleteRegistration />}
        />
        <Route element={<AuthenticatedRoutes />}>
          <Route path="/account/profile" element={<UserProfile />} />
        </Route>
        <Route element={<StaffRoutes />}>
          <Route path="/admin/network" element={<Admin />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/create" element={<CreateUser />} />
          <Route path="/users/:id" element={<UserDetails />} />
        </Route>
        <Route path="/dashboard" element={<Navigate to="/saved" replace />} />
        <Route path="/trips" element={<Navigate to="/travel" replace />} />
        <Route path="/user-trips" element={<Navigate to="/saved" replace />} />
        <Route path="/locations" element={<Navigate to="/stops" replace />} />
        <Route path="/trips/*" element={<Retired />} />
        <Route path="/user-trips/*" element={<Retired />} />
        <Route path="/locations/*" element={<Retired />} />
        <Route path="/account/transport-cards/*" element={<Retired />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
