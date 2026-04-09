import { useRouter } from 'vue-router';

/**
 * useAutoLogout — logs the user out after `idleMinutes` of inactivity.
 *
 * Usage in App.vue:
 *   const { initAutoLogout, destroyAutoLogout } = useAutoLogout(15);
 *   onMounted(() => { if (localStorage.getItem('token')) initAutoLogout(); });
 *   onUnmounted(() => destroyAutoLogout());
 */
export function useAutoLogout(idleMinutes = 15) {
  const router = useRouter();
  let timer = null;
  const idleMs = idleMinutes * 60 * 1000;

  const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(logout, idleMs);
  };

  const initAutoLogout = () => {
    resetTimer();
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
  };

  const destroyAutoLogout = () => {
    clearTimeout(timer);
    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
  };

  return { initAutoLogout, destroyAutoLogout };
}
