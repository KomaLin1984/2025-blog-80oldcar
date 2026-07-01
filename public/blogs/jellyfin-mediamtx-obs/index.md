# 局域网环境下使用 Docker 部署 Jellyfin + MediaMTX + OBS 搭建校园低延迟直播系统

本文纯干货记录在局域网环境下，使用 Docker 部署 Jellyfin、MediaMTX 并结合 OBS 联动，搭建支持百路并发、低延迟且播放进度互不干扰的校园流媒体与直播系统。

---

## 一、 Docker 基础服务部署

### 1. Docker 部署 Jellyfin

在 Windows 环境下，我们需要把路径格式改成 Windows 的本地路径。本教程统一以 `C:\Jellyfin` 路径为例。

首先，在 C 盘根目录下创建一个名为 `Jellyfin` 的文件夹，并在其内部新建三个子文件夹：`config`、`cache`、`movies`。

接着，在 `C:\Jellyfin` 目录下创建一个 `docker-compose.yml` 文件，写入以下内容：

```yaml
version: '3.8'

services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    # Windows 环境下建议映射端口，host 模式在 Windows Docker 中支持有限
    ports:
      - "8096:8096"
      - "8920:8920" # HTTPS 端口（可选）
    volumes:
      - c:\Jellyfin\config:/config
      - c:\Jellyfin\cache:/cache
      - c:\Jellyfin\movies:/media
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all # 将 Windows 识别到的两块 2080Ti 全部映射进容器
              capabilities: [gpu, video]

打开 Windows PowerShell，切换到该目录并启动容器：
cd C:\Jellyfin
docker compose up -d

二、 OBS + MediaMTX 直播流联调
1. OBS 推流配置
打开 OBS ➔ 设置 ➔ 直播：

服务：选择 自定义...

服务器：rtmp://服务器地址:1935/

推流码：hls

2. 编写 Jellyfin 本地虚拟节目单与频道绑定
Jellyfin 电视直播必须绑定 EPG 节目单才能激活前端频道。在宿主机 C:\Jellyfin\movies（即容器内的 /media 目录）下新建两个本地文件：

文件一：live.xml（伪造 24 小时全天候节目单）
<?xml version="1.0" encoding="utf-8"?>
<tv generator-info-name="Custom">
  <channel id="school_live">
    <display-name>校园直播</display-name>
  </channel>
  <programme start="20260101000000 +0800" stop="20300101000000 +0800" channel="school_live">
    <title lang="zh">校园现场实时直播</title>
    <desc lang="zh">接收来自 OBS 的局域网高清信号</desc>
  </programme>
</tv>

文件二：tv.m3u（绑定流地址与节目单 ID）
#EXTM3U
#EXTINF:-1 tvg-id="school_live" tvg-name="校园直播" group-title="校园直播", 校园高清直播间
http://服务器地址:8888/hls/index.m3u8

3. Jellyfin 后台电视直播对接
进入 Jellyfin 后台 ➔ 电视直播。

调谐器设备：点击添加，类型选择 M3U，路径填写容器内的映射路径：/media/tv.m3u（或宿主机绝对路径 C:\Jellyfin\movies\tv.m3u）。

电视节目指南数据提供商：点击添加，类型选择 XMLTV，路径填写：/media/live.xml（或宿主机绝对路径 C:\Jellyfin\movies\live.xml）。

进入 计划任务 ➔ 执行 “刷新电视节目指南”，即可成功激活前端直播频道。

三、 解决百路终端同账号看片进度冲突（无痕播放）
当 100 个教室同时登录同一个公共账号看片时，播放进度会互相覆盖、打架。可以通过以下方案彻底实现“无痕播放”。

1. 全局废除进度保存
进入 Jellyfin 后台 ➔ 控制台 ➔ 播放 ➔ 恢复。

找到 “最小恢复时长（秒）”（默认 300 秒），强行修改为 999999（约 277 个小时）。

原理：将触发记忆播放的门槛提高到 277 小时，使得限制条件永远无法触发。系统对任何终端均“只播不记”，关闭网页即蒸发进度，下次点开永远从 00:00 从头播放。

2. 净化主页 UI
进入该公共账号的 首页设置 标签页：

将主屏幕模块中的 “继续观看” 彻底修改为 “无”。

这样能使多台设备并发登录时的主页更加干净整洁，避免学生看到其他班级的播放残留。

💾 资源下载与说明
具体配置文件可以到我的百度网盘链接下载：https://pan.baidu.com/s/19RptjlTk5msnkC0AwgNZ3A#list/path=%2F

希望大家多多支持我的网站，后期百度网盘会持续更新一些我日常觉得好用的工具软件。
🌐 官方网站：www.80oldcar.com (80后老车)

欢迎大家的转载，请务必标明出处。

