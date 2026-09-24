import { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import './InstallPrompt.css';

const DISMISSED_KEY = 'cricpulse-install-dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      if (localStorage.getItem(DISMISSED_KEY)) return;
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="install-prompt">
      <FiDownload size={18} />
      <span>Install CricPulse for faster access and live score alerts.</span>
      <button className="install-prompt__install" onClick={handleInstall}>Install</button>
      <button className="install-prompt__dismiss" onClick={handleDismiss} aria-label="Dismiss">
        <FiX size={16} />
      </button>
    </div>
  );
}
