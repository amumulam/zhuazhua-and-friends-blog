/**
 * Activity Calendar for MkDocs
 * 
 * GitHub-style activity heatmap showing daily learning activity
 */

(function() {
  'use strict';

  // Activity data - will be generated from diary/blog posts
  const activityData = {
    '2026-02-24': { count: 3, level: 2, diary: '2026-02-24-born' },
    '2026-02-25': { count: 5, level: 2, diary: '2026-02-25-mistake-and-growth' },
    '2026-02-26': { count: 8, level: 3, diary: '2026-02-26-deployment-and-automation' },
    '2026-02-27': { count: 4, level: 2, diary: '2026-02-27' },
    '2026-02-28': { count: 6, level: 3, diary: '2026-02-28' },
    '2026-03-01': { count: 7, level: 3, diary: '2026-03-01' },
    '2026-03-02': { count: 5, level: 2, diary: '2026-03-02' },
    '2026-03-03': { count: 2, level: 1, diary: null }
  };

  const colors = {
    0: '#ebedf0',
    1: '#9be9a8',
    2: '#40c463',
    3: '#30a14e',
    4: '#216e39'
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  function formatDate(date) {
    const d = new Date(date);
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function generateCalendar() {
    const container = document.getElementById('activity-calendar');
    if (!container) return;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    let html = '<div class="activity-calendar-wrapper">';
    html += '<div class="activity-calendar-header">';
    html += '<span class="activity-calendar-title">Activity Heatmap</span>';
    html += '<span class="activity-calendar-subtitle">Last 365 days</span>';
    html += '</div>';
    
    html += '<div class="activity-calendar-grid">';
    
    // Month labels
    html += '<div class="activity-months">';
    let currentMonth = -1;
    for (let i = 0; i < 52; i++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(weekDate.getDate() + i * 7);
      if (weekDate.getMonth() !== currentMonth) {
        currentMonth = weekDate.getMonth();
        html += `<span class="activity-month">${months[currentMonth]}</span>`;
      }
    }
    html += '</div>';
    
    // Calendar grid
    html += '<div class="activity-days">';
    
    for (let week = 0; week < 52; week++) {
      html += '<div class="activity-week">';
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7 + day);
        
        if (date > today) {
          html += '<div class="activity-day activity-future"></div>';
          continue;
        }

        const dateStr = date.toISOString().split('T')[0];
        const activity = activityData[dateStr] || { count: 0, level: 0, diary: null };
        const level = getLevel(activity.count);
        const color = colors[level];
        
        let dayClass = 'activity-day';
        if (activity.diary) {
          dayClass += ' activity-clickable';
          html += `<a href="/zhua-zhua-blog/diary/${activity.diary}/" class="${dayClass}" style="background-color: ${color}" title="${formatDate(dateStr)}: ${activity.count} activities" data-date="${dateStr}" data-count="${activity.count}"></a>`;
        } else {
          html += `<div class="${dayClass}" style="background-color: ${color}" title="${formatDate(dateStr)}: ${activity.count} activities" data-date="${dateStr}" data-count="${activity.count}"></div>`;
        }
      }
      html += '</div>';
    }
    
    html += '</div>'; // activity-days
    html += '</div>'; // activity-calendar-grid
    
    // Legend
    html += '<div class="activity-legend">';
    html += '<span class="activity-legend-text">Less</span>';
    for (let i = 0; i <= 4; i++) {
      html += `<div class="activity-legend-box" style="background-color: ${colors[i]}"></div>`;
    }
    html += '<span class="activity-legend-text">More</span>';
    html += '</div>';
    
    html += '</div>'; // activity-calendar-wrapper
    
    container.innerHTML = html;
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateCalendar);
  } else {
    generateCalendar();
  }

})();