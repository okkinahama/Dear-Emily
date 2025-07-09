document.addEventListener('DOMContentLoaded', function() {
    // --- UI要素のセレクタと初期化 ---
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const scrollableMenu = document.querySelector('.scrollable-menu');
    const scrollProgress = document.getElementById('scroll-progress');

    // APOD (Astronomy Picture of the Day) 関連要素
    const apodElements = {
        title: document.getElementById('apod-title-hero'),
        mediaContainer: document.getElementById('apod-media-container-hero'),
        explanation: document.getElementById('apod-explanation-hero'),
        copyright: document.getElementById('apod-copyright-hero'),
        mainContainer: document.getElementById('apod-container-hero') // エラー表示用
    };

    // 宇宙天気情報 (DONKI) 関連要素
    const solarFlareContainer = document.getElementById('solar-flare-container');
    const geomagneticStormContainer = document.getElementById('geomagnetic-storm-container');

    // NASAニュース関連要素
    const spaceNewsContainer = document.getElementById("space-news");

    // 記事関連要素
    const latestPostsContainer = document.getElementById('latest-posts');
    const sidebarCategoriesContainer = document.getElementById("sidebar-categories");
    const allPostsContainer = document.getElementById('all-posts');
    const categoryFilter = document.getElementById('category-filter');
    const tagFilter = document.getElementById('tag-filter');

    // NASA APIキーと今日の日付
    const NASA_API_KEY = '2xltSsPMjbXB66oDPVCdT6qPhKURghrTPdbhKEzj';
    const TODAY_DATE = new Date().toISOString().slice(0, 10);

    // --- ヘルパー関数 ---
    /**
     * APIからデータをフェッチする共通関数
     * @param {string} url - フェッチするAPIのURL
     * @param {HTMLElement} errorTargetElement - エラーメッセージを表示するDOM要素
     * @param {string} errorMessage - エラー時に表示するメッセージ
     * @returns {Promise<Object>} フェッチしたデータ
     */
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
            throw error; // エラーを再スローして、呼び出し元でさらに処理できるようにする
        }
    }

    /**
     * Intersection Observerを設定し、要素がビューポートに入ったときに`visible`クラスを追加する
     * @param {string} selector - 対象要素のCSSセレクタ
     */
    function setupIntersectionObserver(selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // 一度表示されたら監視を停止
                }
            });
        }, { threshold: 0.2 }); // 20%ビューポートに入ったら発火

        elements.forEach(element => observer.observe(element));
    }

    // --- 機能ごとの処理 ---

    /**
     * ハンバーガーメニューの開閉を処理
     */
    function setupHamburgerMenu() {
        if (hamburgerMenu && scrollableMenu) {
            hamburgerMenu.addEventListener('click', function() {
                scrollableMenu.classList.toggle('open');
                hamburgerMenu.classList.toggle('open');
            });
        }
    }

    /**
     * 各種アニメーション (フェードイン、スライドイン) を設定
     */
    function setupAnimations() {
        setupIntersectionObserver('.fade-in');
        setupIntersectionObserver('.slide-in-left');
        setupIntersectionObserver('.slide-in-right');
        setupIntersectionObserver('.slide-in-bottom');
        setupIntersectionObserver('.section'); // 汎用セクション表示
    }

    /**
     * スクロールプログレスバーの更新を処理
     */
    function setupScrollProgressBar() {
        if (scrollProgress) {
            window.addEventListener('scroll', function() {
                const scrollTop = window.scrollY;
                const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrollPercentage = (documentHeight > 0) ? (scrollTop / documentHeight) * 100 : 0;
                scrollProgress.style.width = scrollPercentage + '%';
            });
        }
    }

    /**
     * APOD (Astronomy Picture of the Day) を取得して表示
     */
    async function fetchAndDisplayApod() {
        const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
        try {
            const data = await fetchData(apodUrl, apodElements.mainContainer, '今日の宇宙画像');

            if (apodElements.title) apodElements.title.textContent = data.title;
            if (apodElements.explanation) apodElements.explanation.textContent = data.explanation;
            if (apodElements.copyright) {
                apodElements.copyright.textContent = data.copyright ? `© ${data.copyright}` : '出典: NASA / パブリックドメインの可能性';
            }

            if (apodElements.mediaContainer) {
                apodElements.mediaContainer.innerHTML = ''; // 既存の内容をクリア
                if (data.media_type === 'video') {
                    const iframe = document.createElement('iframe');
                    iframe.src = data.url;
                    iframe.width = '100%';
                    iframe.style.aspectRatio = '16 / 9'; // アスペクト比を固定
                    iframe.frameBorder = '0';
                    iframe.allowFullscreen = true;
                    apodElements.mediaContainer.appendChild(iframe);
                } else if (data.media_type === 'image') {
                    const img = document.createElement('img');
                    img.src = data.url;
                    img.alt = data.title;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    apodElements.mediaContainer.appendChild(img);
                }
            }
        } catch (error) {
            // fetchData関数で既にエラーメッセージが表示されているため、ここでは特別な処理は不要
        }
    }

    /**
     * 太陽フレア情報を取得して表示
     */
    async function fetchAndDisplaySolarFlares() {
        if (!solarFlareContainer) return;
        const flareUrl = `https://api.nasa.gov/DONKI/FLR?startDate=${TODAY_DATE}&endDate=${TODAY_DATE}&api_key=${NASA_API_KEY}`;

        try {
            const data = await fetchData(flareUrl, solarFlareContainer, '太陽フレア情報');

            if (data.length === 0) {
                solarFlareContainer.innerHTML = '<p>現在のところ、太陽フレアの活動は観測されていません。</p>';
                return;
            }

            solarFlareContainer.innerHTML = '<ul>' + data.map(f => `
                <li>
                    <div><strong>開始日時:</strong> ${f.beginTime}</div>
                    <div><strong>ピーク日時:</strong> ${f.peakTime}</div>
                    <div><strong>終了日時:</strong> ${f.endTime}</div>
                    <div><strong>強度:</strong> ${f.classType || f.class} ${f.intensity ? f.intensity : ''}</div>
                    <div><strong>領域:</strong> ${f.sourceLocation}</div>
                </li>`).join('') + '</ul>';
        } catch (error) {
            // fetchData関数で既にエラーメッセージが表示されているため、ここでは特別な処理は不要
        }
    }

    /**
     * 地磁気嵐情報を取得して表示
     */
    async function fetchAndDisplayGeomagneticStorms() {
        if (!geomagneticStormContainer) return;
        const stormUrl = `https://api.nasa.gov/DONKI/GST?startDate=${TODAY_DATE}&endDate=${TODAY_DATE}&api_key=${NASA_API_KEY}`;

        try {
            const data = await fetchData(stormUrl, geomagneticStormContainer, '地磁気嵐情報');

            if (data.length === 0) {
                geomagneticStormContainer.innerHTML = '<p>現在のところ、地磁気嵐は観測されていません。</p>';
                return;
            }

            geomagneticStormContainer.innerHTML = '<ul>' + data.map(s => `
                <li>
                    <strong>開始日時:</strong> ${s.beginTime}<br>
                    <strong>Kp指数:</strong> ${s.kpIndex || 'N/A'}<br>
                    <strong>強度:</strong> ${s.gstID || 'N/A'}<br>
                    <strong>ソース:</strong> ${s.source || 'N/A'}
                </li>`).join('') + '</ul>';
        } catch (error) {
            // fetchData関数で既にエラーメッセージが表示されているため、ここでは特別な処理は不要
        }
    }

    /**
     * NASAニュースRSSフィードを取得して表示
     */
    async function fetchAndDisplayNasaNews() {
        if (!spaceNewsContainer) return;
        const rssFeedUrl = 'https://www.nasa.gov/rss/dyn/breaking_news.rss';
        const rssApiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssFeedUrl);

        try {
            const data = await fetchData(rssApiUrl, spaceNewsContainer, 'NASAニュース');

            if (data.items && data.items.length > 0) {
                spaceNewsContainer.innerHTML = ''; // ロード中のメッセージをクリア
                data.items.slice(0, 5).forEach(item => {
                    const div = document.createElement("div");
                    div.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>`;
                    spaceNewsContainer.appendChild(div);
                });
            } else {
                spaceNewsContainer.innerHTML = '<p>新しいニュースはありません。</p>';
            }
        } catch (error) {
            // fetchData関数で既にエラーメッセージが表示されているため、ここでは特別な処理は不要
        }
    }

    /**
     * 投稿データをフェッチし、最新記事、カテゴリリスト、全記事表示とフィルタリングを設定
     */
    async function setupPosts() {
        let posts = [];
        try {
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            posts = await response.json();
        } catch (error) {
            console.error('記事の読み込みに失敗しました:', error);
            if (latestPostsContainer) latestPostsContainer.innerHTML = '<p>記事の読み込みに失敗しました。</p>';
            if (sidebarCategoriesContainer) sidebarCategoriesContainer.innerHTML = '<p>カテゴリ情報の読み込みに失敗しました。</p>';
            if (allPostsContainer) allPostsContainer.innerHTML = '<p>記事の読み込みに失敗しました。</p>';
            return; // エラー時は以降の処理を行わない
        }

        // 最新記事の表示
        if (latestPostsContainer) {
            latestPostsContainer.innerHTML = ''; // ロード中のメッセージをクリア
            const latestPosts = posts
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5); // 最新5件を表示

            if (latestPosts.length > 0) {
                latestPosts.forEach(post => {
                    const div = document.createElement('div');
                    div.className = 'post-item';
                    div.innerHTML = `
                        <h3><a href="${post.url || post.link}">${post.title}</a></h3>
                        <p>${post.date} ｜ カテゴリ：${post.category}</p>
                    `;
                    latestPostsContainer.appendChild(div);
                });
            } else {
                latestPostsContainer.innerHTML = '<p>表示する最新記事がありません。</p>';
            }
        }

        // カテゴリ別の表示 (サイドバーを想定)
        if (sidebarCategoriesContainer) {
            const categoriesMap = {};
            posts.forEach(post => {
                if (!categoriesMap[post.category]) {
                    categoriesMap[post.category] = [];
                }
                categoriesMap[post.category].push(post);
            });

            const categoryListHtml = `
                <h2>カテゴリー</h2>
                <ul class="category-list">
                    ${Object.keys(categoriesMap).map(cat => `
                        <li><a href="category.html?name=${encodeURIComponent(cat)}">${cat} (${categoriesMap[cat].length})</a></li>
                    `).join('')}
                </ul>
            `;
            sidebarCategoriesContainer.innerHTML = categoryListHtml;
        }

        // 全投稿表示 + フィルタ機能 (記事一覧ページを想定)
        if (allPostsContainer && categoryFilter && tagFilter) {
            const categories = new Set();
            const tags = new Set();

            posts.forEach(post => {
                categories.add(post.category);
                if (post.tags) {
                    post.tags.forEach(tag => tags.add(tag));
                }
            });

            // カテゴリフィルターオプションの追加
            categoryFilter.innerHTML = '<option value="all">全てのカテゴリ</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });

            // タグフィルターオプションの追加
            tagFilter.innerHTML = '<option value="all">全てのタグ</option>';
            tags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                tagFilter.appendChild(option);
            });

            /**
             * フィルタリングされた記事を表示する
             * @param {Array<Object>} filtered - フィルタリングされた記事の配列
             */
            function displayFilteredPosts(filtered) {
                allPostsContainer.innerHTML = '';
                if (filtered.length === 0) {
                    allPostsContainer.innerHTML = '<p>表示する記事がありません。</p>';
                    return;
                }
                filtered.forEach(post => {
                    const card = `
                        <div class="post-card">
                            <h2><a href="${post.url || post.link}">${post.title}</a></h2>
                            <p class="post-date">${post.date}</p>
                            <p><strong>カテゴリ:</strong> ${post.category}</p>
                            <p><strong>タグ:</strong> ${post.tags ? post.tags.join(', ') : ''}</p>
                        </div>`;
                    allPostsContainer.insertAdjacentHTML('beforeend', card);
                });
            }

            /**
             * カテゴリとタグに基づいて記事をフィルタリングし、表示を更新する
             */
            function filterAndDisplayPosts() {
                const selectedCategory = categoryFilter.value;
                const selectedTag = tagFilter.value;

                const filteredPosts = posts.filter(post => {
                    const categoryMatch = (selectedCategory === 'all' || post.category === selectedCategory);
                    const tagMatch = (selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag)));
                    return categoryMatch && tagMatch;
                });

                displayFilteredPosts(filteredPosts);
            }

            // フィルターイベントリスナー
            categoryFilter.addEventListener('change', filterAndDisplayPosts);
            tagFilter.addEventListener('change', filterAndDisplayPosts);

            // 初期表示
            filterAndDisplayPosts();
        }
    }

    // --- 全ての機能を初期化 ---
    setupHamburgerMenu();
    setupAnimations();
    setupScrollProgressBar();
    fetchAndDisplayApod();
    fetchAndDisplaySolarFlares();
    fetchAndDisplayGeomagneticStorms();
    fetchAndDisplayNasaNews();
    setupPosts();
});