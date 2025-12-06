import { createRouter, createWebHistory } from 'vue-router';
import { staticRoutes } from './routes';
import { getToken } from '../utils/token-utils';
import pinia from '../stores';
import { useUserInfoStore } from '../stores/userInfo';
import { ElMessage } from 'element-plus';

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
});

const userInfoStore = useUserInfoStore(pinia);

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const token = getToken();
  const needAdmin = to.path.startsWith('/admin');
  if (token) {
    if (to.name === 'Login' || to.name === 'Register') {
      return next({ name: 'HeadlineNews' });
    }
    if (!userInfoStore.nickName) {
      try {
        await userInfoStore.getInfo();
      } catch (err) {
        userInfoStore.initUserInfo();
        return next({ name: 'Login' });
      }
    }
    if (needAdmin && userInfoStore.role !== 1) {
      ElMessage.warning('权限不足');
      return next({ name: 'HeadlineNews' });
    }
    return next();
  }
  if (needAdmin) {
    ElMessage.warning('权限不足');
    return next({ name: 'HeadlineNews' });
  }
  return next();
});

export default router;
