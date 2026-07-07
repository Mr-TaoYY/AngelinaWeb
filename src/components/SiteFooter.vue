<script setup>
import { ref } from 'vue'

const wxOpen = ref(false)
const phoneOpen = ref(false)

const goToWeibo = () => {
  window.open('https://weibo.com/u/7337270495', '_blank')
}

const contactPhone = '400-666-0385'
const contactWechat = 'test_account'
</script>

<template>
  <footer>
    <section class="black-footer">
      <div class="qr-block">
        <img class="member-qr" src="/src/assets/member-qr.png" alt="扫码绑定会员卡号">
        <span>扫码绑定会员卡号</span>
      </div>
      <div class="social-block">
        <p>关注我们</p>
        
        <button type="button" @click="goToWeibo" class="icon-btn" aria-label="微博" title="访问微博">
          <img src="/src/assets/weibo1.png" alt="微博">
        </button>
        <button type="button" @click="wxOpen = true" class="icon-btn" aria-label="微信" title="扫码关注微信">
          <img src="/src/assets/wx1.png" alt="微信">
        </button>
        <button type="button" @click="phoneOpen = true" class="icon-btn" aria-label="手机" title="手机扫码">
          <img src="/src/assets/phone1.png" alt="手机">
        </button>
      </div>
      <div class="contact-block">
        <p>联系我们</p>
        <span class="phone-link-desktop">品牌热线：{{ contactPhone }}（周一至周五9:00-17:30）</span>
        <span class="phone-link-mobile">品牌热线：{{ contactPhone }}</span>
        <span>咨询热线：400-666-0385（周一至周五9:00-17:30）</span>
        <span>公司地址：上海市静安区示例路 1601 号</span>
      </div>
    </section>

    <section class="legal-footer">
      <p>国家药监局提示您：宣称用于祛斑美白、防晒、染发、烫发等的化妆品为特殊用途化妆品。</p>
      <div>
        <span>© Test Beauty China 版权所有</span>
        <span>中国工商</span>
        <span>沪ICP备00000000号-0</span>
        <span>沪公网安备00000000000000号</span>
      </div>
      <nav>
        <a href="https://example.com/cookies" target="_blank">cookies政策</a>
        <a href="https://example.com/terms" target="_blank">使用条款</a>
        <a href="https://example.com/privacy" target="_blank">隐私政策</a>
      </nav>
    </section>

    <div v-if="wxOpen || phoneOpen" class="footer-modal" @click.self="wxOpen = false; phoneOpen = false">
      <div>
        <button type="button" @click="wxOpen = false; phoneOpen = false">×</button>
        <div class="fake-qr large"></div>
        <p>{{ phoneOpen ? '手机扫码浏览' : '扫码关注测试账号' }}</p>
      </div>
    </div>
  </footer>
</template>
