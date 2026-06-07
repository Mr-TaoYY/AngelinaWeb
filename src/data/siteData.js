export const navList = [
  { id: 'home', title: '首页', url: '/' },
  { id: 'products', title: '产品中心', url: '/products' },
  { id: 'brandStory', title: '品牌故事', url: '/brandStory' },
  { id: 'counter', title: '官方渠道查询', url: '/counter' },
  { id: 'help', title: '帮助中心', url: '/help' },
]

export const routeTitles = {
  home: '首页',
  activity: '全明星产品',
  products: '产品中心',
  brandStory: '品牌故事',
  history: '品牌历史',
  counter: '官方渠道查询',
  help: '帮助中心',
  classify: {
    intervene: '干预式系列',
    aquarius: '绿晶系列',
    highlight: '高光系列',
    pearl: '黑珍珠系列',
  },
}

export const homeSwiper = [
  { id: '1', title: '卓效修护系列', subtitle: '测试主视觉 01', theme: 'black', href: '' },
  { id: '2', title: '鎏光焕亮系列', subtitle: '测试主视觉 02', theme: 'gold', href: '' },
  { id: '3', title: '全明星产品礼遇', subtitle: '测试主视觉 03', theme: 'ruby', href: '/home/activity' },
  { id: '4', title: '绿晶生命力系列', subtitle: '测试主视觉 04', theme: 'green', href: '' },
  { id: '5', title: '高光瓶系列', subtitle: '测试主视觉 05', theme: 'silver', href: '' },
  { id: '6', title: '眼周密集护理', subtitle: '测试主视觉 06', theme: 'midnight', href: '' },
]

export const activityBlocks = [
  { id: '1', title: '全明星产品', subtitle: '明星单品整屏展示', theme: 'black', href: '' },
  { id: '2', title: '黑金修护霜', subtitle: '测试商品链接位', theme: 'gold', href: 'https://example.com/product/black-cream' },
  { id: '3', title: '绿晶精华', subtitle: '测试商品链接位', theme: 'green', href: 'https://example.com/product/green-serum' },
  { id: '4', title: '高光精华', subtitle: '测试商品链接位', theme: 'silver', href: 'https://example.com/product/glow-serum' },
  { id: '5', title: '黑珍珠面霜', subtitle: '测试商品链接位', theme: 'pearl', href: 'https://example.com/product/pearl-cream' },
  { id: '6', title: '夜间密集护理', subtitle: '测试商品链接位', theme: 'ruby', href: 'https://example.com/product/night-care' },
]

export const brandStory = [
  { id: 'story1', type: 'image', title: '品牌故事', subtitle: '科学护肤与先锋精神', theme: 'black' },
  { id: 'p2p', type: 'video', title: '品牌影片', subtitle: '这里使用测试视频位替代真实视频', theme: 'video' },
  { id: 'story3', type: 'image', title: '实验室灵感', subtitle: '配方、功效与肌肤研究', theme: 'silver' },
  { id: 'story4', type: 'image', title: '品牌历史', subtitle: '点击进入时间线页面', theme: 'gold', href: '/history' },
  { id: 'story5', type: 'image', title: '护肤仪式', subtitle: '测试长图内容区', theme: 'midnight' },
  {
    id: 'story6',
    type: 'split',
    title: '两大系列入口',
    subtitle: '左右热点区域',
    theme: 'green',
    leftHref: '/brandStory/classify?id=intervene',
    rightHref: '/brandStory/classify?id=aquarius',
    leftLabel: '干预式系列',
    rightLabel: '绿晶系列',
  },
  {
    id: 'story7',
    type: 'split',
    title: '进阶系列入口',
    subtitle: '左右热点区域',
    theme: 'pearl',
    leftHref: '/brandStory/classify?id=highlight',
    rightHref: '/brandStory/classify?id=pearl',
    leftLabel: '高光系列',
    rightLabel: '黑珍珠系列',
  },
]

export const historyBlocks = [
  { id: '1', title: '1902', subtitle: '创始灵感测试页', theme: 'black' },
  { id: '2', title: '1930', subtitle: '美容沙龙测试页', theme: 'gold' },
  { id: '3', title: '1950', subtitle: '科研突破测试页', theme: 'silver' },
  { id: '4', title: '1970', subtitle: '全球化测试页', theme: 'ruby' },
  { id: '5', title: '1990', subtitle: '奢华护理测试页', theme: 'midnight' },
  { id: '6', title: '2010', subtitle: '明星系列测试页', theme: 'green' },
  { id: '7', title: '2020', subtitle: '数字化体验测试页', theme: 'pearl' },
  { id: '8', title: 'TODAY', subtitle: '未来护肤测试页', theme: 'black' },
]

