<template>
  <cx-text type="h2" v-bind="$attrs" class="cx-h2">
    <template v-for="(_, name) in $slots" #[name]="x">
      <slot :name="name as unknown as string" v-bind="x" />
    </template>
  </cx-text>
</template>

<script lang="ts" setup>
import CxText from './text.vue'

defineOptions({ name: 'CxH2' })
</script>
