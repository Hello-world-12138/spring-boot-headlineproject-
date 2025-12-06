<template>
  <div class="admin-container">
    <el-card shadow="hover">
      <div class="admin-header">
        <div class="title">管理后台</div>
        <div class="sub">欢迎，{{ userInfoStore.nickName || '管理员' }}</div>
      </div>
      <el-tabs v-model="activeTab">
        <!-- 数据面板 -->
        <el-tab-pane label="数据面板" name="dashboard">
          <div class="overview-grid">
            <el-card shadow="never" class="overview-card">
              <div class="card-title">今日新增用户</div>
              <div class="card-number">{{ overview.todayNewUsers }}</div>
            </el-card>
            <el-card shadow="never" class="overview-card">
              <div class="card-title">今日新增头条</div>
              <div class="card-number">{{ overview.todayNewHeadlines }}</div>
            </el-card>
            <el-card shadow="never" class="overview-card">
              <div class="card-title">用户总数</div>
              <div class="card-number">{{ overview.totalUsers }}</div>
            </el-card>
            <el-card shadow="never" class="overview-card">
              <div class="card-title">头条总数</div>
              <div class="card-number">{{ overview.totalHeadlines }}</div>
            </el-card>
          </div>

          <el-card shadow="never" class="section-card" header="最近7天趋势">
            <div class="trend-legend">
              <span class="legend users">新增用户</span>
              <span class="legend headlines">新增头条</span>
            </div>
            <div class="trend-chart">
              <div v-for="(d, idx) in trend.dates" :key="d" class="trend-row">
                <div class="trend-date">{{ d }}</div>
                <div class="trend-bars">
                  <div class="bar users" :style="{ width: barWidth(trend.newUsers[idx]) + '%' }">
                    {{ trend.newUsers[idx] }}
                  </div>
                  <div class="bar headlines" :style="{ width: barWidth(trend.newHeadlines[idx]) + '%' }">
                    {{ trend.newHeadlines[idx] }}
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card" header="阅读量 TOP10">
            <el-table :data="topHeadlines" border>
              <el-table-column prop="hid" label="ID" width="80" />
              <el-table-column prop="title" label="标题" min-width="260" />
              <el-table-column prop="author" label="作者" width="160" />
              <el-table-column prop="pageViews" label="阅读量" width="120" />
            </el-table>
          </el-card>
        </el-tab-pane>

        <!-- 头条管理 -->
        <el-tab-pane label="头条管理" name="headline">
          <div class="toolbar">
            <el-select v-model="headlineFilter.status" placeholder="筛选状态" style="width: 180px" @change="changeHeadlineFilter">
              <el-option label="全部" :value="-1" />
              <el-option label="待审核" :value="0" />
              <el-option label="已发布" :value="1" />
            </el-select>
          </div>
          <el-table :data="headlineData" border>
            <el-table-column prop="hid" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="220" />
            <el-table-column prop="author" label="作者" width="140" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag type="warning" v-if="row.status === 0">待审核</el-tag>
                <el-tag type="success" v-else>已发布</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发布时间" width="180" />
            <el-table-column label="操作" width="240">
              <template #default="{ row }">
                <el-button size="small" @click="showArticle(row)">查看全文</el-button>
                <el-button v-if="row.status === 0" type="success" size="small" @click="handleApprove(row)">通过审核</el-button>
                <el-button type="danger" size="small" @click="handleRemoveHeadline(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pager">
            <el-pagination
              background
              layout="prev, pager, next"
              :current-page="headlinePage.pageNum"
              :page-size="headlinePage.pageSize"
              :total="headlinePage.total"
              @current-change="changeHeadlinePage"
            />
          </div>
        </el-tab-pane>

        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="user">
          <el-table :data="userData" border>
            <el-table-column prop="uid" label="UID" width="80" />
            <el-table-column prop="username" label="用户名" width="140" />
            <el-table-column prop="nickName" label="昵称" width="160" />
            <el-table-column prop="createTime" label="注册时间" width="180" />
            <el-table-column prop="role" label="角色" width="120">
              <template #default="{ row }">
                <el-tag type="success" v-if="Number(row.role) === 1">管理员</el-tag>
                <el-tag type="danger" v-else-if="Number(row.role) === -1">已封禁用户</el-tag>
                <el-tag v-else>普通用户</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button
                  v-if="Number(row.role) === -1"
                  size="small"
                  type="danger"
                  @click="handleBan(row, false)"
                >解禁</el-button>
                <el-button
                  v-else
                  size="small"
                  type="warning"
                  @click="handleBan(row, true)"
                >封禁</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pager">
            <el-pagination
              background
              layout="prev, pager, next"
              :current-page="userPage.pageNum"
              :page-size="userPage.pageSize"
              :total="userPage.total"
              @current-change="changeUserPage"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAdminHeadlineList,
  removeAdminHeadline,
  getAdminUserList,
  toggleUserBan,
  getAdminLoginInfo,
  approveHeadline,
  getDashboardOverview,
  getDashboardTrend,
  getDashboardTopHeadlines
} from '../../api/admin'
import pinia from '../../stores'
import { useUserInfoStore } from '../../stores/userInfo'

