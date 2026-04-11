<template>
  <div
    v-if="isNext"
    style="
      background-color: #fbbf24;
      color: #1c1917;
      text-align: center;
      padding: 8px 16px;
      font-size: 14px;
    "
  >
    ⚠️ You are viewing the in-development documentation (from the
    <a href="https://github.com/saebyn/radish-ui/tree/main" style="color: #1c1917"
      ><code>main</code> branch</a
    >). For the stable release, visit
    <a href="https://radish-ui.saebyn.dev" style="color: #1c1917">radish-ui.saebyn.dev</a>.
  </div>
</template>

<script setup lang="ts">
declare const __IS_NEXT__: boolean;
const isNext = __IS_NEXT__;
</script>
