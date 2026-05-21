// ===== PAGE NAVIGATION =====
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

function switchPage(targetPage) {
  // Update nav active state
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === targetPage);
  });

  // Show correct page
  pages.forEach(page => {
    if (page.id === `page-${targetPage}`) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(link.dataset.page);
  });
});

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const toggleIcon = document.getElementById('toggle-icon');
const root = document.documentElement;

// Load saved theme or default to light
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
