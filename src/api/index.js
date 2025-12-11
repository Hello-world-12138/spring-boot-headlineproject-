import request from "../utils/request";
import { getToken } from "../utils/token-utils";

// portal/findAllTypes
export const getfindAllTypes = () => {
  return request.get("portal/findAllTypes");
};

// 分页带条件查询所有头条
export const getfindNewsPageInfo = (info) => {
  return request.post("portal/findNewsPage", info);
};

// 查看头条详情
export const getshowHeadlineDetail = (hid) => {
  return request.post("portal/showHeadlineDetail", { hid })
}

// headline/removeByHid
export const removeByHid = (id) => {
  return request({
    method: "post",
    url: "headline/removeByHid",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    data:`hid=${id}`
  })
};

// 登录
export const getLogin = (info) => {
  return request.post("user/login",info);
};

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: "user/loginInfo",
    method: 'get',
    headers: {
      Authorization: getToken()
    }
  });
};

// 注册校验 user/checkUserName
export const registerValidateApi = (username) => {
  return request({
    method: "post",
    url: "user/checkUserName",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    data:`username=${username}`
  })
};

// 注册
export const registerApi = (userInfo) => {
  return request.post("user/regist",userInfo)
}

// 判断用户登录过期
export const isUserOverdue = () => {
  return request.get("user/checkLogin")
}

// 修改头条回显
export const getFindHeadlineByHid = (id) => {
  return request({
      method: "post",
      url: "headline/findHeadlineByHid",
      headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
       data:`hid=${id}`
  });
};

// 点击保存修改的回调
export const saveOrAddNews = (news) => {
  return request.post("headline/update",news)
}

// headline/publish
export const issueNews = (news) => {
  return request.post("headline/publish",news)
}

// 个人中心 - 我发布的
export const getMyHeadlines = () => {
  return request.get("headline/my")
}

// 浏览记录
export const getBrowseHistory = () => {
  return request.get("headline/browseHistory")
}

// 发表评论
export const addComment = (comment) => {
  return request.post("comment/add", comment)
}

// 获取评论列表
export const getCommentList = (hid) => {
  return request.get("comment/list", { params: { hid } })
}

// 轮播图列表
export const getBannerList = (category) => {
  return request.get("banner/list", {
    params: { category }
  })
}
