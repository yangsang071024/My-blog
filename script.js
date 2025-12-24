/* ============================================
   杨晓宇 - 个人博客 JavaScript 交互脚本
   ============================================ */

// ============ 初始化 ============
document.addEventListener('DOMContentLoaded', function() {
    initSettings();
    initTime();
    updateFooterYear();
    initBackToTop();
    initNavigation();
    initComments();
    startAnimationCounters();
});

// ============ 设置面板功能 ============
function initSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.querySelector('.settings-panel');
    const closeSettingsBtn = document.getElementById('closeSettings');
    const bgUpload = document.getElementById('bgUpload');
    const colorPicker = document.getElementById('colorPicker');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const animationToggle = document.getElementById('animationToggle');

    // 打开设置面板
    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.add('open');
    });

    // 关闭设置面板
    closeSettingsBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
    });

    // 背景图片上传
    bgUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                // 1. 设置 body 背景
                document.body.style.backgroundImage = `url(${event.target.result})`;
                // 2. 关键修复：添加背景样式，保证图片铺满且不重复
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
                
                // 3. 关键修复：隐藏视频层，否则图片会被挡住
                const videoBg = document.querySelector('.bg-video');
                if (videoBg) videoBg.style.display = 'none';

                localStorage.setItem('customBg', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // 颜色主题改变
    colorPicker.addEventListener('change', function(e) {
        const color = e.target.value;
        document.documentElement.style.setProperty('--primary-color', color);
        localStorage.setItem('themeColor', color);
    });

    // 字体大小调整
    fontSizeSlider.addEventListener('input', function(e) {
        const size = e.target.value;
        document.documentElement.style.fontSize = size + 'px';
        document.getElementById('fontSizeDisplay').textContent = size + 'px';
        localStorage.setItem('fontSize', size);
    });

    // 动画开关
    animationToggle.addEventListener('change', function(e) {
        if (!e.target.checked) {
            document.body.style.setProperty('--animation-duration', '0s');
            document.documentElement.style.setProperty('--animation-duration', '0s');
            document.body.classList.add('no-animation');
        } else {
            document.body.style.removeProperty('--animation-duration');
            document.documentElement.style.removeProperty('--animation-duration');
            document.body.classList.remove('no-animation');
        }
        localStorage.setItem('animationEnabled', e.target.checked);
    });

    // 加载保存的设置
function loadSettings() {
    const savedBg = localStorage.getItem('customBg');
    // ... 其他变量 ...

    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        
        // 关键修复：如果有缓存的壁纸，也要隐藏视频
        const videoBg = document.querySelector('.bg-video');
        if (videoBg) videoBg.style.display = 'none';
    }

    // ... 其他代码保持不变 ...
}

    // ... 其他代码保持不变 ...
}

// 加载保存的设置
function loadSettings() {
    const savedBg = localStorage.getItem('customBg');
    const savedColor = localStorage.getItem('themeColor');
    const savedFontSize = localStorage.getItem('fontSize');
    const savedAnimation = localStorage.getItem('animationEnabled');

    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
    }

    if (savedColor) {
        document.getElementById('colorPicker').value = savedColor;
        document.documentElement.style.setProperty('--primary-color', savedColor);
    }

    if (savedFontSize) {
        document.getElementById('fontSizeSlider').value = savedFontSize;
        document.documentElement.style.fontSize = savedFontSize + 'px';
        document.getElementById('fontSizeDisplay').textContent = savedFontSize + 'px';
    }

    if (savedAnimation === 'false') {
        document.getElementById('animationToggle').checked = false;
        document.body.classList.add('no-animation');
    }
}

// 保存设置
function saveSetting() {
    showNotification('⚙️ 设置已保存！');
}

// 重置背景
function resetBg() {
    document.body.style.backgroundImage = '';
    
    // 关键修复：恢复视频显示
    const videoBg = document.querySelector('.bg-video');
    if (videoBg) videoBg.style.display = 'block';

    document.getElementById('bgUpload').value = '';
    localStorage.removeItem('customBg');
    showNotification('🖼️ 壁纸已重置！');
}

// 恢复默认设置
function resetAllSettings() {
    localStorage.clear();
    location.reload();
}

// ============ 时间显示 ============
function initTime() {
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const timeDisplay = document.getElementById('timeDisplay');
    const now = new Date();
    
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const timeString = now.toLocaleDateString('zh-CN', options);
    timeDisplay.innerHTML = `🕐 ${timeString}`;
}

// ============ 页脚年份 ============
function updateFooterYear() {
    const year = new Date().getFullYear();
    document.getElementById('footerYear').textContent = year;
}

