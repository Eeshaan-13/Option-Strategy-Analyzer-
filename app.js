// State management
let positions = [
  { id: 1, type: 'call', strike: 100, premium: 5, position: 'long', quantity: 1 }
];
let nextId = 2;
let expiryPrice = 100;
let payoffChart = null;
let expiryChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  initializeEventListeners();
  renderPositions();
  updateMetrics();
  renderPayoffChart();
  renderExpiryCalculator();
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
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update content
  document.getElementById('builderTab').classList.toggle('hidden', tabName !== 'builder');
  document.getElementById('expiryTab').classList.toggle('hidden', tabName !== 'expiry');
  
  // Re-render charts when switching tabs
  if (tabName === 'builder') {
    setTimeout(() => renderPayoffChart(), 100);
  } else {
    setTimeout(() => renderExpiryChart(), 100);
  }
}

function initializeEventListeners() {
  document.getElementById('addPositionBtn').addEventListener('click', addPosition);
  document.getElementById('expiryPrice').addEventListener('input', (e) => {
    expiryPrice = parseFloat(e.target.value) || 0;
    renderExpiryCalculator();
    renderExpiryChart();
  });
}

function addPosition() {
  positions.push({
    id: nextId++,
    type: 'call',
    strike: 100,
    premium: 5,
    position: 'long',
    quantity: 1
  });
  renderPositions();
  updateMetrics();
  renderPayoffChart();
}

function removePosition(id) {
  if (positions.length === 1) return;
  positions = positions.filter(p => p.id !== id);
  renderPositions();
  updateMetrics();
  renderPayoffChart();
  renderExpiryCalculator();
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

function updateMetrics() {
  const data = generateChartData();
  
  // Max Profit
  const maxProfit = Math.max(...data.map(d => d.total));
  document.getElementById('maxProfit').textContent = 
    maxProfit === Infinity ? '∞' : `$${maxProfit.toFixed(2)}`;
  
  // Max Loss
  const maxLoss = Math.min(...data.map(d => d.total));
  document.getElementById('maxLoss').textContent = 
    maxLoss === -Infinity ? '∞' : `$${maxLoss.toFixed(2)}`;
  
  // Breakevens
  const breakevens = [];
  for (let i = 1; i < data.length; i++) {
    if ((data[i-1].total < 0 && data[i].total >= 0) || (data[i-1].total >= 0 && data[i].total < 0)) {
      breakevens.push(data[i].price);
    }
  }
  document.getElementById('breakevens').textContent = breakevens.length || '—';
  
  // Net Premium
  const netPremium = positions.reduce((sum, p) => 
    sum + (p.position === 'long' ? -p.premium : p.premium) * p.quantity, 0
  );
  document.getElementById('netPremium').textContent = `$${netPremium.toFixed(2)}`;
}

function renderPayoffChart() {
  const ctx = document.getElementById('payoffChart');
  if (!ctx) return;
  
  const chartData = generateChartData();
  const prices = chartData.map(d => d.price);
  const totals = chartData.map(d => d.total);
  
  // Create datasets for individual positions (dashed lines)
  const positionDatasets = positions.map((pos, idx) => ({
    label: `${pos.position.charAt(0).toUpperCase() + pos.position.slice(1)} ${pos.type.charAt(0).toUpperCase() + pos.type.slice(1)} $${pos.strike}`,
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
          borderColor: '#1a1f3a',
          borderWidth: 3,
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
          backgroundColor: '#1a1f3a',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          padding: 12,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title: (items) => `Price: $${items[0].label}`,
            label: (context) => {
              if (context.dataset.label.includes('Zone')) return null;
              return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
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
              return actualValue ? `$${actualValue.toFixed(0)}` : '';
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
            color: '#cbd5e1'
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
            callback: (value) => `$${value.toFixed(0)}`,
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
  pnlElement.textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
  pnlElement.className = `expiry-result-value ${totalPnl >= 0 ? 'profit' : 'loss'}`;
  
  document.getElementById('expiryPnlText').textContent = 
    `${totalPnl >= 0 ? 'Profit' : 'Loss'} at $${expiryPrice} expiry price`;
  
  // Render breakdown table
  const tbody = document.getElementById('breakdownTable');
  const rows = positions.map(pos => {
    const payoff = calculatePayoff(pos, expiryPrice);
    return `
      <tr>
        <td><strong>${pos.position.charAt(0).toUpperCase() + pos.position.slice(1)} ${pos.type.charAt(0).toUpperCase() + pos.type.slice(1)}</strong></td>
        <td>$${pos.strike}</td>
        <td>$${pos.premium}</td>
        <td>${pos.quantity}</td>
        <td><span class="pnl-value ${payoff >= 0 ? 'profit' : 'loss'}">${payoff >= 0 ? '+' : ''}$${payoff.toFixed(2)}</span></td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = rows + `
    <tr class="breakdown-total">
      <td colspan="4">Total Strategy</td>
      <td><span class="pnl-value pnl-total ${totalPnl >= 0 ? 'profit' : 'loss'}">${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}</span></td>
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
          borderColor: '#1a1f3a',
          borderWidth: 3,
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
          backgroundColor: '#1a1f3a',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          padding: 12,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            title: (items) => `Price: $${items[0].label}`,
            label: (context) => {
              if (context.dataset.label.includes('Zone')) return null;
              return `P&L: $${context.parsed.y.toFixed(2)}`;
            }
          },
          filter: (tooltipItem) => !tooltipItem.dataset.label.includes('Zone')
        },
        annotation: {
          annotations: {
            expiryLine: {
              type: 'line',
              xMin: expiryIndex,
              xMax: expiryIndex,
              borderColor: '#ef4444',
              borderWidth: 3,
              borderDash: [5, 5],
              label: {
                display: true,
                content: `$${expiryPrice}`,
                position: 'start',
                backgroundColor: '#ef4444',
                color: 'white',
                font: {
                  weight: 'bold',
                  size: 12
                }
              }
            }
          }
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
              return actualValue ? `$${actualValue.toFixed(0)}` : '';
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
            color: '#cbd5e1'
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
            callback: (value) => `$${value.toFixed(0)}`,
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

// Make functions global for inline event handlers
window.updatePosition = updatePosition;
window.removePosition = removePosition;