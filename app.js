// State management
let positions = [
  { id: 1, type: 'call', strike: 150, premium: 5, position: 'long', quantity: 1 }
];
let nextId = 2;
let expiryPrice = 150;
let impliedVolatility = 0.32;
let daysToExpiration = 45;
let spotPrice = 150.25;
let riskFreeRate = 0.05;
let payoffChart = null;
let expiryChart = null;
let deltaChart = null;
let thetaChart = null;
let currentTicker = 'AAPL';
let currentPrice = 150.25;
let priceChange = 2.5;

// Live Simulator State
let simulatorPositions = [
  { id: 1, type: 'call', strike: 100, premium: 5, position: 'long', quantity: 1 }
];
let simNextId = 2;
let simCurrentPrice = 100;
let simMinPrice = 80;
let simMaxPrice = 120;
let simTicker = 'AAPL';
let simulatorChart = null;

// Ticker database
const tickerDatabase = {
  'AAPL': { name: 'Apple Inc.', exchange: 'NASDAQ', price: 150.25, change: 2.5, iv: 32, volume: '85M' },
  'MSFT': { name: 'Microsoft Corp.', exchange: 'NASDAQ', price: 368.50, change: 1.8, iv: 28, volume: '42M' },
  'TSLA': { name: 'Tesla Inc.', exchange: 'NASDAQ', price: 242.80, change: 5.2, iv: 55, volume: '120M' },
  'GOOGL': { name: 'Alphabet Inc.', exchange: 'NASDAQ', price: 142.30, change: -0.5, iv: 30, volume: '28M' },
  'AMZN': { name: 'Amazon.com Inc.', exchange: 'NASDAQ', price: 178.90, change: 1.2, iv: 35, volume: '52M' },
  'NVDA': { name: 'NVIDIA Corp.', exchange: 'NASDAQ', price: 495.20, change: 3.8, iv: 68, volume: '95M' },
  'META': { name: 'Meta Platforms', exchange: 'NASDAQ', price: 485.60, change: -3.1, iv: 45, volume: '38M' },
  'SPY': { name: 'SPDR S&P 500 ETF', exchange: 'NYSE', price: 455.30, change: 0.8, iv: 18, volume: '125M' },
  'QQQ': { name: 'Invesco QQQ Trust', exchange: 'NASDAQ', price: 385.40, change: 1.5, iv: 22, volume: '68M' },
  'RELIANCE': { name: 'Reliance Industries', exchange: 'NSE', price: 2450, change: -0.8, iv: 25, volume: '8M' },
  'TCS': { name: 'Tata Consultancy', exchange: 'NSE', price: 3680, change: 1.2, iv: 22, volume: '5M' },
  'INFY': { name: 'Infosys Ltd.', exchange: 'NSE', price: 1520, change: 0.5, iv: 28, volume: '12M' },
  'HDFC': { name: 'HDFC Bank', exchange: 'NSE', price: 1650, change: -0.3, iv: 20, volume: '15M' },
  'WIPRO': { name: 'Wipro Ltd.', exchange: 'NSE', price: 445, change: 1.8, iv: 30, volume: '9M' },
  'SBIN': { name: 'State Bank of India', exchange: 'NSE', price: 625, change: 2.1, iv: 35, volume: '25M' }
};

// Templates data
const templates = [
  { name: 'Long Call', strikes: [100], types: ['call'], positions: ['long'], premiums: [5], description: 'Bullish view, defined risk', outlook: 'bullish' },
  { name: 'Long Put', strikes: [100], types: ['put'], positions: ['long'], premiums: [5], description: 'Bearish view, defined risk', outlook: 'bearish' },
  { name: 'Bull Call Spread', strikes: [100, 105], types: ['call', 'call'], positions: ['long', 'short'], premiums: [5, 2], description: 'Bullish with reduced cost', outlook: 'bullish' },
  { name: 'Bear Put Spread', strikes: [100, 95], types: ['put', 'put'], positions: ['long', 'short'], premiums: [5, 2], description: 'Bearish with reduced cost', outlook: 'bearish' },
  { name: 'Long Straddle', strikes: [100, 100], types: ['call', 'put'], positions: ['long', 'long'], premiums: [5, 5], description: 'High volatility play', outlook: 'neutral' },
  { name: 'Long Strangle', strikes: [95, 105], types: ['put', 'call'], positions: ['long', 'long'], premiums: [3, 3], description: 'High volatility, lower cost', outlook: 'neutral' },
  { name: 'Iron Condor', strikes: [95, 100, 100, 105], types: ['put', 'put', 'call', 'call'], positions: ['short', 'long', 'short', 'long'], premiums: [2, 4, 4, 2], description: 'High probability income', outlook: 'neutral' },
  { name: 'Butterfly Spread', strikes: [95, 100, 105], types: ['call', 'call', 'call'], positions: ['long', 'short', 'long'], premiums: [8, 5, 2], description: 'Neutral with defined risk', outlook: 'neutral' },
  { name: 'Call Ratio Spread', strikes: [100, 105, 105], types: ['call', 'call', 'call'], positions: ['long', 'short', 'short'], premiums: [5, 2, 2], description: 'Bullish with income', outlook: 'bullish' },
  { name: 'Covered Call', strikes: [105], types: ['call'], positions: ['short'], premiums: [2], description: 'Income on stock position', outlook: 'neutral' },
  { name: 'Married Put', strikes: [95], types: ['put'], positions: ['long'], premiums: [3], description: 'Protective hedge', outlook: 'bullish' },
  { name: 'Calendar Spread', strikes: [100, 100], types: ['call', 'call'], positions: ['short', 'long'], premiums: [3, 5], description: 'Time decay strategy', outlook: 'neutral' }
];

// Live Simulator Functions
function initializeSimulator() {
  renderSimulatorTemplates();
  renderSimulatorPositions();
  updateSimulatorMetrics();
  renderSimulatorChart();
  
  // Set initial state
  document.getElementById('simTicker').value = simTicker;
  document.getElementById('simCurrentPrice').textContent = `${simCurrentPrice.toFixed(2)}`;
  document.getElementById('simPriceSlider').value = simCurrentPrice;
  document.getElementById('simPriceDisplay').textContent = `${simCurrentPrice.toFixed(2)}`;
  document.getElementById('simMinPrice').value = simMinPrice;
  document.getElementById('simMaxPrice').value = simMaxPrice;
  document.getElementById('simMinLabel').textContent = `${simMinPrice}`;
  document.getElementById('simMaxLabel').textContent = `${simMaxPrice}`;
}

function renderSimulatorTemplates() {
  const container = document.getElementById('simulatorTemplates');
  if (!container) return;
  
  const quickTemplates = [
    { name: 'Long Call', strikes: [100], types: ['call'], positions: ['long'], premiums: [5] },
    { name: 'Bull Spread', strikes: [100, 105], types: ['call', 'call'], positions: ['long', 'short'], premiums: [5, 2] },
    { name: 'Straddle', strikes: [100, 100], types: ['call', 'put'], positions: ['long', 'long'], premiums: [5, 5] },
    { name: 'Iron Condor', strikes: [95, 100, 100, 105], types: ['put', 'put', 'call', 'call'], positions: ['short', 'long', 'short', 'long'], premiums: [2, 4, 4, 2] }
  ];
  
  container.innerHTML = quickTemplates.map(t => `
    <button class="btn btn-primary" onclick="applySimulatorTemplate('${t.name}')" style="width: 100%; padding: 8px; font-size: 11px; text-align: left; justify-content: flex-start;">
      ${t.name}
    </button>
  `).join('');
}

