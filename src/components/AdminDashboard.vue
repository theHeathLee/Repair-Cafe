<template>
  <div class="admin-container" :class="{ 'dark-mode': darkMode }">
    <div class="admin-header">
      <h1>{{ dashboardTitle }}</h1>
      <div class="header-actions">
        <span class="user-email">{{ currentUser?.email }}</span>
        <button @click="handleLogout" class="btn btn-secondary">{{ logoutText }}</button>
      </div>
    </div>

    <div v-if="loading" class="loading">{{ loadingText }}</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <div class="admin-content">
      <div class="dates-section">
        <h2>{{ appointmentsTitle }}</h2>
        <p class="section-description">{{ sectionDescription }}</p>
        
        <div class="dates-list">
          <div 
            v-for="(dateEntry, index) in dates" 
            :key="index" 
            class="date-item"
            :class="{ canceled: dateEntry.canceled }"
          >
            <div class="date-input-group">
              <input 
                type="date" 
                v-model="dateEntry.date" 
                class="date-input"
                :disabled="!isAdmin"
              />
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="dateEntry.canceled"
                  :disabled="!isAdmin"
                />
                <span>{{ canceledLabel }}</span>
              </label>
            </div>
            <button 
              v-if="isAdmin"
              @click="removeDate(index)" 
              class="btn btn-danger btn-small"
            >
              {{ removeText }}
            </button>
          </div>
        </div>

        <button 
          v-if="isAdmin"
          @click="addNewDate" 
          class="btn btn-primary"
        >
          {{ addDateText }}
        </button>

        <div class="actions">
          <button 
            @click="saveDates" 
            class="btn btn-primary btn-large"
            :disabled="loading || !isAdmin"
          >
            {{ saveButtonText }}
          </button>
          <router-link to="/" class="btn btn-secondary btn-large">
            {{ backToHomeText }}
          </router-link>
        </div>
      </div>

      <!-- Admin Only: User Approval Section -->
      <div v-if="isAdmin" class="users-section">
        <h2>{{ pendingUsersTitle }}</h2>
        <div v-if="pendingUsers.length === 0" class="no-users">
          {{ noPendingUsersText }}
        </div>
        <div v-else class="users-list">
          <div 
            v-for="user in pendingUsers" 
            :key="user.id" 
            class="user-item"
          >
            <div class="user-info">
              <span class="user-email-display">{{ user.email }}</span>
              <span class="user-date">{{ formatDate(user.createdAt) }}</span>
            </div>
            <div class="user-actions">
              <button @click="approveUser(user.id)" class="btn btn-success btn-small">
                {{ approveText }}
              </button>
              <button @click="rejectUser(user.id)" class="btn btn-danger btn-small">
                {{ rejectText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc,
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { upcomingDates } from '../upcomingDates';

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter();
    const currentUser = ref(null);
    const dates = ref([]);
    const pendingUsers = ref([]);
    const loading = ref(false);
    const error = ref('');
    const success = ref('');
    const isAdmin = ref(false);
    const darkMode = ref(false);
    const currentLang = ref('en'); // Default language
    let unsubscribeUsers = null;

    const checkDarkMode = () => {
      const savedDarkMode = localStorage.getItem('darkMode');
      darkMode.value = savedDarkMode === 'true';
    };

    const loadDates = () => {
      // Convert upcomingDates to editable format
      dates.value = upcomingDates.map(dateEntry => {
        if (typeof dateEntry === 'string') {
          return { date: dateEntry, canceled: false };
        }
        return { date: dateEntry.date, canceled: dateEntry.canceled || false };
      });
    };

    const loadPendingUsers = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('approved', '==', false)
        );
        
        unsubscribeUsers = onSnapshot(q, (snapshot) => {
          pendingUsers.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        });
      } catch (err) {
        console.error('Error loading pending users:', err);
      }
    };

    const checkUserRole = async (userId) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          isAdmin.value = userData.role === 'admin' || userData.approved === true;
        }
      } catch (err) {
        console.error('Error checking user role:', err);
      }
    };

    const addNewDate = () => {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const dateStr = nextMonth.toISOString().split('T')[0];
      dates.value.push({ date: dateStr, canceled: false });
    };

    const removeDate = (index) => {
      dates.value.splice(index, 1);
    };

    const saveDates = async () => {
      loading.value = true;
      error.value = '';
      success.value = '';

      try {
        // Save to Firestore (setDoc will create or update)
        const datesRef = doc(db, 'appointments', 'upcoming');
        await setDoc(datesRef, {
          dates: dates.value,
          updatedAt: new Date(),
          updatedBy: currentUser.value.email
        }, { merge: true });

        success.value = 'Dates saved successfully!';
        setTimeout(() => {
          success.value = '';
        }, 3000);
      } catch (err) {
        console.error('Error saving dates:', err);
        error.value = 'Error saving dates. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const approveUser = async (userId) => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          approved: true,
          approvedAt: new Date(),
          approvedBy: currentUser.value.email
        });
      } catch (err) {
        console.error('Error approving user:', err);
        error.value = 'Error approving user. Please try again.';
      }
    };

    const rejectUser = async (userId) => {
      const confirmMessage = 'Are you sure you want to reject this user?';
      if (window.confirm(confirmMessage)) {
        try {
          await deleteDoc(doc(db, 'users', userId));
        } catch (err) {
          console.error('Error rejecting user:', err);
          error.value = 'Error rejecting user. Please try again.';
        }
      }
    };

    const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push('/login');
      } catch (err) {
        error.value = 'Error logging out. Please try again.';
      }
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };

    // Computed properties using Composition API
    const dashboardTitle = computed(() => {
      return currentLang.value === 'de' ? 'Admin-Dashboard' : 'Admin Dashboard';
    });
    const appointmentsTitle = computed(() => {
      return currentLang.value === 'de' ? 'Termine verwalten' : 'Manage Appointments';
    });
    const sectionDescription = computed(() => {
      return currentLang.value === 'de'
        ? 'Bearbeiten Sie die kommenden Repair Café Termine.'
        : 'Edit upcoming Repair Cafe appointments.';
    });
    const canceledLabel = computed(() => {
      return currentLang.value === 'de' ? 'Abgesagt' : 'Canceled';
    });
    const removeText = computed(() => {
      return currentLang.value === 'de' ? 'Entfernen' : 'Remove';
    });
    const addDateText = computed(() => {
      return currentLang.value === 'de' ? 'Termin hinzufügen' : 'Add Date';
    });
    const saveButtonText = computed(() => {
      return currentLang.value === 'de' ? 'Speichern' : 'Save';
    });
    const backToHomeText = computed(() => {
      return currentLang.value === 'de' ? 'Zurück zur Startseite' : 'Back to Home';
    });
    const logoutText = computed(() => {
      return currentLang.value === 'de' ? 'Abmelden' : 'Logout';
    });
    const loadingText = computed(() => {
      return currentLang.value === 'de' ? 'Lädt...' : 'Loading...';
    });
    const pendingUsersTitle = computed(() => {
      return currentLang.value === 'de' ? 'Ausstehende Benutzer' : 'Pending Users';
    });
    const noPendingUsersText = computed(() => {
      return currentLang.value === 'de' 
        ? 'Keine ausstehenden Benutzer.'
        : 'No pending users.';
    });
    const approveText = computed(() => {
      return currentLang.value === 'de' ? 'Genehmigen' : 'Approve';
    });
    const rejectText = computed(() => {
      return currentLang.value === 'de' ? 'Ablehnen' : 'Reject';
    });

    onMounted(async () => {
      checkDarkMode();
      loadDates();

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          currentUser.value = user;
          await checkUserRole(user.uid);
          if (isAdmin.value) {
            loadPendingUsers();
          }
        } else {
          router.push('/login');
        }
      });
    });

    onUnmounted(() => {
      if (unsubscribeUsers) {
        unsubscribeUsers();
      }
    });

    return {
      currentUser,
      dates,
      pendingUsers,
      loading,
      error,
      success,
      isAdmin,
      darkMode,
      addNewDate,
      removeDate,
      saveDates,
      approveUser,
      rejectUser,
      handleLogout,
      formatDate,
      currentLang,
      dashboardTitle,
      appointmentsTitle,
      sectionDescription,
      canceledLabel,
      removeText,
      addDateText,
      saveButtonText,
      backToHomeText,
      logoutText,
      loadingText,
      pendingUsersTitle,
      noPendingUsersText,
      approveText,
      rejectText
    };
  }
};
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: var(--bg-light, #f8f9fa);
  padding: var(--spacing-lg, 40px);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl, 60px);
  flex-wrap: wrap;
  gap: var(--spacing-md, 24px);
}

