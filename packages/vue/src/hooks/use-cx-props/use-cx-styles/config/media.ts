export const breakPointOptions = [
  { value: '', tooltip: '默认', width: 0, height: 0, icon: 'i-material-symbols-desktop-mac-outline' },
  { value: 'desktop', tooltip: '电脑', width: 1920, height: 1024, icon: 'i-material-symbols-desktop-mac-outline' },
  { value: 'mobile', tooltip: '手机', width: 375, height: 812, icon: 'i-material-symbols-phone-iphone-outline' },
  { value: 'tablet', tooltip: '平板', width: 768, height: 1024, icon: 'i-material-symbols-tablet-mac-outline' },
  { value: 'laptop', tooltip: '笔记本', width: 1366, height: 768, icon: 'i-material-symbols-laptop-mac-outline' }
] as const

export const deviceOptionsGroup = [
  // mobile
  [
    { name: 'Android Compact', width: 412, height: 917 },
    { name: 'Android Medium', width: 700, height: 840 },
    { name: 'iPhone 16', width: 393, height: 852 },
    { name: 'iPhone 16 Pro', width: 402, height: 874 },
    { name: 'iPhone 16 Pro Max', width: 440, height: 956 },
    { name: 'iPhone 16 Plus', width: 430, height: 932 },
    { name: 'iPhone 14(15) Pro Max', width: 430, height: 932 },
    { name: 'iPhone 14 Plus', width: 428, height: 926 },
    { name: 'iPhone 14(15) Pro', width: 393, height: 852 },
    { name: 'iPhone 13(14)', width: 390, height: 844 },
    { name: 'iPhone 13 mini', width: 375, height: 812 },
    { name: 'iPhone SE', width: 320, height: 568 },
    { name: 'iPhone 8 Plus', width: 414, height: 736 },
    { name: 'iPhone 8', width: 375, height: 667 }
  ],
  // tablet
  [
    { name: 'Android Tablets', width: 1280, height: 800 },
    { name: 'iPad 10.2"', width: 810, height: 1080 },
    { name: 'iPad mini 8.3"', width: 744, height: 1133 },
    { name: 'iPad Air 10.9"', width: 820, height: 1180 },
    { name: 'iPad Pro 11"', width: 834, height: 1194 },
    { name: 'iPad Pro 12.9"', width: 1024, height: 1366 }
  ],
  // desktop
  [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'MacBook Air 13"', width: 1280, height: 800 },
    { name: 'MacBook Pro 14"', width: 1512, height: 982 },
    { name: 'MacBook Pro 16"', width: 1728, height: 1117 },
    { name: 'iMac', width: 1280, height: 720 }
  ],
  // PPT
  [
    { name: '幻灯片 16:9', width: 1920, height: 1080 },
    { name: '幻灯片 4:3', width: 1024, height: 768 }
  ],
  // Watch
  [
    { name: 'Apple Watch 38mm', width: 170, height: 195 },
    { name: 'Apple Watch 40mm', width: 162, height: 197 },
    { name: 'Apple Watch 41mm', width: 176, height: 215 },
    { name: 'Apple Watch 42mm', width: 187, height: 223 },
    { name: 'Apple Watch 44mm', width: 184, height: 224 },
    { name: 'Apple Watch 45mm', width: 198, height: 242 },
    { name: 'Apple Watch 46mm', width: 208, height: 248 },
    { name: 'Apple Watch 49mm', width: 205, height: 251 }
  ],
  // Print
  [
    { name: 'A1', width: 1684, height: 2384 },
    { name: 'A2', width: 1191, height: 1684 },
    { name: 'A3', width: 842, height: 1191 },
    { name: 'A4', width: 595, height: 842 },
    { name: 'A5', width: 420, height: 595 },
    { name: 'A6', width: 297, height: 420 },
    { name: 'B1', width: 2004, height: 2835 },
    { name: 'B2', width: 1417, height: 2004 },
    { name: 'B3', width: 1001, height: 1417 },
    { name: 'B4', width: 709, height: 1001 },
    { name: 'B5', width: 499, height: 709 },
    { name: 'B6', width: 354, height: 499 }
  ],
  // Social Media
  [
    { name: '公众号封面 2.35:1', width: 900, height: 383 },
    { name: '视频号封面 3:4', width: 720, height: 960 },
    { name: '微博焦点图 2.15:1', width: 560, height: 260 },
    { name: '微博封面图像 16:5', width: 960, height: 300 },
    { name: '微博横幅 16:9', width: 2560, height: 1440 },
    { name: '小红书图文封面 3:4', width: 720, height: 960 },
    { name: '抖音作品封面 3:4', width: 720, height: 960 },
    { name: 'Bilibili 4:3', width: 960, height: 720 },
    { name: 'Instagram 帖子 1:1', width: 1080, height: 1080 },
    { name: 'Instagram 快拍 9:16', width: 1080, height: 1920 },
    { name: 'YouTube 封面 16:9', width: 1280, height: 720 },
    { name: 'Dribbble Shot 4:30', width: 800, height: 60 },
    { name: 'Behance Project 16:9', width: 1280, height: 720 },
    { name: 'Pinterest Pin 2:3', width: 800, height: 1200 },
    { name: 'Facebook 封面 16:9', width: 820, height: 312 },
    { name: 'Twitter 封面 3:1', width: 1500, height: 500 },
    { name: 'LinkedIn 封面 4:1', width: 1584, height: 396 }
  ]
] as const
