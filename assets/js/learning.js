/* ============================================
   学习路线页面 JavaScript
   ============================================ */

// 学习数据
let learningData = {};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadLearningData();
    initTreeNodes();
    initKnowledgeItems();
    updateOverallProgress();
    initPathStages();
});

// 初始化知识点项的折叠功能
function initKnowledgeItems() {
    document.querySelectorAll('.knowledge-item').forEach(item => {
        const header = item.querySelector('.item-header');
        const note = item.querySelector('.item-note');
        
        if (header && note) {
            // 移除内联的display: none样式，使用CSS控制
            if (note.style.display === 'none') {
                note.style.display = '';
            }
            
            // 确保所有知识点项都有折叠图标
            if (!header.querySelector('.item-toggle-icon')) {
                // 创建折叠图标
                const icon = document.createElement('i');
                icon.className = 'fas fa-chevron-right item-toggle-icon';
                header.insertBefore(icon, header.firstChild);
            }
            
            // 移除所有旧的onclick属性，统一使用事件监听器
            header.removeAttribute('onclick');
            
            // 移除可能存在的旧事件监听器，添加新的事件监听器
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            // 为新header添加点击事件
            newHeader.addEventListener('click', function(e) {
                // 如果点击的是select或button，不触发折叠
                if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || 
                    e.target.closest('select') || e.target.closest('button') ||
                    e.target.closest('.item-actions')) {
                    return;
                }
                toggleItem(this);
            });
        }
    });
}

// 加载学习数据
function loadLearningData() {
    const saved = localStorage.getItem('learningData');
    if (saved) {
        try {
            learningData = JSON.parse(saved);
            applySavedData();
        } catch (e) {
            console.error('加载学习数据失败:', e);
            learningData = {};
        }
    } else {
        // 首次加载，将HTML部分设为已完成
        markHTMLAsCompleted();
    }
}

// 将HTML和CSS部分标记为已完成
function markHTMLAsCompleted() {
    const htmlItems = [
        'html-h1', 'html-p', 'html-br', 'html-hr',
        'html-ul', 'html-ol', 'html-li',
        'html-img', 'html-video',
        'html-a',
        'html-table',
        'html-input', 'html-form', 'html-label', 'html-select',
        'html-block', 'html-inline'
    ];
    
    const cssItems = [
        'css-selectors', 'css-box-model', 'css-layout',
        'css-colors', 'css-typography',
        'css-animations', 'css-transforms', 'css-responsive',
        'css-variables', 'css-positioning', 'css-pseudo',
        'css-flexbox', 'css-grid', 'css-filters'
    ];
    
    const jsItems = [
        'js-variables', 'js-functions', 'js-dom',
        'js-arrays', 'js-objects',
        'js-event-listeners', 'js-event-object',
        'js-async', 'js-es6', 'js-closures',
        'js-this', 'js-json', 'js-storage'
    ];
    
    [...htmlItems, ...cssItems, ...jsItems].forEach(itemId => {
        if (!learningData[itemId]) {
            learningData[itemId] = {};
        }
        learningData[itemId].status = 'completed';
    });
    
    saveLearningData();
    applySavedData();
}

// 应用保存的数据
function applySavedData() {
    // 应用状态 - 先从localStorage读取，如果没有则从select的selected属性读取
    document.querySelectorAll('.knowledge-item').forEach(item => {
        const itemId = item.getAttribute('data-id');
        const select = item.querySelector('.status-select');
        
        if (itemId && select) {
            let status;
            
            // 优先从localStorage读取
            if (learningData[itemId] && learningData[itemId].status) {
                status = learningData[itemId].status;
            } else {
                // 如果没有，检查select的selected属性
                const selectedOption = select.querySelector('option[selected]');
                if (selectedOption) {
                    status = selectedOption.value;
                } else {
                    status = select.value || 'not-started';
                }
            }
            
            item.setAttribute('data-status', status);
            select.value = status;
            
            // 保存到learningData
            if (!learningData[itemId]) {
                learningData[itemId] = {};
            }
            learningData[itemId].status = status;
        }
    });

    // 应用笔记
    Object.keys(learningData).forEach(itemId => {
        const noteData = learningData[itemId].note;
        if (noteData) {
            const noteTextarea = document.querySelector(`#note-${itemId} .note-textarea`);
            if (noteTextarea) {
                noteTextarea.value = noteData;
                const noteBtn = document.querySelector(`[onclick*="toggleNote('${itemId}')"]`);
                if (noteBtn) {
                    noteBtn.classList.add('has-note');
                }
            }
        }
    });

    // 更新节点进度
    updateNodeProgress();
}