const userInfoStore = useUserInfoStore(pinia)
const activeTab = ref('dashboard')
const router = useRouter()

// 头条管理
const headlineData = ref([])
const headlinePage = ref({ pageNum: 1, pageSize: 10, total: 0 })
const headlineFilter = ref({ status: -1 })

// 用户管理
const userData = ref([])
const userPage = ref({ pageNum: 1, pageSize: 10, total: 0 })

// 数据面板
const overview = ref({ todayNewUsers: 0, todayNewHeadlines: 0, totalUsers: 0, totalHeadlines: 0 })
const trend = ref({ dates: [], newUsers: [], newHeadlines: [] })
const topHeadlines = ref([])

const maxTrendValue = computed(() => {
  const all = [...trend.value.newUsers, ...trend.value.newHeadlines]
  return Math.max(...all, 1)
})

const barWidth = (val) => {
  return Math.min(100, (val / maxTrendValue.value) * 100)
}

const loadAdminInfo = async () => {
  try {
    await getAdminLoginInfo()
  } catch (error) {
    // 拦截器已提示
  }
}

const loadHeadlines = async () => {
  const res = await getAdminHeadlineList({
    pageNum: headlinePage.value.pageNum,
    pageSize: headlinePage.value.pageSize,
    status: headlineFilter.value.status,
  })
  headlineData.value = res.pageData || []
  headlinePage.value.pageNum = res.pageNum || headlinePage.value.pageNum
  headlinePage.value.pageSize = res.pageSize || headlinePage.value.pageSize
  headlinePage.value.total = res.totalSize || 0
}

const changeHeadlinePage = (page) => {
  headlinePage.value.pageNum = page
  loadHeadlines()
}

const changeHeadlineFilter = () => {
  headlinePage.value.pageNum = 1
  loadHeadlines()
}

const showArticle = (row) => {
  router.push({ name: 'Detail', query: { hid: row.hid } })
}

const handleApprove = async (row) => {
  await ElMessageBox.confirm('确认通过审核吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await approveHeadline(row.hid)
  ElMessage.success('已通过审核')
  loadHeadlines()
}

const handleRemoveHeadline = async (row) => {
  await ElMessageBox.confirm('确认删除该头条吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await removeAdminHeadline(row.hid)
  ElMessage.success('删除成功')
  loadHeadlines()
}

  const loadUsers = async () => {
  try {
    const res = await getAdminUserList({
      pageNum: userPage.value.pageNum,
      pageSize: userPage.value.pageSize
    })

    // 确保 role 永远是数字类型
    userData.value = (res.pageData || []).map(item => ({
      ...item,
      role: Number(item.role ?? 0)
    }))

    userPage.value.pageNum = res.pageNum || userPage.value.pageNum
    userPage.value.pageSize = res.pageSize || userPage.value.pageSize
    userPage.value.total = res.totalSize || 0

  } catch (err) {
    console.error('加载用户列表失败：', err)
  }
}


const changeUserPage = (page) => {
  userPage.value.pageNum = page
  loadUsers()
}

const handleBan = async (row, banned = null) => {
  // banned 为 true 表示封禁，为 false 表示解禁；默认根据当前角色推断
  const targetBan = banned === null ? Number(row.role) !== -1 : banned
  try {
    await ElMessageBox.confirm(targetBan ? '确认封禁该用户？' : '确认解禁该用户？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await toggleUserBan(row.uid, targetBan)
    ElMessage.success(targetBan ? '已封禁' : '已解禁')
    loadUsers()
  } catch (e) {
    // 用户取消操作，忽略错误
  }
}

const loadDashboard = async () => {
  overview.value = await getDashboardOverview()
  trend.value = await getDashboardTrend(7)
  topHeadlines.value = await getDashboardTopHeadlines()
}

onMounted(() => {
  loadAdminInfo()
  loadDashboard()
  loadHeadlines()
  loadUsers()
})
</script>

<style scoped>
.admin-container {
  padding: 24px;
}

.admin-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}

.admin-header .title {
  font-size: 20px;
  font-weight: 700;
}

.admin-header .sub {
  color: #666;
  font-size: 14px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.overview-card {
  text-align: left;
}

.card-title {
  color: #888;
  margin-bottom: 8px;
}

.card-number {
  font-size: 28px;
  font-weight: 700;
}

.section-card {
  margin-top: 16px;
}

.trend-chart {
  margin-top: 12px;
}

.trend-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.trend-date {
  width: 110px;
  color: #888;
}

.trend-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar {
  height: 26px;
  line-height: 26px;
  color: #fff;
  padding-left: 10px;
  border-radius: 6px;
  font-size: 13px;
}

.bar.users {
  background: linear-gradient(90deg, #409eff, #66b1ff);
}

.bar.headlines {
  background: linear-gradient(90deg, #67c23a, #95d475);
}

.legend {
  margin-right: 14px;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 12px;
  color: #fff;
}

.legend.users {
  background: #409eff;
}

.legend.headlines {
  background: #67c23a;
}

.trend-legend {
  margin-bottom: 8px;
}

.toolbar {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-start;
  gap: 12px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>
