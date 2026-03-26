<template>
  <div class="member-container">
    <div class="member-header">
      <div class="lang-switcher">
        <button type="button" :class="{ active: currentLang === 'de' }" @click="setLang('de')">DE</button>
        <button type="button" :class="{ active: currentLang === 'en' }" @click="setLang('en')">EN</button>
      </div>
    </div>
    <div class="member-content">
      <h1>{{ currentLang === 'de' ? 'Hallo Welt' : 'Hello World' }}</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemberArea',
  data() {
    return {
      currentLang: localStorage.getItem('language') || 'en'
    };
  },
  methods: {
    setLang(lang) {
      this.currentLang = lang;
      localStorage.setItem('language', lang);
    }
  }
};
</script>

<style scoped>
.member-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 24px;
}

.member-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
}

.member-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.lang-switcher {
  display: flex;
  gap: 4px;
}

.lang-switcher button {
  padding: 4px 10px;
  border: 1px solid #e1e8ed;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: #5a6c7d;
}

.lang-switcher button.active {
  background-color: #27ae60;
  color: #fff;
  border-color: #27ae60;
}
</style>