// 初始化树节点
function initTreeNodes() {
    const nodes = document.querySelectorAll('.tree-node');
    nodes.forEach(node => {
        const header = node.querySelector('.node-header');
        if (header) {
            // 检查是否有保存的展开状态
            const category = node.getAttribute('data-category') || node.getAttribute('data-topic');
            const savedState = localStorage.getItem(`node-${category}-expanded`);
            
            // 如果是分支节点且没有保存的状态，默认展开
            if (node.classList.contains('branch') && savedState === null) {
                node.classList.add('expanded');
            } else if (savedState === 'true') {
                node.classList.add('expanded');
            }
        }
    });
}

// 切换节点展开/收起
window.toggleNode = function(header) {
    const node = header.closest('.tree-node');
    node.classList.toggle('expanded');
    
    // 保存展开状态
    const category = node.getAttribute('data-category') || node.getAttribute('data-topic');
    if (category) {
        localStorage.setItem(`node-${category}-expanded`, node.classList.contains('expanded'));
    }
    
    // 更新节点进度
    updateNodeProgress();
};

// 更新状态
window.updateStatus = function(select, itemId) {
    const status = select.value;
    const item = document.querySelector(`[data-id="${itemId}"]`);
    
    if (item) {
        item.setAttribute('data-status', status);
        
        // 保存到学习数据
        if (!learningData[itemId]) {
            learningData[itemId] = {};
        }
        learningData[itemId].status = status;
        saveLearningData();
        
        // 更新进度
        updateNodeProgress();
        updateOverallProgress();
    }
};

// 切换知识点项折叠
window.toggleItem = function(header) {
    const item = header.closest('.knowledge-item');
    if (item) {
        const isExpanding = !item.classList.contains('expanded');
        item.classList.toggle('expanded');
        
        // 如果正在展开，移除display: none样式，让CSS动画生效
        if (isExpanding) {
            const noteDiv = item.querySelector('.item-note');
            if (noteDiv) {
                noteDiv.style.display = '';
                // 确保动画能触发
                setTimeout(() => {
                    const textarea = noteDiv.querySelector('.note-textarea');
                    if (textarea) {
                        textarea.focus();
                    }
                }, 100);
            }
        }
    }
};

// 切换笔记显示（通过添加笔记按钮）
window.toggleNote = function(itemId) {
    const item = document.querySelector(`[data-id="${itemId}"]`);
    if (item) {
        const noteDiv = document.getElementById(`note-${itemId}`);
        if (noteDiv) {
            // 切换 expanded 类来实现展开/收起
            const isExpanding = !item.classList.contains('expanded');
            
            if (isExpanding) {
                // 展开：添加 expanded 类
                item.classList.add('expanded');
            // 移除display: none，让CSS动画生效
            noteDiv.style.display = '';
            
                // 确保动画能触发，然后聚焦到输入框
                setTimeout(() => {
                    const textarea = noteDiv.querySelector('.note-textarea');
                    if (textarea) {
                        textarea.focus();
                    }
                }, 100);
            } else {
                // 收起：移除 expanded 类
                item.classList.remove('expanded');
            }
        }
    }
};

