<template>
  <div class="admin-page">
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
              <div class="card-title">近七日新增用户</div>
              <div class="card-number">{{ overview.recent7Users }}</div>
            </el-card>
            <el-card shadow="never" class="overview-card">
              <div class="card-title">近七日新增头条</div>
              <div class="card-number">{{ overview.recent7Headlines }}</div>
            </el-card>
            <el-card shadow="never" class="overview-card">
              <div class="card-title">近七日新增评论</div>
              <div class="card-number">{{ overview.recent7Comments }}</div>
            </el-card>
            <el-card shadow="never" class="overview-card">
              <div class="card-title">封禁用户数</div>
              <div class="card-number">{{ overview.bannedUsers }}</div>
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
              <span class="legend comments">新增评论</span>
              <span class="legend banned">封禁用户</span>
            </div>
            <div class="trend-layout">
              <!-- 左侧：堆叠面积 + 折线 -->
              <div class="stacked-area">
                <svg
                  v-if="stackChart.width > 0"
                  :viewBox="`0 0 ${stackChart.width} ${stackChart.height}`"
                  preserveAspectRatio="none"
                  class="stacked-svg"
                  @mouseleave="hideHover"
                >
                  <g v-for="layer in stackChart.layers" :key="layer.key">
                    <path
                      :d="layer.area"
                      :fill="layer.fill"
                      :fill-opacity="0.45"
                      :stroke="layer.stroke"
                      stroke-width="1.5"
                    />
                    <path
                      :d="layer.line"
                      :stroke="layer.stroke"
                      stroke-width="1.2"
                      fill="none"
                    />
                  </g>
                  <g v-for="(d, idx) in trend.dates" :key="d">
                    <rect
                      :x="stackChart.points[idx].x - stackChart.step/2"
                      y="0"
                      :width="stackChart.step"
                      :height="stackChart.height"
                      fill="transparent"
                      @mouseenter="setHoverDetail($event, idx)"
                      @mousemove="setHoverDetail($event, idx)"
                      @mouseleave="hideHover"
                    />
                  </g>
                </svg>
                <div
                  class="hover-tip"
                  v-if="tooltip.show"
                  :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
                >
                  <div class="tip-date">{{ tooltip.data.date }}</div>
                  <div class="tip-label">新增用户 / Users：{{ tooltip.data.users }}</div>
                  <div class="tip-label">新增头条 / Headlines：{{ tooltip.data.headlines }}</div>
                  <div class="tip-label">新增评论 / Comments：{{ tooltip.data.comments }}</div>
                  <div class="tip-label">封禁用户 / Banned：{{ tooltip.data.banned }}</div>
                </div>
                <div class="axis-label axis-x">X: 日期 / Date</div>
                <div class="axis-label axis-y">Y: 数量 / Count</div>
              </div>

              <!-- 右侧：玫瑰/圆环条形占比 -->
              <div class="trend-pie">
                <div class="pie-title">近七日占比</div>
                <div class="rose-chart" :style="roseStyle">
                  <div class="rose-center">
                    <div class="pie-center-label">{{ pieHover.label }}</div>
                    <div class="pie-center-value">{{ pieHover.value || pieTotals.total }}</div>
                  </div>
                </div>
                <ul class="pie-legend">
                  <li @mouseenter="setPieHover('新增用户', pieTotals.users)" @mouseleave="setPieHover('总计', pieTotals.total)">
                    <span class="dot users"></span>新增用户：{{ pieTotals.users }}
                  </li>
                  <li @mouseenter="setPieHover('新增头条', pieTotals.headlines)" @mouseleave="setPieHover('总计', pieTotals.total)">
                    <span class="dot headlines"></span>新增头条：{{ pieTotals.headlines }}
                  </li>
                  <li @mouseenter="setPieHover('新增评论', pieTotals.comments)" @mouseleave="setPieHover('总计', pieTotals.total)">
                    <span class="dot comments"></span>新增评论：{{ pieTotals.comments }}
                  </li>
                  <li @mouseenter="setPieHover('封禁用户', pieTotals.banned)" @mouseleave="setPieHover('总计', pieTotals.total)">
                    <span class="dot banned"></span>封禁用户：{{ pieTotals.banned }}
                  </li>
                </ul>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card" header="阅读量 TOP10">
            <el-table :data="topHeadlines" border>
              <el-table-column prop="hid" label="ID" width="80" />
              <el-table-column prop="title" label="标题" min-width="260">
                <template #default="{ row }">
                  <span class="link-title" @click="jumpDetail(row.hid)">{{ row.title }}</span>
                </template>
              </el-table-column>
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

        <!-- 轮播管理 -->
        <el-tab-pane label="轮播管理" name="banner">
          <div class="toolbar">
            <el-button type="primary" size="small" @click="openBannerDialog()">新增轮播</el-button>
          </div>
          <el-table :data="bannerData" border>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column label="图片" width="150">
              <template #default="{ row }">
                <img
                  v-if="row.imageUrl"
                  :src="row.imageUrl"
                  alt="banner"
                  style="width: 130px; height: 70px; object-fit: cover; border-radius: 8px;"
                />
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="160" />
            <el-table-column prop="subtitle" label="副标题" min-width="200" />
            <el-table-column prop="category" label="分类" width="100">
              <template #default="{ row }">
                <el-tag :type="row.category === 'featured' ? 'warning' : 'info'">
                  {{ row.category === 'featured' ? '精选' : '默认' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '上线' : '下线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column label="操作" width="260">
              <template #default="{ row }">
                <el-button size="small" @click="openBannerDialog(row)">编辑</el-button>
                <el-button size="small" type="success" @click="changeBannerStatus(row, 1)">上线</el-button>
                <el-button size="small" type="warning" @click="changeBannerStatus(row, 0)">下线</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pager">
            <el-pagination
              background
              layout="prev, pager, next"
              :current-page="bannerPage.pageNum"
              :page-size="bannerPage.pageSize"
              :total="bannerPage.total"
              @current-change="changeBannerPage"
            />
          </div>

          <el-dialog v-model="bannerDialogVisible" title="轮播图" width="520px">
            <el-form label-width="90px">
              <el-form-item label="标题">
                <el-input v-model="bannerForm.title" placeholder="请输入标题" />
              </el-form-item>
              <el-form-item label="副标题">
                <el-input v-model="bannerForm.subtitle" placeholder="一句话简介" />
              </el-form-item>
              <el-form-item label="图片地址">
                <el-input v-model="bannerForm.imageUrl" placeholder="请输入图片 URL" />
              </el-form-item>
              <el-form-item label="跳转链接">
                <el-input v-model="bannerForm.linkUrl" placeholder="例如 /detail?hid=1" />
              </el-form-item>
              <el-form-item label="分类">
                <el-select v-model="bannerForm.category" style="width: 180px">
                  <el-option label="默认" value="default" />
                  <el-option label="精选" value="featured" />
                </el-select>
              </el-form-item>
              <el-form-item label="排序">
                <el-input v-model.number="bannerForm.sort" type="number" />
              </el-form-item>
              <el-form-item label="状态">
                <el-switch
                  v-model="bannerForm.status"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="上线"
                  inactive-text="下线"
                />
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="bannerDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitBanner">保 存</el-button>
              </span>
            </template>
          </el-dialog>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
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
  getDashboardTopHeadlines,
  getAdminBannerList,
  saveAdminBanner,
  updateBannerStatus
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

// 轮播管理
const bannerData = ref([])
const bannerPage = ref({ pageNum: 1, pageSize: 10, total: 0 })
const bannerDialogVisible = ref(false)
const bannerForm = ref({
  id: null,
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  category: 'default',
  sort: 1,
  status: 1,
})

// 数据面板
const overview = ref({
  recent7Users: 0,
  recent7Headlines: 0,
  recent7Comments: 0,
  bannedUsers: 0,
  totalUsers: 0,
  totalHeadlines: 0,
})

const trend = ref({
  dates: [],
  newUsers: [],
  newHeadlines: [],
  newComments: [],
  newBannedUsers: [],
})
const topHeadlines = ref([])
const tooltip = ref({ show: false, x: 0, y: 0, data: {} })
const pieHover = ref({ label: '总计', value: 0 })

const maxTrendValue = computed(() => {
  const all = [
    ...(trend.value.newUsers || []),
    ...(trend.value.newHeadlines || []),
    ...(trend.value.newComments || []),
    ...(trend.value.newBannedUsers || []),
  ]
  return Math.max(...all, 1)
})

const stackChart = computed(() => {
  const dates = trend.value.dates || []
  const height = 220
  const padding = 30
  const usableHeight = height - padding * 2
  const width = Math.max(320, dates.length > 1 ? dates.length * 60 : 320)
  const step = dates.length > 1 ? width / (dates.length - 1) : width

  const series = [
    { key: 'users', color: '#409EFF', data: trend.value.newUsers || [] },
    { key: 'headlines', color: '#67C23A', data: trend.value.newHeadlines || [] },
    { key: 'comments', color: '#E6A23C', data: trend.value.newComments || [] },
    { key: 'banned', color: '#F56C6C', data: trend.value.newBannedUsers || [] },
  ]
  // 总和用于归一化
  const totals = dates.map((_, idx) => series.reduce((sum, s) => sum + (s.data[idx] || 0), 0))
  const maxTotal = Math.max(...totals, 1)

  // 坐标点
  const points = dates.map((_, idx) => ({
    x: dates.length > 1 ? idx * step : width / 2,
  }))

  const layers = series.map((s, sIdx) => {
    const top = []
    const bottom = []
    for (let i = 0; i < dates.length; i++) {
      const base = series.slice(0, sIdx).reduce((sum, p) => sum + (p.data[i] || 0), 0)
      const val = s.data[i] || 0
      const topY = height - padding - ((base + val) / maxTotal) * usableHeight
      const bottomY = height - padding - (base / maxTotal) * usableHeight
      const x = points[i].x
      top.push(`${x},${topY}`)
      bottom.unshift(`${x},${bottomY}`)
    }
    const area = top.length
      ? `M ${top[0]} L ${top.slice(1).join(' L ')} L ${bottom.join(' L ')} Z`
      : ''
    const line = top.length ? `M ${top[0]} L ${top.slice(1).join(' L ')}` : ''
    return {
      key: s.key,
      fill: s.color,
      stroke: s.color,
      area,
      line,
    }
  })

  return { width, height, step, points, layers }
})

const barWidth = (val) => {
  return Math.min(100, (val / maxTrendValue.value) * 100)
}

const pieTotals = computed(() => {
  const users = (trend.value.newUsers || []).reduce((a, b) => a + (b || 0), 0)
  const headlines = (trend.value.newHeadlines || []).reduce((a, b) => a + (b || 0), 0)
  const comments = (trend.value.newComments || []).reduce((a, b) => a + (b || 0), 0)
  const banned = (trend.value.newBannedUsers || []).reduce((a, b) => a + (b || 0), 0)
  const total = users + headlines + comments + banned || 1
  return { users, headlines, comments, banned, total }
})

const pieStyle = computed(() => {
  const { users, headlines, comments, banned, total } = pieTotals.value
  const deg = (v) => (v / total) * 360
  const uEnd = deg(users)
  const hEnd = uEnd + deg(headlines)
  const cEnd = hEnd + deg(comments)
  const bEnd = 360
  return {
    background: `conic-gradient(
      #409eff 0deg ${uEnd}deg,
      #67c23a ${uEnd}deg ${hEnd}deg,
      #e6a23c ${hEnd}deg ${cEnd}deg,
      #f56c6c ${cEnd}deg ${bEnd}deg
    )`,
  }
})

const setPieHover = (label, value) => {
  pieHover.value = { label, value }
}

const setHoverDetail = (evt, idx) => {
  const date = trend.value.dates[idx]
  const container = evt.target.closest('.stacked-area')
  const rect = container ? container.getBoundingClientRect() : null
  const tipW = 190
  const tipH = 140
  let x = evt.clientX - (rect ? rect.left : 0) + 12
  let y = evt.clientY - (rect ? rect.top : 0) - tipH - 12
  if (rect) {
    x = Math.max(8, Math.min(x, rect.width - tipW - 8))
    y = Math.max(8, Math.min(y, rect.height - tipH - 8))
  }
  tooltip.value = {
    show: true,
    x,
    y,
    data: {
      date,
      users: trend.value.newUsers[idx] || 0,
      headlines: trend.value.newHeadlines[idx] || 0,
      comments: trend.value.newComments[idx] || 0,
      banned: trend.value.newBannedUsers[idx] || 0,
    },
  }
}

const hideHover = () => {
  tooltip.value = { show: false, x: 0, y: 0, data: {} }
}

const roseStyle = computed(() => {
  const { users, headlines, comments, banned, total } = pieTotals.value
  const deg = (v) => (v / total) * 360
  const uEnd = deg(users)
  const hEnd = uEnd + deg(headlines)
  const cEnd = hEnd + deg(comments)
  const bEnd = 360
  return {
    '--rose-bg': `conic-gradient(
      #409eff 0deg ${uEnd}deg,
      #67c23a ${uEnd}deg ${hEnd}deg,
      #e6a23c ${hEnd}deg ${cEnd}deg,
      #f56c6c ${cEnd}deg ${bEnd}deg
    )`,
  }
})

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
  const res = await getAdminUserList({ pageNum: userPage.value.pageNum, pageSize: userPage.value.pageSize })
  userData.value = (res.pageData || []).map(item => ({
    ...item,
    role: item.role === null || item.role === undefined || item.role === '' ? 0 : Number(item.role)
  }))
  userPage.value.pageNum = res.pageNum || userPage.value.pageNum
  userPage.value.pageSize = res.pageSize || userPage.value.pageSize
  userPage.value.total = res.totalSize || 0
}

const changeUserPage = (page) => {
  userPage.value.pageNum = page
  loadUsers()
}

const handleBan = async (row, banned = null) => {
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

// 轮播管理
const loadBannersAdmin = async () => {
  const res = await getAdminBannerList({
    pageNum: bannerPage.value.pageNum,
    pageSize: bannerPage.value.pageSize,
  })
  bannerData.value = res.pageData || []
  bannerPage.value.pageNum = res.pageNum || bannerPage.value.pageNum
  bannerPage.value.pageSize = res.pageSize || bannerPage.value.pageSize
  bannerPage.value.total = res.totalSize || 0
}

const changeBannerPage = (page) => {
  bannerPage.value.pageNum = page
  loadBannersAdmin()
}

const openBannerDialog = (row) => {
  if (row) {
    bannerForm.value = { ...row }
  } else {
    bannerForm.value = {
      id: null,
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      category: 'default',
      sort: 1,
      status: 1,
    }
  }
  bannerDialogVisible.value = true
}

const submitBanner = async () => {
  await saveAdminBanner(bannerForm.value)
  ElMessage.success('保存成功')
  bannerDialogVisible.value = false
  loadBannersAdmin()
}

const changeBannerStatus = async (row, status) => {
  await updateBannerStatus(row.id, status)
  ElMessage.success(status === 1 ? '已上线' : '已下线')
  loadBannersAdmin()
}

const jumpDetail = (hid) => {
  router.push({ name: 'Detail', query: { hid } })
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
  loadBannersAdmin()
})
</script>

<style scoped>
.admin-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(15, 23, 42, 0);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
}

