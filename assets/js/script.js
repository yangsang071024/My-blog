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
    initSkillsAnimation();
    
    // --- 新增功能 ---
    initScrollReveal();   // 滚动显现
    initTypingEffect();   // 英雄区打字机效果
    initLogoTypingEffect(); // 导航栏Logo打字机效果
    init3DTilt();         // 卡片3D倾斜
    initScrollProgress(); // 阅读进度条
    initEasterEgg();      // 彩蛋功能：点击头像5次跳转
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
    loadSettings();
}

// 加载保存的设置
function loadSettings() {
    const savedBg = localStorage.getItem('customBg');
    const savedColor = localStorage.getItem('themeColor');
    const savedFontSize = localStorage.getItem('fontSize');
    const savedAnimation = localStorage.getItem('animationEnabled');
    const savedTheme = localStorage.getItem('theme');

    // 加载主题
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
    } else {
        document.body.removeAttribute('data-theme');
    }

    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        const videoBg = document.querySelector('.bg-video');
        if (videoBg) videoBg.style.display = 'none';
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
    if (!timeDisplay) return; // 如果元素不存在，直接返回
    
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
    const footerYear = document.getElementById('footerYear');
    if (!footerYear) return; // 如果元素不存在，直接返回
    const year = new Date().getFullYear();
    footerYear.textContent = year;
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
    if (!commentsList) return;
    
    commentsList.innerHTML = '';

    // 如果没有评论，显示示例评论
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="comment-item">
                <div class="comment-header">
                    <strong>示例用户</strong>
                    <span class="comment-time">刚刚</span>
                </div>
                <p class="comment-content">这是一条示例评论。你的评论将出现在这里！</p>
            </div>
        `;
        return;
    }

    comments.forEach((comment) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item';
        commentElement.innerHTML = `
            <div class="comment-header">
                <strong>${escapeHtml(comment.name)}</strong>
                <span class="comment-time">${comment.timestamp}</span>
                <button class="delete-comment-btn" onclick="deleteComment(${comment.id})" title="删除评论">✕</button>
            </div>
            <p class="comment-content">${escapeHtml(comment.text)}</p>
        `;
        commentsList.appendChild(commentElement);
    });
}

// 删除评论
function deleteComment(commentId) {
    if (confirm('确定要删除这条评论吗？')) {
        let comments = JSON.parse(localStorage.getItem('comments') || '[]');
        // 使用id删除，而不是index
        comments = comments.filter(comment => comment.id !== commentId);
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
    const images = document.querySelectorAll('img[loading="lazy"][data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('loading');
                    observer.unobserve(img);
                }
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
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    if (currentTheme === 'light') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

// ============ 复制功能 ============

// 复制邮箱地址
function copyEmail() {
    const email = 'yang3346169171@hotmail.com';
    copyToClipboard(email, '✅ 邮箱地址已复制：' + email + '\n💡 可以粘贴到邮件客户端或搜索框');
}

// 复制微信号
function copyWechat() {
    const wechatId = 'mimeme_Male-god';
    copyToClipboard(wechatId, '✅ 微信号已复制：' + wechatId + '\n💡 请打开微信搜索添加好友');
}

// 通用复制到剪贴板函数
function copyToClipboard(text, successMessage) {
    // 尝试使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification(successMessage || '✅ 已复制到剪贴板：' + text);
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopy(text, successMessage);
        });
    } else {
        // 降级方案：使用传统方法
        fallbackCopy(text, successMessage);
    }
}

// 降级复制方案
function fallbackCopy(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification(successMessage || '✅ 已复制到剪贴板：' + text);
        } else {
            showNotification('❌ 复制失败，请手动复制：' + text);
        }
    } catch (err) {
        console.error('复制失败:', err);
        showNotification('❌ 复制失败，请手动复制：' + text);
    } finally {
        document.body.removeChild(textArea);
    }
}

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 1000); // 强制显示1秒，防止闪现
});
// ============ 新增动画功能 ============

// 1. 滚动显现 (Scroll Reveal) - 修正版
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .skill-item');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;

            // 关键修正：增加 check !reveal.classList.contains('active')
            // 只有当元素还未显示时，才执行动画逻辑
            if (elementTop < windowHeight - elementVisible && !reveal.classList.contains('active')) {
                
                reveal.classList.add('active');
                
                // 特殊处理技能条
                if(reveal.classList.contains('skill-item')) {
                    const progressBar = reveal.querySelector('.progress');
                    if (progressBar) {
                        // 获取目标宽度（从data-width属性或style属性）
                        const dataWidth = progressBar.getAttribute('data-width');
                        const targetWidth = dataWidth || (progressBar.getAttribute('style')?.match(/width:\s*(\d+%)/)?.[1] || '0%');
                        
                        // 重置并重新触发动画
                        progressBar.style.width = '0%';
                        setTimeout(() => {
                            progressBar.style.width = targetWidth; 
                        }, 100);
                    }
                }
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // 初始检查
}

// 2. 通用打字机效果函数（循环显示同一文本）
function createTypingEffect(element, text, typeSpeed = 100, deleteSpeed = 50, pauseTime = 2000) {
    if (!element || !text) return;
    
    let charIndex = 0;
    let isDeleting = false;
    let currentSpeed = typeSpeed;
    
    element.classList.add('typing-cursor');
    element.textContent = '';
    
    function type() {
        if (isDeleting) {
            // 删除模式：快速删除
            element.textContent = text.substring(0, charIndex - 1);
            charIndex--;
            currentSpeed = deleteSpeed;
        } else {
            // 打字模式：缓慢打出
            element.textContent = text.substring(0, charIndex + 1);
            charIndex++;
            currentSpeed = typeSpeed;
        }
        
        if (!isDeleting && charIndex === text.length) {
            // 打字完成，暂停后开始删除
            isDeleting = true;
            currentSpeed = pauseTime;
        } else if (isDeleting && charIndex === 0) {
            // 删除完成，重新开始打字
            isDeleting = false;
            currentSpeed = 500; // 删除和打字之间的短暂暂停
        }
        
        setTimeout(type, currentSpeed);
    }
    
    type();
}

// 3. 英雄区打字机效果
function initTypingEffect() {
    const subtitleElement = document.querySelector('.hero-subtitle');
    if (!subtitleElement) return;
    
    const originalText = subtitleElement.textContent.trim();
    if (originalText) {
        // 使用原始文本，实现循环打字机效果
        createTypingEffect(subtitleElement, originalText, 100, 50, 2000);
    }
}

// 4. 导航栏Logo打字机效果
function initLogoTypingEffect() {
    const logoNameElement = document.querySelector('.logo-name');
    if (!logoNameElement) return;
    
    // 获取原始文本（从所有char span中提取）
    const charSpans = logoNameElement.querySelectorAll('.char');
    let originalText = '';
    charSpans.forEach(span => {
        originalText += span.textContent;
    });
    
    if (originalText) {
        // 清空原有的char spans，准备用打字机效果替换
        logoNameElement.innerHTML = '';
        // CSS已经为.logo-name设置了渐变色样式
        createTypingEffect(logoNameElement, originalText, 150, 30, 2000);
    }
}

// 3. 卡片 3D 倾斜效果 (类似 Apple TV 效果)
function init3DTilt() {
    const cards = document.querySelectorAll('.blog-card, .contact-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // 鼠标在卡片内的x坐标
            const y = e.clientY - rect.top;  // 鼠标在卡片内的y坐标
            
            // 计算中心点
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // 计算旋转角度 (最大旋转10度)
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            card.style.transition = 'transform 0.1s ease';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.transition = 'transform 0.5s ease';
        });
    });
}

// 4. 顶部阅读进度条
function initScrollProgress() {
    // 动态创建一个进度条元素
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });
}
// ============ 技能条进出场动画 ============
function initSkillsAnimation() {
    const skillSection = document.querySelector('.skills-section') || document.getElementById('skills');
    if (!skillSection) return; // 如果技能区域不存在，直接返回
    
    const progressBars = skillSection.querySelectorAll('.progress');
    const skillNums = skillSection.querySelectorAll('.skill-num');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // === 进入视口：开始动画 ===
                
                // 1. 动画进度条宽度
                progressBars.forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    if (width) {
                        bar.style.width = width;
                    }
                });

                // 2. 数字计数动画
                skillNums.forEach(num => {
                    const target = parseInt(num.getAttribute('data-target')) || 0;
                    animateValue(num, 0, target, 1500); // 1500ms duration
                });

            } else {
                // === 离开视口：重置为零 ===
                
                // 1. 重置进度条
                progressBars.forEach(bar => {
                    bar.style.width = '0%';
                });

                // 2. 重置数字
                skillNums.forEach(num => {
                    num.textContent = '0%';
                });
            }
        });
    }, { threshold: 0.2 }); // 当 20% 的区域可见时触发

    observer.observe(skillSection);
}

// 数字计数辅助函数
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start) + "%";
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ============ 彩蛋功能：点击头像5次跳转到Easter.html ============
function initEasterEgg() {
    const heroAvatar = document.getElementById('heroAvatar');
    if (!heroAvatar) return;
    
    let clickCount = 0;
    let clickTimeout = null;
    const REQUIRED_CLICKS = 5;
    const RESET_TIME = 2000; // 2秒内没有点击则重置计数
    
    // 显示提示文字的函数
    function showHint(text) {
        // 移除之前的提示（如果存在）
        const existingHint = document.querySelector('.easter-hint');
        if (existingHint) {
            existingHint.remove();
        }
        
        // 创建新的提示元素
        const hint = document.createElement('div');
        hint.className = 'easter-hint';
        hint.textContent = text;
        
        // 将提示添加到avatar容器中
        const avatarContainer = heroAvatar.parentElement;
        avatarContainer.style.position = 'relative';
        avatarContainer.appendChild(hint);
        
        // 2秒后自动移除（动画会在1.7秒后开始淡出，2秒后完全移除）
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 2000);
    }
    
    heroAvatar.addEventListener('click', function() {
        clickCount++;
        
        // 清除之前的重置定时器
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }
        
        // 第一次点击：显示"这里什么都没有的"
        if (clickCount === 1) {
            showHint('这里什么都没有的');
        }
        
        // 第三次点击：显示"被发现了!!!"
        if (clickCount === 3) {
            showHint('被发现了!!!');
        }
        
        // 如果达到5次点击，跳转到Easter.html
        if (clickCount >= REQUIRED_CLICKS) {
            window.location.href = 'pages/Easter.html';
            return;
        }
        
        // 设置重置定时器：2秒内没有继续点击则重置计数
        clickTimeout = setTimeout(() => {
            clickCount = 0;
        }, RESET_TIME);
    });
    
    // 添加鼠标悬停提示（可选）
    heroAvatar.style.cursor = 'pointer';
    heroAvatar.title = '点击试试？';
}