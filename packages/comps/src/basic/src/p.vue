<template>
  <cx-text type="p" v-bind="$attrs" class="cx-p">
    <template v-for="(_, name) in $slots" #[name]="x">
      <slot :name="name as unknown as string" v-bind="x" />
    </template>
  </cx-text>
</template>

<script lang="ts" setup>
import CxText from './text.vue'

defineOptions({ name: 'CxP' })
</script>
