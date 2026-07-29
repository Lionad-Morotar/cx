<template>
  <DataTable v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { DataTable } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { DataTableProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuDataTable', inheritAttrs: false })

const ns = useCxBEM('vtu-data-table')
const vtuProps = useVtuProps<DataTableProps>(useAttrs(), 'cx-vtu-data-table')
</script>