.admin-header h1 {
  margin: 0;
  color: var(--text-primary, #2c3e50);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 24px);
}

.user-email {
  color: var(--text-secondary, #5a6c7d);
}

.admin-content {
  max-width: 1200px;
  margin: 0 auto;
}

.dates-section,
.users-section {
  background: var(--bg-white, #ffffff);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-lg, 40px);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
  margin-bottom: var(--spacing-lg, 40px);
}

.dates-section h2,
.users-section h2 {
  margin-top: 0;
  color: var(--text-primary, #2c3e50);
}

.section-description {
  color: var(--text-secondary, #5a6c7d);
  margin-bottom: var(--spacing-lg, 40px);
}

.dates-list {
  margin-bottom: var(--spacing-lg, 40px);
}

.date-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md, 24px);
  border: 2px solid var(--border-color, #e1e8ed);
  border-radius: var(--radius-md, 12px);
  margin-bottom: var(--spacing-sm, 16px);
  transition: all 0.2s ease;
}

.date-item:hover {
  border-color: var(--primary-color, #27ae60);
}

.date-item.canceled {
  background-color: #fff3cd;
  border-color: #ffc107;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 24px);
  flex: 1;
}

.date-input {
  padding: var(--spacing-sm, 16px);
  border: 2px solid var(--border-color, #e1e8ed);
  border-radius: var(--radius-md, 12px);
  font-size: 1rem;
}

.date-input:disabled {
  background-color: var(--bg-light, #f8f9fa);
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  cursor: pointer;
}

.btn {
  padding: var(--spacing-sm, 16px) var(--spacing-md, 24px);
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

.btn-secondary {
  background-color: var(--bg-white, #ffffff);
  color: var(--text-primary, #2c3e50);
  border: 2px solid var(--border-color, #e1e8ed);
}

.btn-secondary:hover {
  background-color: var(--bg-light, #f8f9fa);
}

.btn-danger {
  background-color: #e74c3c;
  color: #fff;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-success {
  background-color: #27ae60;
  color: #fff;
}

.btn-success:hover {
  background-color: #229954;
}

.btn-small {
  padding: var(--spacing-xs, 8px) var(--spacing-sm, 16px);
  font-size: 0.9rem;
}

.btn-large {
  padding: var(--spacing-md, 24px) var(--spacing-lg, 40px);
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: var(--spacing-md, 24px);
  margin-top: var(--spacing-lg, 40px);
}

.loading,
.error-message,
.success-message {
  padding: var(--spacing-md, 24px);
  border-radius: var(--radius-md, 12px);
  margin-bottom: var(--spacing-md, 24px);
  text-align: center;
}

.loading {
  background-color: #e3f2fd;
  color: #1976d2;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 24px);
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md, 24px);
  border: 2px solid var(--border-color, #e1e8ed);
  border-radius: var(--radius-md, 12px);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 8px);
}

.user-email-display {
  font-weight: 600;
  color: var(--text-primary, #2c3e50);
}

.user-date {
  font-size: 0.9rem;
  color: var(--text-secondary, #5a6c7d);
}

.user-actions {
  display: flex;
  gap: var(--spacing-sm, 16px);
}

.no-users {
  text-align: center;
  color: var(--text-secondary, #5a6c7d);
  padding: var(--spacing-lg, 40px);
}

.dark-mode .admin-container {
  background-color: var(--bg-light, #1a1a1a);
}

.dark-mode .admin-header h1 {
  color: var(--text-primary, #ecf0f1);
}

.dark-mode .dates-section,
.dark-mode .users-section {
  background: var(--bg-white, #2d2d2d);
}

.dark-mode .dates-section h2,
.dark-mode .users-section h2 {
  color: var(--text-primary, #ecf0f1);
}

.dark-mode .date-item,
.dark-mode .user-item {
  border-color: var(--border-color, #404040);
}

.dark-mode .date-input {
  background: var(--bg-light, #1a1a1a);
  color: var(--text-primary, #ecf0f1);
  border-color: var(--border-color, #404040);
}

@media (max-width: 768px) {
  .admin-container {
    padding: var(--spacing-md, 24px);
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm, 16px);
  }

  .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm, 16px);
  }

  .actions {
    flex-direction: column;
  }
}
</style>
