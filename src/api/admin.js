import request from "../utils/request";

/**
 * 管理端接口封装
 */
export const getAdminLoginInfo = () => {
  return request.get("admin/loginInfo");
};

/** 头条列表（支持状态筛选） */
export const getAdminHeadlineList = (params) => {
  return request.post("admin/headline/list", params);
};

/** 删除头条 */
export const removeAdminHeadline = (hid) => {
  return request.post("admin/headline/remove", { hid });
};

/** 审核通过 */
export const approveHeadline = (hid) => {
  return request.post("admin/headline/approve", { hid });
};

/** 用户列表 */
export const getAdminUserList = (params) => {
  return request.post("admin/user/list", params);
};

/** 封禁或解禁用户 */
export const toggleUserBan = (uid, banned) => {
  return request.post("admin/user/ban", { uid, banned });
};

/** 数据面板：概览 */
export const getDashboardOverview = () => {
  return request.get("admin/dashboard/overview");
};

/** 数据面板：趋势 */
export const getDashboardTrend = (days = 7) => {
  return request.get("admin/dashboard/trend", { params: { days } });
};

/** 数据面板：阅读量 TOP10 */
export const getDashboardTopHeadlines = () => {
  return request.get("admin/dashboard/topHeadlines");
};

/** 轮播管理：列表 */
export const getAdminBannerList = (params) => {
  return request.post("banner/admin/list", params);
};

/** 轮播管理：新增 / 编辑 */
export const saveAdminBanner = (data) => {
  return request.post("banner/admin/save", data);
};

/** 轮播管理：修改状态 */
export const updateBannerStatus = (id, status) => {
  return request.post("banner/admin/status", { id, status });
};
