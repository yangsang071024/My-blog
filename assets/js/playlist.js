/* ============================================
   音乐播放器 JavaScript 脚本
   ============================================ */

/* 
 * 如何添加音乐到播放列表：
 * 
 * 方法1: 通过代码添加（推荐）
 * 在 playlist 数组中添加对象，例如：
 * 
 * playlist.push({
 *     title: '歌曲名称',
 *     artist: '艺术家名称',
 *     albumArt: '../assets/img/your-album-cover.jpg',  // 专辑封面图片路径
 *     audioUrl: '../assets/music/your-song.mp3',        // 音频文件路径
 *     duration: 0  // 会自动计算，可以先设为0
 * });
 * 
 * 方法2: 通过界面添加
 * 点击"添加"按钮选择音频文件，或直接拖放音频文件到页面
 * 注意：通过界面添加的音乐会使用文件名作为标题
 * 
 * 方法3: 通过全局函数添加
 * window.addTrackToPlaylist({
 *     title: '歌曲名称',
 *     artist: '艺术家名称',
 *     albumArt: '../assets/img/your-album-cover.jpg',
 *     audioUrl: '../assets/music/your-song.mp3'
 * });
 */

// 播放器状态
let currentTrackIndex = -1;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'none'; // 'none', 'all', 'one'
let playlist = [];

// DOM 元素
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const volumeBtn = document.getElementById('volumeBtn');
const volumeValue = document.getElementById('volumeValue');
const currentTrackTitle = document.getElementById('currentTrackTitle');
const currentTrackArtist = document.getElementById('currentTrackArtist');
const currentAlbumArt = document.getElementById('currentAlbumArt');
const playlistItems = document.getElementById('playlistItems');
const clearPlaylistBtn = document.getElementById('clearPlaylistBtn');
const addMusicBtn = document.getElementById('addMusicBtn');
const playlistEmpty = document.getElementById('playlistEmpty');
const lyricsContainer = document.getElementById('lyricsContainer');

// 歌词相关
let currentLyrics = [];
let lyricsTimer = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initPlaylistPlayer();
    initEventListeners();
    initDefaultPlaylist(); // 初始化默认播放列表
    loadPlaylistFromStorage();
    updatePlaylistDisplay();
});

// 初始化播放器
function initPlaylistPlayer() {
    // 设置默认音量
    audioPlayer.volume = volumeSlider.value / 100;
    updateVolumeDisplay();

    // 音频事件监听
    audioPlayer.addEventListener('loadedmetadata', updateTotalTime);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleTrackEnd);
    audioPlayer.addEventListener('error', handleAudioError);
}

// 初始化事件监听器
function initEventListeners() {
    // 播放/暂停
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // 上一首/下一首
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // 进度条
    progressBar.addEventListener('input', seekTo);
    progressBar.addEventListener('mousedown', () => {
        audioPlayer.pause();
    });
    progressBar.addEventListener('mouseup', () => {
        if (isPlaying) {
            audioPlayer.play();
        }
    });
    
    // 音量控制
    volumeSlider.addEventListener('input', updateVolume);
    volumeBtn.addEventListener('click', toggleMute);
    
    // 播放模式
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // 播放列表操作
    clearPlaylistBtn.addEventListener('click', clearPlaylist);
    addMusicBtn.addEventListener('click', () => {
        // 创建文件输入
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.multiple = true;
        input.onchange = (e) => {
            handleFiles(e.target.files);
        };
        input.click();
    });
    
    // 支持拖放
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('audio/')
        );
        if (files.length > 0) {
            handleFiles(files);
        }
    });
}

// 处理文件
function handleFiles(files) {
    Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        const track = {
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: '未知艺术家',
            albumArt: '../assets/img/avatar.png', // 默认封面（用户上传的音乐使用默认头像）
            audioUrl: url,
            duration: 0
        };
        
        // 获取音频时长
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
            track.duration = audio.duration;
            updatePlaylistDisplay();
        });
        
        playlist.push(track);
    });
    
    savePlaylistToStorage();
    updatePlaylistDisplay();
    
    if (playlist.length === files.length && currentTrackIndex === -1) {
        playTrack(0);
    }
}

