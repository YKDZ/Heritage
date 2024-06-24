# Heritage

由 YK_DZ 制作的，关于非物质文化遗产保护和宣传的论坛站点。

涉及的技术栈如下：

- Vite
- Vue.js
- Tailwind CSS
- Express.js
- Prisma ORM

## 运行

本项目需要 `Node.js 18+` 作为运行环境，后端则需要安装 `MySQL Server`，连接参数填写在 `./api/.env` 中。

### 启动测试服务器

```
cd ./client
npm install
npm run dev

cd ./api
npm install
npx prisma generate
npm run dev
```

## 打包前端

```
cd ./client
npx vite build
```
