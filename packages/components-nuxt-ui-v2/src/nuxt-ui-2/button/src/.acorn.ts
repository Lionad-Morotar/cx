if (!UButton.render._cx_patched) {
  const renderFunctionCode = UButton.render.toString()
  const parser = Parser.extend()
  const ast = parser.parse(renderFunctionCode, { ecmaVersion: 2020 })

  estraverse.replace(ast, {
    enter(node) {
      if (node.type === 'VariableDeclarator' && node.id.name === '_component_UIcon') {
        node.init = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: '_resolveComponent' },
          arguments: [{ type: 'Literal', value: 'p-icon' }],
        }
      }
      return node
    },
  })

  let params, body
  estraverse.traverse(ast, {
    enter(node) {
      if (node.type === 'FunctionDeclaration' && node.id.name === '_sfc_render') {
        params = node.params
        body = node.body
      }
    },
  })

  const newSFCRender = new Function(
    ...params.map((p) => p.name),
    `with(window.renderCtx) { return ${escodegen.generate(body)} }`,
  )
  UButton.render = newSFCRender
  UButton.render._cx_patched = true

  console.log('_resolveComponent', UButton.render)
}
