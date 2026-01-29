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

      <section class="info-card bring-items-section">
        <h2>{{ bringHeading }}</h2>
        <div class="bring-items-grid">
          <div v-for="item in bringItems" :key="item.name" class="bring-item">
            <i :class="item.icon" class="bring-item-icon"></i>
            <span class="bring-item-name">{{ item.name }}</span>
          </div>
        </div>
      </section>

      <section class="info-card">
        <h2>{{ supportHeading }}</h2>
        <p>{{ supportText }}</p>
      </section>

      <section class="motto-section">
        <div class="motto-text">
          <h2>{{ foundersHeading }}</h2>
          <p>{{ foundersText }}</p>
        </div>
        <div class="motto-image">
          <img src="./assets/founders.jpg" alt="Gründer des Repair Café Friedrichshain" />
        </div>
      </section>

      <section class="location-section">
        <div class="location-address">
          <h2>{{ locationHeading }}</h2>
          <p>{{ locationAddress }}</p>
        </div>
        <div class="location-map">
          <div ref="mapContainer" class="map"></div>
        </div>
      </section>
    </div>

    <!-- Footer with Legal Information -->
    <footer class="legal-footer">
      <div class="footer-content">
        <div class="footer-social">
          <a href="https://www.instagram.com/repaircafe_friedrichshain/" target="_blank" rel="noopener noreferrer" class="social-link">
            <i class="fab fa-instagram"></i>
            <span>{{ instagramText }}</span>
          </a>
        </div>
        <div class="footer-links">
          <a href="#" @click.prevent="showImpressum = true">{{ impressumLinkText }}</a>
          <span class="footer-separator">|</span>
          <a href="#" @click.prevent="showPrivacy = true">{{ privacyLinkText }}</a>
        </div>
        <p class="footer-copyright">{{ copyrightText }}</p>
      </div>
    </footer>

    <!-- Impressum Modal -->
    <div v-if="showImpressum" class="modal-overlay" @click="showImpressum = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showImpressum = false">&times;</button>
        <h2>{{ impressumTitle }}</h2>
        <div v-html="impressumContent"></div>
      </div>
    </div>

    <!-- Privacy Policy Modal -->
    <div v-if="showPrivacy" class="modal-overlay" @click="showPrivacy = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showPrivacy = false">&times;</button>
        <h2>{{ privacyTitle }}</h2>
        <div v-html="privacyContent"></div>
      </div>
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
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

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
      map: null,
      // Repair Cafe Friedrichshain coordinates
      cafeLat: 52.51717437206033,
      cafeLng: 13.46478597722804,
      showImpressum: false,
      showPrivacy: false,
    };
  },
  mounted() {
    // Use nextTick to ensure DOM is fully rendered
    this.$nextTick(() => {
      this.initMap();
    });
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    initMap() {
      if (!this.$refs.mapContainer) {
        console.error("Map container not found");
        return;
      }

      // Check if container has dimensions
      const container = this.$refs.mapContainer;
      if (container.offsetHeight === 0 || container.offsetWidth === 0) {
        console.warn("Map container has no dimensions, retrying...");
        setTimeout(() => this.initMap(), 100);
        return;
      }

      // Fix Leaflet default icon paths (required for webpack/Vue)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetina,
        iconUrl: icon,
        shadowUrl: iconShadow,
      });

      try {
        // Initialize Leaflet map
        this.map = L.map(this.$refs.mapContainer, {
          zoomControl: true,
          preferCanvas: false,
        }).setView([this.cafeLat, this.cafeLng], 16);

        // Add OpenStreetMap tiles (no cookies, open source)
        const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        });
        
        osmLayer.addTo(this.map);

        // Invalidate size to ensure map renders correctly after a short delay
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 200);

        // Add marker for Repair Cafe location
        const cafeName = this.currentLang === "de"
          ? "Repair Café Friedrichshain"
          : "Repair Cafe Friedrichshain";
        
        L.marker([this.cafeLat, this.cafeLng])
          .addTo(this.map)
          .bindPopup(cafeName)
          .openPopup();
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    },
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
    bringItems() {
      if (this.currentLang === "de") {
        return [
          { name: "Elektro-Haushaltsgeräte", icon: "fas fa-blender" },
          { name: "Elektrogeräte", icon: "fas fa-plug" },
          { name: "Nähsachen", icon: "fas fa-cut" },
          { name: "Software", icon: "fas fa-code" },
          { name: "Handys", icon: "fas fa-mobile-alt" },
          { name: "Tablets", icon: "fas fa-tablet-alt" },
          { name: "Computer", icon: "fas fa-laptop" },
          { name: "Drohnen", icon: "fas fa-helicopter" },
          { name: "Fotozeug", icon: "fas fa-camera" },
          { name: "Fahrräder", icon: "fas fa-bicycle" },
        ];
      } else {
        return [
          { name: "Household Appliances", icon: "fas fa-blender" },
          { name: "Electronic Devices", icon: "fas fa-plug" },
          { name: "Sewing Projects", icon: "fas fa-cut" },
          { name: "Software", icon: "fas fa-code" },
          { name: "Mobile Phones", icon: "fas fa-mobile-alt" },
          { name: "Tablets", icon: "fas fa-tablet-alt" },
          { name: "Computers", icon: "fas fa-laptop" },
          { name: "Drones", icon: "fas fa-helicopter" },
          { name: "Camera Gear", icon: "fas fa-camera" },
          { name: "Bicycles", icon: "fas fa-bicycle" },
        ];
      }
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
    foundersHeading() {
      return this.currentLang === "de"
        ? "Über uns"
        : "About us";
    },
    foundersText() {
      return this.currentLang === "de"
        ? "Das Repair Café Friedrichshain wurde von engagierten Menschen gegründet, die sich für Nachhaltigkeit und Gemeinschaft einsetzen. Wir glauben daran, dass Reparatur nicht nur Dinge wieder zum Laufen bringt, sondern auch Menschen zusammenbringt und unsere Umwelt schont."
        : "Repair Café Friedrichshain was founded by dedicated people who are committed to sustainability and community. We believe that repair not only makes things work again, but also brings people together and protects our environment.";
    },
    locationHeading() {
      return this.currentLang === "de"
        ? "Wo findet ihr uns?"
        : "Where to find us";
    },
    locationAddress() {
      return this.currentLang === "de"
        ? "Villa Felix\nSchreinerstraße 47\n10247 Berlin"
        : "Villa Felix\nSchreinerstraße 47\n10247 Berlin";
    },
    cookieBannerTitle() {
      return this.currentLang === "de"
        ? "Datenschutz-Information"
        : "Privacy Information";
    },
    cookieBannerText() {
      return this.currentLang === "de"
        ? "Diese Website verwendet keine Cookies. Die interaktive Karte wird mit OpenStreetMap bereitgestellt, einer quelloffenen Alternative, die keine Cookies verwendet und Ihre Privatsphäre respektiert."
        : "This website does not use cookies. The interactive map is provided by OpenStreetMap, an open-source alternative that does not use cookies and respects your privacy.";
    },
    cookieAcceptText() {
      return this.currentLang === "de" ? "Verstanden" : "Got it";
    },
    cookieDeclineText() {
      return this.currentLang === "de" ? "Schließen" : "Close";
    },
    impressumLinkText() {
      return this.currentLang === "de" ? "Impressum" : "Imprint";
    },
    privacyLinkText() {
      return this.currentLang === "de" ? "Datenschutzerklärung" : "Privacy Policy";
    },
    copyrightText() {
      const currentYear = new Date().getFullYear();
      return this.currentLang === "de"
        ? `© ${currentYear} Repair Café Friedrichshain`
        : `© ${currentYear} Repair Cafe Friedrichshain`;
    },
    instagramText() {
      return this.currentLang === "de" ? "Instagram" : "Instagram";
    },
    impressumTitle() {
      return this.currentLang === "de" ? "Impressum" : "Imprint";
    },
    impressumContent() {
      return this.currentLang === "de"
        ? `<p><strong>Angaben gemäß § 5 TMG</strong></p>
           <p>Repair Café Friedrichshain<br>
           Villa Felix<br>
           Schreinerstraße 47<br>
           10247 Berlin<br>
           Deutschland</p>
           <p><strong>Kontakt</strong><br>
           E-Mail: info@repaircafe-friedrichshain.de</p>
           <p><strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</strong><br>
           Repair Café Friedrichshain<br>
           Schreinerstraße 47<br>
           10247 Berlin</p>`
        : `<p><strong>Information according to § 5 TMG</strong></p>
           <p>Repair Café Friedrichshain<br>
           Villa Felix<br>
           Schreinerstraße 47<br>
           10247 Berlin<br>
           Germany</p>
           <p><strong>Contact</strong><br>
           Email: info@repaircafe-friedrichshain.de</p>
           <p><strong>Responsible for content according to § 55 Abs. 2 RStV</strong><br>
           Repair Café Friedrichshain<br>
           Schreinerstraße 47<br>
           10247 Berlin</p>`;
    },
    privacyTitle() {
      return this.currentLang === "de" ? "Datenschutzerklärung" : "Privacy Policy";
    },
    privacyContent() {
      return this.currentLang === "de"
        ? `<p><strong>1. Datenschutz auf einen Blick</strong></p>
           <p><strong>Allgemeine Hinweise</strong><br>
           Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
           
           <p><strong>2. Datenerfassung auf dieser Website</strong></p>
           <p><strong>Cookies</strong><br>
           Diese Website verwendet keine Cookies. Die interaktive Karte wird mit OpenStreetMap bereitgestellt, einer quelloffenen Alternative, die keine Cookies verwendet.</p>
           
           <p><strong>3. Ihre Rechte</strong></p>
           <p>Sie haben jederzeit das Recht, Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten. Bei Fragen zur Datenerfassung können Sie uns kontaktieren.</p>
           
           <p><strong>4. Kontakt</strong></p>
           <p>Bei Fragen zum Datenschutz können Sie uns unter info@repaircafe-friedrichshain.de kontaktieren.</p>`
        : `<p><strong>1. Privacy at a Glance</strong></p>
           <p><strong>General Information</strong><br>
           The following information provides a simple overview of what happens to your personal data when you visit this website.</p>
           
           <p><strong>2. Data Collection on This Website</strong></p>
           <p><strong>Cookies</strong><br>
           This website does not use cookies. The interactive map is provided by OpenStreetMap, an open-source alternative that does not use cookies.</p>
           
           <p><strong>3. Your Rights</strong></p>
           <p>You have the right to obtain information about your personal data stored by us at any time. If you have questions about data collection, you can contact us.</p>
           
           <p><strong>4. Contact</strong></p>
           <p>If you have questions about data protection, you can contact us at info@repaircafe-friedrichshain.de.</p>`;
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

.location-section {
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

.location-section:hover {
  box-shadow: var(--shadow-lg);
}

.location-address h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.location-address p {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-line;
}

.location-map {
  text-align: center;
}

.map {
  display: block;
  width: 100%;
  height: 500px;
  min-height: 500px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
  z-index: 1;
  position: relative;
  background-color: #f0f0f0;
}

/* Leaflet map styling adjustments - using global styles */
.map ::v-deep .leaflet-container,
.map :deep(.leaflet-container) {
  border-radius: var(--radius-lg);
  height: 100% !important;
  width: 100% !important;
  min-height: 500px;
  font-family: inherit;
  background-color: transparent;
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

.bring-items-section {
  text-align: center;
}

.bring-items-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  justify-items: center;
}

.bring-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.bring-item:hover {
  transform: translateY(-4px);
  background-color: var(--bg-light);
}

.bring-item-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.bring-item-name {
  font-size: 0.95rem;
  color: var(--text-secondary);
  text-align: center;
  font-weight: 500;
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

  .bring-items-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-sm);
  }

  .bring-item-icon {
    font-size: 2rem;
  }

  .bring-item-name {
    font-size: 0.85rem;
  }

  .location-section {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .location-address {
    text-align: center;
  }

  .location-address h2 {
    font-size: 1.5rem;
  }

  .map {
    height: 350px;
    margin: 0;
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

  .bring-items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xs);
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

/* Legal Footer */
.legal-footer {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-light);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-social {
  margin-bottom: var(--spacing-md);
  display: flex;
  justify-content: center;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-primary);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.social-link:hover {
  color: var(--primary-color);
  background-color: var(--bg-light);
  transform: translateY(-2px);
}

.social-link i {
  font-size: 1.5rem;
  color: var(--primary-color);
  transition: transform 0.2s ease;
}

.social-link:hover i {
  transform: scale(1.1);
}

.footer-links {
  margin-bottom: var(--spacing-xs);
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.footer-separator {
  margin: 0 var(--spacing-xs);
  color: var(--border-color);
}

.footer-copyright {
  margin: var(--spacing-xs) 0 0 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  position: relative;
  text-align: left;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: 1.8rem;
  color: var(--text-primary);
}

.modal-content p {
  margin-bottom: var(--spacing-sm);
  line-height: 1.7;
  color: var(--text-secondary);
}

.modal-content strong {
  color: var(--text-primary);
}

.modal-close {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .modal-content {
    padding: var(--spacing-md);
    max-width: 100%;
  }

  .modal-content h2 {
    font-size: 1.5rem;
    padding-right: var(--spacing-lg);
  }

  .footer-social {
    margin-bottom: var(--spacing-sm);
  }

  .social-link {
    font-size: 0.9rem;
  }

  .social-link i {
    font-size: 1.3rem;
  }

  .footer-links {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .footer-separator {
    display: none;
  }
}
</style>