function applySimulatorTemplate(name) {
  const template = templates.find(t => t.name === name);
  if (!template) return;
  
  simulatorPositions = template.strikes.map((strike, idx) => ({
    id: idx + 1,
    type: template.types[idx],
    strike: strike,
    premium: template.premiums[idx],
    position: template.positions[idx],
    quantity: 1
  }));
  
  simNextId = simulatorPositions.length + 1;
  renderSimulatorPositions();
  updateSimulatorMetrics();
  renderSimulatorChart();
}

function addSimulatorPosition() {
  simulatorPositions.push({
    id: simNextId++,
    type: 'call',
    strike: Math.round(simCurrentPrice),
    premium: 5,
    position: 'long',
    quantity: 1
  });
  renderSimulatorPositions();
  updateSimulatorMetrics();
  renderSimulatorChart();
}

function removeSimulatorPosition(id) {
  if (simulatorPositions.length === 1) return;
  simulatorPositions = simulatorPositions.filter(p => p.id !== id);
  renderSimulatorPositions();
  updateSimulatorMetrics();
  renderSimulatorChart();
}

function updateSimulatorPosition(id, field, value) {
  const position = simulatorPositions.find(p => p.id === id);
  if (position) {
    if (field === 'quantity') {
      position[field] = parseInt(value) || 1;
    } else if (field === 'strike' || field === 'premium') {
      position[field] = parseFloat(value) || 0;
    } else {
      position[field] = value;
    }
    updateSimulatorMetrics();
    renderSimulatorChart();
  }
}

function renderSimulatorPositions() {
  const container = document.getElementById('simulatorPositions');
  if (!container) return;
  
  container.innerHTML = simulatorPositions.map((pos, idx) => `
    <div style="padding: 10px; background: var(--bg-tertiary); border-radius: var(--radius-base); margin-bottom: 8px; border: 1px solid var(--border-color);">
      <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 10px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase;">#${idx + 1}</span>
        <button class="btn btn-danger" onclick="removeSimulatorPosition(${pos.id})" ${simulatorPositions.length === 1 ? 'disabled' : ''} style="padding: 2px 6px; margin-left: auto;">
          <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 12px; height: 12px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px;">
        <select onchange="updateSimulatorPosition(${pos.id}, 'type', this.value)" style="padding: 5px; font-size: 11px;">
          <option value="call" ${pos.type === 'call' ? 'selected' : ''}>Call</option>
          <option value="put" ${pos.type === 'put' ? 'selected' : ''}>Put</option>
        </select>
        <select onchange="updateSimulatorPosition(${pos.id}, 'position', this.value)" style="padding: 5px; font-size: 11px;">
          <option value="long" ${pos.position === 'long' ? 'selected' : ''}>Long</option>
          <option value="short" ${pos.position === 'short' ? 'selected' : ''}>Short</option>
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div>
          <label style="font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; display: block; margin-bottom: 3px;">Strike</label>
          <input type="number" value="${pos.strike}" onchange="updateSimulatorPosition(${pos.id}, 'strike', this.value)" style="width: 100%; padding: 5px; font-size: 11px;">
        </div>
        <div>
          <label style="font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; display: block; margin-bottom: 3px;">Premium</label>
          <input type="number" value="${pos.premium}" onchange="updateSimulatorPosition(${pos.id}, 'premium', this.value)" style="width: 100%; padding: 5px; font-size: 11px;">
        </div>
      </div>
    </div>
  `).join('');
}

function calculateSimulatorPayoff(position, price) {
  const { type, strike, premium, position: pos, quantity } = position;
  let payoff = 0;
  
  if (type === 'call') {
    const intrinsic = Math.max(0, price - strike);
    payoff = pos === 'long' ? intrinsic - premium : premium - intrinsic;
  } else {
    const intrinsic = Math.max(0, strike - price);
    payoff = pos === 'long' ? intrinsic - premium : premium - intrinsic;
  }
  
  return payoff * quantity;
}

function generateSimulatorChartData() {
  const strikes = simulatorPositions.map(p => p.strike);
  const minStrike = Math.min(...strikes);
  const maxStrike = Math.max(...strikes);
  const range = Math.max(maxStrike - minStrike, 30);
  const start = Math.max(0, minStrike - range * 0.3);
  const end = maxStrike + range * 0.3;
  const step = (end - start) / 200;
  
  const data = [];
  for (let price = start; price <= end; price += step) {
    const roundedPrice = Math.round(price * 100) / 100;
    const total = simulatorPositions.reduce((sum, pos) => 
      sum + calculateSimulatorPayoff(pos, roundedPrice), 0);
    data.push({ price: roundedPrice, total });
  }
  
  return data;
}

function updateSimulatorMetrics() {
  const data = generateSimulatorChartData();
  
  // Current P&L
  const currentPnL = simulatorPositions.reduce((sum, pos) => 
    sum + calculateSimulatorPayoff(pos, simCurrentPrice), 0);
  const pnlEl = document.getElementById('simPnL');
  if (pnlEl) {
    pnlEl.textContent = `${currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}`;
    pnlEl.style.color = currentPnL >= 0 ? 'var(--success-green)' : 'var(--danger-red)';
  }
  
  // P&L Percentage
  const totalPremium = Math.abs(simulatorPositions.reduce((sum, p) => 
    sum + (p.position === 'long' ? p.premium : -p.premium) * p.quantity, 0));
  const pnlPercent = totalPremium > 0 ? (currentPnL / totalPremium * 100) : 0;
  const pnlPercentEl = document.getElementById('simPnLPercent');
  if (pnlPercentEl) {
    pnlPercentEl.textContent = `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`;
    pnlPercentEl.style.color = currentPnL >= 0 ? 'var(--success-green)' : 'var(--danger-red)';
  }
  
  // Max Profit
  const maxProfit = Math.max(...data.map(d => d.total));
  const maxProfitEl = document.getElementById('simMaxProfit');
  if (maxProfitEl) {
    maxProfitEl.textContent = maxProfit === Infinity ? '∞' : `${maxProfit.toFixed(2)}`;
  }
  
  // Max Loss
  const maxLoss = Math.min(...data.map(d => d.total));
  const maxLossEl = document.getElementById('simMaxLoss');
  if (maxLossEl) {
    maxLossEl.textContent = maxLoss === -Infinity ? '-∞' : `${maxLoss.toFixed(2)}`;
  }
  
  // Breakevens
  const breakevens = [];
  for (let i = 1; i < data.length; i++) {
    if ((data[i-1].total < 0 && data[i].total >= 0) || (data[i-1].total >= 0 && data[i].total < 0)) {
      breakevens.push(data[i].price);
    }
  }
  const breakevenEl = document.getElementById('simBreakeven');
  if (breakevenEl) {
    if (breakevens.length === 0) {
      breakevenEl.textContent = '—';
    } else if (breakevens.length === 1) {
      breakevenEl.textContent = `${breakevens[0].toFixed(2)}`;
    } else {
      breakevenEl.textContent = `${breakevens.length} points`;
    }
  }
  
  // Profit Probability
  const profitPoints = data.filter(d => d.total > 0).length;
  const profitProb = (profitPoints / data.length * 100).toFixed(1);
  const probEl = document.getElementById('simProfitProb');
  if (probEl) probEl.textContent = `${profitProb}%`;
  
  // Greeks
  const greeks = simulatorPositions.reduce((total, pos) => {
    const g = calculateGreeks(pos.type, pos.strike, simCurrentPrice, impliedVolatility, daysToExpiration, riskFreeRate);
    const multiplier = pos.position === 'long' ? 1 : -1;
    return {
      delta: total.delta + g.delta * multiplier * pos.quantity,
      gamma: total.gamma + g.gamma * multiplier * pos.quantity,
      theta: total.theta + g.theta * multiplier * pos.quantity,
      vega: total.vega + g.vega * multiplier * pos.quantity,
      rho: total.rho + g.rho * multiplier * pos.quantity
    };
  }, { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 });
  
  const deltaEl = document.getElementById('simDelta');
  const gammaEl = document.getElementById('simGamma');
  const thetaEl = document.getElementById('simTheta');
  const vegaEl = document.getElementById('simVega');
  const rhoEl = document.getElementById('simRho');
  
  if (deltaEl) deltaEl.textContent = greeks.delta.toFixed(3);
  if (gammaEl) gammaEl.textContent = greeks.gamma.toFixed(4);
  if (thetaEl) thetaEl.textContent = `${greeks.theta.toFixed(2)}`;
  if (vegaEl) vegaEl.textContent = greeks.vega.toFixed(3);
  if (rhoEl) rhoEl.textContent = greeks.rho.toFixed(3);
}

