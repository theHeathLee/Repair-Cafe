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

      <h2>{{ bringHeading }}</h2>
      <p>{{ bringText }}</p>

      <h2>{{ supportHeading }}</h2>
      <p>{{ supportText }}</p>
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
  },
};
</script>

<style>
#app {
  position: relative;
  font-family: "Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  max-width: 800px;
  margin: 0 auto;
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
  margin: 20px auto;
  max-width: 2000px;
}
.motto-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
  text-align: left;
  align-items: center;
}
.motto-text {
  /* Left cell - 50% width */
}
.motto-image {
  text-align: center;
}
.motto-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
.content h1 {
  margin-bottom: 10px;
}
.content h2 {
  margin-top: 20px;
  margin-bottom: 8px;
  font-size: 1.1rem;
}
.content p {
  margin: 6px 0;
}
.content .lead {
  font-weight: 600;
  font-size: 1.3rem;
  color: #27ae60;
  margin-top: 16px;
  margin-bottom: 12px;
}
.content .intro {
  margin-top: 12px;
}
.map {
  display: block;
  margin: 0 auto 40px auto;
  width: 100%;
  max-width: 800px;
  height: 450px;
}
</style>
