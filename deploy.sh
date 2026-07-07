#!/bin/bash
# codexDemo 一键部署脚本（适配宝塔面板的 Debian 系统）
#
# 用法：
#   1. 通过宝塔"文件"功能上传 codexDemo-full.zip 和本脚本到 /root/
#   2. 在宝塔"终端"中执行：
#        cd /root && chmod +x deploy.sh && ./deploy.sh
#
# 可选参数：
#   ./deploy.sh --port=3000              # 自定义后端端口（默认3000）
#   ./deploy.sh --restart                # 仅重启服务（更新代码后用）
#   ./deploy.sh --skip-bt                # 跳过宝塔检测，按纯命令行模式部署

set -e

# ==================== 配置 ====================
APP_NAME="codexDemo"
APP_PORT=3000
RESTART_ONLY=false
SKIP_BT=false
ZIP_FILE="codexDemo-full.zip"

# 宝塔检测
BT_PANEL="/www/server/panel"
BT_WWWROOT="/www/wwwroot"
HAS_BT=false
if [ -d "$BT_PANEL" ]; then
    HAS_BT=true
fi

# 应用目录（宝塔环境用 /www/wwwroot，否则用 /var/www）
if [ "$HAS_BT" = true ]; then
    APP_DIR="$BT_WWWROOT/$APP_NAME"
else
    APP_DIR="/var/www/$APP_NAME"
fi

# 颜色
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
step()  { echo -e "\n${BLUE}========== $1 ==========${NC}"; }

# 解析参数
for arg in "$@"; do
    case $arg in
        --port=*)   APP_PORT="${arg#*=}";;
        --restart)  RESTART_ONLY=true;;
        --skip-bt)  SKIP_BT=true; HAS_BT=false; APP_DIR="/var/www/$APP_NAME";;
        *)          warn "未知参数: $arg";;
    esac
done

# ==================== 检查 root ====================
if [ "$EUID" -ne 0 ]; then
    error "请使用 root 用户运行，或在宝塔终端中执行"
fi

# ==================== 宝塔环境提示 ====================
if [ "$HAS_BT" = true ]; then
    info "检测到宝塔面板，将使用宝塔适配模式"
    info "应用目录: $APP_DIR"
    info "Nginx/SSL/防火墙将通过宝塔面板图形化配置（脚本末尾会给出操作步骤）"
fi

# ==================== 仅重启模式 ====================
if [ "$RESTART_ONLY" = true ]; then
    step "重启服务"
    cd $APP_DIR
    pm2 restart $APP_NAME || error "重启失败，请检查 $APP_NAME 是否存在"
    pm2 status $APP_NAME
    info "服务已重启"
    exit 0
fi

# ==================== 1. 环境检查与安装 ====================
step "1. 检查并安装依赖环境"

# Node.js
if ! command -v node &> /dev/null; then
    info "安装 Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs build-essential python3
else
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        warn "Node 版本过低（v$NODE_VERSION），升级到 20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    else
        info "Node.js $(node -v) 已安装"
    fi
fi

# 编译工具（better-sqlite3 需要）
if ! command -v gcc &> /dev/null; then
    info "安装编译工具..."
    apt install -y build-essential python3
fi

# pm2
if ! command -v pm2 &> /dev/null; then
    info "安装 pm2..."
    npm install -g pm2
fi

# unzip
if ! command -v unzip &> /dev/null; then
    info "安装 unzip..."
    apt install -y unzip
fi

# Nginx（宝塔环境由宝塔管理，纯命令行模式才自动装）
if [ "$HAS_BT" = false ]; then
    if ! command -v nginx &> /dev/null; then
        info "安装 Nginx..."
        apt install -y nginx
    fi
fi

info "环境检查通过"

# ==================== 2. 查找并解压项目 ====================
step "2. 查找并解压项目包"

ZIP_PATH=""
SEARCH_DIRS=("./" "/root/" "/tmp/" "/www/wwwroot/" "$(dirname "$0")/")
for dir in "${SEARCH_DIRS[@]}"; do
    if [ -f "${dir}${ZIP_FILE}" ]; then
        ZIP_PATH="${dir}${ZIP_FILE}"
        break
    fi
done

if [ -z "$ZIP_PATH" ]; then
    error "未找到 $ZIP_FILE，请通过宝塔文件管理上传到 /root/ 后重试"
fi

info "找到压缩包: $ZIP_PATH"

# 停止旧服务
if pm2 list 2>/dev/null | grep -q $APP_NAME; then
    info "停止旧服务..."
    pm2 stop $APP_NAME 2>/dev/null || true
    pm2 delete $APP_NAME 2>/dev/null || true
fi

