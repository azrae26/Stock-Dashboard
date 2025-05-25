// 等待文檔加載完成
document.addEventListener('DOMContentLoaded', function() {
    // 設置Chart.js全局配置
    Chart.defaults.color = '#e0e0e0';
    Chart.defaults.borderColor = '#3a3a3a';
    Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
    
    // 初始化股票卡片輪播
    initCardCarousel();
    
    // 初始化市場總覽圖表 - 如果需要的話
    const marketChart = document.getElementById('marketChart');
    if (marketChart) {
        initMarketChart();
    }
});

/**
 * 卡片輪播系統
 * 重構版本：將功能模塊化，代碼更清晰易維護
 */
function initCardCarousel() {
    // 獲取所需元素
    const carousel = {
        container: document.querySelector('.card-wrapper'),
        cards: document.querySelectorAll('.article-card'),
        indicators: document.querySelectorAll('.indicator'),
        prevBtn: document.querySelector('.swipe-left'),
        nextBtn: document.querySelector('.swipe-right'),
        cardImages: document.querySelectorAll('.card-image')
    };
    
    // 卡片輪播狀態
    const state = {
        currentIndex: 0,
        isTransitioning: false,
        mousePosition: { x: 0, y: 0 }
    };
    
    // 只在元素存在時才初始化
    if (!carousel.container || carousel.cards.length === 0) return;
    
    // 1. 初始化卡片
    initializeCards();
    
    // 2. 添加所有事件監聽器
    attachEventListeners();
    
    // 3. 預加載圖片
    preloadCardImages();
    
    /**
     * 初始化卡片和指示器
     */
    function initializeCards() {
        // 初始化第一張卡片
        carousel.cards[0].classList.add('active');
        carousel.cards[0].style.transform = 'translateX(0)';
        carousel.cards[0].style.opacity = '1';
        
        // 初始化指示器
        if (carousel.indicators.length > 0) {
            carousel.indicators[0].classList.add('active');
        }
        
        // 為每張卡片圖片添加底部陰影
        carousel.cardImages.forEach(cardImage => {
            const bottomShadow = document.createElement('div');
            bottomShadow.className = 'bottom-shadow';
            cardImage.appendChild(bottomShadow);
        });
        
        // 確保所有卡片的股票信息行間距一致
        carousel.cards.forEach(card => {
            const stockInfoLine = card.querySelector('.card-stock-info-line');
            if (stockInfoLine) {
                stockInfoLine.style.marginTop = '-10px';
            }
        });
        
        // 檢測標題高度
        setTimeout(() => {
            checkTitleLines();
            // 確保完全加載後再次檢查
            setTimeout(checkTitleLines, 300);
        }, 100);
    }
    
    /**
     * 添加所有事件監聽器
     */
    function attachEventListeners() {
        // 輪播控制按鈕
        carousel.prevBtn.addEventListener('click', prevCard);
        carousel.nextBtn.addEventListener('click', nextCard);
        
        // 指示器點擊事件
        carousel.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (state.isTransitioning || state.currentIndex === index) return;
                state.currentIndex = index;
                updateCardDisplay();
            });
        });
        
        // 卡片圖片點擊事件 - 事件委派
        carousel.container.addEventListener('click', (e) => {
            // 確認點擊的是卡片圖片
            const cardImage = e.target.closest('.card-image');
            if (!cardImage || state.isTransitioning) return;
            
            // 獲取點擊位置
            const rect = cardImage.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            
            // 根據點擊位置切換卡片
            if (clickX < rect.width / 2) {
                prevCard();
            } else {
                nextCard();
            }
        });
        
        // 窗口大小變化時重新檢測標題高度
        window.addEventListener('resize', debounce(checkTitleLines, 200));
        
        // 跟蹤鼠標位置
        document.addEventListener('mousemove', (e) => {
            state.mousePosition.x = e.clientX;
            state.mousePosition.y = e.clientY;
        });
        
        // 鼠標移動事件 - 使用事件委派減少監聽器數量
        carousel.container.addEventListener('mousemove', throttle((e) => {
            // 確認移動發生在卡片圖片上
            const cardImage = e.target.closest('.card-image');
            if (!cardImage) return;
            
            // 判斷位置並應用相應樣式
            const rect = cardImage.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const side = mouseX < rect.width / 2 ? 'left' : 'right';
            
            // 移除所有懸停類
            cardImage.classList.remove('hover-left', 'hover-right');
            // 添加當前側的懸停類
            cardImage.classList.add(`hover-${side}`);
        }, 50));
        
        // 當鼠標離開圖片時移除效果
        carousel.container.addEventListener('mouseleave', (e) => {
            const cardImage = e.target.closest('.card-image');
                if (cardImage) {
                cardImage.classList.remove('hover-left', 'hover-right');
            }
        });
        
        // 觸控滑動支援
        let touchStartX, touchMoveX;
        
        carousel.container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        carousel.container.addEventListener('touchmove', (e) => {
            touchMoveX = e.touches[0].clientX;
        });
        
        carousel.container.addEventListener('touchend', () => {
            if (touchStartX - touchMoveX > 50) { // 向左滑動
                nextCard();
            } else if (touchMoveX - touchStartX > 50) { // 向右滑動
                prevCard();
            }
        });
    }
    
    /**
     * 防抖函數 - 用於處理resize等頻繁觸發的事件
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    /**
     * 節流函數 - 用於處理mousemove等高頻事件
     */
    function throttle(func, limit) {
        let lastCallTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCallTime < limit) return;
            lastCallTime = now;
            func.apply(this, args);
        };
    }
    
    /**
     * 預加載卡片圖片
     */
    function preloadCardImages() {
        console.log('預加載卡片圖片...');
        let loadedCount = 0;
        
        carousel.cardImages.forEach(cardImage => {
            // 獲取背景圖片URL
            const bgImg = getComputedStyle(cardImage).backgroundImage;
            const imgUrl = bgImg.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            
            if (imgUrl && imgUrl !== 'none') {
                const img = new Image();
                img.onload = function() {
                    loadedCount++;
                    if (loadedCount === carousel.cardImages.length) {
                        console.log('所有卡片圖片預加載完成');
                    }
                };
                img.src = imgUrl;
            }
        });
    }
    
    /**
     * 切換到上一張卡片
     */
    function prevCard() {
        if (state.isTransitioning) return;
        state.currentIndex = (state.currentIndex - 1 + carousel.cards.length) % carousel.cards.length;
        updateCardDisplay();
    }
    
    /**
     * 切換到下一張卡片
     */
    function nextCard() {
        if (state.isTransitioning) return;
        state.currentIndex = (state.currentIndex + 1) % carousel.cards.length;
        updateCardDisplay();
    }
    
    /**
     * 更新卡片顯示
     */
    function updateCardDisplay() {
        if (state.isTransitioning) return;
        state.isTransitioning = true;
        
        // 統一設置容器高度
        if (carousel.container) {
            carousel.container.style.height = '540px';
        }
        
        // 獲取當前活動卡片
        const activeCard = document.querySelector('.article-card.active');
        // 記錄當前卡片是否為雙行標題
        const wasTwoLine = activeCard ? activeCard.classList.contains('two-line-title') : false;
        
        // 重置所有卡片圖片的懸停效果
        carousel.cardImages.forEach(image => {
            image.classList.remove('hover-left', 'hover-right');
        });
        
        // 重置非當前卡片的樣式
        carousel.cards.forEach((card, index) => {
            if (index !== state.currentIndex) {
                card.classList.remove('two-line-title');
            }
            
            // 確保底部陰影位置正確
            const bottomShadow = card.querySelector('.bottom-shadow');
                if (bottomShadow) {
                    bottomShadow.style.bottom = '0';
                }
            
            // 確保所有卡片的股票信息行間距一致
            const stockInfoLine = card.querySelector('.card-stock-info-line');
            if (stockInfoLine) {
                stockInfoLine.style.marginTop = '-10px';
            }
        });
        
        // 更新卡片位置和狀態
        carousel.cards.forEach((card, index) => {
            if (index === state.currentIndex) {
                // 當前卡片
                card.classList.add('active');
                card.style.transform = 'translateX(0)';
                card.style.opacity = '1';
                
                // 暫時應用雙行標題狀態
                if (wasTwoLine) {
                    card.classList.add('temp-two-line');
                }
                
                // 確保當前卡片的股票信息行間距正確
                const stockInfoLine = card.querySelector('.card-stock-info-line');
                if (stockInfoLine) {
                    stockInfoLine.style.marginTop = '-10px';
                }
            } else {
                // 非當前卡片
                card.classList.remove('active');
                
                // 左側卡片
                if (index < state.currentIndex || (state.currentIndex === 0 && index === carousel.cards.length - 1)) {
                    card.style.transform = 'translateX(-100%)';
                } else {
                // 右側卡片
                    card.style.transform = 'translateX(100%)';
                }
                card.style.opacity = '0';
            }
        });
        
        // 更新指示器狀態
        carousel.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === state.currentIndex);
        });
        
        // 確保指示器位置一致
        const indicator = document.querySelector('.card-indicator');
        if (indicator) {
            indicator.style.bottom = '-5px';
        }
        
        // 等待過渡動畫完成
        setTimeout(() => {
            // 移除臨時類
            document.querySelectorAll('.temp-two-line').forEach(card => {
                card.classList.remove('temp-two-line');
            });
            
            // 重新檢測標題高度
            checkTitleLines();
            
            // 應用懸停效果
            applyHoverEffect();
            
            // 解除過渡鎖定
            state.isTransitioning = false;
        }, 300);
    }
    
    /**
     * 檢測並調整標題行數
     */
    function checkTitleLines() {
        // 只檢測當前活動卡片
        const activeCard = document.querySelector('.article-card.active');
        if (!activeCard) return;
        
        const title = activeCard.querySelector('.card-title');
        if (!title) return;
        
        // 使用更簡單的方法檢測標題高度
        // 1. 設置臨時樣式測量實際高度
        const originalStyle = title.style.cssText;
        title.style.cssText += 'max-height: none; height: auto; overflow: visible;';
        const titleHeight = title.scrollHeight;
        
        // 2. 恢復原始樣式
        title.style.cssText = originalStyle;
        
        // 3. 檢測標題是否包含熱門標籤
        const hasHotTag = title.querySelector('.hot-tag') !== null;
        
        // 4. 獲取文本長度
        const titleText = title.textContent || title.innerText;
        const titleTextLength = (titleText || '').trim().length;
        
        // 5. 判斷是否需要雙行樣式 - 調整閾值以配合增加的間距
        const needsTwoLines = titleHeight > 45 || (hasHotTag && titleTextLength > 40) || titleTextLength > 70;
        const currentlyTwoLines = activeCard.classList.contains('two-line-title');
        
        // 6. 如果狀態發生變化，應用相應樣式
        if (needsTwoLines !== currentlyTwoLines) {
            // 先儲存公司名稱行
            const stockInfoLine = activeCard.querySelector('.card-stock-info-line');
            
            // 切換雙行標題狀態
            activeCard.classList.toggle('two-line-title', needsTwoLines);
            
            // 給渲染一點時間，然後確保公司名稱行位置正確
            setTimeout(() => {
                // 動畫結束後確保公司名稱行位置正確
                if (stockInfoLine) {
                    // 強制應用-10px間距
                    stockInfoLine.style.marginTop = '-10px';
                }
            }, 50);
        }
        
        // 無論是否切換狀態，都確保股票信息行的間距正確
        const stockInfoLine = activeCard.querySelector('.card-stock-info-line');
        if (stockInfoLine) {
            stockInfoLine.style.marginTop = '-10px';
        }
    }
    
    /**
     * 根據滑鼠位置應用懸停效果
     */
    function applyHoverEffect() {
        const activeCard = carousel.cards[state.currentIndex];
        if (!activeCard) return;
        
        const cardImage = activeCard.querySelector('.card-image');
        if (!cardImage) return;
        
        const rect = cardImage.getBoundingClientRect();
        
        // 檢查滑鼠是否在卡片上
        if (state.mousePosition.x >= rect.left && 
            state.mousePosition.x <= rect.right && 
            state.mousePosition.y >= rect.top && 
            state.mousePosition.y <= rect.bottom) {
            
            // 計算相對位置並應用效果
            const relativeX = state.mousePosition.x - rect.left;
            const side = relativeX < rect.width / 2 ? 'left' : 'right';
            
            cardImage.classList.remove('hover-left', 'hover-right');
            cardImage.classList.add(`hover-${side}`);
        }
    }
}

// 初始化市場總覽圖表 - 保留這一個基本圖表作為示例
function initMarketChart() {
    const ctx = document.getElementById('marketChart');
    if (!ctx) return;
    
    // 模擬數據
    const labels = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
    const taiexData = [18120, 18150, 18200, 18180, 18210, 18250, 18235];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '台股大盤',
                data: taiexData,
                borderColor: '#fb8c00',
                backgroundColor: 'rgba(251, 140, 0, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#e0e0e0'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#e0e0e0'
                    }
                },
                x: {
                    ticks: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
} 