// 播放/暂停
function togglePlayPause() {
    if (currentTrackIndex === -1 && playlist.length > 0) {
        playTrack(0);
        return;
    }
    
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playPauseBtn.querySelector('i').classList.remove('fa-pause');
        playPauseBtn.querySelector('i').classList.add('fa-play');
        document.querySelector('.album-art-wrapper')?.classList.remove('playing');
    } else {
        audioPlayer.play();
        isPlaying = true;
        playPauseBtn.querySelector('i').classList.remove('fa-play');
        playPauseBtn.querySelector('i').classList.add('fa-pause');
        document.querySelector('.album-art-wrapper')?.classList.add('playing');
    }
}

// 播放指定曲目
function playTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    currentTrackIndex = index;
    const track = playlist[index];
    
    audioPlayer.src = track.audioUrl;
    currentTrackTitle.textContent = track.title;
    currentTrackArtist.textContent = track.artist;
    currentAlbumArt.src = track.albumArt;
    
    // 重置歌词状态
    resetLyricsState();
    
    // 加载歌词
    if (track.lrcUrl) {
        console.log('准备加载歌词:', track.lrcUrl);
        loadLyrics(track.lrcUrl).catch(error => {
            console.error('加载歌词时出错:', error);
            currentLyrics = [];
            displayLyrics();
        });
    } else {
        console.log('该歌曲没有歌词文件');
        currentLyrics = [];
        displayLyrics();
    }
    
    updatePlaylistDisplay();
    audioPlayer.play();
    isPlaying = true;
    playPauseBtn.querySelector('i').classList.remove('fa-play');
    playPauseBtn.querySelector('i').classList.add('fa-pause');
    document.querySelector('.album-art-wrapper')?.classList.add('playing');
}

// 上一首
function playPrevious() {
    if (playlist.length === 0) return;
    
    let newIndex;
    if (isShuffled) {
        newIndex = Math.floor(Math.random() * playlist.length);
    } else {
        newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1;
    }
    
    playTrack(newIndex);
}

// 下一首
function playNext() {
    if (playlist.length === 0) return;
    
    let newIndex;
    if (isShuffled) {
        newIndex = Math.floor(Math.random() * playlist.length);
        // 避免连续播放同一首
        while (newIndex === currentTrackIndex && playlist.length > 1) {
            newIndex = Math.floor(Math.random() * playlist.length);
        }
    } else {
        newIndex = currentTrackIndex < playlist.length - 1 ? currentTrackIndex + 1 : 0;
    }
    
    playTrack(newIndex);
}

// 处理曲目结束
function handleTrackEnd() {
    if (repeatMode === 'one') {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else if (repeatMode === 'all' || currentTrackIndex < playlist.length - 1) {
        playNext();
    } else {
        isPlaying = false;
        playPauseBtn.querySelector('i').classList.remove('fa-pause');
        playPauseBtn.querySelector('i').classList.add('fa-play');
        document.querySelector('.album-art-wrapper')?.classList.remove('playing');
    }
}

// 更新进度
function updateProgress() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        // 更新歌词显示
        updateLyrics(audioPlayer.currentTime);
    }
}

// 更新总时长
function updateTotalTime() {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
}

// 跳转到指定位置
function seekTo() {
    const seekTime = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
}