function updateSimulatorPrice() {
  const slider = document.getElementById('simPriceSlider');
  simCurrentPrice = parseFloat(slider.value);
  document.getElementById('simPriceDisplay').textContent = `${simCurrentPrice.toFixed(2)}`;
  document.getElementById('simCurrentPrice').textContent = `${simCurrentPrice.toFixed(2)}`;
  updateSimulatorMetrics();
  renderSimulatorChart();
}

function updateSimulatorRange() {
  simMinPrice = parseFloat(document.getElementById('simMinPrice').value) || 80;
  simMaxPrice = parseFloat(document.getElementById('simMaxPrice').value) || 120;
  
  const slider = document.getElementById('simPriceSlider');
  slider.min = simMinPrice;
  slider.max = simMaxPrice;
  
  // Clamp current price to new range
  if (simCurrentPrice < simMinPrice) simCurrentPrice = simMinPrice;
  if (simCurrentPrice > simMaxPrice) simCurrentPrice = simMaxPrice;
  slider.value = simCurrentPrice;
  
  document.getElementById('simMinLabel').textContent = `${simMinPrice}`;
  document.getElementById('simMaxLabel').textContent = `${simMaxPrice}`;
  document.getElementById('simPriceDisplay').textContent = `${simCurrentPrice.toFixed(2)}`;
  document.getElementById('simCurrentPrice').textContent = `${simCurrentPrice.toFixed(2)}`;
  
  updateSimulatorMetrics();
  renderSimulatorChart();
}

function changeSimulatorTicker() {
  simTicker = document.getElementById('simTicker').value;
  const data = tickerDatabase[simTicker];
  if (data) {
    simCurrentPrice = data.price;
    const range = data.price * 0.2;
    simMinPrice = Math.round(data.price - range);
    simMaxPrice = Math.round(data.price + range);
    
    document.getElementById('simCurrentPrice').textContent = `${simCurrentPrice.toFixed(2)}`;
    document.getElementById('simPriceSlider').min = simMinPrice;
    document.getElementById('simPriceSlider').max = simMaxPrice;
    document.getElementById('simPriceSlider').value = simCurrentPrice;
    document.getElementById('simPriceDisplay').textContent = `${simCurrentPrice.toFixed(2)}`;
    document.getElementById('simMinPrice').value = simMinPrice;
    document.getElementById('simMaxPrice').value = simMaxPrice;
    document.getElementById('simMinLabel').textContent = `${simMinPrice}`;
    document.getElementById('simMaxLabel').textContent = `${simMaxPrice}`;
    
    // Update strikes to be near new price
    simulatorPositions.forEach(pos => {
      pos.strike = Math.round(simCurrentPrice / 5) * 5;
    });
    
    renderSimulatorPositions();
    updateSimulatorMetrics();
    renderSimulatorChart();
  }
}

function renderSimulatorChart() {
  const ctx = document.getElementById('simulatorChart');
  if (!ctx) return;
  
  const chartData = generateSimulatorChartData();
  const prices = chartData.map(d => d.price);
  const totals = chartData.map(d => d.total);
  
  // Create gradient fills
  const profitData = chartData.map(d => d.total >= 0 ? d.total : 0);
  const lossData = chartData.map(d => d.total < 0 ? d.total : 0);
  
  // Individual position datasets
  const positionDatasets = simulatorPositions.map((pos, idx) => ({
    label: `${pos.position.charAt(0).toUpperCase() + pos.position.slice(1)} ${pos.type.charAt(0).toUpperCase() + pos.type.slice(1)} ${pos.strike}`,
    data: chartData.map(d => calculateSimulatorPayoff(pos, d.price)),
    borderColor: ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][idx % 5],
    borderWidth: 1.5,
    borderDash: [4, 4],
    pointRadius: 0,
    fill: false,
    tension: 0.1
  }));
  
  if (simulatorChart) {
    simulatorChart.destroy();
  }
  
  simulatorChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: prices,
      datasets: [
        ...positionDatasets,
        {
          label: 'Profit Zone',
          data: profitData,
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: 'origin',
          tension: 0.1,
          order: 3
        },
        {
          label: 'Loss Zone',
          data: lossData,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: 'origin',
          tension: 0.1,
          order: 3
        },
        {
          label: 'Combined Strategy',
          data: totals,
          borderColor: '#0f172a',
          borderWidth: 4,
          pointRadius: 0,
          fill: false,
          tension: 0.1,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 200
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: { size: 10 },
            usePointStyle: true,
            padding: 8,
            color: '#64748b',
            filter: (item) => !item.text.includes('Zone')
          }
        },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            title: (items) => `Price: ${items[0].label}`,
            label: (context) => {
              if (context.dataset.label.includes('Zone')) return null;
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
            }
          },
          filter: (item) => !item.dataset.label.includes('Zone')
        },
        annotation: {
          annotations: {
            currentPrice: {
              type: 'line',
              xMin: simCurrentPrice,
              xMax: simCurrentPrice,
              borderColor: '#f59e0b',
              borderWidth: 2,
              borderDash: [6, 3],
              label: {
                display: true,
                content: `Current: ${simCurrentPrice.toFixed(2)}`,
                position: 'start',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                font: { size: 10, weight: 'bold' },
                padding: 4
              }
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Underlying Price',
            font: { size: 11, weight: '600' },
            color: '#64748b'
          },
          ticks: {
            callback: (value, index) => {
              const actualValue = prices[index];
              return actualValue ? `${actualValue.toFixed(0)}` : '';
            },
            maxTicksLimit: 10,
            font: { size: 10 },
            color: '#94a3b8'
          },
          grid: { color: '#e2e8f0' },
          border: { color: '#cbd5e1' }
        },
        y: {
          title: {
            display: true,
            text: 'P&L',
            font: { size: 11, weight: '600' },
            color: '#64748b'
          },
          ticks: {
            callback: (value) => `${value.toFixed(0)}`,
            font: { size: 10 },
            color: '#94a3b8'
          },
          grid: {
            color: (context) => context.tick.value === 0 ? '#64748b' : '#e2e8f0',
            lineWidth: (context) => context.tick.value === 0 ? 2 : 1
          },
          border: { color: '#cbd5e1' }
        }
      }
    }
  });
}