// 保存笔记
window.saveNote = function(itemId) {
    const noteTextarea = document.querySelector(`#note-${itemId} .note-textarea`);
    if (noteTextarea) {
        const noteContent = noteTextarea.value.trim();
        
        // 保存到学习数据
        if (!learningData[itemId]) {
            learningData[itemId] = {};
        }
        learningData[itemId].note = noteContent;
        saveLearningData();
        
        // 更新笔记按钮状态
        const noteBtn = document.querySelector(`[onclick*="toggleNote('${itemId}')"]`);
        if (noteBtn) {
            if (noteContent) {
                noteBtn.classList.add('has-note');
            } else {
                noteBtn.classList.remove('has-note');
            }
        }
        
        // 显示保存成功提示
        showNotification('✅ 笔记已保存！');
    }
};

// 保存学习数据
function saveLearningData() {
    try {
        localStorage.setItem('learningData', JSON.stringify(learningData));
    } catch (e) {
        console.error('保存学习数据失败:', e);
    }
}

// 获取知识点的状态（优先从select读取，其次从data-status）
function getItemStatus(item) {
    const select = item.querySelector('.status-select');
    if (select && select.value) {
        return select.value;
    }
    return item.getAttribute('data-status') || 'not-started';
}

// 更新节点进度
function updateNodeProgress() {
    // 更新每个分支节点的进度
    document.querySelectorAll('.tree-node.branch').forEach(branchNode => {
        const items = branchNode.querySelectorAll('.knowledge-item');
        if (items.length === 0) return;
        
        let completed = 0;
        items.forEach(item => {
            const status = getItemStatus(item);
            if (status === 'completed') {
                completed++;
            }
        });
        
        const progress = Math.round((completed / items.length) * 100);
        const badge = branchNode.querySelector('.progress-badge');
        if (badge) {
            badge.textContent = progress + '%';
            badge.setAttribute('data-progress', progress);
        }
    });
    
    // 更新根节点的进度
    document.querySelectorAll('.tree-node.root').forEach(rootNode => {
        const branches = rootNode.querySelectorAll('.tree-node.branch');
        if (branches.length === 0) return;
        
        let totalItems = 0;
        let totalCompleted = 0;
        
        branches.forEach(branch => {
            const items = branch.querySelectorAll('.knowledge-item');
            items.forEach(item => {
                totalItems++;
                const status = getItemStatus(item);
                if (status === 'completed') {
                    totalCompleted++;
                }
            });
        });
        
        if (totalItems > 0) {
            const progress = Math.round((totalCompleted / totalItems) * 100);
            const badge = rootNode.querySelector('.progress-badge');
            if (badge) {
                badge.textContent = progress + '%';
                badge.setAttribute('data-progress', progress);
            }
        }
    });
}

// 更新总体进度
function updateOverallProgress() {
    const allItems = document.querySelectorAll('.knowledge-item');
    if (allItems.length === 0) return;
    
    let completed = 0;
    allItems.forEach(item => {
        const status = getItemStatus(item);
        if (status === 'completed') {
            completed++;
        }
    });
    
    const progress = Math.round((completed / allItems.length) * 100);
    const progressFill = document.getElementById('overallProgress');
    const progressPercent = document.getElementById('overallPercent');
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    if (progressPercent) {
        progressPercent.textContent = progress + '%';
    }
}

// 初始化路径阶段
function initPathStages() {
    const stages = document.querySelectorAll('.path-stage');
    stages.forEach(stage => {
        stage.addEventListener('click', function() {
            const stageType = this.getAttribute('data-stage');
            scrollToCategory(stageType);
        });
    });
}

// 滚动到指定分类
function scrollToCategory(category) {
    const categoryMap = {
        'basic': 'html',
        'intermediate': 'frameworks',
        'advanced': 'advanced',
        'expert': 'advanced'
    };
    
    const targetCategory = categoryMap[category] || category;
    const targetNode = document.querySelector(`[data-category="${targetCategory}"]`);
    
    if (targetNode) {
        // 展开节点
        if (!targetNode.classList.contains('expanded')) {
            const header = targetNode.querySelector('.node-header');
            if (header) {
                toggleNode(header);
            }
        }
        
        // 滚动到节点
        setTimeout(() => {
            targetNode.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300);
    }
}

// 显示通知
function showNotification(message) {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message);
    } else {
        // 简单的通知实现
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
}

