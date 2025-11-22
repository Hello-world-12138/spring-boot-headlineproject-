# 文件：前端项目根目录/Dockerfile
# 多阶段构建：先构建，再运行（最终镜像只有 80MB 左右）
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com   # 用国内镜像更快

COPY . .
RUN npm run build   # 会生成 dist 目录

# 第二阶段：用 nginx 提供静态文件
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# 复制自定义 nginx 配置（解决 vue history 模式 404 问题）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]