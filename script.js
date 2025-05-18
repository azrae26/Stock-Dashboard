// 等待文檔加載完成
document.addEventListener('DOMContentLoaded', function() {
    // 設置Chart.js全局配置
    Chart.defaults.color = '#e0e0e0';
    Chart.defaults.borderColor = '#3a3a3a';
    Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
    
    // 檢測卡片標題是否為兩行
    function checkTitleLines() {
        // 只獲取當前活動卡片
        const activeCard = document.querySelector('.article-card.active');
        if (!activeCard) return;
        
        // 獲取活動卡片的標題
        const title = activeCard.querySelector('.card-title');
        if (!title) return;
        
        // 複製標題元素並設置為隱藏來計算實際高度
        const clone = title.cloneNode(true);
        clone.style.visibility = 'hidden';
        clone.style.position = 'absolute';
        clone.style.width = title.offsetWidth + 'px';
        clone.style.maxHeight = 'none';
        clone.style.height = 'auto';
        document.body.appendChild(clone);
        
        // 獲取文本內容和高度
        const titleText = title.innerText || title.textContent;
        const titleTextLength = titleText.trim().length;
        const titleHeight = clone.offsetHeight;
        
        // 移除克隆元素
        document.body.removeChild(clone);
        
        // 使用更嚴格的條件判斷是否需要兩行
        // 1. 標題高度明顯超過一行(40px)
        // 2. 標題包含熱門標籤，且文本長度超過閾值
        // 3. 文本長度非常長（超過70字）
        const hasHotTag = title.querySelector('.hot-tag') !== null;
        const needsTwoLines = titleHeight > 40 || (hasHotTag && titleTextLength > 40) || titleTextLength > 70;
        const currentlyTwoLines = activeCard.classList.contains('two-line-title');
        
        console.log('檢測標題需要兩行:', needsTwoLines, '高度:', titleHeight, '文本長度:', titleTextLength, '有熱門標籤:', hasHotTag);
        
        // 只在狀態發生變化時才應用變化，以確保動畫效果
        if (needsTwoLines !== currentlyTwoLines) {
            // 先延遲一點點時間，讓瀏覽器有時間處理前面的樣式變化
            setTimeout(() => {
                if (needsTwoLines) {
                    // 添加雙行標題類
                    activeCard.classList.add('two-line-title');
                } else {
                    // 移除雙行標題類
                    activeCard.classList.remove('two-line-title');
                }
                
                // 確保底部陰影不會溢出
                const cardImage = activeCard.querySelector('.card-image');
                if (cardImage) {
                    const bottomShadow = cardImage.querySelector('.bottom-shadow');
                    if (bottomShadow) {
                        // 確保底部陰影在圖片範圍內
                        bottomShadow.style.bottom = '0';
                    }
                }
            }, 10);
        }
        
        // 無論是否需要兩行，都確保卡片包裝器高度和指示器位置保持不變
        const cardWrapper = document.querySelector('.card-wrapper');
        if (cardWrapper) {
            cardWrapper.style.height = '540px'; // 從550px減少到540px
        }
        
        const indicator = document.querySelector('.card-indicator');
        if (indicator) {
            indicator.style.bottom = '-5px'; // 保持不變
        }
    }
    
    // 在頁面加載後執行檢測，並在卡片切換時重新檢測
    setTimeout(checkTitleLines, 100);
    
    // 在窗口大小變化時重新檢測
    window.addEventListener('resize', function() {
        // 使用防抖函數避免頻繁調用
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(function() {
            checkTitleLines();
        }, 200);
    });
    
    // 確保在DOM完全加載後再次檢測
    setTimeout(checkTitleLines, 300);
    
    // 初始化所有圖表
    initMarketChart();
    initStockChart();
    initTechnicalCharts();
    initFinancialCharts();
    initIndustryChart();
    
    // 添加股票選擇器事件監聽
    const stockSelect = document.getElementById('stockSelect');
    if (stockSelect) {
        stockSelect.addEventListener('change', function() {
            // 實際應用中，這裡應該從API獲取選中的股票資料
            const selectedStock = this.value;
            updateStockInfo(selectedStock);
        });
    }
    
    // 添加圖表時間範圍選擇器事件監聽
    const chartPeriodButtons = document.querySelectorAll('.chart-period button');
    chartPeriodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按鈕的活動狀態
            chartPeriodButtons.forEach(btn => btn.classList.remove('active'));
            // 添加當前按鈕的活動狀態
            this.classList.add('active');
            // 更新圖表數據（實際應用中，這裡應該根據選擇的時間範圍獲取數據）
            updateChartPeriod(this.textContent);
        });
    });

    // 股票卡片滑動功能
    const swipeLeftBtn = document.querySelector('.swipe-left');
    const swipeRightBtn = document.querySelector('.swipe-right');
    const indicators = document.querySelectorAll('.indicator');
    const cards = document.querySelectorAll('.article-card');
    
    // 預加載所有卡片的背景圖片
    function preloadCardImages() {
        console.log('預加載卡片圖片...');
        const cardImages = document.querySelectorAll('.card-image');
        let loadedCount = 0;
        
        cardImages.forEach((cardImage) => {
            // 獲取元素背景圖片的URL
            const bgImg = getComputedStyle(cardImage).backgroundImage;
            const imgUrl = bgImg.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            
            if (imgUrl && imgUrl !== 'none') {
                const img = new Image();
                img.onload = function() {
                    loadedCount++;
                    if (loadedCount === cardImages.length) {
                        console.log('所有卡片圖片預加載完成');
                    }
                };
                img.src = imgUrl;
            }
        });
    }
    
    // 執行預加載
    preloadCardImages();
    
    // 為所有卡片圖片添加底部陰影元素
    document.querySelectorAll('.card-image').forEach(cardImage => {
        // 創建底部陰影元素
        const bottomShadow = document.createElement('div');
        bottomShadow.className = 'bottom-shadow';
        cardImage.appendChild(bottomShadow);
        
        // 添加鼠標移動事件，根據鼠標位置顯示對應側的漸層
        // 使用節流函數減少事件觸發頻率
        let lastSide = ''; // 記錄上次的位置
        let lastCallTime = 0; // 上次調用時間
        const throttleTime = 50; // 節流時間（毫秒）
        
        cardImage.addEventListener('mousemove', function(e) {
            const now = Date.now();
            // 如果距離上次調用時間不足節流時間，則跳過
            if (now - lastCallTime < throttleTime) return;
            
            // 獲取鼠標相對於圖片的X座標
            const rect = this.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const halfWidth = this.offsetWidth / 2;
            
            // 判斷當前側邊
            const currentSide = mouseX < halfWidth ? 'left' : 'right';
            
            // 如果與上次相同，則不做改變
            if (currentSide === lastSide) return;
            
            // 更新上次記錄
            lastSide = currentSide;
            lastCallTime = now;
            
            // 清除兩側的激活類
            this.classList.remove('hover-left', 'hover-right');
            
            // 根據鼠標位置添加對應的激活類
            if (currentSide === 'left') {
                this.classList.add('hover-left');
            } else {
                this.classList.add('hover-right');
            }
        });
        
        // 鼠標離開圖片時移除所有激活類
        cardImage.addEventListener('mouseleave', function() {
            lastSide = ''; // 重置記錄
            this.classList.remove('hover-left', 'hover-right');
        });
    });
    
    let currentCardIndex = 0;
    let isTransitioning = false; // 添加過渡狀態標記
    let lastMouseX = 0; // 記錄最後滑鼠X座標位置
    let lastMouseY = 0; // 記錄最後滑鼠Y座標位置
    
    // 追蹤滑鼠在文檔上的位置
    document.addEventListener('mousemove', function(e) {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });
    
    // 應用漸層效果到當前卡片
    function applyGradientToCurrentCard() {
        // 獲取當前活動卡片的圖片元素
        const currentCard = cards[currentCardIndex];
        if (!currentCard) return;
        
        const cardImage = currentCard.querySelector('.card-image');
        if (!cardImage) return;
        
        // 獲取卡片圖片的位置和尺寸
        const rect = cardImage.getBoundingClientRect();
        
        // 檢查滑鼠是否在卡片圖片上
        if (lastMouseX >= rect.left && lastMouseX <= rect.right && 
            lastMouseY >= rect.top && lastMouseY <= rect.bottom) {
            
            // 獲取滑鼠相對於圖片的X座標
            const mouseX = lastMouseX - rect.left;
            const halfWidth = cardImage.offsetWidth / 2;
            
            // 判斷當前側邊
            const currentSide = mouseX < halfWidth ? 'left' : 'right';
            
            // 清除兩側的激活類
            cardImage.classList.remove('hover-left', 'hover-right');
            
            // 根據滑鼠位置添加對應的激活類
            if (currentSide === 'left') {
                cardImage.classList.add('hover-left');
            } else {
                cardImage.classList.add('hover-right');
            }
        }
    }
    
    // 更新卡片顯示
    function updateCardDisplay() {
        if (isTransitioning) return; // 如果正在切換中，則忽略此次操作
        isTransitioning = true;
        
        // 1. 先重置卡片包裝器高度 - 始終保持 540px
        const cardWrapper = document.querySelector('.card-wrapper');
        if (cardWrapper) {
            cardWrapper.style.height = '540px'; // 從550px減少到540px
        }
        
        // 2. 移除所有卡片的特殊樣式，但保留當前活動卡片的雙行標題狀態以保證動畫效果
        const activeCard = document.querySelector('.article-card.active');
        const wasTwoLine = activeCard ? activeCard.classList.contains('two-line-title') : false;
        
        document.querySelectorAll('.card-image').forEach(image => {
            image.classList.remove('hover-left', 'hover-right');
        });
        
        document.querySelectorAll('.article-card').forEach((card, index) => {
            if (index !== currentCardIndex) {
                card.classList.remove('two-line-title');
            }
            
            // 重置底部陰影位置確保不會溢出
            const cardImage = card.querySelector('.card-image');
            if (cardImage) {
                const bottomShadow = cardImage.querySelector('.bottom-shadow');
                if (bottomShadow) {
                    bottomShadow.style.bottom = '0';
                }
            }
        });
        
        // 3. 更新卡片顯示狀態
        cards.forEach((card, index) => {
            if (index === currentCardIndex) {
                card.classList.add('active');
                card.style.transform = 'translateX(0)';
                card.style.opacity = '1';
                
                // 將先前活動卡片的雙行標題狀態臨時應用於新卡片，後續再由 checkTitleLines 正確檢測
                if (wasTwoLine) {
                    card.classList.add('temp-two-line');
                }
            } else {
                card.classList.remove('active');
                // 左側卡片
                if (index < currentCardIndex || (currentCardIndex === 0 && index === cards.length - 1)) {
                    card.style.transform = 'translateX(-100%)';
                } 
                // 右側卡片
                else {
                    card.style.transform = 'translateX(100%)';
                }
                card.style.opacity = '0';
            }
        });
        
        // 4. 更新指示器
        indicators.forEach((indicator, index) => {
            if (index === currentCardIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        // 5. 重置指示器位置
        const indicator = document.querySelector('.card-indicator');
        if (indicator) {
            indicator.style.bottom = '-5px'; // 指示器位置始終為 -5px，無論標題行數
        }
        
        // 6. 延遲處理，等待過渡動畫完成
        setTimeout(() => {
            // 移除臨時雙行類
            document.querySelectorAll('.article-card').forEach(card => {
                card.classList.remove('temp-two-line');
            });
            
            isTransitioning = false;
            
            // 7. 僅檢測當前卡片標題並應用適當樣式（帶動畫效果）
            checkTitleLines();
            
            // 8. 應用漸層效果
            applyGradientToCurrentCard();
        }, 300); // 延長到300毫秒確保動畫完成
    }
    
    // 立即初始化第一張卡片，不使用延遲
    cards[0].classList.add('active');
    cards[0].style.transform = 'translateX(0)';
    cards[0].style.opacity = '1';

    // 初始化第一個指示器
    if (indicators.length > 0) {
        indicators[0].classList.add('active');
    }

    // 第一次加載立即檢測標題高度
    checkTitleLines();

    // 剩餘的初始化可以使用延遲
    setTimeout(function() {
        // 重新檢測一次，確保正確
        checkTitleLines();
    }, 500);
    
    // 上一張卡片
    function prevCard() {
        if (isTransitioning) return; // 如果正在過渡中，則忽略此操作
        currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
        updateCardDisplay();
    }
    
    // 下一張卡片
    function nextCard() {
        if (isTransitioning) return; // 如果正在過渡中，則忽略此操作
        currentCardIndex = (currentCardIndex + 1) % cards.length;
        updateCardDisplay();
    }
    
    // 為左側按鈕添加點擊事件
    swipeLeftBtn.addEventListener('click', prevCard);
    
    // 為右側按鈕添加點擊事件
    swipeRightBtn.addEventListener('click', nextCard);
    
    // 點擊指示器跳到對應卡片
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            if (isTransitioning || currentCardIndex === index) return;
            currentCardIndex = index;
            updateCardDisplay();
        });
    });
    
    // 為卡片圖片添加點擊事件，左半部分回到上一張，右半部分前往下一張
    document.querySelectorAll('.card-image').forEach(cardImage => {
        cardImage.addEventListener('click', function(e) {
            if (isTransitioning) return; // 如果正在過渡中，則忽略此操作
            
            // 獲取點擊位置相對於圖片的X座標
            const clickX = e.clientX - this.getBoundingClientRect().left;
            // 獲取圖片寬度
            const imageWidth = this.offsetWidth;
            
            // 如果點擊位置在圖片左半邊，切換到上一張卡片
            if (clickX < imageWidth / 2) {
                prevCard();
            } 
            // 如果點擊位置在圖片右半邊，切換到下一張卡片
            else {
                nextCard();
            }
        });
    });
    
    // 觸控滑動支援
    const cardWrapper = document.querySelector('.card-wrapper');
    let startX, moveX;
    
    cardWrapper.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    cardWrapper.addEventListener('touchmove', function(e) {
        moveX = e.touches[0].clientX;
    });
    
    cardWrapper.addEventListener('touchend', function() {
        if (startX - moveX > 50) { // 向左滑動
            nextCard();
        } else if (moveX - startX > 50) { // 向右滑動
            prevCard();
        }
    });
});

