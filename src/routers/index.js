import { createRouter, createWebHistory } from 'vue-router';
import { staticRoutes } from './routes';
import { getToken } from '../utils/token-utils';
import pinia from '../stores';
import { useUserInfoStore } from '../stores/userInfo';

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
});

const userInfoStore = useUserInfoStore(pinia);

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const token = getToken();
  if (token) {
    // 已登录用户访问 login/register 直接跳首页
    if (to.name === 'Login' || to.name === 'Register') {
      next({ name: 'HeadlineNews' });
    } else {
      if (userInfoStore.nickName) {
        next();
      } else {
        try {
          await userInfoStore.getInfo();
          next();
        } catch (err) {
          userInfoStore.initUserInfo();
          next({ name: 'Login' });
        }
      }
    }
  } else {
    next(); // 没有 token 可以访问任意页面
  }
});

export default router;