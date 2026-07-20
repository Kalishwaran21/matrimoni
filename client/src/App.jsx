import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "./components/Toast";
import AdminLayout from "./layouts/AdminLayout";
import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";
import About from "./pages/About";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import AdminApprovals from "./pages/AdminApprovals";
import AdminCreatedProfiles from "./pages/AdminCreatedProfiles";
import AdminCreateProfile from "./pages/AdminCreateProfile";
import AdminClientInterests from "./pages/AdminClientInterests";
import AdminSettings from "./pages/AdminSettings";
import AdminPayments from "./pages/AdminPayments";
import AdminChats from "./pages/AdminChats";
import ManagerLayout from "./layouts/ManagerLayout";
import ManagerOutsideData from "./pages/ManagerOutsideData";
import Chat from "./pages/Chat";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Interests from "./pages/Interests";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import ProfileDetail from "./pages/ProfileDetail";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import SearchMatches from "./pages/SearchMatches";
import Subscription from "./pages/Subscription";

export default function App() {
  return (
    <>
      {/* Global toast notifications rendered on top of everything */}
      <ToastContainer />

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
            <Route path="edit/:id" element={<ManagerOutsideData editMode />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