// Make simulator functions global
window.addSimulatorPosition = addSimulatorPosition;
window.removeSimulatorPosition = removeSimulatorPosition;
window.updateSimulatorPosition = updateSimulatorPosition;
window.applySimulatorTemplate = applySimulatorTemplate;
window.updateSimulatorPrice = updateSimulatorPrice;
window.updateSimulatorRange = updateSimulatorRange;
window.changeSimulatorTicker = changeSimulatorTicker;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  initializeEventListeners();
  initializeTickerSelector();
  updateLivePrice();
  renderPositions();
  updateAllMetrics();
  renderAllCharts();
  renderTemplates();
  updateDashboard();
  initializeSimulator();
  
  // Switch to dashboard tab by default
  switchTab('dashboard');
  
  // Add keyboard support for simulator
  document.addEventListener('keydown', (e) => {
    const activeTab = document.querySelector('.tab.active')?.dataset.tab;
    if (activeTab === 'simulator') {
      const slider = document.getElementById('simPriceSlider');
      if (slider && document.activeElement !== slider) {
        const step = parseFloat(slider.step) || 0.5;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          simCurrentPrice = Math.min(simMaxPrice, simCurrentPrice + step);
          slider.value = simCurrentPrice;
          updateSimulatorPrice();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          simCurrentPrice = Math.max(simMinPrice, simCurrentPrice - step);
          slider.value = simCurrentPrice;
          updateSimulatorPrice();
        }
      }
    }
  });
  
  // Add resize observers for chart containers
  const chartContainers = ['payoffChartContainer', 'expiryChartContainer', 'deltaChartContainer', 'thetaChartContainer'];
  chartContainers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          // Debounce resize to avoid too many redraws
          clearTimeout(container.resizeTimeout);
          container.resizeTimeout = setTimeout(() => {
            if (containerId === 'payoffChartContainer') renderPayoffChart();
            else if (containerId === 'expiryChartContainer') renderExpiryChart();
            else if (containerId === 'deltaChartContainer') renderDeltaChart();
            else if (containerId === 'thetaChartContainer') renderThetaChart();
          }, 200);
        }
      });
      resizeObserver.observe(container);
    }
  });
});

function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeTab) activeTab.classList.add('active');
  
  // Update content
  const allTabs = ['dashboardTab', 'builderTab', 'greeksTab', 'templatesTab', 'payoffTab'];
  allTabs.forEach(tab => {
    const el = document.getElementById(tab);
    if (el) el.classList.add('hidden');
  });
  
  const activeContent = document.getElementById(`${tabName}Tab`);
  if (activeContent) activeContent.classList.remove('hidden');
  
  // Re-render charts when switching tabs
  setTimeout(() => {
    if (tabName === 'builder') renderPayoffChart();
    else if (tabName === 'payoff') renderExpiryChart();
    else if (tabName === 'greeks') { renderGreeksTable(); renderDeltaChart(); renderThetaChart(); }
  }, 100);
}

function initializeTickerSelector() {
  const tickerInput = document.getElementById('tickerInput');
  const tickerDropdown = document.getElementById('tickerDropdown');
  
  tickerInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toUpperCase();
    if (searchTerm.length === 0) {
      tickerDropdown.classList.add('hidden');
      return;
    }
    
    const matches = Object.entries(tickerDatabase).filter(([symbol, data]) => 
      symbol.includes(searchTerm) || data.name.toUpperCase().includes(searchTerm)
    );
    
    if (matches.length > 0) {
      tickerDropdown.innerHTML = matches.map(([symbol, data]) => `
        <div class="ticker-option" onclick="selectTicker('${symbol}')">
          <div class="ticker-option-name">${symbol}</div>
          <div class="ticker-option-exchange">${data.exchange} - ${data.name}</div>
        </div>
      `).join('');
      tickerDropdown.classList.remove('hidden');
    } else {
      tickerDropdown.classList.add('hidden');
    }
  });
  
  tickerInput.addEventListener('focus', () => {
    if (tickerInput.value.length > 0) {
      tickerInput.dispatchEvent(new Event('input'));
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.ticker-selector')) {
      tickerDropdown.classList.add('hidden');
    }
  });
}

function selectTicker(symbol) {
  currentTicker = symbol;
  const data = tickerDatabase[symbol];
  currentPrice = data.price;
  priceChange = data.change;
  spotPrice = data.price;
  impliedVolatility = data.iv / 100;
  expiryPrice = data.price;
  
  document.getElementById('tickerInput').value = symbol;
  document.getElementById('tickerDropdown').classList.add('hidden');
  
  updateLivePrice();
  updateAllMetrics();
  renderAllCharts();
}