# 备份现有数据
if [ -d "$APP_DIR" ] && [ -f "$APP_DIR/server/data.db" ]; then
    BACKUP_DIR="/backup/codexDemo_$(date +%Y%m%d_%H%M%S)"
    info "备份现有数据到 $BACKUP_DIR"
    mkdir -p $BACKUP_DIR
    cp $APP_DIR/server/data.db $BACKUP_DIR/ 2>/dev/null || true
    cp $APP_DIR/server/data.db-wal $BACKUP_DIR/ 2>/dev/null || true
    cp $APP_DIR/server/data.db-shm $BACKUP_DIR/ 2>/dev/null || true
    cp -r $APP_DIR/server/uploads $BACKUP_DIR/ 2>/dev/null || true
fi

# 解压
info "解压项目到 $APP_DIR..."
mkdir -p $APP_DIR
unzip -o "$ZIP_PATH" -d $APP_DIR > /dev/null
info "解压完成"

# ==================== 3. 安装项目依赖 ====================
step "3. 安装项目依赖"

cd $APP_DIR
info "执行 npm install（better-sqlite3 会编译原生模块，约1-2分钟）..."
npm install
info "依赖安装完成"

# ==================== 4. 构建前端 ====================
step "4. 构建前端"

if grep -q '"build"' package.json; then
    info "执行 npm run build..."
    npm run build
    if [ -d "dist" ]; then
        info "前端构建完成"
    else
        warn "构建后未找到 dist 目录"
    fi
else
    warn "未找到 build 脚本，跳过"
fi

# ==================== 5. 验证数据 ====================
step "5. 验证数据完整性"

if [ -f "server/data.db" ]; then
    DB_SIZE=$(du -h server/data.db | cut -f1)
    info "数据库: server/data.db ($DB_SIZE)"

    if command -v sqlite3 &> /dev/null; then
        TABLES=$(sqlite3 server/data.db ".tables" 2>/dev/null)
        if [ -n "$TABLES" ]; then
            info "数据库表: $TABLES"
            for table in swiper brand_story product admin channels; do
                if echo "$TABLES" | grep -qw "$table"; then
                    COUNT=$(sqlite3 server/data.db "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "?")
                    info "  - $table: $COUNT 条"
                fi
            done
        fi
    else
        warn "sqlite3 未安装，跳过表验证（可 apt install sqlite3）"
    fi
else
    warn "未找到数据库文件，首次启动后自动创建"
fi

if [ -d "server/uploads" ]; then
    UPLOAD_COUNT=$(find server/uploads -type f | wc -l)
    UPLOAD_SIZE=$(du -sh server/uploads | cut -f1)
    info "上传文件: $UPLOAD_COUNT 个，共 $UPLOAD_SIZE"
fi

[ -d "dist" ] && info "前端 dist 目录: 存在" || warn "前端 dist 目录: 不存在"

# ==================== 6. 启动后端服务 ====================
step "6. 启动后端服务（pm2）"

info "使用 pm2 启动..."
pm2 start server/index.js --name $APP_NAME
pm2 save

# 开机自启
pm2 startup systemd -u root --hp /root 2>/dev/null | grep "sudo" | bash 2>/dev/null || warn "请手动执行 pm2 startup 返回的命令"

sleep 3

# 健康检查
info "健康检查..."
if curl -s "http://localhost:$APP_PORT/api/swiper" > /dev/null 2>&1; then
    info "后端服务启动成功 (端口 $APP_PORT)"
else
    warn "后端可能未就绪，查看日志：pm2 logs $APP_NAME"
fi

# ==================== 7. Nginx 配置 ====================
step "7. Nginx 反向代理配置"

if [ "$HAS_BT" = true ]; then
    # 宝塔环境：跳过命令行配置，由宝塔面板操作
    info "宝塔环境：Nginx 配置请在宝塔面板中操作（见末尾说明）"
    info "跳过命令行 Nginx 配置"
else
    # 纯命令行模式
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ip.sb 2>/dev/null || echo "服务器IP")
    NGINX_CONF="/etc/nginx/conf.d/$APP_NAME.conf"

    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $PUBLIC_IP;

    client_max_body_size 500M;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/admin/upload {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        client_max_body_size 500M;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:$APP_PORT;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    if nginx -t 2>&1; then
        systemctl restart nginx
        systemctl enable nginx 2>/dev/null
        info "Nginx 配置完成"
    else
        warn "Nginx 配置测试失败，请检查: $NGINX_CONF"
    fi
fi

# ==================== 8. 防火墙 ====================
step "8. 防火墙配置"

if [ "$HAS_BT" = true ]; then
    info "宝塔环境：请在宝塔面板「安全」中放行 80 端口"
    info "云服务器还需在控制台安全组放行 80 端口"
else
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp 2>/dev/null || true
        ufw allow 80/tcp 2>/dev/null || true
        ufw --force enable 2>/dev/null || true
        info "ufw 防火墙已配置"
    else
        warn "请手动放行 80 端口"
    fi
fi

# ==================== 9. 定时备份 ====================
step "9. 配置定时备份"

mkdir -p /backup
cat > /backup/backup_codexDemo.sh << 'EOF'
#!/bin/bash
APP_DIR="/var/www/codexDemo"
if [ ! -d "$APP_DIR" ]; then APP_DIR="/www/wwwroot/codexDemo"; fi
BACKUP_DIR="/backup/codexDemo_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

cp $APP_DIR/server/data.db $BACKUP_DIR/ 2>/dev/null
cp $APP_DIR/server/data.db-wal $BACKUP_DIR/ 2>/dev/null
cp $APP_DIR/server/data.db-shm $BACKUP_DIR/ 2>/dev/null
cp -r $APP_DIR/server/uploads $BACKUP_DIR/ 2>/dev/null

find /backup -maxdepth 1 -name "codexDemo_*" -type d -mtime +7 -exec rm -rf {} \;
echo "[$(date)] 备份完成: $BACKUP_DIR"
EOF
chmod +x /backup/backup_codexDemo.sh

if ! crontab -l 2>/dev/null | grep -q "backup_codexDemo.sh"; then
    (crontab -l 2>/dev/null; echo "0 3 * * * /backup/backup_codexDemo.sh >> /backup/backup.log 2>&1") | crontab -
    info "已添加定时备份（每天凌晨3点）"
else
    info "定时备份已存在"
fi

# ==================== 完成 ====================
step "部署完成"

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ip.sb 2>/dev/null || echo "服务器IP")

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  codexDemo 部署成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "后端服务已启动 (pm2: $APP_NAME, 端口 $APP_PORT)"
echo ""

