import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import mitt from 'mitt'
import router from "./routers/index";
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import pinia from './stores';
const app = createApp(App)
app.config.globalProperties.Bus = mitt()



app.use(ElementPlus, {
    locale: zhCn,
})
// 全局加载动画
app.use(ElementPlus, {
  loading: {
    background: 'rgba(0, 0, 0, 0.8)'
  }
})
app.use(pinia)
app.use(router)
app.mount('#app')