.admin-page {
  min-height: 100vh;
  width: 100%;
  background-image: url('https://images.pexels.com/photos/701337/pexels-photo-701337.jpeg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 30px 0 50px;
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
  color: #f9fafb;
}

.admin-header .sub {
  color: #e5e7eb;
  font-size: 14px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.overview-card {
  text-align: left;
  background: rgba(15,23,42,0.7);
  border: 1px solid rgba(255,255,255,0.16);
  color: #f9fafb;
  backdrop-filter: blur(10px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.4);
}

.card-title {
  color: #e5e7eb;
  margin-bottom: 8px;
}

.card-number {
  font-size: 28px;
  font-weight: 700;
}

.section-card {
  margin-top: 16px;
  background: rgba(15,23,42,0.7);
  border: 1px solid rgba(255,255,255,0.16);
  color: #f9fafb;
  backdrop-filter: blur(10px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.4);
}

:deep(.el-card) {
  background: rgba(15,23,42,0.7) !important;
  border: 1px solid rgba(255,255,255,0.16) !important;
  color: #f9fafb !important;
  backdrop-filter: blur(10px);
}
:deep(.el-card__header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(255,255,255,0.12) !important;
  color: #f9fafb !important;
}

.trend-layout {
  margin-top: 12px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.stacked-area {
  flex: 2;
  position: relative;
  padding: 8px;
  background: rgba(15,23,42,0.7);
  border: 1px solid rgba(148,163,184,0.5);
  border-radius: 12px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.stacked-svg {
  width: 100%;
  height: 240px;
}

.axis-label {
  position: absolute;
  font-size: 12px;
  color: #f9fafb;
  pointer-events: none;
}

.axis-label.axis-x {
  bottom: 6px;
  left: 12px;
}

.axis-label.axis-y {
  top: 8px;
  left: 12px;
}

.legend {
  margin-right: 14px;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 12px;
  color: #f9fafb;
}

.legend.users {
  background: #409eff;
}

.legend.headlines {
  background: #67c23a;
}

.legend.comments {
  background: #e6a23c;
}

.legend.banned {
  background: #f56c6c;
}

.trend-legend {
  margin-bottom: 8px;
}

.trend-pie {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(15,23,42,0.6);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.35);
}

.pie-title {
  font-size: 14px;
  color: #f9fafb;
}

.pie-chart {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), rgba(255,255,255,0)), var(--rose-bg, #1f252d);
  display: grid;
  place-items: center;
}

.pie-chart::after {
  content: "";
  position: absolute;
  inset: 46px;
  background: rgba(15,23,42,0.95);
  border-radius: 50%;
  box-shadow: inset 0 3px 8px rgba(0,0,0,0.12);
}

.pie-legend {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: #f9fafb;
}

.pie-legend li {
  display: flex;
  align-items: center;
  margin: 4px 0;
}

.pie-legend .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.dot.users {
  background: #409eff;
}

.dot.headlines {
  background: #67c23a;
}

.dot.comments {
  background: #e6a23c;
}

.dot.banned {
  background: #f56c6c;
}

.hover-tip {
  position: absolute;
  min-width: 160px;
  padding: 10px 14px;
  background: rgba(17, 24, 39, 0.82);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
  color: #f9fafb;
  pointer-events: none;
  z-index: 2;
}

.tip-date {
  font-size: 12px;
  color: #f9fafb;
}

.tip-label {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #f9fafb;
}

.tip-value {
  margin-top: 2px;
  font-size: 20px;
  font-weight: 700;
  color: #2563eb;
}

.pie-center {
  position: absolute;
  inset: 54px;
  background: rgba(17, 24, 39, 0.75);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #f5f7fb;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.15);
}

.pie-center-label {
  font-size: 12px;
  color: #f5f7fb;
}

.pie-center-value {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 700;
  color: #f5f7fb;
}

.rose-chart {
  position: relative;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), rgba(255,255,255,0)), var(--rose-bg, #1f252d);
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.16);
}

