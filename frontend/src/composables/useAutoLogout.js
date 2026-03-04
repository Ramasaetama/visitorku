import { useRouter, useRoute } from 'vue-router';

export function useAutoLogout(timeoutMinutes = 0.1) {
  const router = useRouter();
  const route = useRoute();
  let timeoutId = null;

  const logoutUser = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('app_lang');
    localStorage.removeItem('app_tz');
    
    router.push('/login');
    // Pesan Alert
    alert('Sesi Anda telah habis karena tidak ada aktivitas. Silakan login kembali.');
  };

  const resetTimer = () => {
    if (timeoutId) clearTimeout(timeoutId);
    
    if (route.path === '/login') {
      return; 
    }
    
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