// 更新音量
function updateVolume() {
    const volume = volumeSlider.value / 100;
    audioPlayer.volume = volume;
    updateVolumeDisplay();
    
    // 更新音量图标
    if (volume === 0) {
        volumeBtn.querySelector('i').classList.remove('fa-volume-up', 'fa-volume-down');
        volumeBtn.querySelector('i').classList.add('fa-volume-mute');
    } else if (volume < 0.5) {
        volumeBtn.querySelector('i').classList.remove('fa-volume-up', 'fa-volume-mute');
        volumeBtn.querySelector('i').classList.add('fa-volume-down');
    } else {
        volumeBtn.querySelector('i').classList.remove('fa-volume-down', 'fa-volume-mute');
        volumeBtn.querySelector('i').classList.add('fa-volume-up');
    }
}

// 更新音量显示
function updateVolumeDisplay() {
    volumeValue.textContent = Math.round(volumeSlider.value) + '%';
}

// 静音/取消静音
function toggleMute() {
    if (audioPlayer.volume === 0) {
        audioPlayer.volume = volumeSlider.value / 100 || 0.7;
        volumeSlider.value = audioPlayer.volume * 100;
    } else {
        audioPlayer.volume = 0;
        volumeSlider.value = 0;
    }
    updateVolume();
}

// 切换随机播放
function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
}

