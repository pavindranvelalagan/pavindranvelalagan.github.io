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

  if (targetPage === 'photography') {
    renderPhotography();
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

// ===== MARKDOWN PARSING HELPERS =====
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseInlineMarkdown(text) {
  let cleanText = escapeHtml(text);
  const placeholders = [];

  // 1. Inline code (`code`)
  cleanText = cleanText.replace(/`(.*?)`/g, (match, p1) => {
    placeholders.push(`<code>${p1}</code>`);
    return `@@PH_${placeholders.length - 1}@@`;
  });

  // 2. Images (![alt](url))
  cleanText = cleanText.replace(/!\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => {
    placeholders.push(`<img src="${p2}" alt="${p1}" loading="lazy" />`);
    return `@@PH_${placeholders.length - 1}@@`;
  });

  // 3. Links ([text](url))
  cleanText = cleanText.replace(/\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => {
    placeholders.push(`<a href="${p2}" target="_blank" rel="noopener">${p1}</a>`);
    return `@@PH_${placeholders.length - 1}@@`;
  });

  // 4. Bold (**text**)
  cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 5. Italic (*text* or _text_)
  cleanText = cleanText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  cleanText = cleanText.replace(/_(.*?)_/g, '<em>$1</em>');

  // Restore placeholders
  for (let i = 0; i < placeholders.length; i++) {
    cleanText = cleanText.replace(`@@PH_${i}@@`, placeholders[i]);
  }

  return cleanText;
}

function parseMarkdownToHTML(md) {
  const lines = md.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeContent = [];
  let codeLang = '';
  let inTable = false;
  let tableRows = [];
  let inList = false;
  let listType = ''; // 'ul' or 'ol'
  let listItems = [];
  let paragraphLines = [];

  function flushList() {
    if (listItems.length > 0) {
      html += `<${listType}>` + listItems.map(item => `<li>${parseInlineMarkdown(item)}</li>`).join('') + `</${listType}>`;
      listItems = [];
      inList = false;
    }
  }

  function flushTable() {
    if (tableRows.length > 0) {
      let tableHtml = '<table>';
      let startIdx = 0;
      if (tableRows.length > 1 && tableRows[1].every(cell => cell.trim().match(/^:?-+:?$/) || cell.trim() === '')) {
        tableHtml += '<thead><tr>' + tableRows[0].map(cell => `<th>${parseInlineMarkdown(cell.trim())}</th>`).join('') + '</tr></thead>';
        startIdx = 2; // skip header and divider
      }
      tableHtml += '<tbody>';
      for (let i = startIdx; i < tableRows.length; i++) {
        if (tableRows[i].length === 1 && tableRows[i][0] === '') continue;
        tableHtml += '<tr>' + tableRows[i].map(cell => `<td>${parseInlineMarkdown(cell.trim())}</td>`).join('') + '</tr>';
      }
      tableHtml += '</tbody></table>';
      html += `<div class="table-container">${tableHtml}</div>`;
      tableRows = [];
      inTable = false;
    }
  }

  function flushParagraph() {
    if (paragraphLines.length > 0) {
      html += `<p>${parseInlineMarkdown(paragraphLines.join(' '))}</p>`;
      paragraphLines = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // 1. Fenced Code Block
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const escapedCode = escapeHtml(codeContent.join('\n'));
        html += `
          <div class="code-block-container">
            <div class="code-block-header">
              <span class="code-block-lang">${codeLang || 'bash'}</span>
              <button class="copy-code-btn" onclick="copyCodeText(this)">Copy</button>
            </div>
            <pre><code class="language-${codeLang || 'bash'}">${escapedCode}</code></pre>
          </div>
        `;
        codeContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        flushTable();
        flushParagraph();
        inCodeBlock = true;
        codeLang = line.trim().substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // 2. Indented Code Block (4 spaces of indentation and not empty)
    if (!inTable && line.startsWith('    ') && line.trim() !== '') {
      flushList();
      flushTable();
      flushParagraph();

      let indentedContent = [];
      while (i < lines.length && (lines[i].startsWith('    ') || lines[i].trim() === '')) {
        indentedContent.push(lines[i].substring(4)); // Strip 4 spaces
        i++;
      }
      i--; // Adjust index because loop increments it

      const escapedCode = escapeHtml(indentedContent.join('\n'));
      html += `
        <div class="code-block-container">
          <div class="code-block-header">
            <span class="code-block-lang">bash</span>
            <button class="copy-code-btn" onclick="copyCodeText(this)">Copy</button>
          </div>
          <pre><code class="language-bash">${escapedCode}</code></pre>
        </div>
      `;
      continue;
    }

    // 3. Table Rows
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList();
      flushParagraph();
      inTable = true;
      const cells = line.trim().split('|').slice(1, -1);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 4. Headers
    if (line.trim().startsWith('#')) {
      flushList();
      flushTable();
      flushParagraph();
      const match = line.trim().match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const title = parseInlineMarkdown(match[2]);
        const tag = `h${level + 1}`;
        html += `<${tag}>${title}</${tag}>`;
        continue;
      }
    }

    // 5. Unordered List Items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      flushTable();
      flushParagraph();
      const content = line.trim().substring(2);
      if (inList && listType === 'ul') {
        listItems.push(content);
      } else {
        flushList();
        inList = true;
        listType = 'ul';
        listItems.push(content);
      }
      continue;
    }

    // 6. Ordered List Items
    if (line.trim().match(/^\d+\.\s+/)) {
      flushTable();
      flushParagraph();
      const content = line.trim().replace(/^\d+\.\s+/, '');
      if (inList && listType === 'ol') {
        listItems.push(content);
      } else {
        flushList();
        inList = true;
        listType = 'ol';
        listItems.push(content);
      }
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      flushList();
      flushTable();
      flushParagraph();
      continue;
    }

    // 7. Regular paragraph text line
    flushList();
    flushTable();
    paragraphLines.push(line.trim());
  }

  // Flush remaining
  flushList();
  flushTable();
  flushParagraph();

  return html;
}

