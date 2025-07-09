document.addEventListener('DOMContentLoaded', function () {
  // --- UI要素のセレクタと初期化 ---
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const scrollableMenu = document.querySelector('.scrollable-menu');
  const scrollProgress = document.getElementById('scroll-progress');

  const apodElements = {
    title: document.getElementById('apod-title-hero'),
    mediaContainer: document.getElementById('apod-media-container-hero'),
    explanation: document.getElementById('apod-explanation-hero'),
    copyright: document.getElementById('apod-copyright-hero'),
    mainContainer: document.getElementById('apod-container-hero')
  };

  const solarFlareContainer = document.getElementById('solar-flare-container');
  const geomagneticStormContainer = document.getElementById('geomagnetic-storm-container');
  const spaceNewsContainer = document.getElementById("space-news");
  const latestPostsContainer = document.getElementById('latest-posts');
  const sidebarCategoriesContainer = document.getElementById("sidebar-categories");
  const allPostsContainer = document.getElementById('all-posts');
  const categoryFilter = document.getElementById('category-filter');
  const tagFilter = document.getElementById('tag-filter');

  const NASA_API_KEY = '2xltSsPMjbXB66oDPVCdT6qPhKURghrTPdbhKEzj';
  const TODAY_DATE = new Date().toISOString().slice(0, 10);

  async function fetchData(url, errorTargetElement, errorMessage) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`${errorMessage}エラー:`, error);
      if (errorTargetElement) {
        errorTargetElement.innerHTML = `<p>${errorMessage}を取得できませんでした。</p>`;
      }
      throw error;
    }
  }

  function setupHamburgerMenu() {
    if (hamburgerMenu && scrollableMenu) {
      hamburgerMenu.addEventListener('click', function () {
        scrollableMenu.classList.toggle('open');
        hamburgerMenu.classList.toggle('open');
      });
    }
  }

  function setupAnimations() {
    setupIntersectionObserver('.fade-in');
    setupIntersectionObserver('.slide-in-left');
    setupIntersectionObserver('.slide-in-right');
    setupIntersectionObserver('.slide-in-bottom');
    setupIntersectionObserver('.section');
  }

  function setupScrollProgressBar() {
    if (scrollProgress) {
      window.addEventListener('scroll', function () {
        const scrollTop = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (documentHeight > 0) ? (scrollTop / documentHeight) * 100 : 0;
        scrollProgress.style.width = scrollPercentage + '%';
      });
    }
  }

  function setupIntersectionObserver(selector) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    elements.forEach(element => observer.observe(element));
  }

  // 以下にfetchAndDisplayApod、fetchAndDisplaySolarFlares、fetchAndDisplayGeomagneticStorms、fetchAndDisplayNasaNews関数を配置
  // 省略して setupPosts の修正版へ移ります

  async function setupPosts() {
    let posts = [];
    try {
      const response = await fetch('posts.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      posts = await response.json();
    } catch (error) {
      console.error('記事の読み込みに失敗しました:', error);
      if (latestPostsContainer) latestPostsContainer.innerHTML = '<p>記事の読み込みに失敗しました。</p>';
      if (sidebarCategoriesContainer) sidebarCategoriesContainer.innerHTML = '<p>カテゴリ情報の読み込みに失敗しました。</p>';
      if (allPostsContainer) allPostsContainer.innerHTML = '<p>記事の読み込みに失敗しました。</p>';
      return;
    }

    if (latestPostsContainer) {
      latestPostsContainer.innerHTML = '';
      const latestPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      latestPosts.forEach(post => {
        const postCategories = Array.isArray(post.category) ? post.category.join(', ') : post.category;
        const div = document.createElement('div');
        div.className = 'post-item';
        div.innerHTML = `
          <h3><a href="${post.url || post.link}">${post.title}</a></h3>
          <p>${post.date} ｜ カテゴリ：${postCategories}</p>`;
        latestPostsContainer.appendChild(div);
      });
    }

    if (sidebarCategoriesContainer) {
      const categoriesMap = {};
      posts.forEach(post => {
        const categories = Array.isArray(post.category) ? post.category : [post.category];
        categories.forEach(cat => {
          if (!categoriesMap[cat]) categoriesMap[cat] = [];
          categoriesMap[cat].push(post);
        });
      });

      sidebarCategoriesContainer.innerHTML = `
        <h2>カテゴリー</h2>
        <ul class="category-list">
          ${Object.keys(categoriesMap).map(cat => `<li><a href="category.html?name=${encodeURIComponent(cat)}">${cat} (${categoriesMap[cat].length})</a></li>`).join('')}
        </ul>`;
    }

    if (allPostsContainer && categoryFilter && tagFilter) {
      const categories = new Set();
      const tags = new Set();

      posts.forEach(post => {
        const postCategories = Array.isArray(post.category) ? post.category : [post.category];
        postCategories.forEach(cat => categories.add(cat));
        if (post.tags) post.tags.forEach(tag => tags.add(tag));
      });

      categoryFilter.innerHTML = '<option value="all">全てのカテゴリ</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
      });

      tagFilter.innerHTML = '<option value="all">全てのタグ</option>';
      tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
      });

      function displayFilteredPosts(filtered) {
        allPostsContainer.innerHTML = '';
        if (filtered.length === 0) {
          allPostsContainer.innerHTML = '<p>表示する記事がありません。</p>';
          return;
        }
        filtered.forEach(post => {
          const postCategories = Array.isArray(post.category) ? post.category.join(', ') : post.category;
          const postTags = post.tags ? post.tags.join(', ') : '';
          const imageTag = post.image ? `<img src="${post.image}" alt="${post.title}" class="post-thumbnail">` : '';

          allPostsContainer.insertAdjacentHTML('beforeend', `
            <div class="post-card">
              ${imageTag}
              <h2><a href="${post.url || post.link}">${post.title}</a></h2>
              <p class="post-date">${post.date}</p>
              <p><strong>カテゴリ:</strong> ${postCategories}</p>
              <p><strong>タグ:</strong> ${postTags}</p>
            </div>`);
        });
      }

      function filterAndDisplayPosts() {
        const selectedCategory = categoryFilter.value;
        const selectedTag = tagFilter.value;

        const filtered = posts.filter(post => {
          const postCategories = Array.isArray(post.category) ? post.category : [post.category];
          const categoryMatch = selectedCategory === 'all' || postCategories.includes(selectedCategory);
          const tagMatch = selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag));
          return categoryMatch && tagMatch;
        });

        displayFilteredPosts(filtered);
      }

      categoryFilter.addEventListener('change', filterAndDisplayPosts);
      tagFilter.addEventListener('change', filterAndDisplayPosts);
      filterAndDisplayPosts();
    }
  }

  setupHamburgerMenu();
  setupAnimations();
  setupScrollProgressBar();
  fetchAndDisplayApod();
  fetchAndDisplaySolarFlares();
  fetchAndDisplayGeomagneticStorms();
  fetchAndDisplayNasaNews();
  setupPosts();
});