.rose-chart::after {
  content: "";
  position: absolute;
  inset: 60px;
  background: rgba(17,24,39,0.95);
  border-radius: 50%;
  box-shadow: inset 0 4px 10px rgba(0,0,0,0.12);
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.link-title {
  color: #f9fafb;
  cursor: pointer;
}
.link-title:hover {
  text-decoration: underline;
}

/* Element Plus 表格与分页统一玻璃暗调 */
:deep(.el-card) {
  background-color: rgba(15,23,42,0.7) !important;
  color: #f9fafb !important;
  border: 1px solid rgba(255,255,255,0.16) !important;
  backdrop-filter: blur(10px);
}
:deep(.el-card__header) {
  background-color: transparent !important;
  color: #f9fafb !important;
  border-bottom: 1px solid rgba(255,255,255,0.12) !important;
}
:deep(.el-tabs__item) {
  color: #e5e7eb !important;
}
:deep(.el-tabs__item.is-active) {
  color: #f9fafb !important;
  font-weight: 700;
}
:deep(.el-tabs__active-bar) {
  background-color: #f9fafb !important;
}

:deep(.el-table),
:deep(.el-table__inner-wrapper),
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  background-color: transparent !important;
}

:deep(.el-table th),
:deep(.el-table td),
:deep(.el-table__cell) {
  background-color: rgba(15,23,42,0.35) !important;
  color: #f9fafb !important;
  border-color: rgba(148,163,184,0.4) !important;
}

