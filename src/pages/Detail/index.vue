<template>
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
.seeDetails {
  width: 1200px;
  margin: 0 auto;
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
}

.headline-content {
  width: 800px;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  margin-bottom: 40px;

  h4 {
    font-size: 28px;
    margin: 0 0 20px 0;
    color: #1a1a1a;
  }

  .meta {
    margin-bottom: 20px;
    span {
      margin-right: 20px;
      color: #8d91aa;
      font-size: 14px;
    }
  }

  .article p {
    line-height: 2;
    color: #333;
    text-align: justify;
  }
}

.comment-section {
  width: 800px;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);

  h3 {
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }

  .add-comment {
    margin-bottom: 30px;
  }

  .comment-list {
    .comment-item {
      padding: 18px 0;
      border-bottom: 1px dashed #eee;

      &:last-child {
        border-bottom: none;
      }

      .user-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        color: #666;

        .time {
          color: #999;
        }
      }

      .content {
        margin: 0;
        color: #333;
        line-height: 1.6;
      }
    }
  }
}
</style>