<template>
  <div class="headline-page">
    <div class="container">
    <!-- 顶部轮播图 -->
    <div class="banner-wrapper" v-if="banners.length">
      <el-carousel height="260px" indicator-position="outside">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div class="banner-item" :style="{ backgroundImage: 'url(' + item.imageUrl + ')' }">
            <div class="banner-mask">
              <h2 class="banner-title">{{ item.title }}</h2>
              <p class="banner-subtitle">{{ item.subtitle }}</p>
              <el-button type="primary" size="small" @click="goBannerDetail(item)">
                查看详情
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="listItem">
      <div class="containerItem" v-for="item in pageData" :key="item.hid">
        <div>
          <span class="text">{{ item.title }}</span>
          <el-tag
            v-if="Number(item.publisherRole) === 1"
            type="warning"
            size="small"
            style="margin-left: 8px;"
          >管理员发布</el-tag>
        </div>
        <div class="detail">
          <span>{{ item.type == 1 ? "新闻":item.type == 2 ? "体育": item.type == 3 ? "娱乐": item.type == 4 ? "科技" : "其他" }}</span>
          <span>{{item.pageViews}} 浏览</span>
          <span>{{item.pastHours}} 小时前</span>
        </div>
        <div>
          <el-button @click="toDetail(item.hid)" size="small"
            style="background: #198754; margin-left: 15px; color: #bbd3dc">查看全文</el-button>
          <el-popconfirm v-if="item.publisher == type" @confirm="handlerDelete(item.hid)" :title="`您确定要删除${item.title}吗?`">
            <template #reference>
              <el-button size="small" style="background: #dc3545; color: #bbd3dc">删除</el-button>
            </template>
          </el-popconfirm>

          <el-button @click="Modify(item.hid)" v-if="item.publisher == type"  size="small" style="background: #212529; color: #bbd3dc">修改</el-button>
        </div>
      </div>
  
      <div style="margin-top: 20px">
        <el-pagination 
          v-model:current-page="findNewsPageInfo.pageNum"
          v-model:page-size="findNewsPageInfo.pageSize" 
          @size-change="getPageList"
          @current-change="getPageList"
          :page-sizes="[5,7,10]" 
          background
          layout="prev, pager, next , ->, sizes, total" 
          :total="totalSize" />
      </div>
    </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance, watch } from "vue"
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import pinia from '../../stores/index';
import { useUserInfoStore } from '../../stores/userInfo'
import { getfindNewsPageInfo , removeByHid, getBannerList } from "../../api/index"
const  { Bus } = getCurrentInstance()!.appContext.config.globalProperties
const userInfoStore = useUserInfoStore(pinia)
const router = useRouter()
const type = userInfoStore.uid

// ?
const banners = ref<any[]>([])
const isFeatured = ref(false)

const findNewsPageInfo = ref(
  {
    keyWords: "",
    type: 0,
    pageNum: 1,
    pageSize: 5,
  }
)
const totalSize = ref(0)
const pageData = ref([])

Bus.on('keyword', (keywords: string) => {
  findNewsPageInfo.value.keyWords = keywords
})
Bus.on('tid', (tid: number) => {
  if (tid === -999) {
    // 精选：筛选管理员发布 + 关键字辅助
    findNewsPageInfo.value.type = 0
    findNewsPageInfo.value.keyWords = '中核集团'
    isFeatured.value = true
  } else {
    findNewsPageInfo.value.type = tid
    findNewsPageInfo.value.keyWords = ''
    isFeatured.value = false
  }
  // 导航切换时列表数据会刷新
})

watch(() => findNewsPageInfo.value, () => {
  getPageList()
}, {
  deep: true,
})

const getPageList = async () => {
  let result = await getfindNewsPageInfo(findNewsPageInfo.value)
  let list = result.pageInfo.pageData || []
  if (isFeatured.value) {
    list = list.filter((item: any) => Number(item.publisherRole) === 1)
  }
  pageData.value = list
  findNewsPageInfo.value.pageNum = result.pageInfo.pageNum
  findNewsPageInfo.value.pageSize = result.pageInfo.pageSize
  totalSize.value = isFeatured.value ? list.length : +result.pageInfo.totalSize
}

const loadBanners = async () => {
  try {
    const list = await getBannerList(undefined)
    banners.value = Array.isArray(list) ? list : []
  } catch (e) {
    banners.value = []
  }
}

onMounted(() => {
  getPageList()
  loadBanners()
})

const toDetail = (hid: number) => {
  router.push({ name: "Detail" ,query:{ hid }});
}

const handlerDelete = async (id: number) => {
  await removeByHid(id)
  ElMessage.success('??!')
  getPageList()
}

const Modify = (hid: number) => {
  router.push({ name: "addOrModifyNews", query: { hid } });
}

const goBannerDetail = (item: any) => {
  if (item.linkUrl) {
    if (item.linkUrl.startsWith('http')) {
      window.open(item.linkUrl, '_blank')
    } else {
      router.push(item.linkUrl)
    }
    return
  }
  if (item.hid) {
    router.push({ name: "Detail", query: { hid: item.hid } })
  }
}
</script>

<style lang="less" scoped>
.headline-page {
  min-height: 100vh;
  width: 100%;
  background-image: url('https://images.pexels.com/photos/701337/pexels-photo-701337.jpeg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 30px 0 50px;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), rgba(255,255,255,0.0)) ,
              rgba(255, 255, 255, 0.00);
  backdrop-filter: blur(6px);
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  color: #e5e7eb;
}

.banner-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto 10px;
  padding: 0 20px;
}

.banner-item {
  width: 100%;
  height: 260px;
  border-radius: 16px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px 30px;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%);
  color: #fff;
}

.banner-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
}

.banner-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.listItem {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.containerItem {
  background: rgba(15, 23, 42, 0.92);
  color: #f5f5f5;
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  max-width: 700px;
  margin: 30px 0;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.55);
  }

  .text {
    font-size: 20px;
    font-weight: bold;
    color: #f8fafc;
    margin-bottom: 15px;
  }

  .detail span {
    color: #cbd5e1;
    font-size: 14px;
  }

  .el-button {
    border-radius: 25px;
    font-weight: bold;
    box-shadow: 0 6px 18px rgba(0,0,0,0.28);
  }
}
</style>


