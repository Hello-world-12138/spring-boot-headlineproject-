<template>
  <div class="headerContainer">
    <!-- 头部左侧区域 -->
    <div class="left">
      <ul>
        <li @click="HighlightHandler(index)" v-for="(item,index) in findAllTypeList" :key="item.tid">
          <a :class="{ active: item.isHighlight }" href="javascript:;">{{ item.tname }}</a>
        </li>
      </ul>
    </div>
    <!-- 头部右侧区域 -->
    <div class="right">
      <div class="rightInput" style="margin-right: 50px;">
        <el-input v-model="keywords" placeholder="搜索最新头条"></el-input>
      </div>

      <!-- 用户登录以后的展示 -->
      <div class="btn-dropdown">
        <!-- 用户没有登录的时候的展示 -->
        <div v-if="nickName" style="display: flex; justify-content: center; align-items: center;">
          <el-dropdown>
            <el-button type="primary">
              您好:{{ nickName }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handlerNews">发布新闻</el-dropdown-item>
                <el-dropdown-item @click="toMyCenter">个人中心</el-dropdown-item>
                <el-dropdown-item @click="toBrowseHistory">浏览记录</el-dropdown-item>
                <el-dropdown-item v-if="role === 1" @click="toAdmin">管理后台</el-dropdown-item>
                <el-dropdown-item @click="Logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div v-else class="containerButton">
          <el-button size="small" style="background: #212529; color: #aea7a2" @click="toLogin">登录</el-button>
          <el-button size="small" style="background: #ffc107; color: #684802" @click="toRegister">注册</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'Header'
})
</script>

<script setup>
import { getfindAllTypes, isUserOverdue } from '../api/index'
import { ref, onMounted , getCurrentInstance ,watch, computed} from "vue"
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { removeToken } from '../utils/token-utils'
import pinia from '../stores/index'
import { useUserInfoStore } from '../stores/userInfo'
const userInfoStore = useUserInfoStore(pinia)
const nickName = computed(() => userInfoStore.nickName)
const role = computed(() => userInfoStore.role)
// 获取全局事件总线
const { Bus } = getCurrentInstance().appContext.config.globalProperties
const router = useRouter()
const keywords = ref("") // 收集搜索最新头条参数
// 监视搜索参数的变化,当搜索参数变化的时候给HeadlineNews组件传递数据
watch(keywords, (newVal) => {
  Bus.emit('keyword', newVal)
})
const findAllTypeList = ref([])//所有头条分类
const toLogin = () => {
  router.push({ name: "Login" });
}
//点击去注册页面
const toRegister = () => {
  router.push({ name: "Register" });
}
const getList = async () => {
  let result = await getfindAllTypes()
  // 遍历数据添加高亮标识
  result.forEach((item) => {
    item.tid = item.tid
    item.tname = item.tname
    item.isHighlight = false
  })
  // 添加微头条数据
  result.unshift({
    isHighlight: true,
    tid: 0,
    tname: "微头条"
  })
  findAllTypeList.value = result
}
const toMyCenter = () => router.push({ name: "MyCenter" })
const toBrowseHistory = () => router.push({ name: "BrowseHistory" })
const toAdmin = () => router.push({ name: "Admin" })
onMounted(() => {
  getList()
})

//点击切换高亮的回调(排他思想)
const HighlightHandler = (index) => {
  findAllTypeList.value.forEach((item) => {
    item.isHighlight = false
  })
  // 切换高亮的时候把tid传给HeadlineNews组件
  findAllTypeList.value[index].isHighlight = true
  Bus.emit('tid', findAllTypeList.value[index].tid)
}

// 点击退出登录的回调
const Logout = () => {
  removeToken()
  userInfoStore.initUserInfo()
  router.push({ name: "HeadlineNews" });
}

//点击发布新闻的回调
const handlerNews = async () => {
  //发送请求判断用户是否token过期
  await isUserOverdue()
  router.push({ name: "addOrModifyNews" });
}
</script>

<style lang="less" scoped>
.headerContainer {
  width: 100%;
  height: 70px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 60px;               /* 左右内边距加大 */
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  /* ==================== 左侧导航 ==================== */
  .left {
    ul {
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        margin: 0 30px;

        a {
          color: white !important;
          font-size: 18px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          position: relative;
          padding: 8px 0;

          &.active,
          &:hover {
            color: #ffd700 !important;
          }

          &.active::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 100%;
            height: 4px;
            background: #ffd700;
            border-radius: 2px;
          }
        }
      }
    }
  }

  /* ==================== 右侧 ==================== */
  .right {
    display: flex;
    align-items: center;
    gap: 40px;                     /* 搜索框和用户按钮之间加大间距 */

    /* 搜索框 */
    .rightInput {
      flex: 0 0 240px;             /* 固定宽度 */

      :deep(.el-input__wrapper) {
        background: rgba(255, 255, 255, 0.2) !important;
        border-radius: 30px;
      }

      :deep(.el-input__inner) {
        color: white !important;
        height: 44px;
        font-size: 15px;
      }

      :deep(.el-input__inner::placeholder) {
        color: rgba(255, 255, 255, 0.7) !important;
      }
    }

    /* 你好，xxx 下拉按钮 */
    .btn-dropdown {
      min-width: 200px;            /* 强制宽度，绝不被挤压 */
      flex-shrink: 0;              /* 不允许被压缩 */

      .el-button {
        background: rgba(255, 255, 255, 0.18) !important;
        border: 1px solid rgba(255, 255, 255, 0.35);
        color: white !important;
        border-radius: 30px;
        height: 44px;
        font-weight: bold;
        padding: 0 30px !important;      /* 左右内边距超大 */
        min-width: 190px;                /* 按钮最小宽度 */
        white-space: nowrap;
        overflow: visible;
        justify-content: center;
        font-size: 16px;
        letter-spacing: 1px;
      }
    }

    /* 未登录时的登录注册按钮 */
    .containerButton {
      display: flex;
      gap: 18px;

      .el-button {
        border-radius: 30px;
        font-weight: bold;
        padding: 0 22px;
        height: 44px;
      }
    }
  }
}
</style>
