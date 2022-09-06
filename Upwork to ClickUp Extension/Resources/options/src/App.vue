<template>
  <main class="container">
    <h2>Upwork to ClickUp Extension Preferences:</h2>
    <FormApiKey/>
    <div class="row">
      <div class="col">
        <FormListSelect/>
      </div>
      <div class="col">
        <FormMatchFields/>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import FormApiKey from '@/components/FormApiKey.vue'
import FormListSelect from '@/components/FormListSelect.vue'
import FormMatchFields from '@/components/FormMatchFields.vue'
</script>

<style lang="scss">
//@import "bootstrap/scss/bootstrap";
</style>
