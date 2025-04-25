<template>
  <div class="loader-container">
    <div class="spinner"></div>
  </div>
</template>

<style lang="scss" scoped>
  @use '@/styles/colors' as colors;
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: colors.$brand-color-1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
