<template>
  <div class="error-box">
    <h2>Something went wrong</h2>
    <p class="message">{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ErrorBoundary',
  props: {
    message: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped>
.error-box {
  background-color: #fff1f0;
  color: #a8071a;
  border: 1px solid #ffccc7;
  border-radius: 12px;
  text-align: center;
  width: 50%;
  margin: 40px auto; 
}


h2 {
  font-size:   24px;
  margin-bottom: 12px;
}

.message {
  font-size: 16px;
  color: #a8071a;
  line-height: 1.5;
}

</style>