// Global copy handler for pre-formatted code blocks
window.copyCodeText = function (btn) {
  const codeElement = btn.closest('.code-block-container').querySelector('pre code');
  if (!codeElement) return;
  const text = codeElement.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy code: ', err);
  });
};

// Memory cache to store fetched markdown content for instant tab transitions
const blogContentCache = {};

async function fetchBlogMarkdown(filePath) {
  if (blogContentCache[filePath]) {
    return blogContentCache[filePath];
  }
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Failed to load file: ${response.statusText}`);
  }
  const text = await response.text();
  blogContentCache[filePath] = text;
  return text;
}

async function showBlogDetail(postId, updateHistory = true) {
  const post = BLOGS_DATA.find(p => p.id === postId);
  if (!post) return;

  // Update URL so it can be shared
  if (updateHistory) {
    const url = new URL(window.location);
    url.searchParams.set('blog', postId);
    window.history.pushState({ path: url.href }, '', url.href);
  }

  const isVersioned = (post.filePathV1 && post.filePathV2) || (post.contentV1 && post.contentV2);
  const isSingleMarkdown = !isVersioned && (post.filePath || (typeof post.content === 'string'));
  const referencesHtml = post.references.map(ref => `<li><a href="${ref.url}" target="_blank" rel="noopener">→ ${ref.text}</a></li>`).join('');

  let detailBodyHtml = '';
  if (isVersioned) {
    const v1Name = post.v1Name || 'Intermediate';
    const v2Name = post.v2Name || 'Beginner';
    detailBodyHtml = `
      <div class="version-toggle-container">
        <span class="toggle-label">Target Audience:</span>
        <div class="version-toggle-capsule">
          <div class="toggle-slider" id="toggle-slider"></div>
          <button class="toggle-btn active" id="toggle-btn-v1">${v1Name}</button>
          <button class="toggle-btn" id="toggle-btn-v2">${v2Name}</button>
        </div>
      </div>
      <div id="blog-detail-body-text" class="blog-detail-body-text">
        ${post.contentV1 ? parseMarkdownToHTML(post.contentV1) : '<div class="photo-loading">Loading blog content...</div>'}
      </div>
    `;
  } else if (isSingleMarkdown) {
    const videoHtml = post.youtubeId ? `
      <div class="blog-detail-video-container">
        <iframe 
          src="https://www.youtube.com/embed/${post.youtubeId}" 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </div>` : '';
    detailBodyHtml = `
      <div id="blog-detail-body-text" class="blog-detail-body-text">
        ${(typeof post.content === 'string') ? parseMarkdownToHTML(post.content) : '<div class="photo-loading">Loading blog content...</div>'}
      </div>
      ${videoHtml}
    `;
  } else {
    const paragraphsHtml = (post.content || []).map(p => `<p>${p}</p>`).join('');
    const galleryHtml = (post.images || []).map(img => `<img src="${img}" alt="Blog image" loading="lazy" />`).join('');
    const videoHtml = post.youtubeId ? `
      <div class="blog-detail-video-container">
        <iframe 
          src="https://www.youtube.com/embed/${post.youtubeId}" 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </div>` : '';
    detailBodyHtml = `
      <div class="blog-detail-body-text">
        ${paragraphsHtml}
      </div>
      <div class="blog-detail-gallery">
        ${galleryHtml}
      </div>
      ${videoHtml}
    `;
  }

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
      ${detailBodyHtml}

      <div class="blog-detail-references">
        <h4>[References & Links]</h4>
        <ul>
          ${referencesHtml}
        </ul>
      </div>
    </div>
  `;

  // Swap views to display detail immediately (showing loading state if fetching is required)
  blogListView.style.display = 'none';
  blogDetailView.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Load content asynchronously if versioned or single markdown file
  if (isVersioned) {
    const btnV1 = document.getElementById('toggle-btn-v1');
    const btnV2 = document.getElementById('toggle-btn-v2');
    const slider = document.getElementById('toggle-slider');
    const bodyText = document.getElementById('blog-detail-body-text');

    let v1Md = post.contentV1 || '';
    let v2Md = post.contentV2 || '';

    // If file paths are provided, perform fetch
    if (post.filePathV1 && post.filePathV2) {
      try {
        const [fetchedV1, fetchedV2] = await Promise.all([
          fetchBlogMarkdown(post.filePathV1),
          fetchBlogMarkdown(post.filePathV2)
        ]);
        v1Md = fetchedV1;
        v2Md = fetchedV2;
      } catch (err) {
        console.warn("Dynamic markdown fetching failed (likely due to CORS under file:// protocol). Falling back to pre-compiled blog content.", err);
        // CORS Fallback: Use the pre-packaged copy inside blogs-data.js
        v1Md = post.contentV1 || '';
        v2Md = post.contentV2 || '';

        if (!v1Md || !v2Md) {
          const errorMsg = `Error: Could not load the blog content from "${post.filePathV1}". <br><br><strong>Why is this happening?</strong><br>Browsers block local AJAX/fetch requests when HTML pages are opened directly as local files (using the <code>file://</code> protocol in the address bar).<br><br><strong>How to fix:</strong><br>1. Run a local web server (e.g. VS Code's "Live Server" extension, <code>npx serve</code>, or Python's <code>python -m http.server</code>).<br>2. Or compile the files using the blog compiler so they can be loaded offline.`;
          v1Md = errorMsg;
          v2Md = errorMsg;
        }
      }

      // Display the loaded text (default to Version 1)
      if (btnV1.classList.contains('active')) {
        bodyText.innerHTML = parseMarkdownToHTML(v1Md);
      } else {
        bodyText.innerHTML = parseMarkdownToHTML(v2Md);
      }
      setupBlogImagesLightbox();
    }

    btnV1.addEventListener('click', () => {
      if (btnV1.classList.contains('active')) return;
      btnV1.classList.add('active');
      btnV2.classList.remove('active');
      slider.style.left = '0%';

      bodyText.classList.add('fade-out');
      setTimeout(() => {
        bodyText.innerHTML = parseMarkdownToHTML(v1Md);
        setupBlogImagesLightbox();
        bodyText.classList.remove('fade-out');
      }, 150);
    });

    btnV2.addEventListener('click', () => {
      if (btnV2.classList.contains('active')) return;
      btnV2.classList.add('active');
      btnV1.classList.remove('active');
      slider.style.left = '50%';

      bodyText.classList.add('fade-out');
      setTimeout(() => {
        bodyText.innerHTML = parseMarkdownToHTML(v2Md);
        setupBlogImagesLightbox();
        bodyText.classList.remove('fade-out');
      }, 150);
    });
  } else if (isSingleMarkdown && post.filePath) {
    const bodyText = document.getElementById('blog-detail-body-text');
    let md = (typeof post.content === 'string') ? post.content : '';
    try {
      md = await fetchBlogMarkdown(post.filePath);
    } catch (err) {
      console.warn("Dynamic markdown fetching failed. Falling back to pre-compiled content.", err);
      md = (typeof post.content === 'string') ? post.content : '';
    }
    bodyText.innerHTML = parseMarkdownToHTML(md);
    setupBlogImagesLightbox();
  }
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

// Initialize filtering and routing on load
document.addEventListener('DOMContentLoaded', () => {
  filterProjects('all');
  handleRouting();
});

// ===== LIGHTBOX LOGIC =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

if (lightbox && lightboxClose) {
  lightboxClose.addEventListener('click', () => {
    lightbox.style.display = 'none';
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) {
      lightbox.style.display = 'none';
    }
  });
}

