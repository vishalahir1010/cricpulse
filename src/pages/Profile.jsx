import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiLogOut, FiBell, FiBellOff } from 'react-icons/fi';
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
  const [notifStatus, setNotifStatus] = useState('unsupported'); // 'unsupported' | 'default' | 'granted' | 'denied'
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

  return (
    <div className="container profile-page">
      <div className="profile-page__header">
        <img
          src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.email || '')}`}
          alt=""
          className="profile-page__avatar"
        />
        <div>
          <h1>{user?.displayName || 'My Cricket'}</h1>
          <p>{user?.email}</p>
        </div>
        <button className="profile-page__logout" onClick={handleLogout}>
          <FiLogOut size={16} /> Log Out
        </button>
      </div>

      <div className="glass-card profile-notif">
        <div>
          <h2>Match notifications</h2>
          <p>
            {notifStatus === 'unsupported' && "Not supported in this browser."}
            {notifStatus === 'denied' && 'Blocked — enable notifications for this site in your browser settings.'}
            {notifStatus === 'default' && 'Get a push when a match you follow updates.'}
            {notifStatus === 'granted' && (fcmToken ? 'Enabled on this device.' : 'Allowed — following a match will enable this device.')}
          </p>
        </div>
        {notifStatus === 'default' && (
          <button className="profile-notif__btn" onClick={handleEnableNotifications} disabled={notifBusy}>
            <FiBell size={15} /> {notifBusy ? 'Enabling…' : 'Enable'}
          </button>
        )}
        {notifStatus === 'granted' && fcmToken && (
          <button className="profile-notif__btn" onClick={handleDisableNotifications} disabled={notifBusy}>
            <FiBellOff size={15} /> {notifBusy ? 'Turning off…' : 'Turn off on this device'}
          </button>
        )}
      </div>

      <div className="profile-grid">
        <section className="glass-card profile-section">
          <h2>⭐ Favorite Teams</h2>
          {teamsLoading && <TableSkeleton rows={2} />}
          {!teamsLoading && !favTeams?.length && <p className="profile-section__empty">No favorite teams yet.</p>}
          {!teamsLoading && favTeams?.map((t) => (
            <Link key={t.id} to={`/teams/${t.id}`} className="profile-section__item">{t.name}</Link>
          ))}
        </section>

        <section className="glass-card profile-section">
          <h2>❤️ Favorite Players</h2>
          {playersLoading && <TableSkeleton rows={2} />}
          {!playersLoading && !favPlayers?.length && <p className="profile-section__empty">No favorite players yet.</p>}
          {!playersLoading && favPlayers?.map((p) => (
            <Link key={p.id} to={`/players/${p.id}`} className="profile-section__item">{p.name}</Link>
          ))}
        </section>

        <section className="glass-card profile-section">
          <h2>🔔 Followed Matches</h2>
          {followedLoading && <TableSkeleton rows={2} />}
          {!followedLoading && !followed?.length && <p className="profile-section__empty">Not following any matches yet.</p>}
          {!followedLoading && followed?.map((m) => (
            <Link key={m.id} to={`/matches/${m.id}`} className="profile-section__item">{m.name}</Link>
          ))}
        </section>
      </div>
    </div>
  );
}
