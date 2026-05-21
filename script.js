// ===== PAGE NAVIGATION =====
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

function switchPage(targetPage) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === targetPage);
  });
  pages.forEach(page => {
    page.classList.toggle('active', page.id === `page-${targetPage}`);
  });
  
  // Reset blog view to list when navigating
  if (targetPage === 'blog') {
    hideBlogDetail();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(link.dataset.page);
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

function showBlogDetail(postId) {
  const post = BLOGS_DATA.find(p => p.id === postId);
  if (!post) return;

  // Build the detail content HTML
  const paragraphsHtml = post.content.map(p => `<p>${p}</p>`).join('');
  const galleryHtml = post.images.map(img => `<img src="${img}" alt="Blog image" loading="lazy" />`).join('');
  const referencesHtml = post.references.map(ref => `<li><a href="${ref.url}" target="_blank" rel="noopener">→ ${ref.text}</a></li>`).join('');

  blogDetailContent.innerHTML = `
    <header class="blog-detail-header">
      <h2 class="blog-detail-title">${post.title}</h2>
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

function hideBlogDetail() {
  if (blogDetailView) blogDetailView.style.display = 'none';
  if (blogListView) blogListView.style.display = 'block';
}

if (blogBackBtn) {
  blogBackBtn.addEventListener('click', () => {
    hideBlogDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Initialize blog rendering
renderBlogList();
