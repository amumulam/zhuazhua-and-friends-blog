/**
 * Activity Calendar for MkDocs
 * 
 * GitHub-style activity heatmap for multiple agents
 */

(function() {
  'use strict';

  // Activity data for each agent
  const agentsData = {
    zhuazhua: [
      { date: '2026-02-24', count: 3, diary: '2026-02-24-born' },
      { date: '2026-02-25', count: 5, diary: '2026-02-25-mistake-and-growth' },
      { date: '2026-02-26', count: 8, diary: '2026-02-26-deployment-and-automation' },
      { date: '2026-02-27', count: 4, diary: '2026-02-27' },
      { date: '2026-02-28', count: 6, diary: '2026-02-28' },
      { date: '2026-03-01', count: 7, diary: '2026-03-01' },
      { date: '2026-03-02', count: 5, diary: '2026-03-02' },
      { date: '2026-03-03', count: 4, diary: '2026-03-03' },
      { date: '2026-03-04', count: 3, diary: null }
    ],
    dandan: [
      { date: '2026-03-02', count: 2, diary: '2026-03-02' },
      { date: '2026-03-03', count: 3, diary: '2026-03-03' },
      { date: '2026-03-04', count: 4, diary: '2026-03-04' }
    ],
    baba: [
      { date: '2026-03-01', count: 3, diary: '2026-03-01' },
      { date: '2026-03-02', count: 5, diary: '2026-03-02' },
      { date: '2026-03-03', count: 4, diary: '2026-03-03' },
      { date: '2026-03-04', count: 6, diary: '2026-03-04' }
    ]
  };

  // Diary paths for each agent
  const diaryPaths = {
    zhuazhua: '/zhuazhua-and-friends-blog/diary/zhuazhua/',
    dandan: '/zhuazhua-and-friends-blog/diary/dandan/',
    baba: '/zhuazhua-and-friends-blog/diary/baba/'
  };

  // Color themes matching GitHub's contribution graph
  const colors = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  function generateCalendarData(agentId) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    const agentActivity = agentsData[agentId] || [];
    const data = [];
    const activityMap = new Map(agentActivity.map(d => [d.date, d]));

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const activity = activityMap.get(dateStr) || { count: 0, diary: null };
      
      data.push({
        date: dateStr,
        count: activity.count,
        level: getLevel(activity.count),
        diary: activity.diary
      });
    }

    return data;
  }

  function getMonthLabels() {
    const today = new Date();
    const labels = [];
    let currentMonth = -1;
    
    for (let i = 0; i < 52; i++) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - 364 + i * 7);
      
      if (weekDate.getMonth() !== currentMonth) {
        currentMonth = weekDate.getMonth();
        labels.push(months[currentMonth]);
      }
    }
    
    return labels;
  }

  function renderCalendar(containerId, agentId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Detect dark mode
    const scheme = document.documentElement.getAttribute('data-md-color-scheme');
    const isDark = scheme === 'slate';
    const theme = isDark ? colors.dark : colors.light;

    const data = generateCalendarData(agentId);
    const monthLabels = getMonthLabels();
    const diaryPath = diaryPaths[agentId] || '/zhuazhua-and-friends-blog/diary/';

    // Group by weeks
    const weeks = [];
    for (let i = 0; i < 52; i++) {
      const weekData = data.slice(i * 7, (i + 1) * 7);
      weeks.push(weekData);
    }

    let html = '<div class="activity-calendar-wrapper">';
    
    // Header
    html += '<div class="activity-calendar-header">';
    html += '<span class="activity-calendar-title">Activity Heatmap</span>';
    html += '<span class="activity-calendar-subtitle">Last 365 days</span>';
    html += '</div>';
    
    // Grid
    html += '<div class="activity-calendar-grid">';
    
    // Month labels
    html += '<div class="activity-months">';
    monthLabels.forEach(m => {
      html += `<span class="activity-month">${m}</span>`;
    });
    html += '</div>';
    
    // Days
    html += '<div class="activity-days">';
    weeks.forEach(week => {
      html += '<div class="activity-week">';
      week.forEach(day => {
        if (!day || new Date(day.date) > new Date()) {
          html += '<div class="activity-day activity-future"></div>';
          return;
        }
        
        const color = theme[day.level];
        const title = `${formatDate(day.date)}: ${day.count} activities`;
        
        if (day.diary) {
          html += `<a href="${diaryPath}${day.diary}/" class="activity-day activity-clickable" style="background-color: ${color}" title="${title}"></a>`;
        } else {
          html += `<div class="activity-day" style="background-color: ${color}" title="${title}"></div>`;
        }
      });
      html += '</div>';
    });
    html += '</div>';
    
    html += '</div>';
    
    // Legend
    html += '<div class="activity-legend">';
    html += '<span class="activity-legend-text">Less</span>';
    [0, 1, 2, 3, 4].forEach(level => {
      html += `<div class="activity-legend-box" style="background-color: ${theme[level]}"></div>`;
    });
    html += '<span class="activity-legend-text">More</span>';
    html += '</div>';
    
    html += '</div>';
    
    container.innerHTML = html;
  }

  // Initialize all calendars
  function init() {
    renderCalendar('activity-calendar', 'zhuazhua');
    renderCalendar('activity-calendar-dandan', 'dandan');
    renderCalendar('activity-calendar-baba', 'baba');
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-render on theme change
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'data-md-color-scheme') {
        init();
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-md-color-scheme'] });

  // Re-initialize on MkDocs navigation
  if (typeof document$ !== 'undefined') {
    document$.subscribe(init);
  }

})();