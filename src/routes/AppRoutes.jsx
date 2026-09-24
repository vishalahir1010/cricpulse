import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

const Home = lazy(() => import('../pages/Home'));
const Live = lazy(() => import('../pages/Live'));
const Matches = lazy(() => import('../pages/Matches'));
const MatchDetails = lazy(() => import('../pages/MatchDetails'));
const Series = lazy(() => import('../pages/Series'));
const SeriesDetails = lazy(() => import('../pages/SeriesDetails'));
const Teams = lazy(() => import('../pages/Teams'));
const TeamDetails = lazy(() => import('../pages/TeamDetails'));
const Players = lazy(() => import('../pages/Players'));
const PlayerDetails = lazy(() => import('../pages/PlayerDetails'));
const PlayerComparison = lazy(() => import('../pages/PlayerComparison'));
const Rankings = lazy(() => import('../pages/Rankings'));
const Records = lazy(() => import('../pages/Records'));
const News = lazy(() => import('../pages/News'));
const NewsDetails = lazy(() => import('../pages/NewsDetails'));
const Search = lazy(() => import('../pages/Search'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const Favorites = lazy(() => import('../pages/Favorites'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminNews = lazy(() => import('../pages/admin/AdminNews'));
const AdminComments = lazy(() => import('../pages/admin/AdminComments'));
const AdminPolls = lazy(() => import('../pages/admin/AdminPolls'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const NotFound = lazy(() => import('../pages/NotFound'));

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Live />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:matchId" element={<MatchDetails />} />
          <Route path="/series" element={<Series />} />
          <Route path="/series/:seriesId" element={<SeriesDetails />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<TeamDetails />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/compare" element={<PlayerComparison />} />
          <Route path="/players/:playerId" element={<PlayerDetails />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/records" element={<Records />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<Navigate to="news" replace />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="comments" element={<AdminComments />} />
              <Route path="polls" element={<AdminPolls />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
