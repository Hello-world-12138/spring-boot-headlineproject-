<template>
  <!-- 官方返回 + 标题栏 -->
  <el-page-header @back="goBack" class="page-header">
    <template #content>
      <div class="header-content">
        <span class="title">我发布的头条</span>
      </div>
    </template>
  </el-page-header>

  <!-- 主体内容 -->
  <div class="my-center">
    <div class="list" v-if="list.length > 0">
      <div class="item" v-for="item in list" :key="item.hid" @click="toDetail(item.hid)">
        <h3>{{ item.title }}</h3>
        <div class="info">
          <span>{{ item.pageViews }} 浏览</span>
          <span>{{ item.pastHours ? item.pastHours + '小时前' : '刚刚' }}</span>
        </div>
      </div>
    </div>

    <el-empty v-else description="您还没有发布过头条哦~" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { getMyHeadlines } from "../../api/index"
import { useRouter } from "vue-router"

const router = useRouter()
const list = ref([])

// 返回首页
const goBack = () => {
  router.push({ name: "HeadlineNews" })
}

const load = async () => {
  const res = await getMyHeadlines()
  list.value = res.myHeadlines || []
}

const toDetail = (hid) => {
  router.push({ name: "Detail", query: { hid } })
}

onMounted(load)
</script>

<style lang="less" scoped>
.page-header {
  padding: 20px 40px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.header-content {
  display: flex;
  align-items: center;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.my-center {
  width: 800px;
  margin: 30px auto;
}

.item {
  padding: 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #f9f9f9;
    border-radius: 8px;
  }

  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #333;
  }
}

.info span {
  margin-right: 20px;
  color: #999;
  font-size: 14px;
}
</style>