import { define } from '@lionad/cx-definition'
import CxRender from './render.vue'
import CxRenderComponent from './render-component.vue'
import CxInfo from './info.vue'
import CxRenderComponentWithBindings from './render-component-with-bindings.vue'
import CxTransparentComponent from './transparent-render.vue'

export default [
  define({
    name: '渲染器',
    description: '自定义组件渲染器',
    key: 'cx-render',
    component: CxRender,
  }),
  define({
    name: '组件渲染器',
    description: '自定义组件渲染器',
    key: 'cx-render-component',
    component: CxRenderComponent,
  }),
  define({
    name: '信息',
    description: '信息',
    key: 'cx-info',
    component: CxInfo,
  }),
  define({
    name: '组件渲染器',
    description: '自定义组件渲染器',
    key: 'cx-render-component-with-bindings',
    component: CxRenderComponentWithBindings,
  }),
  define({
    name: '透明包装器',
    description: '透明包装器',
    key: 'cx-transparent-component',
    component: CxTransparentComponent,
  }),
]
