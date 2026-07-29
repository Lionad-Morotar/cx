<template>
  <cx-text :type="`h${$attrs.level || 1}` as keyof HTMLElementTagNameMap" v-bind="$attrs" class="cx-header">
    <template v-for="(_, name) in $slots" #[name]="x">
      <slot :name="name as unknown as string" v-bind="x" />
    </template>
  </cx-text>
</template>

<script lang="ts" setup>
import CxText from './text.vue'

defineOptions({ name: 'CxHeader' })
</script>
