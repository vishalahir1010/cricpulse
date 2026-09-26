import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiLogOut, 
  FiBell, 
  FiBellOff, 
  FiUser, 
  FiCalendar, 
  FiSettings, 
  FiStar, 
  FiShield, 
  FiChevronRight 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/firebase/authService';
import { useFetch } from '../hooks/useFetch';
import { getFavorites, getFollowedMatches } from '../services/firebase/firestoreService';
import { enablePushNotifications, disablePushNotifications } from '../services/firebase/messagingService';
import { TableSkeleton } from '../components/common/Skeleton';
import './Profile.css';

function getNotificationSupport() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifStatus, setNotifStatus] = useState('unsupported');
  const [notifBusy, setNotifBusy] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    setNotifStatus(getNotificationSupport() ? Notification.permission : 'unsupported');
  }, []);

  const { data: favTeams, loading: teamsLoading } = useFetch(
    () => (user ? getFavorites(user.uid, 'team') : Promise.resolve([])),
    [user?.uid]
  );
  const { data: favPlayers, loading: playersLoading } = useFetch(
    () => (user ? getFavorites(user.uid, 'player') : Promise.resolve([])),
    [user?.uid]
  );
  const { data: followed, loading: followedLoading } = useFetch(
    () => (user ? getFollowedMatches(user.uid) : Promise.resolve([])),
    [user?.uid]
  );

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  const handleEnableNotifications = async () => {
    setNotifBusy(true);
    try {
      const token = await enablePushNotifications(user.uid);
      setNotifStatus(getNotificationSupport() ? Notification.permission : 'unsupported');
      if (token) {
        setFcmToken(token);
        toast.success('Notifications enabled for your followed matches');
      } else if (Notification.permission === 'denied') {
        toast.error('Notifications blocked — enable them in your browser settings');
      }
    } catch (err) {
      toast.error(err.message || 'Could not enable notifications');
    } finally {
      setNotifBusy(false);
    }
  };

  const handleDisableNotifications = async () => {
    setNotifBusy(true);
    try {
      await disablePushNotifications(user.uid, fcmToken);
      setFcmToken(null);
      toast.success('Notifications turned off on this device');
    } catch {
      toast.error('Could not turn off notifications');
    } finally {
      setNotifBusy(false);
    }
  };

  const joinedYear = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '2024';

  return (
    <div className="container profile-page">
      <div className="profile-layout">
        {/* Left Sidebar Tabs */}
        <aside className="profile-sidebar glass-card">
          <nav className="profile-nav">
            <button
              className={`profile-nav__btn ${activeTab === 'profile' ? 'profile-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FiUser size={18} />
              <span>Profile</span>
            </button>
            <button
              className={`profile-nav__btn ${activeTab === 'matches' ? 'profile-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              <FiCalendar size={18} />
              <span>My Matches</span>
              {followed?.length > 0 && <span className="profile-nav__badge">{followed.length}</span>}
            </button>
            <button
              className={`profile-nav__btn ${activeTab === 'notifications' ? 'profile-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <FiBell size={18} />
              <span>Notifications</span>
            </button>
            <button
              className={`profile-nav__btn ${activeTab === 'settings' ? 'profile-nav__btn--active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings size={18} />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Profile Content */}
        <main className="profile-main">
          {/* User Header Card */}
          <div className="profile-hero-card glass-card">
            <div className="profile-hero-content">
              <div className="profile-avatar-wrap">
                <img
                  src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.displayName || user?.email || 'User')}`}
                  alt=""
                  className="profile-avatar-img"
                />
              </div>
              <div className="profile-user-info">
                <h1 className="profile-user-name">{user?.displayName || user?.email?.split('@')[0] || 'Cricket Fan'}</h1>
                <p className="profile-user-email">{user?.email}</p>
                <span className="profile-member-badge">Member since {joinedYear}</span>
              </div>
            </div>

            <div className="profile-hero-actions">
              <button className="profile-btn profile-btn--outline" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Account Overview Stats */}
          <div className="profile-overview-section">
            <h2 className="profile-section-title">Account Overview</h2>
            <div className="profile-stats-grid">
              <div className="profile-stat-box glass-card">
                <span className="profile-stat-box__label">Followed Matches</span>
                <span className="profile-stat-box__value">{followed?.length || 0}</span>
              </div>
              <div className="profile-stat-box glass-card">
                <span className="profile-stat-box__label">Favorite Teams</span>
                <span className="profile-stat-box__value">{favTeams?.length || 0}</span>
              </div>
              <div className="profile-stat-box glass-card">
                <span className="profile-stat-box__label">Favorite Players</span>
                <span className="profile-stat-box__value">{favPlayers?.length || 0}</span>
              </div>
              <div className="profile-stat-box glass-card">
                <span className="profile-stat-box__label">Account Status</span>
                <span className="profile-stat-box__value profile-stat-box__value--active">Active</span>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="profile-notifications-card glass-card">
            <div className="profile-notifications-card__info">
              <h3>
                <FiBell size={18} className="profile-icon--green" /> Match Notifications
              </h3>
              <p>
                {notifStatus === 'unsupported' && 'Push notifications are not supported in this browser.'}
                {notifStatus === 'denied' && 'Notifications blocked. Please enable them in your browser settings.'}
                {notifStatus === 'default' && 'Receive instant live alerts when matches you follow hit key milestones.'}
                {notifStatus === 'granted' && (fcmToken ? 'Live push alerts are active on this browser.' : 'Push permissions allowed. Alerts activate on match follow.')}
              </p>
            </div>
            {notifStatus === 'default' && (
              <button className="profile-btn profile-btn--primary" onClick={handleEnableNotifications} disabled={notifBusy}>
                <FiBell size={16} />
                <span>{notifBusy ? 'Enabling…' : 'Enable Alerts'}</span>
              </button>
            )}
            {notifStatus === 'granted' && fcmToken && (
              <button className="profile-btn profile-btn--outline" onClick={handleDisableNotifications} disabled={notifBusy}>
                <FiBellOff size={16} />
                <span>{notifBusy ? 'Updating…' : 'Turn Off'}</span>
              </button>
            )}
          </div>

          {/* Favorites & Followed Content Sections */}
          <div className="profile-details-grid">
            {/* Followed Matches */}
            <div className="profile-card glass-card">
              <div className="profile-card__header">
                <h3><FiCalendar size={16} /> Followed Matches</h3>
                <span className="profile-card__count">{followed?.length || 0}</span>
              </div>
              <div className="profile-card__body">
                {followedLoading && <TableSkeleton rows={2} />}
                {!followedLoading && (!followed || followed.length === 0) && (
                  <p className="profile-empty-text">You are not following any live matches yet.</p>
                )}
                {!followedLoading && followed?.map((m) => (
                  <Link key={m.id} to={`/matches/${m.id}`} className="profile-list-item">
                    <span className="profile-list-item__title">{m.name}</span>
                    <FiChevronRight size={16} className="profile-list-item__arrow" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Favorite Teams */}
            <div className="profile-card glass-card">
              <div className="profile-card__header">
                <h3><FiShield size={16} /> Favorite Teams</h3>
                <span className="profile-card__count">{favTeams?.length || 0}</span>
              </div>
              <div className="profile-card__body">
                {teamsLoading && <TableSkeleton rows={2} />}
                {!teamsLoading && (!favTeams || favTeams.length === 0) && (
                  <p className="profile-empty-text">No favorite teams added yet.</p>
                )}
                {!teamsLoading && favTeams?.map((t) => (
                  <Link key={t.id} to={`/teams/${t.id}`} className="profile-list-item">
                    <span className="profile-list-item__title">{t.name}</span>
                    <FiChevronRight size={16} className="profile-list-item__arrow" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Favorite Players */}
            <div className="profile-card glass-card">
              <div className="profile-card__header">
                <h3><FiStar size={16} /> Favorite Players</h3>
                <span className="profile-card__count">{favPlayers?.length || 0}</span>
              </div>
              <div className="profile-card__body">
                {playersLoading && <TableSkeleton rows={2} />}
                {!playersLoading && (!favPlayers || favPlayers.length === 0) && (
                  <p className="profile-empty-text">No favorite players starred yet.</p>
                )}
                {!playersLoading && favPlayers?.map((p) => (
                  <Link key={p.id} to={`/players/${p.id}`} className="profile-list-item">
                    <span className="profile-list-item__title">{p.name}</span>
                    <FiChevronRight size={16} className="profile-list-item__arrow" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