function setupBlogImagesLightbox() {
  const blogImages = document.querySelectorAll('.blog-detail-body-text img, .blog-detail-gallery img');
  blogImages.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightbox.style.display = 'block';
      lightboxImg.src = img.src;
    });
  });
}

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
window.copyShareLink = function (btn) {
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

// ===== INSTAGRAM PHOTOGRAPHY RENDERING =====
let instagramLoaded = false;

function renderPhotography() {
  const photoGrid = document.getElementById('photo-grid');
  if (!photoGrid) return;

  // Only render if we haven't rendered yet
  if (photoGrid.dataset.rendered === 'true') {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
    return;
  }

  if (typeof INSTAGRAM_EMBEDS === 'undefined' || !INSTAGRAM_EMBEDS.length) {
    photoGrid.innerHTML = '<div class="photo-loading">No posts found.</div>';
    return;
  }

  // Render embeds inside individual .photo-item divs
  photoGrid.innerHTML = INSTAGRAM_EMBEDS.map(embed => `
    <div class="photo-item">
      ${embed}
    </div>
  `).join('');

  photoGrid.dataset.rendered = 'true';

  // Load/process the Instagram embed script dynamically
  if (window.instgrm && window.instgrm.Embeds) {
    window.instgrm.Embeds.process();
  } else if (!instagramLoaded) {
    instagramLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  }
}