if [ "$HAS_BT" = true ]; then
    echo -e "${YELLOW}========== 宝塔面板还需完成以下配置 ==========${NC}"
    echo ""
    echo -e "${BLUE}【步骤1】安装 PM2 管理器（如果未装）${NC}"
    echo -e "  宝塔面板 → 软件商店 → 搜索「PM2管理器」→ 安装"
    echo -e "  （本脚本已用命令行 pm2 启动，此步为方便日后可视化管理）"
    echo ""
    echo -e "${BLUE}【步骤2】创建网站并配置反向代理${NC}"
    echo -e "  宝塔面板 → 网站 → 添加站点："
    echo -e"     域名：填你的域名或公网IP"
    echo -e"     根目录：$APP_DIR"
    echo -e"     PHP版本：纯静态"
    echo -e"  创建后 → 点击站点「设置」→ 反向代理 → 添加反向代理："
    echo -e"     代理名称：codexDemo"
    echo -e"     目标URL：http://127.0.0.1:$APP_PORT"
    echo -e"     发送域名：\$host"
    echo -e"  保存即可（宝塔会自动生成 Nginx 配置）"
    echo ""
    echo -e "${BLUE}【步骤3】配置上传文件大小限制${NC}"
    echo -e"  宝塔面板 → 网站 → 站点设置 → 配置文件"
    echo -e"  在 server 块内添加：client_max_body_size 500M;"
    echo -e"  或在宝塔「软件商店」→ Nginx → 设置 → 配置修改 中全局添加"
    echo -e"  保存后重载 Nginx"
    echo ""
    echo -e "${BLUE}【步骤4】申请 SSL 证书（可选，推荐有域名时配置）${NC}"
    echo -e"  宝塔面板 → 网站 → 站点设置 → SSL → Let's Encrypt"
    echo -e"  一键申请，自动续期"
    echo ""
    echo -e "${BLUE}【步骤5】放行端口${NC}"
    echo -e"  宝塔面板 → 安全 → 放行 80 端口"
    echo -e"  云服务器控制台安全组也需放行 80 端口"
    echo ""
    echo -e "${BLUE}【步骤6】定时备份（可选，脚本已添加 cron）${NC}"
    echo -e"  也可在 宝塔面板 → 计划任务 中添加："
    echo -e"     任务类型：Shell 脚本"
    echo -e"     任务名：备份codexDemo"
    echo -e"     执行周期：每天 03:00"
    echo -e"     脚本内容：/backup/backup_codexDemo.sh"
    echo ""
    echo -e "${YELLOW}========== 完成上述步骤后即可访问 ==========${NC}"
    echo ""
    echo -e "访问地址（完成步骤2后）："
    echo -e "  前台：http://<域名或IP>/"
    echo -e "  后台：http://<域名或IP>/admin"
    echo ""
else
    echo -e "访问地址:"
    echo -e "  前台首页：http://$PUBLIC_IP/"
    echo -e "  产品中心：http://$PUBLIC_IP/products"
    echo -e "  后台管理：http://$PUBLIC_IP/admin"
    echo ""
fi

echo -e "${YELLOW}[重要] 安全提醒:${NC}"
echo -e "  1. 登录后台立即修改默认密码（admin / admin123）"
echo -e "  2. 修改 server/config.js 中的 jwtSecret（openssl rand -hex 32）"
echo -e "  3. 修改后执行：pm2 restart $APP_NAME"
echo ""
echo -e "常用命令:"
echo -e "  pm2 status              # 查看服务状态"
echo -e "  pm2 logs $APP_NAME         # 查看日志"
echo -e "  pm2 restart $APP_NAME      # 重启服务"
echo -e "  ./deploy.sh --restart     # 快速重启"
echo ""
