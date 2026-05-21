// ===== PAGE NAVIGATION =====
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

function switchPage(targetPage, updateHistory = true) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === targetPage);
  });
  pages.forEach(page => {
    page.classList.toggle('active', page.id === `page-${targetPage}`);
  });
  
  // Reset blog view to list when navigating
  if (targetPage === 'blog') {
    hideBlogDetail(false);
  } else {
    if (blogDetailView && blogDetailView.style.display !== 'none') {
      hideBlogDetail(false);
    }
  }
  
  if (updateHistory) {
    const url = new URL(window.location);
    url.searchParams.set('page', targetPage);
    url.searchParams.delete('blog');
    window.history.pushState({ page: targetPage }, '', url.href);
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(link.dataset.page, true);
  });
});

// ===== PROJECT FILTER TABS =====
const filterTabs = document.querySelectorAll('.filter-tab');
const projectItems = document.querySelectorAll('.project-item');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab
    filterTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    const filter = tab.dataset.filter;

    // Show/hide projects
    projectItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    // Fix first/last borders after filtering
    updateProjectBorders();
  });
});

function updateProjectBorders() {
  const visible = [...projectItems].filter(i => !i.classList.contains('hidden'));
  projectItems.forEach(i => i.style.paddingTop = '');
  if (visible.length > 0) {
    visible[0].style.paddingTop = '0';
  }
}

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const toggleIcon = document.getElementById('toggle-icon');
const root = document.documentElement;

const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
applyTheme(savedTheme);

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('portfolio-theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ===== BLOG RENDERING & LOGIC =====
const blogListContainer = document.getElementById('blog-list-container');
const blogListView = document.getElementById('blog-list-view');
const blogDetailView = document.getElementById('blog-detail-view');
const blogDetailContent = document.getElementById('blog-detail-content');
const blogBackBtn = document.getElementById('blog-back-btn');

function renderBlogList() {
  if (!blogListContainer) return;
  blogListContainer.innerHTML = BLOGS_DATA.map(post => `
    <div class="blog-item" data-id="${post.id}">
      <div class="blog-item-info">
        <div class="blog-item-title-row">
          <span class="blog-item-title">[${post.title}]</span>
          <span class="blog-item-date">${post.date}</span>
        </div>
        <div class="blog-item-tags">
          ${post.keywords.map(kw => `<span class="blog-tag">${kw}</span>`).join('')}
        </div>
        <p class="blog-item-excerpt">${post.excerpt}</p>
      </div>
      <div class="blog-item-thumb">
        <img src="${post.thumbnail}" alt="${post.title}" loading="lazy" />
      </div>
    </div>
  `).join('');

  // Add click listeners to items
  const blogItems = blogListContainer.querySelectorAll('.blog-item');
  blogItems.forEach(item => {
    item.addEventListener('click', () => {
      showBlogDetail(item.dataset.id);
    });
  });
}

function showBlogDetail(postId, updateHistory = true) {
  const post = BLOGS_DATA.find(p => p.id === postId);
  if (!post) return;

  // Update URL so it can be shared
  if (updateHistory) {
    const url = new URL(window.location);
    url.searchParams.set('blog', postId);
    window.history.pushState({ path: url.href }, '', url.href);
  }

  // Build the detail content HTML
  const paragraphsHtml = post.content.map(p => `<p>${p}</p>`).join('');
  const galleryHtml = post.images.map(img => `<img src="${img}" alt="Blog image" loading="lazy" />`).join('');
  const referencesHtml = post.references.map(ref => `<li><a href="${ref.url}" target="_blank" rel="noopener">→ ${ref.text}</a></li>`).join('');

  blogDetailContent.innerHTML = `
    <header class="blog-detail-header">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
        <h2 class="blog-detail-title">${post.title}</h2>
        <button onclick="copyShareLink(this)" style="background: none; border: none; color: inherit; cursor: pointer; padding: 0.5rem; display: flex; align-items: center; justify-content: center; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7" title="Copy Link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </button>
      </div>
      <div class="blog-detail-meta">
        <span>${post.date}</span>
        <span class="dot">·</span>
        <div class="blog-item-tags" style="display: inline-flex; margin-bottom: 0;">
          ${post.keywords.map(kw => `<span class="blog-tag">${kw}</span>`).join('')}
        </div>
      </div>
    </header>

    <div class="blog-detail-body">
      ${paragraphsHtml}
      
      <div class="blog-detail-gallery">
        ${galleryHtml}
      </div>

      <div class="blog-detail-video-container">
        <iframe 
          src="https://www.youtube.com/embed/${post.youtubeId}" 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </div>

      <div class="blog-detail-references">
        <h4>[References & Links]</h4>
        <ul>
          ${referencesHtml}
        </ul>
      </div>
    </div>
  `;

  // Swap views
  blogListView.style.display = 'none';
  blogDetailView.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideBlogDetail(updateHistory = true) {
  if (blogDetailView) blogDetailView.style.display = 'none';
  if (blogListView) blogListView.style.display = 'block';

  // Remove blog param from URL
  if (updateHistory) {
    const url = new URL(window.location);
    url.searchParams.delete('blog');
    window.history.pushState({ path: url.href }, '', url.href);
  }
}

if (blogBackBtn) {
  blogBackBtn.addEventListener('click', () => {
    hideBlogDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Initialize blog rendering
renderBlogList();

// Check URL for specific blog post or page on load
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('blog');
  const pageId = urlParams.get('page');
  
  if (blogId) {
    switchPage('blog', false);
    showBlogDetail(blogId, false);
  } else if (pageId) {
    switchPage(pageId, false);
  } else {
    switchPage('about', false);
  }
});

// Handle browser navigation (back/forward)
window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('blog');
  const pageId = urlParams.get('page');
  
  if (blogId) {
    switchPage('blog', false);
    showBlogDetail(blogId, false);
  } else if (pageId) {
    switchPage(pageId, false);
  } else {
    switchPage('about', false);
  }
});

// Copy link function
window.copyShareLink = function(btn) {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
};