// ============ 返回顶部 ============
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) {
        console.warn('返回顶部按钮未找到');
        return;
    }
    
    // 检查滚动位置并显示/隐藏按钮
    function checkScroll() {
        if (window.scrollY > 300 || document.documentElement.scrollTop > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // 初始检查

    // 点击按钮返回顶部
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 使用更兼容的滚动方法
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        
        // 备用方案
        setTimeout(() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 100);
        
        console.log('返回顶部按钮被点击');
    });
}

// ============ 导航 ============
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 平滑滚动到指定位置
function scrollTo(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 立即跳转（无平滑过渡），用于“立即联系”按钮
function jumpTo(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'auto',
            block: 'start'
        });
        // 同步更新地址栏锚点（可选）
        try { window.location.hash = '#' + sectionId; } catch (e) {}
    }
}

// ============ 评论功能 ============
function initComments() {
    const storedComments = localStorage.getItem('comments');
    if (storedComments) {
        const comments = JSON.parse(storedComments);
        displayComments(comments);
    }
}

function submitComment() {
    const nameInput = document.getElementById('commentName');
    const emailInput = document.getElementById('commentEmail');
    const textInput = document.getElementById('commentText');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) {
        showNotification('❌ 请填写名字和评论内容！');
        return;
    }

    const comment = {
        id: Date.now(),
        name: name,
        email: email,
        text: text,
        timestamp: new Date().toLocaleString('zh-CN')
    };

    // 保存到localStorage
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.unshift(comment);
    localStorage.setItem('comments', JSON.stringify(comments));

    // 清空输入框
    nameInput.value = '';
    emailInput.value = '';
    textInput.value = '';

    // 刷新显示
    displayComments(comments);
    showNotification('✅ 评论发送成功！感谢您的支持！');
}

function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';

    comments.forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item';
        commentElement.innerHTML = `
            <div class="comment-header">
                <strong>${escapeHtml(comment.name)}</strong>
                <span class="comment-time">${comment.timestamp}</span>
                <button class="delete-comment-btn" onclick="deleteComment(${index})" title="删除评论">✕</button>
            </div>
            <p class="comment-content">${escapeHtml(comment.text)}</p>
        `;
        commentsList.appendChild(commentElement);
    });
}

// 删除评论
function deleteComment(index) {
    if (confirm('确定要删除这条评论吗？')) {
        let comments = JSON.parse(localStorage.getItem('comments') || '[]');
        comments.splice(index, 1);
        localStorage.setItem('comments', JSON.stringify(comments));
        displayComments(comments);
        showNotification('✅ 评论已删除！');
    }
}

// ============ 数字计数动画 ============
function startAnimationCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// ============ 工具函数 ============

// 通知提示
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 防XSS - HTML转义
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============ 动画关键帧定义 ============
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }

    .no-animation * {
        animation: none !important;
        transition: none !important;
    }
`;
document.head.appendChild(style);

// ============ 键盘快捷键 ============
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K 打开设置
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('settingsBtn').click();
    }
    
    // Esc 关闭设置
    if (e.key === 'Escape') {
        document.querySelector('.settings-panel').classList.remove('open');
    }
});

// ============ 性能优化 - 懒加载 ============
if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('loading');
                observer.unobserve(img);
            }
        });
    });
    images.forEach(img => imageObserver.observe(img));
}

// ============ 欢迎信息 ============
console.log('%c欢迎来到杨晓宇的个人博客！🎉', 'font-size: 20px; color: #6366f1; font-weight: bold;');
console.log('%c这是一个充满创意和科技感的博客网站', 'font-size: 14px; color: #8b5cf6;');
console.log('%c快捷键：Ctrl+K 打开设置面板', 'font-size: 12px; color: #06b6d4;');

// ============ 视频播放控制 ============

// 播放/暂停切换
function togglePlay(button) {
    const videoContainer = button.closest('.video-container');
    const video = videoContainer.querySelector('.blog-video');
    
    if (video.paused) {
        video.play();
        button.textContent = '⏸ 暂停';
    } else {
        video.pause();
        button.textContent = '▶ 播放';
    }
}

// 设置播放速度
function setPlaybackSpeed(slider) {
    const videoContainer = slider.closest('.video-container');
    const video = videoContainer.querySelector('.blog-video');
    const speedLabel = videoContainer.querySelector('.speed-label');
    const speed = parseFloat(slider.value);
    
    video.playbackRate = speed;
    speedLabel.textContent = speed.toFixed(1) + 'x';
}

// 全屏播放
function toggleFullscreen(button) {
    const videoContainer = button.closest('.video-container');
    
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
            alert(`无法进入全屏模式: ${err.message}`);
        });
        button.textContent = '⛶ 退出';
    } else {
        document.exitFullscreen();
        button.textContent = '⛶ 全屏';
    }
}

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
    const buttons = document.querySelectorAll('.fullscreen-btn');
    buttons.forEach(button => {
        if (document.fullscreenElement) {
            button.textContent = '⛶ 退出';
        } else {
            button.textContent = '⛶ 全屏';
        }
    });
});
