<template>
  <div id="app">
    <img alt="Logo" src="./assets/Repaircafe-Logo_x9galzmx.png" class="logo" />
    <div class="content">
      <h1>Welcome to Repair Cafe Friedrichshain</h1>
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
export default {
  data() {
    return {
      bodyText: "Repair cafe is on summber break",
      googleMapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2427.8985857933244!2d13.46478597722804!3d52.51717437206033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84f003b8f2781%3A0xed19a688a2b4312d!2sRepaircafe-Friedrichshain!5e0!3m2!1sen!2sde!4v1748112503102!5m2!1sen!2sde",
    };
  },
};
</script>

<style>
.logo {
  max-width: 200px;
  margin: 20px auto;
  display: block;
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