function updateLivePrice() {
  const data = tickerDatabase[currentTicker];
  const priceEl = document.getElementById('livePrice');
  const changeEl = document.getElementById('livePriceChange');
  
  const isIndianMarket = data.exchange === 'NSE';
  const currencySymbol = isIndianMarket ? '₹' : '$';
  
  priceEl.textContent = `${currencySymbol}${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  changeEl.textContent = `${data.change >= 0 ? '+' : ''}${data.change.toFixed(1)}%`;
  changeEl.style.color = data.change >= 0 ? 'var(--success-green)' : 'var(--danger-red)';
  
  document.getElementById('tickerInput').value = currentTicker;
}

function initializeEventListeners() {
  document.getElementById('addPositionBtn').addEventListener('click', addPosition);
  
  const expiryInput = document.getElementById('expiryPrice');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      expiryPrice = parseFloat(e.target.value) || 0;
      renderExpiryCalculator();
      renderExpiryChart();
    });
  }
  
  const ivSlider = document.getElementById('ivSlider');
  if (ivSlider) {
    ivSlider.addEventListener('input', (e) => {
      impliedVolatility = parseFloat(e.target.value) / 100;
      document.getElementById('ivDisplay').textContent = `${e.target.value}%`;
      updateAllMetrics();
      renderAllCharts();
    });
  }
  
  const dteSlider = document.getElementById('dteSlider');
  if (dteSlider) {
    dteSlider.addEventListener('input', (e) => {
      daysToExpiration = parseInt(e.target.value);
      document.getElementById('dteDisplay').textContent = `${e.target.value} days`;
      updateAllMetrics();
      renderAllCharts();
    });
  }
  
  const accountSize = document.getElementById('accountSize');
  const riskPercent = document.getElementById('riskPercent');
  if (accountSize && riskPercent) {
    accountSize.addEventListener('input', updatePositionSize);
    riskPercent.addEventListener('input', updatePositionSize);
  }
}

function addPosition() {
  positions.push({
    id: nextId++,
    type: 'call',
    strike: Math.round(spotPrice),
    premium: 5,
    position: 'long',
    quantity: 1
  });
  renderPositions();
  updateAllMetrics();
  renderPayoffChart();
  updateDashboard();
  updateRiskMetrics();
}

// Chart resize and export functions
function resetChartSize(chartId) {
  const container = document.getElementById(chartId + 'Container');
  if (container) {
    if (chartId === 'payoffChart') container.style.height = '500px';
    else if (chartId === 'expiryChart') container.style.height = '400px';
    else container.style.height = '300px';
    
    setTimeout(() => {
      if (chartId === 'payoffChart') renderPayoffChart();
      else if (chartId === 'expiryChart') renderExpiryChart();
      else if (chartId === 'deltaChart') renderDeltaChart();
      else if (chartId === 'thetaChart') renderThetaChart();
    }, 100);
  }
}

function toggleFullscreen(chartId) {
  const container = document.getElementById(chartId + 'Container');
  if (container) {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        alert('Error attempting to enable fullscreen: ' + err.message);
      });
    } else {
      document.exitFullscreen();
    }
  }
}

function exportChart(chartId) {
  const canvas = document.getElementById(chartId);
  if (canvas) {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${chartId}_${currentTicker}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = url;
    link.click();
  }
}

function removePosition(id) {
  if (positions.length === 1) return;
  positions = positions.filter(p => p.id !== id);
  renderPositions();
  updateAllMetrics();
  renderPayoffChart();
  renderExpiryCalculator();
  updateDashboard();
  updateRiskMetrics();
}

function updatePosition(id, field, value) {
  const position = positions.find(p => p.id === id);
  if (position) {
    if (field === 'quantity') {
      position[field] = parseInt(value) || 1;
    } else if (field === 'strike' || field === 'premium') {
      position[field] = parseFloat(value) || 0;
    } else {
      position[field] = value;
    }
    updateMetrics();
    renderPayoffChart();
    renderExpiryCalculator();
  }
}

function renderPositions() {
  const tbody = document.getElementById('positionsTable');
  tbody.innerHTML = positions.map((pos, idx) => `
    <tr>
      <td><strong>${idx + 1}</strong></td>
      <td>
        <select onchange="updatePosition(${pos.id}, 'type', this.value)">
          <option value="call" ${pos.type === 'call' ? 'selected' : ''}>Call</option>
          <option value="put" ${pos.type === 'put' ? 'selected' : ''}>Put</option>
        </select>
      </td>
      <td>
        <select onchange="updatePosition(${pos.id}, 'position', this.value)">
          <option value="long" ${pos.position === 'long' ? 'selected' : ''}>Long</option>
          <option value="short" ${pos.position === 'short' ? 'selected' : ''}>Short</option>
        </select>
      </td>
      <td>
        <input type="number" value="${pos.strike}" onchange="updatePosition(${pos.id}, 'strike', this.value)">
      </td>
      <td>
        <input type="number" value="${pos.premium}" onchange="updatePosition(${pos.id}, 'premium', this.value)">
      </td>
      <td>
        <input type="number" value="${pos.quantity}" min="1" onchange="updatePosition(${pos.id}, 'quantity', this.value)" style="width: 80px;">
      </td>
      <td>
        <button class="btn btn-danger" onclick="removePosition(${pos.id})" ${positions.length === 1 ? 'disabled' : ''}>
          <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
  
  document.getElementById('positionCount').textContent = positions.length;
}

function calculatePayoff(position, spotPrice) {
  const { type, strike, premium, position: pos, quantity } = position;
  let payoff = 0;
  
  if (type === 'call') {
    const intrinsic = Math.max(0, spotPrice - strike);
    payoff = pos === 'long' ? intrinsic - premium : premium - intrinsic;
  } else {
    const intrinsic = Math.max(0, strike - spotPrice);
    payoff = pos === 'long' ? intrinsic - premium : premium - intrinsic;
  }
  
  return payoff * quantity;
}

function generateChartData() {
  const strikes = positions.map(p => p.strike);
  const minStrike = Math.min(...strikes);
  const maxStrike = Math.max(...strikes);
  const range = maxStrike - minStrike || 50;
  const start = Math.max(0, minStrike - range);
  const end = maxStrike + range;
  const step = (end - start) / 100;
  
  const data = [];
  for (let price = start; price <= end; price += step) {
    const point = { price: Math.round(price * 100) / 100 };
    
    positions.forEach((pos, idx) => {
      point[`pos${idx}`] = calculatePayoff(pos, price);
    });
    
    point.total = positions.reduce((sum, pos) => sum + calculatePayoff(pos, price), 0);
    data.push(point);
  }
  
  return data;
}

// Black-Scholes Greeks calculations
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

function normalPDF(x) {
  return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
}

function calculateGreeks(type, strike, spot, iv, dte, rate) {
  const T = dte / 365;
  const d1 = (Math.log(spot / strike) + (rate + iv * iv / 2) * T) / (iv * Math.sqrt(T));
  const d2 = d1 - iv * Math.sqrt(T);
  
  let delta, gamma, theta, vega, rho;
  
  if (type === 'call') {
    delta = normalCDF(d1);
    theta = (-spot * normalPDF(d1) * iv / (2 * Math.sqrt(T)) - rate * strike * Math.exp(-rate * T) * normalCDF(d2)) / 365;
    rho = strike * T * Math.exp(-rate * T) * normalCDF(d2) / 100;
  } else {
    delta = normalCDF(d1) - 1;
    theta = (-spot * normalPDF(d1) * iv / (2 * Math.sqrt(T)) + rate * strike * Math.exp(-rate * T) * normalCDF(-d2)) / 365;
    rho = -strike * T * Math.exp(-rate * T) * normalCDF(-d2) / 100;
  }
  
  gamma = normalPDF(d1) / (spot * iv * Math.sqrt(T));
  vega = spot * normalPDF(d1) * Math.sqrt(T) / 100;
  
  return { delta, gamma, theta, vega, rho };
}

function getPositionGreeks(position) {
  const greeks = calculateGreeks(position.type, position.strike, spotPrice, impliedVolatility, daysToExpiration, riskFreeRate);
  const multiplier = position.position === 'long' ? 1 : -1;
  
  return {
    delta: greeks.delta * multiplier * position.quantity,
    gamma: greeks.gamma * multiplier * position.quantity,
    theta: greeks.theta * multiplier * position.quantity,
    vega: greeks.vega * multiplier * position.quantity,
    rho: greeks.rho * multiplier * position.quantity
  };
}

