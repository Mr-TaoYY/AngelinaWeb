export const navList = [
  { id: 'home', title: '首页', url: '/' },
  { id: 'brandStory', title: '品牌故事', url: '/brandStory' },
  { id: 'counter', title: '官方渠道查询', url: '/counter' },
  { id: 'help', title: '帮助中心', url: '/help' },
]

export const routeTitles = {
  home: '首页',
  activity: '全明星产品',
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
        id: '1',
        name: '怎样获得关于产品的建议？',
        description: ['您可以通过官方渠道在线咨询。', '也可以致电测试服务热线 400-000-2026。'],
      },
      {
        id: '2',
        name: '已购买产品有疑问，可以在哪里咨询？',
        description: ['请联系购买渠道客服。', '如来自测试商城，可进入会员中心咨询。'],
      },
      {
        id: '3',
        name: '会员如何咨询会员信息？',
        description: ['进入测试小程序会员中心查询。', '也可拨打测试品牌热线。'],
      },
      {
        id: '4',
        name: '官网展示产品为什么与渠道库存不同？',
        description: ['官网为展示页，库存以具体销售渠道为准。'],
      },
      {
        id: '5',
        name: '如何查找线下柜台？',
        description: ['请访问官方渠道查询页，或在测试小程序查询附近柜台。'],
      },
    ],
  },
  { id: 'clause', type: 'pageto', title: '使用条款', href: 'https://example.com/terms' },
  { id: 'privacy', type: 'pageto', title: '隐私声明', href: 'https://example.com/privacy' },
  { id: 'cookies', type: 'pageto', title: 'COOKIES政策', href: 'https://example.com/cookies' },
  { id: 'intellectual', type: 'content', title: '知识产权和版权', description: '本页面为学习复刻测试内容，不包含原站受保护文案、图片、视频或商标。' },
  { id: 'law', type: 'content', title: '本地法律和规定', description: '此处模拟帮助中心正文内容，可替换为你自己的合规条款。' },
  { id: 'responsibility', type: 'content', title: '责任限度', description: '测试内容用于学习页面结构，不用于真实商业发布。' },
  { id: 'security', type: 'content', title: '安全性', description: '此处模拟隐私与安全说明模块。' },
  { id: 'uncertain', type: 'content', title: '不确定性', description: '此处模拟信息准确性提示。' },
  { id: 'personalInfo', type: 'content', title: '个人信息使用', description: '此处模拟个人信息使用说明。' },
]
