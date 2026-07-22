import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '地理地图',
  description:
    'leaflet 地图，标记 lat∈[-90,90]/lng∈[-180,180]，支持路线、聚类与 marker/route 事件。',
  key: 'cx-vtu-geo-map',
  icon: 'i-tabler-map',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '门店分布',
    },
    theme: {
      name: '主题',
      type: 'card-selector',
      isPreview: true,
      initial: 'light',
      options: [
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
      ],
    },
    showZoomControl: {
      name: '缩放控件',
      type: 'switch',
      initial: true,
    },
    markers: {
      name: '标记',
      type: 'json',
      initial: () => [
        { id: 'sh', lat: 31.23, lng: 121.47, label: '上海' },
        { id: 'bj', lat: 39.9, lng: 116.4, label: '北京' },
      ],
    },
  },
})
