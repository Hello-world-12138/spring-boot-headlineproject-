import request from "../utils/request"
import { getToken } from "../utils/token-utils";  // 新增：导入 getToken 用于传递 token 到 header

// portal/findAllTypes
//获取分类列表
export const getfindAllTypes = () => {
  return request.get("portal/findAllTypes");
};
// 分页带条件查询所有头条
export const getfindNewsPageInfo = (info) => {
  return request.post("portal/findNewsPage",info);
};
// 查看头条详情
// api/index.js → 完全替换 getshowHeadlineDetail
export const getshowHeadlineDetail = (hid) => {
  return request.post("portal/showHeadlineDetail", { hid })
}

//删除的回调
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

//登录的接口
export const getLogin = (info) => {
  return request.post("user/login",info);
};
//获取用户信息的接口
export const getUserInfo = () => {  // 修改：移除无用参数 info，直接返回；URL 改为 "user/loginInfo"；添加 token 到 header
  return request({
    url: "user/loginInfo",
    method: 'get',
    headers: {
      Authorization: getToken()  // 传递 token 到 header（后端 @RequestHeader String token）
    }
  });
};

//注册校验的接口  user/checkUserName
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

// 注册的接口
export const registerApi = (userInfo) => {
  return request.post("user/regist",userInfo)
}
//判断用户登录过期的接口
export const isUserOverdue = () => {
  return request.get("user/checkLogin")
}

// 修改头条回显的接口
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

//点击保存修改的回调
// headline/update
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
