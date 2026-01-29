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
      <p class="lead">{{ bodyText }}</p>

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

      <section class="motto-section">
        <div class="motto-text">
          <h2>{{ mottoHeading }}</h2>
          <p>{{ mottoText }}</p>
        </div>
        <div class="motto-image">
          <img src="./assets/pcrepair.jpg" alt="PC-Reparatur im Repair Café" />
        </div>
      </section>

      <section class="motto-section">
        <div class="motto-text">
          <h2>{{ togetherHeading }}</h2>
          <p>{{ togetherText }}</p>
        </div>
        <div class="motto-image">
          <img src="./assets/soldering.png" alt="Löten im Repair Café" />
        </div>
      </section>

      <section class="info-card">
        <h2>{{ bringHeading }}</h2>
        <p>{{ bringText }}</p>
      </section>

      <section class="info-card">
        <h2>{{ supportHeading }}</h2>
        <p>{{ supportText }}</p>
      </section>
    </div>

    <!-- Cookie Consent Banner -->
    <div v-if="!cookieConsent" class="cookie-banner">
      <div class="cookie-banner-content">
        <div class="cookie-banner-text">
          <h3>{{ cookieBannerTitle }}</h3>
          <p>{{ cookieBannerText }}</p>
        </div>
        <div class="cookie-banner-buttons">
          <button @click="acceptCookies" class="cookie-btn cookie-btn-accept">
            {{ cookieAcceptText }}
          </button>
          <button @click="declineCookies" class="cookie-btn cookie-btn-decline">
            {{ cookieDeclineText }}
          </button>
        </div>
      </div>
    </div>
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
    // Check if user has already given consent
    const consent = localStorage.getItem("cookieConsent");
    return {
      currentLang: "de",
      nextDateFormatted: next ? next.formatted : null,
      cookieConsent: consent !== null, // Show banner if no consent stored
      googleMapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2427.8985857933244!2d13.46478597722804!3d52.51717437206033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84f003b8f2781%3A0xed19a688a2b4312d!2sRepaircafe-Friedrichshain!5e0!3m2!1sen!2sde!4v1748112503102!5m2!1sen!2sde",
    };
  },
  methods: {
    acceptCookies() {
      localStorage.setItem("cookieConsent", "accepted");
      localStorage.setItem("cookieConsentDate", new Date().toISOString());
      this.cookieConsent = true;
    },
    declineCookies() {
      localStorage.setItem("cookieConsent", "declined");
      localStorage.setItem("cookieConsentDate", new Date().toISOString());
      this.cookieConsent = true;
    },
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
    mottoHeading() {
      return this.currentLang === "de" ? "Unser Motto" : "Our motto";
    },
    mottoText() {
      return this.currentLang === "de"
        ? "Hilfe zur Selbsthilfe – das ist das Motto aller Reparatur-Initiativen."
        : "Help for self-help – that is the motto of all repair initiatives.";
    },
    togetherHeading() {
      return this.currentLang === "de"
        ? "Wir reparieren gemeinsam!"
        : "We repair together!";
    },
    togetherText() {
      return this.currentLang === "de"
        ? "Ihr habt defekte Sachen oder Dinge, die nicht bestimmungsgemäß funktionieren? Lasst uns das gemeinsam ansehen. Wir sind eine freie Reparaturinitiative, die Hilfe zur Selbsthilfe leistet. Meist habt ihr selbst schon eine Ahnung, die wir gemeinsam verfolgen. Manchmal erarbeiten wir uns auch erst einen Plan. Nachhaltigkeit ist das Stichwort – nicht entsorgen und neu kaufen, reparieren."
        : "You have broken items or things that no longer work as intended? Let’s have a look at them together. We are an open repair initiative that focuses on help for self-help. Often you already have an idea of what might be wrong and we explore it together. Sometimes we first work out a plan. The key idea is sustainability – don’t throw things away and buy new ones, repair them.";
    },
    bringHeading() {
      return this.currentLang === "de"
        ? "Womit könnt ihr kommen?"
        : "What can you bring?";
    },
    bringText() {
      return this.currentLang === "de"
        ? "Elektro-Haushaltsgeräte, Elektrogeräte, Nähsachen, Software, Handys, Tablets, Computer, Drohnen, Fotozeug – was halt alles so kaputt geht. Und ab jetzt können wir auch Fahrräder reparieren."
        : "Household electrical appliances, electronic devices, sewing projects, software, mobile phones, tablets, computers, drones, camera gear – everything that tends to break. And from now on we can also repair bicycles.";
    },
    supportHeading() {
      return this.currentLang === "de"
        ? "Ihr möchtet uns unterstützen?"
        : "Would you like to support us?";
    },
    supportText() {
      return this.currentLang === "de"
        ? "Schreibt uns eine Mail oder kommt gern vorbei. Es ist manchmal stressig, es klappt nicht immer alles und vielleicht ist auch mal der Kaffee alle. Aber unser Dank wird euch auf ewig verfolgen. Wir suchen insbesondere Leute, die Fahrräder reparieren können, und alle, die sich mit ihren Fähigkeiten einbringen möchten."
        : "Send us an email or just drop by. Sometimes it’s stressful, not everything works out and maybe the coffee is gone – but you will have our eternal gratitude. We are especially looking for people who can repair bicycles and everyone who wants to contribute their skills.";
    },
    cookieBannerTitle() {
      return this.currentLang === "de"
        ? "Cookie-Einstellungen"
        : "Cookie Settings";
    },
    cookieBannerText() {
      return this.currentLang === "de"
        ? "Diese Website verwendet Cookies von Google Maps, um Kartenfunktionen bereitzustellen. Durch die Nutzung unserer Website stimmen Sie der Verwendung von Cookies zu. Sie können jederzeit Ihre Einwilligung widerrufen."
        : "This website uses cookies from Google Maps to provide map functionality. By using our website, you consent to the use of cookies. You can revoke your consent at any time.";
    },
    cookieAcceptText() {
      return this.currentLang === "de" ? "Akzeptieren" : "Accept";
    },
    cookieDeclineText() {
      return this.currentLang === "de" ? "Ablehnen" : "Decline";
    },
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}

