// 以字符串形式读取 URL 返回内容
// * disabled for a while
// * 微前端会劫持请求，所以直还不如使用动态标签的形式
// export const fetchContent = async (url: string): Promise<string> => {
//   const fetch = (window as any).fetch
//   return fetch(url)
//     .then((response) => response.text())
//     .then((res) => res || '')
// }
