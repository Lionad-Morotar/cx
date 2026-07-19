function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_UIcon = __nuxt_component_0
  const _component_ULink = __nuxt_component_1

  return (_openBlock(), _createBlock(_component_ULink, _mergeProps({
    type: _ctx.type,
    disabled: _ctx.disabled || _ctx.loading,
    class: _ctx.buttonClass
  }, { ..._ctx.linkProps, ..._ctx.attrs }), {
    default: _withCtx(() => [
      _renderSlot(_ctx.$slots, 'leading', {
        disabled: _ctx.disabled,
        loading: _ctx.loading
      }, () => [
        (_ctx.isLeading && _ctx.leadingIconName)
          ? (_openBlock(), _createBlock(_component_UIcon, {
              'key': 0,
              'name': _ctx.leadingIconName,
              'class': _normalizeClass(_ctx.leadingIconClass),
              'aria-hidden': 'true'
            }, null, 8 /* PROPS */, ['name', 'class']))
          : _createCommentVNode('v-if', true)
      ]),
      _renderSlot(_ctx.$slots, 'default', {}, () => [
        (_ctx.label)
          ? (_openBlock(), _createElementBlock('span', {
              'key': 0,
              'class': _normalizeClass([_ctx.truncate ? _ctx.ui.truncate : '']),
              'data-v-inspector': 'node_modules/.pnpm/@nuxt+ui@2.19.2_async-validator@4.2.5_change-case@5.4.4_magicast@0.3.5_rollup@4.28.0_vi_c592d51bc04958f784e49aa21d6cab1d/node_modules/@nuxt/ui/dist/runtime/components/elements/Button.vue:8:7'
            }, _toDisplayString(_ctx.label), 3 /* TEXT, CLASS */))
          : _createCommentVNode('v-if', true)
      ]),
      _renderSlot(_ctx.$slots, 'trailing', {
        disabled: _ctx.disabled,
        loading: _ctx.loading
      }, () => [
        (_ctx.isTrailing && _ctx.trailingIconName)
          ? (_openBlock(), _createBlock(_component_UIcon, {
              'key': 0,
              'name': _ctx.trailingIconName,
              'class': _normalizeClass(_ctx.trailingIconClass),
              'aria-hidden': 'true'
            }, null, 8 /* PROPS */, ['name', 'class']))
          : _createCommentVNode('v-if', true)
      ])
    ]),
    _: 3 /* FORWARDED */
  }, 16 /* FULL_PROPS */, ['type', 'disabled', 'class']))
}
