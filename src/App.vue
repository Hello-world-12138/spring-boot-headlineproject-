<template>
  <div >
    <Header v-show="isHeader"></Header>
    <router-view></router-view>
  </div>
</template>


<script >
import Header from './components/Header.vue'
 import { defineComponent } from 'vue'
  export default  defineComponent({
    name:'App'
  })
</script>
<script  setup>
import { computed } from "vue"
import { useRoute } from 'vue-router'
const route = useRoute() // 路由信息对象
// 判断是否显示header组件
const isHeader = computed(() => {
  const noHeaderRoutes = ["Login", "Register", "addNews"]  // 这里写你路由的真实 name
  return !noHeaderRoutes.includes(route.name)
})
  
</script>

<style lang="less" scoped>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);  /* 深蓝渐变，超稳！ */
  color: white;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>