:root {
  --primary-color: #27ae60;
  --primary-dark: #229954;
  --text-primary: #2c3e50;
  --text-secondary: #5a6c7d;
  --bg-light: #f8f9fa;
  --bg-white: #ffffff;
  --border-color: #e1e8ed;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 40px;
  --spacing-xl: 60px;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-light);
}

#app {
  position: relative;
  font-family: "Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
  background-color: var(--bg-white);
  min-height: 100vh;
  box-shadow: var(--shadow-sm);
}

.logo {
  max-width: 220px;
  margin: var(--spacing-lg) auto var(--spacing-md);
  display: block;
  filter: drop-shadow(var(--shadow-sm));
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.02);
}

.lang-switcher {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  gap: var(--spacing-xs);
  background: var(--bg-white);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.lang-switcher button {
  margin: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 2px solid var(--border-color);
  background-color: var(--bg-white);
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.lang-switcher button:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-light);
}

.lang-switcher button.active {
  background-color: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.content {
  text-align: center;
  margin: var(--spacing-md) auto;
  max-width: 100%;
}

.content h1 {
  margin-bottom: var(--spacing-sm);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.content .lead {
  font-weight: 600;
  font-size: 1.4rem;
  color: var(--primary-color);
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.05) 100%);
  border-radius: var(--radius-md);
  display: inline-block;
}

.map {
  display: block;
  margin: var(--spacing-xl) auto;
  width: 100%;
  max-width: 900px;
  height: 500px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.motto-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: left;
  align-items: center;
  transition: box-shadow 0.3s ease;
}

.motto-section:hover {
  box-shadow: var(--shadow-lg);
}

.motto-text h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.motto-text p {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.motto-image {
  text-align: center;
}

.motto-image img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.motto-image img:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.info-card {
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: left;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.info-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.info-card h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.info-card p {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.content h2 {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-size: 1.1rem;
}

.content p {
  margin: var(--spacing-xs) 0;
}

.content .intro {
  margin-top: var(--spacing-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  #app {
    padding: var(--spacing-sm);
  }

  .content h1 {
    font-size: 2rem;
  }

  .content .lead {
    font-size: 1.2rem;
  }

  .motto-section {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .motto-text {
    text-align: center;
  }

  .motto-text h2 {
    font-size: 1.5rem;
  }

  .info-card {
    padding: var(--spacing-md);
  }

  .info-card h2 {
    font-size: 1.5rem;
  }

  .map {
    height: 350px;
    margin: var(--spacing-lg) auto;
  }

  .lang-switcher {
    position: relative;
    top: 0;
    right: 0;
    justify-content: center;
    margin-bottom: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .content h1 {
    font-size: 1.75rem;
  }

  .motto-text h2,
  .info-card h2 {
    font-size: 1.3rem;
  }

  .motto-section,
  .info-card {
    padding: var(--spacing-sm);
  }
}

/* Cookie Consent Banner */
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-white);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: var(--spacing-md);
  border-top: 3px solid var(--primary-color);
}

.cookie-banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
}

.cookie-banner-text {
  flex: 1;
  text-align: center;
}

.cookie-banner-text h3 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.cookie-banner-text p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.cookie-banner-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: center;
}

.cookie-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 2px solid;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.cookie-btn-accept {
  background-color: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.cookie-btn-accept:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.cookie-btn-decline {
  background-color: var(--bg-white);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.cookie-btn-decline:hover {
  background-color: var(--bg-light);
  border-color: var(--text-secondary);
}

@media (max-width: 768px) {
  .cookie-banner {
    padding: var(--spacing-sm);
  }

  .cookie-banner-content {
    gap: var(--spacing-sm);
  }

  .cookie-banner-text h3 {
    font-size: 1.1rem;
  }

  .cookie-banner-text p {
    font-size: 0.9rem;
  }

  .cookie-btn {
    flex: 1;
    min-width: 100px;
  }
}
</style>
