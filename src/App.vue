<template>
  <div id="app">
    <div class="lang-switcher">
        <button
          type="button"
          :class="{ active: currentLang === 'de' }"
          @click="currentLang = 'de'"
        >
          DE
        </button>
        <button
          type="button"
          :class="{ active: currentLang === 'en' }"
          @click="currentLang = 'en'"
        >
          EN
        </button>
      </div>
    <img alt="Logo" src="./assets/Repaircafe-Logo_x9galzmx.png" class="logo" />
    <div class="content">
      <h1>{{ headingText }}</h1>
      <p>{{ bodyText }}</p>
    </div>
    <iframe
      class="map"
      width="600"
      height="450"
      style="border:0"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
      :src="googleMapUrl"
    ></iframe>
  </div>
</template>

<script>
import { upcomingDates } from "./upcomingDates.js";

function getNextCafeDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const dateStr of upcomingDates) {
    const d = new Date(dateStr + "T12:00:00");
    if (d >= today) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return { formatted: `${day}.${month}.${year}`, date: d };
    }
  }
  return null;
}

export default {
  data() {
    const next = getNextCafeDate();
    return {
      currentLang: "de",
      nextDateFormatted: next ? next.formatted : null,
      googleMapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2427.8985857933244!2d13.46478597722804!3d52.51717437206033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84f003b8f2781%3A0xed19a688a2b4312d!2sRepaircafe-Friedrichshain!5e0!3m2!1sen!2sde!4v1748112503102!5m2!1sen!2sde",
    };
  },
  computed: {
    headingText() {
      return this.currentLang === "de"
        ? "Willkommen im Repair Café Friedrichshain"
        : "Welcome to Repair Cafe Friedrichshain";
    },
    bodyText() {
      if (!this.nextDateFormatted) {
        return this.currentLang === "de"
          ? "Repair Café ist in der Winterpause"
          : "Repair cafe is on winter break";
      }
      return this.currentLang === "de"
        ? `Nächstes Repair Café ist am ${this.nextDateFormatted}`
        : `Next cafe is on ${this.nextDateFormatted}`;
    },
  },
};
</script>

<style>
#app {
  position: relative;
  font-family: "Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.logo {
  max-width: 200px;
  margin: 20px auto;
  display: block;
}
.lang-switcher {
  position: absolute;
  top: 10px;
  right: 10px;
}
.lang-switcher button {
  margin: 0 4px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
}
.lang-switcher button.active {
  background-color: #333;
  color: #fff;
  border-color: #333;
}
.content {
  text-align: center;
  margin: 20px;
}
.map {
  display: block;
  margin: 0 auto 40px auto;
  width: 100%;
  max-width: 800px;
  height: 450px;
}
</style>
