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
