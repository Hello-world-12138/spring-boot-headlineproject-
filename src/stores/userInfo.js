import { defineStore } from 'pinia';
import { getToken, removeToken, setToken } from '../utils/token-utils';
import { getLogin, getUserInfo } from '../api/index';

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    token: getToken(),
    nickName: '',
    uid: '',
    role: 0,
  }),

  actions: {
    // 登陆的异步action
    async login(loginForm) {
      const result = await getLogin(loginForm);
      const token = result.token;
      this.role = result.role ?? 0;
      this.token = token;
      setToken(token);
      await this.getInfo();
    },
    async getInfo() {
      const result = await getUserInfo();
      this.nickName = result.loginUser.nickName;
      this.uid = result.loginUser.uid;
      this.role = result.loginUser.role ?? 0;
    },
    initUserInfo() {
      removeToken();
      this.nickName = "";
      this.uid = "";
      this.token = "";
      this.role = 0;
    },
  },
});