// 切换循环模式
function toggleRepeat() {
    const modes = ['none', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    repeatMode = modes[(currentModeIndex + 1) % modes.length];
    
    repeatBtn.classList.remove('active');
    if (repeatMode === 'all') {
        repeatBtn.classList.add('active');
        repeatBtn.title = '循环全部';
    } else if (repeatMode === 'one') {
        repeatBtn.classList.add('active');
        repeatBtn.title = '单曲循环';
    } else {
        repeatBtn.title = '不循环';
    }
}

// 更新播放列表显示
function updatePlaylistDisplay() {
    if (playlist.length === 0) {
        playlistItems.style.display = 'none';
        playlistEmpty.style.display = 'block';
        return;
    }
    
    playlistItems.style.display = 'flex';
    playlistEmpty.style.display = 'none';
    
    playlistItems.innerHTML = '';
    
    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentTrackIndex) {
            item.classList.add('playing');
        }
        item.setAttribute('data-index', index);
        
        item.innerHTML = `
            <div class="playlist-item-number">${index + 1}</div>
            <div class="playlist-item-art">
                <img src="${track.albumArt}" alt="专辑封面" class="playlist-item-img">
            </div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${escapeHtml(track.title)}</div>
                <div class="playlist-item-artist">${escapeHtml(track.artist)}</div>
            </div>
            <div class="playlist-item-duration">${formatTime(track.duration || 0)}</div>
            <div class="playlist-item-actions">
                <button class="playlist-action-btn" title="播放" onclick="playTrackFromList(${index})">
                    <i class="fas fa-play"></i>
                </button>
                <button class="playlist-action-btn" title="删除" onclick="removeTrackFromList(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        playlistItems.appendChild(item);
    });
}

// 从播放列表播放
window.playTrackFromList = function(index) {
    playTrack(index);
};

// 从播放列表删除
window.removeTrackFromList = function(index) {
    if (confirm('确定要删除这首歌吗？')) {
        // 如果删除的是当前播放的曲目
        if (index === currentTrackIndex) {
            if (playlist.length > 1) {
                const nextIndex = index < playlist.length - 1 ? index : index - 1;
                playlist.splice(index, 1);
                playTrack(Math.max(0, nextIndex - (index < nextIndex ? 0 : 1)));
            } else {
                playlist.splice(index, 1);
                audioPlayer.pause();
                audioPlayer.src = '';
                currentTrackIndex = -1;
                isPlaying = false;
                playPauseBtn.querySelector('i').classList.remove('fa-pause');
                playPauseBtn.querySelector('i').classList.add('fa-play');
                currentTrackTitle.textContent = '暂无播放';
                currentTrackArtist.textContent = '艺术家';
                document.querySelector('.album-art-wrapper')?.classList.remove('playing');
            }
        } else {
            playlist.splice(index, 1);
            if (index < currentTrackIndex) {
                currentTrackIndex--;
            }
        }
        
        savePlaylistToStorage();
        updatePlaylistDisplay();
    }
};

// 清空播放列表
function clearPlaylist() {
    if (playlist.length === 0) return;
    
    if (confirm('确定要清空播放列表吗？')) {
        playlist = [];
        audioPlayer.pause();
        audioPlayer.src = '';
        currentTrackIndex = -1;
        isPlaying = false;
        playPauseBtn.querySelector('i').classList.remove('fa-pause');
        playPauseBtn.querySelector('i').classList.add('fa-play');
        currentTrackTitle.textContent = '暂无播放';
        currentTrackArtist.textContent = '艺术家';
        document.querySelector('.album-art-wrapper')?.classList.remove('playing');
        
        savePlaylistToStorage();
        updatePlaylistDisplay();
    }
}

// 格式化时间
function formatTime(seconds) {
    if (!isFinite(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// HTML 转义
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

// 处理音频错误
function handleAudioError() {
    console.error('音频加载失败');
    showNotification('❌ 音频加载失败，请检查文件格式');
}

// 显示通知
function showNotification(message) {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message);
    } else {
        alert(message);
    }
}

// 保存播放列表到 localStorage
function savePlaylistToStorage() {
    try {
        // 只保存基本信息，不保存 Blob URL
        const playlistData = playlist.map(track => ({
            title: track.title,
            artist: track.artist,
            albumArt: track.albumArt,
            duration: track.duration
            // 注意：不保存 audioUrl，因为 Blob URL 不能持久化
        }));
        localStorage.setItem('musicPlaylist', JSON.stringify(playlistData));
    } catch (e) {
        console.error('保存播放列表失败:', e);
    }
}

// 从 localStorage 加载播放列表
function loadPlaylistFromStorage() {
    try {
        const saved = localStorage.getItem('musicPlaylist');
        if (saved) {
            const playlistData = JSON.parse(saved);
            // 注意：由于 Blob URL 不能持久化，需要用户重新添加音频文件
            // 这里只显示已保存的曲目信息
            console.log('已保存的播放列表数据:', playlistData);
            // 实际使用时，用户需要重新添加音频文件
        }
    } catch (e) {
        console.error('加载播放列表失败:', e);
    }
}

// 全局函数：添加音乐到播放列表（供外部调用）
window.addTrackToPlaylist = function(track) {
    if (!track.audioUrl) {
        console.error('缺少音频URL');
        return;
    }
    
    // 设置默认值
    const newTrack = {
        title: track.title || '未知歌曲',
        artist: track.artist || '未知艺术家',
        albumArt: track.albumArt || 'img/avatar.png',
        audioUrl: track.audioUrl,
        duration: track.duration || 0
    };
    
    // 如果duration为0，尝试获取
    if (newTrack.duration === 0) {
        const audio = new Audio(newTrack.audioUrl);
        audio.addEventListener('loadedmetadata', () => {
            newTrack.duration = audio.duration;
            updatePlaylistDisplay();
        });
        audio.load();
    }
    
    playlist.push(newTrack);
    savePlaylistToStorage();
    updatePlaylistDisplay();
    
    // 如果当前没有播放的歌曲，自动播放新添加的
    if (currentTrackIndex === -1 && playlist.length === 1) {
        playTrack(0);
    }
};

// 初始化默认播放列表
function initDefaultPlaylist() {
    // 如果已经有保存的播放列表，就不初始化默认列表
    const saved = localStorage.getItem('musicPlaylist');
    if (saved) return;
    
    const defaultTracks = [
        {
            title: '我看过',
            artist: '洪一诺',
            albumArt: '../assets/img/我看过.png',
            audioUrl: '../assets/music/我看过.mp3',
            lrcUrl: '../assets/music/我看过.lrc',
            duration: 0
        },
        {
            title: '心墙',
            artist: '郭静',
            albumArt: '../assets/img/心情.png',
            audioUrl: '../assets/music/心墙.mp3',
            lrcUrl: '../assets/music/心墙.lrc',
            duration: 0
        },
        {
            title: '恶作剧',
            artist: '王蓝茵',
            albumArt: '../assets/img/恶作剧.png',
            audioUrl: '../assets/music/恶作剧.mp3',
            lrcUrl: '../assets/music/恶作剧.lrc',
            duration: 0
        },
        {
            title: 'Deadman',
            artist: '蔡徐坤',
            albumArt: '../assets/img/deadman.png',
            audioUrl: '../assets/music/Deadman.mp3',
            lrcUrl: '../assets/music/Deadman.lrc',
            duration: 0
        }
    ];
    
    // 立即设置播放列表，让用户可以立即看到
    playlist = defaultTracks;
    
    // 异步获取每首歌曲的时长
    defaultTracks.forEach((track) => {
        const audio = new Audio(track.audioUrl);
        audio.addEventListener('loadedmetadata', () => {
            track.duration = audio.duration;
            updatePlaylistDisplay();
        });
        audio.addEventListener('error', () => {
            // 加载失败时保持duration为0
            console.warn('无法加载歌曲时长:', track.title);
        });
        audio.load();
    });
}

// 解析LRC歌词文件
async function parseLRC(lrcUrl) {
    try {
        const response = await fetch(lrcUrl);
        if (!response.ok) {
            console.error('加载LRC文件失败:', response.status);
            return [];
        }
        const text = await response.text();
        const lines = text.split(/\r?\n/); // 支持Windows和Unix换行符
        const lyrics = [];
        
        // 匹配时间戳格式 [mm:ss.xxx] 或 [mm:ss] 或 [mm:ss.x]
        const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // 重置正则表达式的lastIndex
            timeRegex.lastIndex = 0;
            
            // 先提取所有时间戳
            const timeStamps = [];
            let match;
            while ((match = timeRegex.exec(line)) !== null) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                let milliseconds = 0;
                
                if (match[3]) {
                    // LRC格式：小数点后表示百分之一秒（0-99）
                    // 例如：[00:01.80] = 1秒 + 80百分之一秒 = 1.8秒
                    // 有些文件可能只有1位或3位，需要转换
                    const msDigits = match[3];
                    let centiseconds; // 百分之一秒
                    
                    if (msDigits.length === 1) {
                        // 1位：例如 "8" 应该理解为 "80" 百分之一秒
                        centiseconds = parseInt(msDigits, 10) * 10;
                    } else if (msDigits.length === 2) {
                        // 2位：标准格式，例如 "80" 表示 80 百分之一秒
                        centiseconds = parseInt(msDigits, 10);
                    } else {
                        // 3位：可能是毫秒格式，需要转换，例如 "800" = 80百分之一秒
                        centiseconds = Math.floor(parseInt(msDigits, 10) / 10);
                    }
                    
                    // 转换为秒的小数部分
                    milliseconds = centiseconds * 10; // 转换为毫秒，最终计算时除以1000
                }
                
                const time = minutes * 60 + seconds + milliseconds / 1000;
                timeStamps.push(time);
            }
            
            // 移除时间戳，获取歌词内容
            const content = line.replace(/\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]/g, '').trim();
            
            // 如果没有内容或时间戳，跳过
            if (!content || timeStamps.length === 0) return;
            
            // 为每个时间戳创建歌词条目
            timeStamps.forEach(time => {
                lyrics.push({
                    time: time,
                    text: content
                });
            });
        });
        
        // 按时间排序
        lyrics.sort((a, b) => a.time - b.time);
        
        console.log('解析歌词成功，共', lyrics.length, '行');
        return lyrics;
    } catch (error) {
        console.error('加载歌词失败:', error);
        return [];
    }
}

// 加载歌词
async function loadLyrics(lrcUrl) {
    console.log('开始加载歌词:', lrcUrl);
    currentLyrics = await parseLRC(lrcUrl);
    console.log('歌词加载完成，共', currentLyrics.length, '行');
    displayLyrics();
}

// 显示歌词
function displayLyrics() {
    if (!lyricsContainer) {
        console.error('歌词容器未找到');
        return;
    }
    
    if (currentLyrics.length === 0) {
        lyricsContainer.innerHTML = '<div class="lyrics-line">暂无歌词</div>';
        console.log('当前没有歌词可显示');
        return;
    }
    
    console.log('显示歌词，共', currentLyrics.length, '行');
    lyricsContainer.innerHTML = currentLyrics.map((lyric, index) => {
        return `<div class="lyrics-line" data-time="${lyric.time}">${escapeHtml(lyric.text)}</div>`;
    }).join('');
}

// 更新歌词显示（根据当前播放时间）
let lastActiveIndex = -1;
let lastScrollTime = 0;
const SCROLL_THROTTLE_MS = 200; // 滚动节流时间（毫秒）

function updateLyrics(currentTime) {
    if (!lyricsContainer || currentLyrics.length === 0) return;
    
    const lines = lyricsContainer.querySelectorAll('.lyrics-line');
    if (lines.length === 0) return;
    
    let activeIndex = -1;
    
    // 找到当前应该高亮的歌词行
    for (let i = currentLyrics.length - 1; i >= 0; i--) {
        if (currentTime >= currentLyrics[i].time) {
            activeIndex = i;
            break;
        }
    }
    
    // 如果找不到匹配的行，不更新
    if (activeIndex === -1) return;
    
    // 更新歌词行的样式（每次都更新，确保样式正确）
    lines.forEach((line, index) => {
        line.classList.remove('active', 'previous', 'upcoming');
        if (index === activeIndex) {
            line.classList.add('active');
        } else if (index < activeIndex) {
            line.classList.add('previous');
        } else {
            line.classList.add('upcoming');
        }
    });
    
    // 只在索引改变或超过节流时间时才滚动
    const now = Date.now();
    if (activeIndex !== lastActiveIndex || (now - lastScrollTime) > SCROLL_THROTTLE_MS) {
        lastActiveIndex = activeIndex;
        lastScrollTime = now;
        
        // 确保行元素存在
        if (lines[activeIndex]) {
            scrollLyricsToLine(lines[activeIndex]);
        }
    }
}

// 滚动歌词容器到指定行（仅滚动容器内部，不影响页面）
function scrollLyricsToLine(lineElement) {
    if (!lyricsContainer || !lineElement) {
        console.warn('滚动失败：容器或行元素不存在');
        return;
    }
    
    const container = lyricsContainer;
    const line = lineElement;
    
    // 获取行相对于容器的偏移位置
    const lineOffsetTop = line.offsetTop;
    
    // 获取容器的可见高度
    const containerHeight = container.clientHeight;
    
    // 获取行的高度
    const lineHeight = line.offsetHeight;
    
    // 计算目标滚动位置：让当前行在容器中心
    const targetScrollTop = lineOffsetTop - (containerHeight / 2) + (lineHeight / 2);
    
    // 限制滚动范围
    const maxScrollTop = container.scrollHeight - containerHeight;
    const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
    
    // 检查是否需要滚动（避免不必要的滚动）
    const currentScroll = container.scrollTop;
    const scrollDiff = Math.abs(finalScrollTop - currentScroll);
    
    // 只有当滚动距离大于10px时才滚动
    if (scrollDiff > 10) {
        container.scrollTo({
            top: finalScrollTop,
            behavior: 'smooth'
        });
        console.log('滚动到位置:', finalScrollTop, '当前:', currentScroll, '目标行:', lineOffsetTop);
    }
}

// 重置歌词状态（切换歌曲时调用）
function resetLyricsState() {
    lastActiveIndex = -1;
    lastScrollTime = 0;
    if (lyricsContainer) {
        // 立即滚动到顶部，不使用平滑滚动
        lyricsContainer.scrollTop = 0;
    }
}

