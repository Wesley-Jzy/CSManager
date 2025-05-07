# CS电竞经理模拟器

CS电竞经理是一款基于React的网页游戏，模拟电子竞技俱乐部的经营管理。作为俱乐部经理，您需要管理选手、参加比赛、进行转会和升级设施，最终打造一支冠军战队。

![CS电竞经理模拟器](https://via.placeholder.com/800x400?text=CS%E7%94%B5%E7%AB%9E%E7%BB%8F%E7%90%86)

## 功能特点

- **比赛模块**：模拟CS比赛，支持BO1、BO3、BO5等多种比赛格式
- **选手管理**：训练选手提升属性，支付薪水，查看选手详细数据
- **选手招募**：从转会市场或选手草案中签约新选手
- **战队管理**：升级设施，获取赞助商，管理俱乐部财务

## 技术栈

- React 18
- Vite
- Tailwind CSS
- JavaScript (ES6+)

## 安装步骤

### 前提条件

确保您的系统已安装：
- Node.js (推荐v18或更高版本)
- npm (通常随Node.js一起安装)

### 安装指南

1. **克隆仓库**

```bash
git clone https://github.com/yourusername/cs-manager.git
cd cs-manager
```

2. **安装依赖**

```bash
npm install
```

## 启动项目

安装完成后，可以通过以下命令启动开发服务器：

```bash
npm run dev
```

应用将在 http://localhost:5173 启动，您可以在浏览器中访问该地址。

## 构建生产版本

要构建用于生产环境的优化版本，请运行：

```bash
npm run build
```

构建文件将生成在 `dist` 目录中。

## 项目结构

```
cs-manager/
├── src/                  # 源代码目录
│   ├── modules/          # 功能模块
│   │   ├── match/        # 比赛模块
│   │   ├── player/       # 选手管理模块
│   │   ├── recruitment/  # 选手招募模块
│   │   └── team/         # 战队管理模块
│   ├── App.jsx           # 主应用组件
│   ├── main.jsx          # 应用入口
│   └── index.css         # 全局样式
├── public/               # 静态资源
├── index.html            # HTML模板
└── package.json          # 项目依赖与脚本
```

## 游戏指南

1. **开始游戏**：启动后，您将看到主界面和侧边栏导航。
2. **管理选手**：在"选手管理"模块中训练选手提升属性。
3. **招募新选手**：通过"选手招募"模块从转会市场或选手草案中签约新选手。
4. **升级设施**：在"战队管理"模块升级训练中心、游戏之家和分析办公室。
5. **参加比赛**：在"比赛模块"中选择对手和比赛格式，赢得比赛以获取奖金和声誉。
6. **获取赞助**：随着声誉提升，吸引更高级的赞助商。

## 贡献指南

我们欢迎社区贡献！如果您想为项目做出贡献，请参考以下步骤：

1. Fork本仓库
2. 创建您的功能分支: `git checkout -b feature/amazing-feature`
3. 提交您的更改: `git commit -m 'Add some amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 打开一个Pull Request

## 许可证

本项目使用MIT许可证 - 详情请参阅LICENSE文件。

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 邮箱: ziyue.jiang97@gmail.com
- GitHub Issues: [https://github.com/Wesley-Jzy//cs-manager/issues](https://github.com/Wesley-Jzy//cs-manager/issues)
