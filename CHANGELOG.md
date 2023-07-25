# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.1](https://github.com/yuque/yuque-chrome-extension/compare/v0.3.0...v0.3.1) (2023-07-25)


### Features

* 保存成功后收起整个剪藏工具面板 ([#49](https://github.com/yuque/yuque-chrome-extension/issues/49)) ([0f8f320](https://github.com/yuque/yuque-chrome-extension/commit/0f8f320cce76196ebe9690cd32df2cc2427da30c))
* 支持 h1 到 h6 的剪藏 ([#46](https://github.com/yuque/yuque-chrome-extension/issues/46)) ([9133777](https://github.com/yuque/yuque-chrome-extension/commit/9133777cc2e326399ce008aadb06fe7c15cac902))


### Bug Fixes

* 清理掉 manifest.json 中未使用的 permission ([#50](https://github.com/yuque/yuque-chrome-extension/issues/50)) ([744bf21](https://github.com/yuque/yuque-chrome-extension/commit/744bf2147eaf567bb0d6ed4f9872545d42d9fa2b))
* 继续选取时不再提取当前页面的信息 ([#51](https://github.com/yuque/yuque-chrome-extension/issues/51)) ([666e46a](https://github.com/yuque/yuque-chrome-extension/commit/666e46a0a4bb2146834d1f347cf9d844896a933b))
* 解决反序列化导致节点丢失块信息出现任意键入后回删文本和图片的问题 ([#45](https://github.com/yuque/yuque-chrome-extension/issues/45)) ([895bd97](https://github.com/yuque/yuque-chrome-extension/commit/895bd97f8d7c6cda400e3b64340a8dac3f3ddba1))
* 请求 updates.xml 时使用 no-cache 策略 ([#47](https://github.com/yuque/yuque-chrome-extension/issues/47)) ([11b9187](https://github.com/yuque/yuque-chrome-extension/commit/11b91872bf98ee41009400fca551c04d054b393c))
* 调整 继续选取 到多选剪藏下 ([#48](https://github.com/yuque/yuque-chrome-extension/issues/48)) ([b321903](https://github.com/yuque/yuque-chrome-extension/commit/b321903102e20e46b88df1202e0a40857478ce20))

## [0.3.0](https://github.com/yuque/yuque-chrome-extension/compare/v0.2.1...v0.3.0) (2023-07-25)


### Bug Fixes

* 调整 book 选择器实现避免类型问题 ([#42](https://github.com/yuque/yuque-chrome-extension/issues/42)) ([a6cfc78](https://github.com/yuque/yuque-chrome-extension/commit/a6cfc788f4040e7592ab4b11cca8e479e1bbdc7f))

### [0.2.1](https://github.com/yuque/yuque-chrome-extension/compare/v0.2.0...v0.2.1) (2023-07-24)


### Features

* 保存后复原编辑器 ([#19](https://github.com/yuque/yuque-chrome-extension/issues/19)) ([3d208dd](https://github.com/yuque/yuque-chrome-extension/commit/3d208ddeb9688ba84f1e3b746c2747b038ad3d67))
* 去掉整页剪藏 ([#35](https://github.com/yuque/yuque-chrome-extension/issues/35)) ([1670e78](https://github.com/yuque/yuque-chrome-extension/commit/1670e7811271166ac5083c6663d4d3b8703bc4e3))
* 右键选择文字剪藏添加引用 ([#18](https://github.com/yuque/yuque-chrome-extension/issues/18)) ([657572c](https://github.com/yuque/yuque-chrome-extension/commit/657572c7cd57efb62c29ecb17c39874e327c07fb))
* 将 js 改为 ts ([#28](https://github.com/yuque/yuque-chrome-extension/issues/28)) ([659dcf5](https://github.com/yuque/yuque-chrome-extension/commit/659dcf5774bd600053f9d69cef4ad1a2449450ed))
* 支持自动检查新版本 ([#34](https://github.com/yuque/yuque-chrome-extension/issues/34)) ([3390af3](https://github.com/yuque/yuque-chrome-extension/commit/3390af39389a9d3333ddfd9d1f90014e0a299287))
* 新增剪藏编辑器工具栏 ([#12](https://github.com/yuque/yuque-chrome-extension/issues/12)) ([59a4cbb](https://github.com/yuque/yuque-chrome-extension/commit/59a4cbb80c028e0ca40419de2294ee5485579d26))
* 添加登录提示信息 ([#22](https://github.com/yuque/yuque-chrome-extension/issues/22)) ([fc01c7e](https://github.com/yuque/yuque-chrome-extension/commit/fc01c7e9030a3a02381b4ff876cc342d9d6cf4a2))
* 请求头增加 runtime.id ([#29](https://github.com/yuque/yuque-chrome-extension/issues/29)) ([e009a25](https://github.com/yuque/yuque-chrome-extension/commit/e009a252933cc376bd16f3e3af6ecd44c0cf44e1))


### Bug Fixes

* ci failed ([#33](https://github.com/yuque/yuque-chrome-extension/issues/33)) ([1d12843](https://github.com/yuque/yuque-chrome-extension/commit/1d1284382f59b2cfe27351d6f1a54d765fbab7db))
* 新增文档目录不展示问题 ([#21](https://github.com/yuque/yuque-chrome-extension/issues/21)) ([0a2e0b8](https://github.com/yuque/yuque-chrome-extension/commit/0a2e0b8f52e292bb6b5bb69774eca5057befab5b))
* 确保剪藏内容保存到文档去除网页引用标题 ([#20](https://github.com/yuque/yuque-chrome-extension/issues/20)) ([ee6a415](https://github.com/yuque/yuque-chrome-extension/commit/ee6a4155ce7d2d5c689a37c8a1e63af4ffc91991))
* 补充升级新版本的翻译 ([#36](https://github.com/yuque/yuque-chrome-extension/issues/36)) ([65b5ff5](https://github.com/yuque/yuque-chrome-extension/commit/65b5ff5f4c56983fd8193eca4a1b86200c0e3f9e))
* 解决 content-script 中全局 app 变量冲突的问题 ([#30](https://github.com/yuque/yuque-chrome-extension/issues/30)) ([e32cd90](https://github.com/yuque/yuque-chrome-extension/commit/e32cd90690cc52cfd51c262da6d6a4cd93d54fd5))
