import axios from "axios";
import { ElMessage } from "element-plus";
import pinia from "../stores/index";
import { useUserInfoStore } from "../stores/userInfo";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// 配置 axios 实例
const service = axios.create({
  baseURL: "/app-dev/",
  timeout: 50000,
});

// 添加请求拦截器
service.interceptors.request.use((config) => {
  NProgress.start(); // 开启进度条
  const userInfoStore = useUserInfoStore(pinia);
  const token = userInfoStore.token;
  if (token) {
    config.headers["token"] = token;
  }
  return config;
});

// 添加响应拦截器
service.interceptors.response.use(
  (response) => {
    NProgress.done(); // 关闭进度条
    const { code, message, data } = response.data;
    if (code !== 200) {
      if (code === 501) return Promise.reject(ElMessage.error("用户名有误"));
      if (code === 503) return Promise.reject(ElMessage.error("密码有误"));
      if (code === 504) return Promise.reject(ElMessage.error("登录已过期"));
      if (code === 505) return Promise.reject(ElMessage.error("用户名占用"));
      if (code === 506) return Promise.reject(ElMessage.error("账号已被封禁"));
      if (code === 507) return Promise.reject(ElMessage.error("该头条待审核或不可访问"));
      if (code === 403) return Promise.reject(ElMessage.error("权限不足"));
      return Promise.reject(ElMessage.error(message || "请求失败"));
    }
    return data; // 返回成功响应数据中的 data
  },
  (error) => {
    NProgress.done(); // 关闭进度条
    return Promise.reject(error.message);
  }
);

export default service;