// 初始化市場總覽圖表
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

// 初始化個股圖表
function initStockChart() {
    const ctx = document.getElementById('stockChart');
    if (!ctx) return;
    
    // 模擬數據 - 使用隨機數據生成一條類似股價的線
    const labels = Array.from({length: 30}, (_, i) => (i + 1).toString());
    const basePrice = 610;
    const priceData = [basePrice];
    
    for (let i = 1; i < 30; i++) {
        const change = (Math.random() - 0.5) * 10;
        priceData.push(Math.max(580, Math.min(640, priceData[i-1] + change)));
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '股價',
                data: priceData,
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1,
                fill: true,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#e0e0e0'
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

// 初始化技術分析圖表
function initTechnicalCharts() {
    initMAChart();
    initRSIChart();
}

// 初始化移動平均線圖表
function initMAChart() {
    const ctx = document.getElementById('maChart');
    if (!ctx) return;
    
    // 模擬數據
    const labels = Array.from({length: 20}, (_, i) => (i + 1).toString());
    const priceData = [];
    const ma5Data = [];
    const ma10Data = [];
    const ma20Data = [];
    
    // 生成隨機價格數據
    const basePrice = 610;
    for (let i = 0; i < 40; i++) {
        const change = (Math.random() - 0.5) * 10;
        if (i === 0) {
            priceData.push(basePrice);
        } else {
            priceData.push(Math.max(580, Math.min(640, priceData[i-1] + change)));
        }
    }
    
    // 計算移動平均線
    for (let i = 0; i < 20; i++) {
        if (i >= 4) {
            const ma5Sum = priceData.slice(i-4+20, i+1+20).reduce((a, b) => a + b, 0);
            ma5Data.push(ma5Sum / 5);
        } else {
            ma5Data.push(null);
        }
        
        if (i >= 9) {
            const ma10Sum = priceData.slice(i-9+20, i+1+20).reduce((a, b) => a + b, 0);
            ma10Data.push(ma10Sum / 10);
        } else {
            ma10Data.push(null);
        }
        
        if (i >= 19) {
            const ma20Sum = priceData.slice(i-19+20, i+1+20).reduce((a, b) => a + b, 0);
            ma20Data.push(ma20Sum / 20);
        } else {
            ma20Data.push(null);
        }
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '股價',
                    data: priceData.slice(20, 40),
                    borderColor: '#aaaaaa',
                    backgroundColor: 'rgba(170, 170, 170, 0.1)',
                    tension: 0.1,
                    borderWidth: 1.5,
                    pointRadius: 0
                },
                {
                    label: 'MA5',
                    data: ma5Data,
                    borderColor: '#f44336',
                    backgroundColor: 'transparent',
                    tension: 0.1,
                    borderWidth: 1.5,
                    pointRadius: 0
                },
                {
                    label: 'MA10',
                    data: ma10Data,
                    borderColor: '#4caf50',
                    backgroundColor: 'transparent',
                    tension: 0.1,
                    borderWidth: 1.5,
                    pointRadius: 0
                },
                {
                    label: 'MA20',
                    data: ma20Data,
                    borderColor: '#fb8c00',
                    backgroundColor: 'transparent',
                    tension: 0.1,
                    borderWidth: 1.5,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 10
                        },
                        color: '#e0e0e0'
                    }
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

// 初始化RSI圖表
function initRSIChart() {
    const ctx = document.getElementById('rsiChart');
    if (!ctx) return;
    
    // 模擬RSI數據
    const labels = Array.from({length: 20}, (_, i) => (i + 1).toString());
    const rsiData = [];
    
    for (let i = 0; i < 20; i++) {
        // 生成隨機RSI數據（實際應用中應該根據價格數據計算）
        const rsi = 50 + (Math.random() - 0.5) * 30;
        rsiData.push(Math.min(85, Math.max(30, rsi)));
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'RSI-14',
                data: rsiData,
                borderColor: '#fb8c00',
                backgroundColor: 'rgba(251, 140, 0, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 100,
                    grid: {
                        color: function(context) {
                            if (context.tick.value === 30 || context.tick.value === 70) {
                                return 'rgba(244, 67, 54, 0.3)';
                            }
                            return 'rgba(255, 255, 255, 0.05)';
                        }
                    },
                    ticks: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

// 初始化財務圖表
function initFinancialCharts() {
    initRevenueChart();
    initMarginChart();
}

// 初始化營收與淨利趨勢圖表
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // 模擬數據
    const labels = ['2022 Q1', '2022 Q2', '2022 Q3', '2022 Q4', '2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4'];
    const revenueData = [4800, 5100, 5250, 5600, 5200, 5303, 5462, 6258];
    const profitData = [1950, 2100, 2200, 2450, 2150, 2314, 2362, 2950];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '營收(億)',
                    data: revenueData,
                    backgroundColor: 'rgba(251, 140, 0, 0.7)',
                    order: 2
                },
                {
                    label: '淨利(億)',
                    data: profitData,
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    order: 1
                }
            ]
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
                    beginAtZero: true,
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

// 初始化利潤率趨勢圖表
function initMarginChart() {
    const ctx = document.getElementById('marginChart');
    if (!ctx) return;
    
    // 模擬數據
    const labels = ['2022 Q1', '2022 Q2', '2022 Q3', '2022 Q4', '2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4'];
    const grossMarginData = [52.5, 51.8, 52.0, 52.4, 51.6, 52.1, 51.8, 53.2];
    const operatingMarginData = [40.2, 39.5, 39.8, 40.5, 39.6, 40.1, 39.8, 41.5];
    const netMarginData = [34.5, 33.8, 34.2, 35.0, 33.6, 35.1, 36.2, 38.4];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '毛利率',
                    data: grossMarginData,
                    borderColor: '#fb8c00',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3
                },
                {
                    label: '營益率',
                    data: operatingMarginData,
                    borderColor: '#4caf50',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3
                },
                {
                    label: '淨利率',
                    data: netMarginData,
                    borderColor: '#f5b041',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3
                }
            ]
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
                    min: 30,
                    max: 60,
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

// 初始化產業比較圖表
function initIndustryChart() {
    const ctx = document.getElementById('industryChart');
    if (!ctx) return;
    
    // 模擬數據
    const labels = ['台積電', '聯發科', '聯電', '日月光', '華碩', '鴻海'];
    const marketCapData = [16211, 8653, 6495, 4326, 2935, 11248];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '市值(億新台幣)',
                data: marketCapData,
                backgroundColor: [
                    'rgba(251, 140, 0, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(245, 176, 65, 0.8)',
                    'rgba(119, 136, 153, 0.8)',
                    'rgba(244, 67, 54, 0.8)',
                    'rgba(103, 58, 183, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                y: {
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 更新股票信息（當用戶選擇不同股票時）
function updateStockInfo(stockId) {
    console.log('更新股票信息', stockId);
    // 在實際應用中，這裡應該從API獲取對應的股票數據並更新UI
    
    // 模擬股票數據
    const stockData = {
        '2330': {
            name: '台積電',
            price: 625.00,
            change: '+15.00',
            changePercent: '+2.5%',
            volume: '2,354萬',
            pe: 18.6,
            yield: '1.8%',
            pb: 5.2
        },
        '2412': {
            name: '中華電',
            price: 128.00,
            change: '+1.00',
            changePercent: '+0.8%',
            volume: '1,235萬',
            pe: 16.3,
            yield: '4.2%',
            pb: 2.1
        },
        '2454': {
            name: '聯發科',
            price: 1050.00,
            change: '-12.00',
            changePercent: '-1.2%',
            volume: '863萬',
            pe: 22.4,
            yield: '1.5%',
            pb: 4.8
        }
    };
    
    if (stockData[stockId]) {
        const data = stockData[stockId];
        const isUp = data.change.startsWith('+');
        
        // 更新股票頭部信息
        const stockHeader = document.querySelector('.stock-header');
        if (stockHeader) {
            stockHeader.querySelector('h3').textContent = `${stockId} ${data.name}`;
            stockHeader.querySelector('.price').textContent = data.price.toFixed(2);
            stockHeader.querySelector('.change').textContent = `${data.change} (${data.changePercent})`;
            stockHeader.querySelector('.change').className = `change ${isUp ? 'up' : 'down'}`;
        }
        
        // 更新股票指標
        const metrics = document.querySelectorAll('.stock-metrics .metric .value');
        if (metrics && metrics.length >= 4) {
            metrics[0].textContent = data.volume;
            metrics[1].textContent = data.pe;
            metrics[2].textContent = data.yield;
            metrics[3].textContent = data.pb;
        }
        
        // 在實際應用中，這裡還應該更新圖表數據
    }
}

// 更新圖表時間範圍
function updateChartPeriod(period) {
    console.log('更新圖表時間範圍', period);
    // 在實際應用中，這裡應該根據選擇的時間範圍獲取數據並更新圖表
    
    // 例如，可以根據不同的時間範圍顯示不同的數據點數量
    const dataPoints = {
        '1日': 6,
        '1週': 5,
        '1月': 20,
        '3月': 60,
        '1年': 240,
        '5年': 1200
    };
    
    // 這裡僅模擬一下行為，實際應用中應該重新獲取數據並更新圖表
    const stockChart = document.getElementById('stockChart')?.chart;
    if (stockChart) {
        // 股票圖表已經由Chart.js初始化，可以直接更新
        // 這裡只是示例，實際上需要更新為真實數據
    }
} 