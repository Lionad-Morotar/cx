/**
 * 使异步函数至少运行某段时间
 */
export const useCxMinTime = <Fn extends (...args: any) => any>(fn: Fn, time = 350) => {
  const sleep = (time = 350) => new Promise((resolve) => setTimeout(resolve, time))

  type Params = Array<Parameters<typeof fn>> | Parameters<typeof fn>
  type Return = ReturnType<typeof fn>

  return (...args: Params) =>
    Promise.all([fn(...(args as Array<Parameters<typeof fn>>)), sleep(time)]).then(
      ([res1]) => res1 as Return,
    )
}
