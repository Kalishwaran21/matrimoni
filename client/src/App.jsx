import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "./components/Toast";
import { FullPageSpinner } from "./components/Spinner";

// Layouts (Keep synchronous for quick initial shell render)
import AdminLayout from "./layouts/AdminLayout";
import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";
import ManagerLayout from "./layouts/ManagerLayout";

// Pages (Lazy load to heavily optimize performance and reduce JS bundle size)
const About = lazy(() => import("./pages/About"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminApprovals = lazy(() => import("./pages/AdminApprovals"));
const AdminCreatedProfiles = lazy(() => import("./pages/AdminCreatedProfiles"));
const AdminCreateProfile = lazy(() => import("./pages/AdminCreateProfile"));
const AdminClientInterests = lazy(() => import("./pages/AdminClientInterests"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminChats = lazy(() => import("./pages/AdminChats"));
const AdminImportProfiles = lazy(() => import("./pages/AdminImportProfiles"));
const ManagerOutsideData = lazy(() => import("./pages/ManagerOutsideData"));
const Chat = lazy(() => import("./pages/Chat"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Home = lazy(() => import("./pages/Home"));
const Interests = lazy(() => import("./pages/Interests"));
const Login = lazy(() => import("./pages/Login"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileDetail = lazy(() => import("./pages/ProfileDetail"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SearchMatches = lazy(() => import("./pages/SearchMatches"));
const Subscription = lazy(() => import("./pages/Subscription"));

export default function App() {
  return (
    <>
      {/* Global toast notifications rendered on top of everything */}
      <ToastContainer />

      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<Navigate to="/matches" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:id" element={<ProfileDetail />} />
            <Route path="matches" element={<SearchMatches />} />
            <Route path="interests" element={<Interests />} />
            <Route path="chat" element={<Chat />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute admin />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="create-profile" element={<AdminCreateProfile />} />
            <Route path="import-profiles" element={<AdminImportProfiles />} />
            <Route path="client-interests" element={<AdminClientInterests />} />
            <Route path="created-profiles" element={<AdminCreatedProfiles />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="chats" element={<AdminChats />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute manager />}>
          <Route path="manager" element={<ManagerLayout />}>
            <Route index element={<ManagerOutsideData />} />
            <Route path="created-profiles" element={<AdminCreatedProfiles />} />
            <Route path="import-profiles" element={<AdminImportProfiles />} />
            <Route path="edit/:id" element={<ManagerOutsideData editMode />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
