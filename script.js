// 等待文檔加載完成
document.addEventListener('DOMContentLoaded', function() {
    // 設置Chart.js全局配置
    Chart.defaults.color = '#e0e0e0';
    Chart.defaults.borderColor = '#3a3a3a';
    Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
    
    // 初始化市場總覽圖表 - 如果需要的話
    const marketChart = document.getElementById('marketChart');
    if (marketChart) {
        initMarketChart();
    }
});

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