function getPortfolioGreeks() {
  return positions.reduce((total, pos) => {
    const greeks = getPositionGreeks(pos);
    return {
      delta: total.delta + greeks.delta,
      gamma: total.gamma + greeks.gamma,
      theta: total.theta + greeks.theta,
      vega: total.vega + greeks.vega,
      rho: total.rho + greeks.rho
    };
  }, { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 });
}

function updateAllMetrics() {
  updateMetrics();
  updateGreeksDisplay();
}

function updateMetrics() {
  const data = generateChartData();
  
  // Max Profit
  const maxProfit = Math.max(...data.map(d => d.total));
  const maxProfitEl = document.getElementById('maxProfit');
  if (maxProfitEl) {
    maxProfitEl.textContent = maxProfit === Infinity ? '∞' : `${maxProfit.toFixed(2)}`;
  }
  
  // Max Loss
  const maxLoss = Math.min(...data.map(d => d.total));
  const maxLossEl = document.getElementById('maxLoss');
  if (maxLossEl) {
    maxLossEl.textContent = maxLoss === -Infinity ? '∞' : `${maxLoss.toFixed(2)}`;
  }
  
  // Breakevens
  const breakevens = [];
  for (let i = 1; i < data.length; i++) {
    if ((data[i-1].total < 0 && data[i].total >= 0) || (data[i-1].total >= 0 && data[i].total < 0)) {
      breakevens.push(data[i].price);
    }
  }
  const breakevenEl = document.getElementById('breakevens');
  if (breakevenEl) {
    breakevenEl.textContent = breakevens.length || '—';
  }
  
  // Net Premium
  const netPremium = positions.reduce((sum, p) => 
    sum + (p.position === 'long' ? -p.premium : p.premium) * p.quantity, 0
  );
  const netPremiumEl = document.getElementById('netPremium');
  if (netPremiumEl) {
    netPremiumEl.textContent = `${netPremium.toFixed(2)}`;
  }
}

function updateGreeksDisplay() {
  const greeks = getPortfolioGreeks();
  
  // Update header
  const headerDelta = document.getElementById('headerDelta');
  const headerTheta = document.getElementById('headerTheta');
  if (headerDelta) headerDelta.textContent = greeks.delta.toFixed(3);
  if (headerTheta) headerTheta.textContent = `${greeks.theta.toFixed(2)}`;
  
  // Update dashboard
  const elements = {
    portfolioDelta: greeks.delta.toFixed(3),
    portfolioGamma: greeks.gamma.toFixed(4),
    portfolioTheta: `${greeks.theta.toFixed(2)}`,
    portfolioVega: greeks.vega.toFixed(3)
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function renderPayoffChart() {
  const ctx = document.getElementById('payoffChart');
  if (!ctx) return;
  
  const chartData = generateChartData();
  const prices = chartData.map(d => d.price);
  const totals = chartData.map(d => d.total);
  
  // Create datasets for individual positions (dashed lines)
  const positionDatasets = positions.map((pos, idx) => ({
    label: `${pos.position.charAt(0).toUpperCase() + pos.position.slice(1)} ${pos.type.charAt(0).toUpperCase() + pos.type.slice(1)} ${pos.strike}`,
    data: chartData.map(d => d[`pos${idx}`]),
    borderColor: ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][idx % 6],
    borderWidth: 2,
    borderDash: [5, 5],
    pointRadius: 0,
    fill: false,
    tension: 0.1,
    opacity: 0.7
  }));
  
  // Create gradient fills for profit/loss zones
  const profitData = chartData.map(d => d.total >= 0 ? d.total : 0);
  const lossData = chartData.map(d => d.total < 0 ? d.total : 0);
  
  if (payoffChart) {
    payoffChart.destroy();
  }
  
  payoffChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: prices,
      datasets: [
        ...positionDatasets,
        {
          label: 'Profit Zone',
          data: profitData,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'transparent',
          borderWidth: 0,
          pointRadius: 0,
          fill: 'origin',
          tension: 0.1,
          order: 2
        },
        {
          label: 'Loss Zone',
          data: lossData,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'transparent',
          borderWidth: 0,
          pointRadius: 0,
          fill: 'origin',
          tension: 0.1,
          order: 2
        },
        {
          label: 'Combined Strategy',
          data: totals,
          borderColor: '#0f172a',
          borderWidth: 4,
          pointRadius: 0,
          fill: false,
          tension: 0.1,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: { size: 11, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
            usePointStyle: true,
            padding: 12,
            color: '#64748b',
            filter: (legendItem) => {
              return !legendItem.text.includes('Zone');
            }
          }
        },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title: (items) => `Price: ${items[0].label}`,
            label: (context) => {
              if (context.dataset.label.includes('Zone')) return null;
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
            }
          },
          filter: (tooltipItem) => !tooltipItem.dataset.label.includes('Zone')
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Underlying Price at Expiry',
            font: { size: 12, weight: '600', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
            color: '#64748b'
          },
          ticks: {
            callback: (value, index) => {
              const actualValue = prices[index];
              return actualValue ? `${actualValue.toFixed(0)}` : '';
            },
            maxTicksLimit: 12,
            font: { size: 11, family: 'SF Mono, Menlo, Monaco, monospace' },
            color: '#94a3b8'
          },
          grid: {
            color: '#e2e8f0',
            lineWidth: 1
          },
          border: {
            color: '#cbd5e1',
            width: 1
          }
        },
        y: {
          title: {
            display: true,
            text: 'Profit / Loss',
            font: { size: 12, weight: '600', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
            color: '#64748b'
          },
          ticks: {
            callback: (value) => `${value.toFixed(0)}`,
            font: { size: 11, family: 'SF Mono, Menlo, Monaco, monospace' },
            color: '#94a3b8'
          },
          grid: {
            color: (context) => context.tick.value === 0 ? '#64748b' : '#e2e8f0',
            lineWidth: (context) => context.tick.value === 0 ? 2 : 1
          },
          border: {
            color: '#cbd5e1'
          }
        }
      }
    }
  });
}

