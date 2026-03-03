import { useRouter } from 'vue-router';

// Waktu AutoLogout
export function useAutoLogout(timeoutMinutes = 15) {
  const router = useRouter();
  let timeoutId = null;

  const logoutUser = () => {
    alert('Sesi Anda telah habis karena tidak ada aktivitas. Silakan login kembali.');
    
    localStorage.removeItem('token'); 
    localStorage.removeItem('app_lang');
    localStorage.removeItem('app_tz');
    
    router.push('/login');
  };

  const resetTimer = () => {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(logoutUser, timeoutMinutes * 60 * 1000);
  };

  const initAutoLogout = () => {
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();
  };

  const destroyAutoLogout = () => {
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
    
    if (timeoutId) clearTimeout(timeoutId);
  };

  return {
    initAutoLogout,
    destroyAutoLogout
  };
}