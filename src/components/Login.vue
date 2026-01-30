<template>
  <div class="login-container" :class="{ 'dark-mode': darkMode }">
    <div class="login-card">
      <h1>{{ loginTitle }}</h1>
      <div v-if="!firebaseConfigured" class="error-message">
        {{ firebaseNotConfiguredMessage }}
      </div>
      <p v-if="pendingApproval" class="pending-message">{{ pendingMessage }}</p>
      
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <div class="auth-tabs">
        <button 
          :class="{ active: activeTab === 'login' }" 
          @click="activeTab = 'login'"
        >
          {{ loginTabText }}
        </button>
        <button 
          :class="{ active: activeTab === 'register' }" 
          @click="activeTab = 'register'"
        >
          {{ registerTabText }}
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login' && firebaseConfigured" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>{{ emailLabel }}</label>
          <input 
            type="email" 
            v-model="loginEmail" 
            :placeholder="emailPlaceholder"
            required
          />
        </div>
        <div class="form-group">
          <label>{{ passwordLabel }}</label>
          <input 
            type="password" 
            v-model="loginPassword" 
            :placeholder="passwordPlaceholder"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? loadingText : loginButtonText }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-if="activeTab === 'register' && firebaseConfigured" @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>{{ emailLabel }}</label>
          <input 
            type="email" 
            v-model="registerEmail" 
            :placeholder="emailPlaceholder"
            required
          />
        </div>
        <div class="form-group">
          <label>{{ passwordLabel }}</label>
          <input 
            type="password" 
            v-model="registerPassword" 
            :placeholder="passwordPlaceholder"
            required
            minlength="6"
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? loadingText : registerButtonText }}
        </button>
      </form>

      <div v-if="firebaseConfigured" class="divider">
        <span>{{ orText }}</span>
      </div>

      <button v-if="firebaseConfigured" @click="handleGoogleAuth" class="btn btn-google" :disabled="loading">
        <i class="fab fa-google"></i>
        {{ googleButtonText }}
      </button>

      <div class="back-link">
        <router-link to="/">{{ backToHomeText }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/multi-word-component-names */
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

export default {
  name: 'LoginPage',
  data() {
    return {
      activeTab: 'login',
      loginEmail: '',
      loginPassword: '',
      registerEmail: '',
      registerPassword: '',
      loading: false,
      error: '',
      pendingApproval: false,
      darkMode: false,
      currentLang: 'en', // Default language
      firebaseConfigured: false
    };
  },
  mounted() {
    this.pendingApproval = this.$route.query.pending === 'true';
    this.checkDarkMode();
    // Get language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      this.currentLang = savedLang;
    }
    // Check if Firebase is configured
    this.firebaseConfigured = auth !== null && db !== null;
  },
  methods: {
    checkDarkMode() {
      const savedDarkMode = localStorage.getItem('darkMode');
      this.darkMode = savedDarkMode === 'true';
    },
    async handleLogin() {
      this.loading = true;
      this.error = '';
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.loginEmail, this.loginPassword);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.approved || userData.role === 'admin') {
            this.$router.push('/admin');
          } else {
            this.error = this.pendingApprovalMessage;
            this.pendingApproval = true;
          }
        } else {
          this.error = this.pendingApprovalMessage;
          this.pendingApproval = true;
        }
      } catch (error) {
        this.error = this.getErrorMessage(error.code);
      } finally {
        this.loading = false;
      }
    },
    async handleRegister() {
      this.loading = true;
      this.error = '';
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.registerEmail, this.registerPassword);
        
        // Create user document with pending approval
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: this.registerEmail,
          approved: false,
          role: 'user',
          createdAt: new Date()
        });
        
        this.error = this.registrationSuccessMessage;
        this.activeTab = 'login';
        this.pendingApproval = true;
      } catch (error) {
        this.error = this.getErrorMessage(error.code);
      } finally {
        this.loading = false;
      }
    },
    async handleGoogleAuth() {
      this.loading = true;
      this.error = '';
      
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user document exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          // Create user document with pending approval
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            approved: false,
            role: 'user',
            createdAt: new Date()
          });
          this.error = this.registrationSuccessMessage;
          this.pendingApproval = true;
        } else {
          const userData = userDoc.data();
          if (userData.approved || userData.role === 'admin') {
            this.$router.push('/admin');
          } else {
            this.error = this.pendingApprovalMessage;
            this.pendingApproval = true;
          }
        }
      } catch (error) {
        this.error = this.getErrorMessage(error.code);
      } finally {
        this.loading = false;
      }
    },
    getErrorMessage(errorCode) {
      const errorMessages = {
        'auth/user-not-found': this.userNotFoundMessage,
        'auth/wrong-password': this.wrongPasswordMessage,
        'auth/email-already-in-use': this.emailInUseMessage,
        'auth/weak-password': this.weakPasswordMessage,
        'auth/invalid-email': this.invalidEmailMessage,
        'auth/popup-closed-by-user': this.popupClosedMessage
      };
      return errorMessages[errorCode] || this.genericErrorMessage;
    }
  },
  computed: {
    loginTitle() {
      return this.currentLang === 'de' ? 'Anmeldung' : 'Login';
    },
    loginTabText() {
      return this.currentLang === 'de' ? 'Anmelden' : 'Login';
    },
    registerTabText() {
      return this.currentLang === 'de' ? 'Registrieren' : 'Register';
    },
    emailLabel() {
      return this.currentLang === 'de' ? 'E-Mail' : 'Email';
    },
    passwordLabel() {
      return this.currentLang === 'de' ? 'Passwort' : 'Password';
    },
    emailPlaceholder() {
      return this.currentLang === 'de' ? 'ihre@email.de' : 'your@email.com';
    },
    passwordPlaceholder() {
      return this.currentLang === 'de' ? 'Passwort eingeben' : 'Enter password';
    },
    loginButtonText() {
      return this.currentLang === 'de' ? 'Anmelden' : 'Login';
    },
    registerButtonText() {
      return this.currentLang === 'de' ? 'Registrieren' : 'Register';
    },
    loadingText() {
      return this.currentLang === 'de' ? 'Lädt...' : 'Loading...';
    },
    orText() {
      return this.currentLang === 'de' ? 'oder' : 'or';
    },
    googleButtonText() {
      return this.currentLang === 'de' ? 'Mit Google anmelden' : 'Sign in with Google';
    },
    backToHomeText() {
      return this.currentLang === 'de' ? 'Zurück zur Startseite' : 'Back to Home';
    },
    pendingMessage() {
      return this.currentLang === 'de' 
        ? 'Ihr Konto wartet auf die Genehmigung durch einen Administrator.'
        : 'Your account is pending approval by an administrator.';
    },
    pendingApprovalMessage() {
      return this.currentLang === 'de'
        ? 'Ihr Konto wurde noch nicht genehmigt. Bitte warten Sie auf die Genehmigung durch einen Administrator.'
        : 'Your account has not been approved yet. Please wait for administrator approval.';
    },
    registrationSuccessMessage() {
      return this.currentLang === 'de'
        ? 'Registrierung erfolgreich! Ihr Konto wartet auf die Genehmigung durch einen Administrator.'
        : 'Registration successful! Your account is pending approval by an administrator.';
    },
    userNotFoundMessage() {
      return this.currentLang === 'de'
        ? 'Benutzer nicht gefunden.'
        : 'User not found.';
    },
    wrongPasswordMessage() {
      return this.currentLang === 'de'
        ? 'Falsches Passwort.'
        : 'Wrong password.';
    },
    emailInUseMessage() {
      return this.currentLang === 'de'
        ? 'Diese E-Mail wird bereits verwendet.'
        : 'This email is already in use.';
    },
    weakPasswordMessage() {
      return this.currentLang === 'de'
        ? 'Passwort muss mindestens 6 Zeichen lang sein.'
        : 'Password must be at least 6 characters long.';
    },
    invalidEmailMessage() {
      return this.currentLang === 'de'
        ? 'Ungültige E-Mail-Adresse.'
        : 'Invalid email address.';
    },
    popupClosedMessage() {
      return this.currentLang === 'de'
        ? 'Popup-Fenster wurde geschlossen.'
        : 'Popup window was closed.';
    },
    genericErrorMessage() {
      return this.currentLang === 'de'
        ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
        : 'An error occurred. Please try again.';
    },
    firebaseNotConfiguredMessage() {
      return this.currentLang === 'de'
        ? 'Firebase ist nicht konfiguriert. Bitte aktualisieren Sie src/firebase.js mit Ihrer Firebase-Konfiguration.'
        : 'Firebase is not configured. Please update src/firebase.js with your Firebase configuration.';
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-light, #f8f9fa);
  padding: var(--spacing-md, 24px);
}

.login-card {
  background: var(--bg-white, #ffffff);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-lg, 40px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));
  max-width: 400px;
  width: 100%;
}

.login-card h1 {
  margin-top: 0;
  margin-bottom: var(--spacing-md, 24px);
  text-align: center;
  color: var(--text-primary, #2c3e50);
}

.pending-message {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: var(--radius-md, 12px);
  padding: var(--spacing-sm, 16px);
  margin-bottom: var(--spacing-md, 24px);
  color: #856404;
  text-align: center;
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: var(--radius-md, 12px);
  padding: var(--spacing-sm, 16px);
  margin-bottom: var(--spacing-md, 24px);
  color: #721c24;
  text-align: center;
}

.auth-tabs {
  display: flex;
  gap: var(--spacing-xs, 8px);
  margin-bottom: var(--spacing-md, 24px);
}

.auth-tabs button {
  flex: 1;
  padding: var(--spacing-sm, 16px);
  border: 2px solid var(--border-color, #e1e8ed);
  background: var(--bg-white, #ffffff);
  border-radius: var(--radius-sm, 8px);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.auth-tabs button.active {
  background-color: var(--primary-color, #27ae60);
  color: #fff;
  border-color: var(--primary-color, #27ae60);
}

.auth-form {
  margin-bottom: var(--spacing-md, 24px);
}

.form-group {
  margin-bottom: var(--spacing-md, 24px);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs, 8px);
  color: var(--text-primary, #2c3e50);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: var(--spacing-sm, 16px);
  border: 2px solid var(--border-color, #e1e8ed);
  border-radius: var(--radius-md, 12px);
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color, #27ae60);
}

.btn {
  width: 100%;
  padding: var(--spacing-sm, 16px);
  border: none;
  border-radius: var(--radius-md, 12px);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color, #27ae60);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark, #229954);
}

.btn-google {
  background-color: #fff;
  color: #4285f4;
  border: 2px solid #4285f4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs, 8px);
}

.btn-google:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.divider {
  text-align: center;
  margin: var(--spacing-md, 24px) 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color, #e1e8ed);
}

.divider span {
  background: var(--bg-white, #ffffff);
  padding: 0 var(--spacing-sm, 16px);
  position: relative;
  color: var(--text-secondary, #5a6c7d);
}

.back-link {
  text-align: center;
  margin-top: var(--spacing-md, 24px);
}

.back-link a {
  color: var(--primary-color, #27ae60);
  text-decoration: none;
}

.back-link a:hover {
  text-decoration: underline;
}

.dark-mode .login-card {
  background: var(--bg-white, #2d2d2d);
}

.dark-mode .login-card h1 {
  color: var(--text-primary, #ecf0f1);
}

.dark-mode .form-group label {
  color: var(--text-primary, #ecf0f1);
}

.dark-mode .form-group input {
  background: var(--bg-light, #1a1a1a);
  color: var(--text-primary, #ecf0f1);
  border-color: var(--border-color, #404040);
}

.dark-mode .divider span {
  background: var(--bg-white, #2d2d2d);
}
</style>