function renderExpiryCalculator() {
  const totalPnl = positions.reduce((sum, pos) => sum + calculatePayoff(pos, expiryPrice), 0);
  
  const pnlElement = document.getElementById('expiryPnl');
  pnlElement.textContent = `${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}`;
  pnlElement.className = `expiry-result-value ${totalPnl >= 0 ? 'profit' : 'loss'}`;
  
  document.getElementById('expiryPnlText').textContent = 
    `${totalPnl >= 0 ? 'Profit' : 'Loss'} at ${expiryPrice} expiry price`;
  
  // Render breakdown table
  const tbody = document.getElementById('breakdownTable');
  const rows = positions.map(pos => {
    const payoff = calculatePayoff(pos, expiryPrice);
    return `
      <tr>
        <td><strong>${pos.position.charAt(0).toUpperCase() + pos.position.slice(1)} ${pos.type.charAt(0).toUpperCase() + pos.type.slice(1)}</strong></td>
        <td>${pos.strike}</td>
        <td>${pos.premium}</td>
        <td>${pos.quantity}</td>
        <td><span class="pnl-value ${payoff >= 0 ? 'profit' : 'loss'}">${payoff >= 0 ? '+' : ''}${payoff.toFixed(2)}</span></td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = rows + `
    <tr class="breakdown-total">
      <td colspan="4">Total Strategy</td>
      <td><span class="pnl-value pnl-total ${totalPnl >= 0 ? 'profit' : 'loss'}">${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}</span></td>
    </tr>
  `;
}

function renderExpiryChart() {
  const ctx = document.getElementById('expiryChart');
  if (!ctx) return;
  
  const chartData = generateChartData();
  const prices = chartData.map(d => d.price);
  const totals = chartData.map(d => d.total);
  
  // Create gradient fills for profit/loss zones
  const profitData = chartData.map(d => d.total >= 0 ? d.total : 0);
  const lossData = chartData.map(d => d.total < 0 ? d.total : 0);
  
  // Find the closest index to expiry price for annotation
  const expiryIndex = prices.reduce((prev, curr, idx) => 
    Math.abs(curr - expiryPrice) < Math.abs(prices[prev] - expiryPrice) ? idx : prev
  , 0);
  
  if (expiryChart) {
    expiryChart.destroy();
  }
  
  expiryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: prices,
      datasets: [
        {
          label: 'Profit Zone',
          data: profitData,
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: 'transparent',
          borderWidth: 0,
          pointRadius: 0,
          fill: 'origin',
          tension: 0.1,
          order: 2
        },
        {
          label: 'Loss Zone',
          data: lossData,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'transparent',
          borderWidth: 0,
          pointRadius: 0,
          fill: 'origin',
          tension: 0.1,
          order: 2
        },
        {
          label: 'Combined Strategy',
          data: totals,
          borderColor: '#0f172a',
          borderWidth: 4,
          pointRadius: 0,
          fill: false,
          tension: 0.1,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            title: (items) => `Price: ${items[0].label}`,
            label: (context) => {
              if (context.dataset.label.includes('Zone')) return null;
              return `P&L: ${context.parsed.y.toFixed(2)}`;
            }
          },
          filter: (tooltipItem) => !tooltipItem.dataset.label.includes('Zone')
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Underlying Price at Expiry',
            font: { size: 12, weight: '600', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
            color: '#64748b'
          },
          ticks: {
            callback: (value, index) => {
              const actualValue = prices[index];
              return actualValue ? `${actualValue.toFixed(0)}` : '';
            },
            maxTicksLimit: 12,
            font: { size: 11, family: 'SF Mono, Menlo, Monaco, monospace' },
            color: '#94a3b8'
          },
          grid: {
            color: '#e2e8f0',
            lineWidth: 1
          },
          border: {
            color: '#cbd5e1',
            width: 1
          }
        },
        y: {
          title: {
            display: true,
            text: 'Profit / Loss',
            font: { size: 12, weight: '600', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
            color: '#64748b'
          },
          ticks: {
            callback: (value) => `${value.toFixed(0)}`,
            font: { size: 11, family: 'SF Mono, Menlo, Monaco, monospace' },
            color: '#94a3b8'
          },
          grid: {
            color: (context) => context.tick.value === 0 ? '#64748b' : '#e2e8f0',
            lineWidth: (context) => context.tick.value === 0 ? 2 : 1
          },
          border: {
            color: '#cbd5e1'
          }
        }
      }
    }
  });
}

function updateDashboard() {
  const data = generateChartData();
  const maxProfit = Math.max(...data.map(d => d.total));
  const maxLoss = Math.min(...data.map(d => d.total));
  const netPremium = positions.reduce((sum, p) => 
    sum + (p.position === 'long' ? -p.premium : p.premium) * p.quantity, 0
  );
  
  const dashMaxProfit = document.getElementById('dashMaxProfit');
  const dashMaxLoss = document.getElementById('dashMaxLoss');
  const dashTotalPremium = document.getElementById('dashTotalPremium');
  const dashRiskReward = document.getElementById('dashRiskReward');
  
  if (dashMaxProfit) dashMaxProfit.textContent = maxProfit === Infinity ? '∞' : `${maxProfit.toFixed(2)}`;
  if (dashMaxLoss) dashMaxLoss.textContent = maxLoss === -Infinity ? '∞' : `${maxLoss.toFixed(2)}`;
  if (dashTotalPremium) dashTotalPremium.textContent = `${netPremium.toFixed(2)}`;
  
  if (dashRiskReward && maxLoss !== -Infinity && maxProfit !== Infinity) {
    const ratio = Math.abs(maxProfit / maxLoss);
    dashRiskReward.textContent = `${ratio.toFixed(2)}:1`;
  }
  
  // Render quick templates
  renderQuickTemplates();
}

function renderQuickTemplates() {
  const container = document.getElementById('quickTemplates');
  if (!container) return;
  
  const quickTemplates = templates.slice(0, 6);
  container.innerHTML = quickTemplates.map(t => `
    <div class="template-card" onclick="applyTemplate('${t.name}')">
      <div class="template-name">${t.name}</div>
      <div class="template-desc">${t.description}</div>
      <span class="template-outlook ${t.outlook}">${t.outlook}</span>
    </div>
  `).join('');
}

function renderTemplates() {
  const container = document.getElementById('templateGrid');
  if (!container) return;
  
  container.innerHTML = templates.map(t => `
    <div class="template-card" onclick="applyTemplate('${t.name}')">
      <div class="template-name">${t.name}</div>
      <div class="template-desc">${t.description}</div>
      <span class="template-outlook ${t.outlook}">${t.outlook}</span>
    </div>
  `).join('');
}

function applyTemplate(name) {
  const template = templates.find(t => t.name === name);
  if (!template) return;
  
  positions = template.strikes.map((strike, idx) => ({
    id: idx + 1,
    type: template.types[idx],
    strike: strike,
    premium: template.premiums[idx],
    position: template.positions[idx],
    quantity: 1
  }));
  
  nextId = positions.length + 1;
  renderPositions();
  updateAllMetrics();
  renderAllCharts();
  updateDashboard();
  updateRiskMetrics();
  
  // Switch to builder tab
  switchTab('builder');
}

function updateRiskMetrics() {
  const data = generateChartData();
  const maxLoss = Math.min(...data.map(d => d.total));
  const maxProfit = Math.max(...data.map(d => d.total));
  
  // Value at Risk (95%)
  const var95 = Math.abs(maxLoss * 0.95);
  const varEl = document.getElementById('varValue');
  if (varEl) varEl.textContent = `${var95.toFixed(2)}`;
  
  // Expected Shortfall
  const es = Math.abs(maxLoss * 1.05);
  const esEl = document.getElementById('esValue');
  if (esEl) esEl.textContent = `${es.toFixed(2)}`;
  
  // Profit Probability (simplified)
  const profitPoints = data.filter(d => d.total > 0).length;
  const profitProb = (profitPoints / data.length * 100).toFixed(1);
  const probEl = document.getElementById('profitProb');
  if (probEl) probEl.textContent = `${profitProb}%`;
  
  // Kelly Criterion (simplified)
  const kelly = maxLoss !== 0 ? Math.min(100, Math.max(0, (profitPoints / data.length * maxProfit / Math.abs(maxLoss) * 100))).toFixed(1) : 0;
  const kellyEl = document.getElementById('kellyValue');
  if (kellyEl) kellyEl.textContent = `${kelly}%`;
  
  // Risk warnings
  renderRiskWarnings();
  updatePositionSize();
}

function renderRiskWarnings() {
  const container = document.getElementById('riskWarnings');
  if (!container) return;
  
  const warnings = [];
  
  // Check for undefined risk
  const hasNakedShorts = positions.some(p => p.position === 'short');
  const data = generateChartData();
  const maxLoss = Math.min(...data.map(d => d.total));
  
  if (maxLoss === -Infinity) {
    warnings.push({
      title: 'UNDEFINED RISK',
      text: 'This strategy has unlimited loss potential. Extreme caution advised.'
    });
  }
  
  if (hasNakedShorts && maxLoss < -1000) {
    warnings.push({
      title: 'HIGH RISK POSITION',
      text: 'Naked short positions detected with significant downside exposure.'
    });
  }
  
  const greeks = getPortfolioGreeks();
  if (Math.abs(greeks.gamma) > 0.1) {
    warnings.push({
      title: 'HIGH GAMMA RISK',
      text: 'Large gamma exposure means delta will change rapidly with price movements.'
    });
  }
  
  if (warnings.length === 0) {
    container.innerHTML = '<div style="color: var(--text-tertiary); font-size: 13px;">No significant risk warnings at this time.</div>';
  } else {
    container.innerHTML = warnings.map(w => `
      <div class="risk-warning">
        <div class="risk-warning-title">${w.title}</div>
        <div class="risk-warning-text">${w.text}</div>
      </div>
    `).join('');
  }
}

function updatePositionSize() {
  const accountSize = parseFloat(document.getElementById('accountSize')?.value || 10000);
  const riskPercent = parseFloat(document.getElementById('riskPercent')?.value || 2);
  const data = generateChartData();
  const maxLoss = Math.abs(Math.min(...data.map(d => d.total)));
  
  if (maxLoss > 0 && maxLoss !== Infinity) {
    const riskAmount = accountSize * (riskPercent / 100);
    const contracts = Math.floor(riskAmount / maxLoss);
    const positionSizeEl = document.getElementById('positionSize');
    if (positionSizeEl) positionSizeEl.textContent = contracts;
  }
}

function renderGreeksTable() {
  const tbody = document.getElementById('greeksTable');
  if (!tbody) return;
  
  tbody.innerHTML = positions.map(pos => {
    const greeks = getPositionGreeks(pos);
    return `
      <tr>
        <td><strong>${pos.position.charAt(0).toUpperCase() + pos.position.slice(1)} ${pos.type.charAt(0).toUpperCase() + pos.type.slice(1)}</strong></td>
        <td>${pos.strike}</td>
        <td>${greeks.delta.toFixed(3)}</td>
        <td>${greeks.gamma.toFixed(4)}</td>
        <td>${greeks.theta.toFixed(2)}</td>
        <td>${greeks.vega.toFixed(3)}</td>
        <td>${greeks.rho.toFixed(3)}</td>
      </tr>
    `;
  }).join('');
  
  const portfolio = getPortfolioGreeks();
  tbody.innerHTML += `
    <tr style="background: rgba(14, 165, 233, 0.08); font-weight: 600; border-top: 2px solid var(--border-color);">
      <td colspan="2">PORTFOLIO TOTAL</td>
      <td>${portfolio.delta.toFixed(3)}</td>
      <td>${portfolio.gamma.toFixed(4)}</td>
      <td>${portfolio.theta.toFixed(2)}</td>
      <td>${portfolio.vega.toFixed(3)}</td>
      <td>${portfolio.rho.toFixed(3)}</td>
    </tr>
  `;
}

function renderDeltaChart() {
  const ctx = document.getElementById('deltaChart');
  if (!ctx) return;
  
  const priceRange = [];
  for (let i = 80; i <= 120; i += 2) {
    priceRange.push(i);
  }
  
  const originalSpot = spotPrice;
  const deltaData = priceRange.map(price => {
    spotPrice = price;
    const greeks = getPortfolioGreeks();
    return greeks.delta;
  });
  spotPrice = originalSpot;
  
  if (deltaChart) deltaChart.destroy();
  
  deltaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: priceRange,
      datasets: [{
        label: 'Portfolio Delta',
        data: deltaData,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          callbacks: {
            label: (context) => `Delta: ${context.parsed.y.toFixed(3)}`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Spot Price', color: '#64748b', font: { size: 12, weight: '600' } },
          ticks: { color: '#94a3b8', font: { size: 11, family: 'SF Mono, Menlo, Monaco, monospace' }, callback: (value) => `${value}` },
          grid: { color: '#e2e8f0' },
          border: { color: '#cbd5e1' }
        },
        y: {
          title: { display: true, text: 'Delta', color: '#64748b', font: { size: 12, weight: '600' } },
          ticks: { color: '#94a3b8', font: { size: 11, family: 'SF Mono, Menlo, Monaco, monospace' } },
          grid: { color: '#e2e8f0' },
          border: { color: '#cbd5e1' }
        }
      }
    }
  });
}

function renderThetaChart() {
  const ctx = document.getElementById('thetaChart');
  if (!ctx) return;
  
  const dteRange = [1, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180];
  const originalDte = daysToExpiration;
  
  const thetaData = dteRange.map(dte => {
    daysToExpiration = dte;
    const greeks = getPortfolioGreeks();
    return greeks.theta;
  });
  daysToExpiration = originalDte;
  
  if (thetaChart) thetaChart.destroy();
  
  thetaChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dteRange.map(d => `${d}d`),
      datasets: [{
        label: 'Daily Theta',
        data: thetaData,
        backgroundColor: thetaData.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
        borderColor: thetaData.map(v => v >= 0 ? '#10b981' : '#ef4444'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          callbacks: {
            label: (context) => `Theta: ${context.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Days to Expiration', color: '#64748b', font: { size: 12, weight: '600' } },
          ticks: { color: '#94a3b8', font: { size: 11 } },
          grid: { color: '#e2e8f0' },
          border: { color: '#cbd5e1' }
        },
        y: {
          title: { display: true, text: 'Daily P&L', color: '#64748b', font: { size: 12, weight: '600' } },
          ticks: { color: '#94a3b8', font: { size: 11, family: 'SF Mono, Menlo, Monaco, monospace' }, callback: (value) => `${value.toFixed(0)}` },
          grid: { color: '#e2e8f0' },
          border: { color: '#cbd5e1' }
        }
      }
    }
  });
}

function renderAllCharts() {
  renderPayoffChart();
  renderExpiryCalculator();
  renderExpiryChart();
  renderGreeksTable();
  renderDeltaChart();
  renderThetaChart();
}

// Make functions global for inline event handlers
window.updatePosition = updatePosition;
window.removePosition = removePosition;
window.applyTemplate = applyTemplate;
window.selectTicker = selectTicker;
window.resetChartSize = resetChartSize;
window.toggleFullscreen = toggleFullscreen;
window.exportChart = exportChart;
