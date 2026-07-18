export const nativeEvents = {
  mousedown: {
    name: '按下鼠标',
    description: 'mousedown',
  },
  mouseenter: {
    name: '鼠标进入',
    description: 'mouseenter',
  },
  mouseleave: {
    name: '鼠标离开',
    description: 'mouseleave',
  },
  mousemove: {
    name: '鼠标移动',
    description: 'mousemove',
  },
  mouseout: {
    name: '鼠标移出',
    description: 'mouseout',
  },
  mouseover: {
    name: '鼠标经过',
    description: 'mouseover',
  },
  mouseup: {
    name: '释放鼠标',
    description: 'mouseup',
  },
  click: {
    name: '点击',
    description: 'click',
  },
  change: {
    name: '值改变',
    description: 'change',
  },
  input: {
    name: '输入',
    description: 'input',
  },
  select: {
    name: '选择',
    description: 'select',
  },
  focus: {
    name: '聚焦',
    description: 'focus',
  },
  blur: {
    name: '失焦',
    description: 'blur',
  },
  submit: {
    name: '表单提交',
    description: 'submit',
  },
  reset: {
    name: '表单重置',
    description: 'reset',
  },
  scroll: {
    name: '滚动',
    description: 'scroll',
  },
  load: {
    name: '加载完成',
    description: 'load',
  },
  error: {
    name: '出错',
    description: 'error',
  },
  keydown: {
    name: '按下按钮',
    description: 'keydown',
  },
  keypress: {
    name: '按下键盘',
    description: 'keypress',
  },
  keyup: {
    name: '释放按钮',
    description: 'keyup',
  },
  dblclick: {
    name: '双击',
    description: 'dblclick',
  },
  drag: {
    name: '拖拽',
    description: 'drag',
  },
  dragstart: {
    name: '开始拖拽',
    description: 'dragstart',
  },
  dragenter: {
    name: '拖拽区域有效',
    description: 'dragenter',
  },
  dragleave: {
    name: '离开拖拽区域',
    description: 'dragleave',
  },
  dragover: {
    name: '进入拖拽区域',
    description: 'dragover',
  },
  drop: {
    name: '释放拖拽',
    description: 'drop',
  },
  dragend: {
    name: '拖拽结束',
    description: 'dragend',
  },
  animationstart: {
    name: '动画开始',
    description: 'animationstart',
  },
  animationend: {
    name: '动画结束',
    description: 'animationend',
  },
  animationiteration: {
    name: '动画重复',
    description: 'animationiteration',
  },
  transitionrun: {
    name: '过渡动画运行',
    description: 'transitionrun',
  },
  transitionstart: {
    name: '过渡动画开始',
    description: 'transitionstart',
  },
  transitionend: {
    name: '过渡动画结束',
    description: 'transitionend',
  },
  transitioncancel: {
    name: '过渡动画取消',
    description: 'transitioncancel',
  },
} as const

export default nativeEvents
