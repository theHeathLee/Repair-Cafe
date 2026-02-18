import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase';
import Home from '../components/Home.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import Login from '../components/Login.vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard to protect admin routes
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth) {
    // Check if Firebase is properly initialized
    if (!auth || !db) {
      console.warn('Firebase not configured. Please update src/firebase.js with your Firebase configuration.');
      return next({ path: '/login' });
    }

    try {
      // Check current auth state
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return next({ path: '/login' });
      }
      
      // Check if user is approved
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.approved || userData.role === 'admin') {
          next();
        } else {
          next({ path: '/login', query: { pending: 'true' } });
        }
      } else {
        next({ path: '/login', query: { pending: 'true' } });
      }
    } catch (error) {
      console.error('Error checking user auth:', error);
      // If Firebase isn't configured or there's an error, redirect to login
      if (error.code === 'app/invalid-credential' || 
          error.code === 'auth/invalid-api-key' ||
          error.message?.includes('invalid') || 
          error.message?.includes('API key') ||
          error.message?.includes('The requested action is invalid')) {
        console.warn('Firebase configuration error. Please configure Firebase in src/firebase.js');
      }
      next({ path: '/login' });
    }
  } else {
    next();
  }
});

export default router;
