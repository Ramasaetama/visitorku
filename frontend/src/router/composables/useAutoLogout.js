import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';

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
    Swal.fire({
      icon: 'warning',
      title: 'Sesi Berakhir',
      text: 'Sesi Anda telah habis karena tidak ada aktivitas. Silakan login kembali.',
      confirmButtonColor: '#D68D0D'
    });
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