:deep(.el-table thead th) {
  background-color: rgba(15,23,42,0.55) !important;
  color: #f9fafb !important;
}

:deep(.el-table__row) {
  background-color: rgba(15,23,42,0.25) !important;
}

:deep(.el-table__row:hover > td) {
  background-color: rgba(248,250,252,0.06) !important;
}

:deep(.el-table__empty-block) {
  background-color: transparent !important;
  color: #f9fafb !important;
}

:deep(.el-select .el-input__wrapper),
:deep(.el-input__wrapper) {
  background-color: rgba(15,23,42,0.5) !important;
  color: #f9fafb !important;
  border-color: rgba(255,255,255,0.2) !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: #f9fafb !important;
}

:deep(.el-pagination),
:deep(.el-pagination__total),
:deep(.el-pagination button),
:deep(.el-pagination .el-pager li) {
  color: #e5e7eb !important;
  background-color: transparent;
}

:deep(.el-button--primary),
:deep(.el-button--warning),
:deep(.el-button--success),
:deep(.el-button--danger) {
  color: #f9fafb !important;
}

:deep(.el-tag) {
  color: #1f2937 !important;
  font-weight: 700;
}
:deep(.el-tag__content) {
  color: #1f2937 !important;
  font-weight: 700;
}

/* Element Plus 表格与分页统一玻璃暗调 */
:deep(.el-table),
:deep(.el-table__inner-wrapper),
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  background-color: transparent !important;
}

:deep(.el-table th),
:deep(.el-table td),
:deep(.el-table__cell) {
  background-color: transparent !important;
  color: #f9fafb !important;
  border-color: rgba(148,163,184,0.4) !important;
}

:deep(.el-table__row:hover > td) {
  background-color: rgba(248,250,252,0.06) !important;
}

:deep(.el-table__empty-block) {
  background-color: transparent !important;
  color: #f9fafb !important;
}

:deep(.el-pagination),
:deep(.el-pagination__total),
:deep(.el-pagination button),
:deep(.el-pagination .el-pager li) {
  color: #e5e7eb !important;
  background-color: transparent;
}

:deep(.el-button--primary),
:deep(.el-button--warning),
:deep(.el-button--success),
:deep(.el-button--danger) {
  color: #f9fafb !important;
}

:deep(.el-tag) {
  color: #f9fafb !important;
}
</style>
