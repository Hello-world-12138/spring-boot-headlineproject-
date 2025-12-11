<template>
  <div class="detail-page">
  <div class="seeDetails">
    <!-- 头条详情部分（保持你原来的样式） -->
    <div class="headline-content">
      <h4>{{ detailList.title }}</h4>
      <div class="meta">
        <span>{{ detailList.typeName }}</span>
        <span>{{ detailList.pageViews }} 浏览</span>
        <span>{{ detailList.pastHours }} 小时前</span>
        <span v-if="detailList.author">作者：{{ detailList.author }}</span>
      </div>
      <div class="article">
        <p>{{ detailList.article }}</p>
      </div>
    </div>

    <!-- 评论区（新加的） -->
    <div class="comment-section">
      <h3>评论区（{{ commentList.length }}）</h3>

      <!-- 发表评论框 -->
      <div class="add-comment">
        <el-input
          type="textarea"
          v-model="newComment"
          placeholder="说点什么..."
          :rows="4"
          resize="none"
        />
        <el-button type="primary" @click="submitComment" :disabled="!newComment.trim()" style="margin-top: 12px;">
          发表评论
        </el-button>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list">
        <div v-for="item in commentList" :key="item.id" class="comment-item">
          <div class="user-info">
            <strong>用户{{ item.uid }}</strong>
            <span class="time">{{ formatTime(item.create_time) }}</span>
          </div>
          <p class="content">{{ item.content }}</p>
        </div>

        <el-empty v-if="commentList.length === 0" description="暂无评论，快来抢沙发~" />
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'Detail'
})
</script>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from 'vue-router'
import { getshowHeadlineDetail, addComment, getCommentList } from "../../api/index"
import { ElMessage } from 'element-plus'

const route = useRoute()
const detailList = ref({})
const commentList = ref([])
const newComment = ref("")

// 加载头条详情
const loadDetail = async () => {
  const result = await getshowHeadlineDetail(route.query.hid)
  detailList.value = result.headline || {}
  loadComments()  // 顺便加载评论
}

// 加载评论
const loadComments = async () => {
  const res = await getCommentList(route.query.hid)
  commentList.value = res.commentList || []
}

// 发表评论
const submitComment = async () => {
  if (!newComment.value.trim()) return

  await addComment({
    hid: Number(route.query.hid),
    content: newComment.value.trim()
  })

  ElMessage.success("评论成功！")
  newComment.value = ""
  loadComments()  // 刷新评论列表
}

// 时间格式化
const formatTime = (time) => {
  if (!time) return ""
  const date = new Date(time)
  const now = Date.now()
  const diff = (now - date.getTime()) / 1000

  if (diff < 60) return "刚刚"
  if (diff < 3600) return Math.floor(diff / 60) + "分钟前"
  if (diff < 86400) return Math.floor(diff / 3600) + "小时前"
  return Math.floor(diff / 86400) + "天前"
}

onMounted(loadDetail)
</script>

<style lang="less" scoped>
.detail-page {
  min-height: 100vh;
  width: 100%;
  background-image: url('https://images.pexels.com/photos/701337/pexels-photo-701337.jpeg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 30px 0 50px;
}

.seeDetails {
  width: 1200px;
  max-width: 95%;
  margin: 40px auto;
  color: #1f2937;

.headline-content, .comment-section {
    background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), rgba(255,255,255,0.03)) ,
                rgba(255, 255, 255, 0.25);
    color: #1f2937;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.18);
    margin-bottom: 30px;
    backdrop-filter: blur(8px);

    h4, h3 {
      font-size: 28px;
      color: #1e3c72;
      margin-bottom: 16px;
    }

    .meta span, .comment-item .time {
      color: #1f2937;
      margin-right: 16px;
    }

    .article p, .comment-item .content {
      color: #1f2937;
      line-height: 1.8;
      white-space: pre-wrap;
    }

    .comment-item .user-info strong {
      color: #1f2937;
    }
    .comment-item .time {
      color: #1f2937;
      margin-left: 12px;
    }
  }
}
</style>