export const classifyData = [
  {
    id: 'intervene',
    title: '干预式系列',
    theme: 'black',
    products: ['经典修护霜', '修护精华', '眼部精华', '密集面膜', '洁面乳', '身体护理', '日间乳液', '修护套装', '旅行套装'],
  },
  {
    id: 'aquarius',
    title: '绿晶系列',
    theme: 'green',
    products: ['绿晶精华', '绿晶面霜', '绿晶眼霜', '绿晶水乳', '洁面泡沫', '身体乳', '喷雾', '护理套装'],
  },
  {
    id: 'highlight',
    title: '高光系列',
    theme: 'silver',
    products: ['高光精华', '高光面霜', '高光眼霜', '高光水乳', '密集安瓶', '提亮面膜', '焕亮套装'],
  },
  {
    id: 'pearl',
    title: '黑珍珠系列',
    theme: 'pearl',
    products: ['黑珍珠面霜', '黑珍珠眼霜', '黑珍珠精华'],
  },
]

export const channelList = [
  {
    id: 'jd',
    store: '【京东】',
    title: '安捷莉娜旗舰店',
    type: 'href',
    url: 'https://mall.jd.com/index-10322988.html',
  },
  {
    id: 'douyin',
    store: '【抖音】',
    title: '安捷莉娜官方旗舰店',
    type: 'href',
    url: 'https://www.douyin.com/user/MS4wLjABAAAAQw03bK77F32NpZV4bcUN0PzeaiDsCLX37Qc-Y87G8s6nleA39w1mk5QEA6mAPTX5?from_tab_name=main',
  },
  {
    id: 'tmall',
    store: '【天猫】',
    title: '安捷莉娜旗舰店',
    type: 'href',
    url: 'https://anjielina.tmall.com/shop/view_shop.htm?spm=a21n57.shop_search.0.0.7fb9523cCY63Z3',
  },
]

export const helpCenterData = [
  {
    id: 'commonProblem',
    title: '常见问题',
    type: 'category',
    children: [
      {
        id: 'contact',
        name: '联系我们',
        description: [
          '品牌热线：400-660-9529（周一至周五9:00-17:30）',
          '咨询热线：400-660-9529（周一至周五9:00-17:30）',
        ],
      },
      {
        id: 'productAdvice',
        name: '怎样获得关于产品的建议？',
        description: [
          '您可以将您的问题通过以下官方渠道在线咨询：',
          '天猫搜索：安捷莉娜官方旗舰店',
          '京东搜索：安捷莉娜官方旗舰店',
          '抖音搜索：安捷莉娜官方旗舰店',
          '微信搜索小程序：安捷莉娜ANGELINA',
          '或致电客服400-660-9529（周一至周五9:00-17:30）。',
        ],
      },
      {
        id: 'purchaseQuestion',
        name: '对已经收到购买产品有疑问，可以在哪里咨询？',
        description: ['您可以联系购买渠道的相关客服咨询。'],
      },
      {
        id: 'memberInfo',
        name: '品牌会员如何咨询会员信息？',
        description: [
          '您可以通过微信搜索“安捷莉娜ANGELINA”小程序，进入会员中心进行查询，如您还有任何疑问，可致电品牌热线：400-660-9529（周一至周五9:00-17:30）。',
        ],
      },
      {
        id: 'productAvailability',
        name: '官网展示的产品为什么在其它渠道有差异/缺货/无货？',
        description: ['官网仅做产品展示，具体您可以咨询销售渠道的相关客服。'],
      },
    ],
  },
  { id: 'clause', type: 'content', title: '使用条款', description: '/' },
  { id: 'privacy', type: 'content', title: '隐私声明', description: '/' },
  { id: 'cookies', type: 'content', title: 'Cookies政策', description: '/' },
  { id: 'intellectual', type: 'content', title: '知识产权和版权', description: '/' },
  { id: 'law', type: 'content', title: '本地法律和规定', description: '/' },
  { id: 'responsibility', type: 'content', title: '责任限度', description: '/' },
  { id: 'security', type: 'content', title: '安全性', description: '/' },
  { id: 'uncertain', type: 'content', title: '不确定性', description: '/' },
  { id: 'personalInfo', type: 'content', title: '个人信息使用', description: '/' },
]
