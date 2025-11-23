document.addEventListener('DOMContentLoaded', function() {
    // --- 定数と初期化 ---
    
    // UI要素のセレクタ
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const menuToToggle = document.querySelector('.scrollable-menu') || document.querySelector('.nav-links');
    const scrollProgress = document.getElementById('scroll-progress');

    // ★ご自身のNASA APIキーを設定してください★
    const NASA_API_KEY = '2xltSsPMjbXB66oDPVCdT6qPhKURghrTPdbhKEzj'; // <--- ここをあなたのキーに置き換え
    const TODAY_DATE = new Date().toISOString().slice(0, 10);

    // APOD (Astronomy Picture of the Day) 関連要素
    const apodElements = {
        // メインページ（ヒーローセクション）用の要素ID
        title: document.getElementById('apod-title-hero'),
        mediaContainer: document.getElementById('apod-media-container-hero'),
        explanation: document.getElementById('apod-explanation-hero'),
        copyright: document.getElementById('apod-copyright-hero'),
        mainContainer: document.getElementById('apod-container-hero'), // ヒーローセクション用エラー表示コンテナ
        // ★記事内（詳細ページ）用の要素ID（新しい要素）★
        articleContent: document.getElementById('apod-content') 
    };

    // 宇宙天気情報 (DONKI) 関連要素
    const solarFlareContainer = document.getElementById('solar-flare-container') || document.getElementById('space-weather-container');
    const geomagneticStormContainer = document.getElementById('geomagnetic-storm-container');
    // NASAニュース関連要素
    const spaceNewsContainer = document.getElementById("space-news");
    // 記事関連要素
    const latestPostsContainer = document.getElementById('latest-posts');
    const sidebarCategoriesContainer = document.getElementById("sidebar-categories");
    const allPostsContainer = document.getElementById('all-posts');
    const categoryFilter = document.getElementById('category-filter');
    const tagFilter = document.getElementById('tag-filter');


    // --- ヘルパー関数 ---
    
    /**
     * APIからデータをフェッチする共通関数
     */
    async function fetchData(url, errorTargetElement, errorMessage) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (Array.isArray(data) && data.length === 0) {
                 return data; 
            }
            return data;
        } catch (error) {
            console.error(`${errorMessage}取得エラー:`, error);
            if (errorTargetElement) {
                errorTargetElement.innerHTML = `<p>${errorMessage}を取得できませんでした。</p>`;
            }
            throw error;
        }
    }

    /**
     * Intersection Observerを設定し、要素がビューポートに入ったときに`visible`クラスを追加する
     */
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


    // --- 機能ごとの処理 ---

    /**
     * ハンバーガーメニューの開閉を処理
     */
    function setupHamburgerMenu() {
        if (hamburgerMenu && menuToToggle) {
            hamburgerMenu.addEventListener('click', function() {
                menuToToggle.classList.toggle('open');
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
        setupIntersectionObserver('.section'); 
        // 記事内のAPODセクションもアニメーション対象に
        setupIntersectionObserver('#apod'); 
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
     * ヒーローセクションと記事内の両方に対応
     */
    async function fetchAndDisplayApod() {
        const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
        // 記事内のコンテナが存在する場合はそれをエラーターゲットに、なければヒーローコンテナ
        const errorEl = apodElements.mainContainer || document.getElementById('apod') || null; 

        try {
            const data = await fetchData(apodUrl, errorEl, '今日の宇宙画像');

            if (!data) return; 

            // 1. メインページ（ヒーロー）セクションへの表示
            if (apodElements.title) apodElements.title.textContent = data.title;
            if (apodElements.explanation) apodElements.explanation.textContent = data.explanation;
            if (apodElements.copyright) {
                apodElements.copyright.textContent = data.copyright ? `© ${data.copyright}` : '出典: NASA / パブリックドメインの可能性';
            }
            
            if (apodElements.mediaContainer) {
                apodElements.mediaContainer.innerHTML = ''; 
                const isVideo = data.media_type === 'video';
                const mediaUrl = data.url || data.hdurl;
                
                if (isVideo) {
                    const iframe = document.createElement('iframe');
                    iframe.src = mediaUrl; iframe.width = '100%'; iframe.style.aspectRatio = '16 / 9'; 
                    iframe.frameBorder = '0'; iframe.allowFullscreen = true;
                    apodElements.mediaContainer.appendChild(iframe);
                } else if (data.media_type === 'image') {
                    const img = document.createElement('img');
                    img.src = mediaUrl; img.alt = data.title; img.style.maxWidth = '100%'; img.style.height = 'auto';
                    apodElements.mediaContainer.appendChild(img);
                }
            }

            // 2. 記事内APOD (`apod-content`) への表示
            if (apodElements.articleContent) {
                apodElements.articleContent.innerHTML = '';
                const isImage = data.media_type === 'image';
                const mediaUrl = data.url || data.hdurl;

                const title = document.createElement('div'); title.textContent = data.title || 'APOD';
                const date = document.createElement('div'); date.className='meta'; date.textContent = data.date || TODAY_DATE;

                apodElements.articleContent.appendChild(title); 
                apodElements.articleContent.appendChild(date);

                if (isImage){
                    const img = document.createElement('img'); 
                    img.src = mediaUrl; 
                    img.alt = data.title || 'APOD image'; 
                    img.style.maxWidth='100%'; 
                    img.style.borderRadius='8px'; 
                    apodElements.articleContent.appendChild(img);
                } else {
                    const link = document.createElement('a'); 
                    link.href = mediaUrl; 
                    link.textContent = 'APODを表示する'; 
                    link.target='_blank'; 
                    apodElements.articleContent.appendChild(link);
                }

                if(data.explanation){
                    const ex = document.createElement('p'); 
                    ex.textContent = data.explanation; 
                    apodElements.articleContent.appendChild(ex);
                }
            }
        } catch (error) {
            // fetchDataでエラー表示済み
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

            if (!data || data.length === 0) {
                solarFlareContainer.innerHTML = '<p>現在のところ、太陽フレアの活動は観測されていません。</p>';
                return;
            }

            // HTML生成ロジック
            solarFlareContainer.innerHTML = '<ul>' + data.map(f => `
                <li>
                    <div><strong>開始日時:</strong> ${f.beginTime}</div>
                    <div><strong>ピーク日時:</strong> ${f.peakTime}</div>
                    <div><strong>終了日時:</strong> ${f.endTime || 'N/A'}</div>
                    <div><strong>強度:</strong> ${f.classType || f.class} ${f.intensity ? f.intensity : ''}</div>
                    <div><strong>領域:</strong> ${f.sourceLocation || 'N/A'}</div>
                </li>`).join('') + '</ul>';
        } catch (error) {
            // fetchDataでエラー表示済み
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

            if (!data || data.length === 0) {
                geomagneticStormContainer.innerHTML = '<p>現在のところ、地磁気嵐は観測されていません。</p>';
                return;
            }

            geomagneticStormContainer.innerHTML = '<ul>' + data.map(s => {
                // GSTデータ構造の確認：`allID`が地磁気嵐のレベル情報を含む
                const stormLevel = s.allID && s.allID.length > 0 ? s.allID.map(id => `${id.level} (${id.time})`).join(', ') : 'N/A';
                
                return `
                <li>
                    <strong>開始日時:</strong> ${s.beginTime}<br>
                    <strong>嵐レベル:</strong> ${stormLevel}<br>
                    <strong>ソース:</strong> ${s.source || 'N/A'}
                </li>`;
            }).join('') + '</ul>';
        } catch (error) {
            // fetchDataでエラー表示済み
        }
    }

    /**
     * NASAニュースRSSフィードを取得して表示
     */
    async function fetchAndDisplayNasaNews() {
        if (!spaceNewsContainer) return;
        const rssFeedUrl = 'https://www.nasa.gov/rss/dyn/breaking_news.rss';
        // CORS対策としてRSS-to-JSONプロキシサービスを使用
        const rssApiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssFeedUrl);

        try {
            const data = await fetchData(rssApiUrl, spaceNewsContainer, 'NASAニュース');

            if (data.items && data.items.length > 0) {
                spaceNewsContainer.innerHTML = ''; // ロード中のメッセージをクリア
                data.items.slice(0, 5).forEach(item => {
                    const div = document.createElement("div");
                    div.className = 'news-item';
                    div.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>`;
                    spaceNewsContainer.appendChild(div);
                });
            } else {
                spaceNewsContainer.innerHTML = '<p>新しいニュースはありません。</p>';
            }
        } catch (error) {
            // fetchDataでエラー表示済み
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
            // 日付でソート（最新順）
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('記事の読み込みに失敗しました:', error);
            // 記事関連のコンテナ全てにエラーを表示
            [latestPostsContainer, sidebarCategoriesContainer, allPostsContainer].forEach(container => {
                if (container) container.innerHTML = '<p>記事の読み込みに失敗しました。</p>';
            });
            return;
        }

        // --- 最新記事の表示 (トップページなど) ---
        if (latestPostsContainer) {
            latestPostsContainer.innerHTML = ''; 
            const latestPosts = posts.slice(0, 5); 

            if (latestPosts.length > 0) {
                latestPosts.forEach(post => {
                    const div = document.createElement('div');
                    div.className = 'post-item';
                    const categoryText = Array.isArray(post.category) ? post.category.join(', ') : post.category;
                    const linkUrl = post.url || post.link || '#';
                    
                    div.innerHTML = `
                        ${post.image ? `<img src="${post.image}" alt="${post.title}のサムネイル" class="article-thumbnail-small">` : ''}
                        <h3><a href="${linkUrl}">${post.title}</a></h3>
                        <p>${post.date} ｜ カテゴリ：${categoryText}</p>
                    `;
                    latestPostsContainer.appendChild(div);
                });
            } else {
                latestPostsContainer.innerHTML = '<p>表示する最新記事がありません。</p>';
            }
        }

        // --- カテゴリ別の表示 (サイドバー) ---
        if (sidebarCategoriesContainer) {
            const categoriesMap = {};
            posts.forEach(post => {
                const categories = Array.isArray(post.category) ? post.category : [post.category];
                categories.forEach(cat => {
                    if (!cat) return; // カテゴリがnullや空文字列の場合はスキップ
                    if (!categoriesMap[cat]) categoriesMap[cat] = 0;
                    categoriesMap[cat]++;
                });
            });

            const categoryListHtml = `
                <h2>カテゴリー</h2>
                <ul class="category-list">
                    ${Object.keys(categoriesMap).map(cat => `
                        <li><a href="category.html?name=${encodeURIComponent(cat)}">${cat} (${categoriesMap[cat]})</a></li>
                    `).join('')}
                </ul>
            `;
            sidebarCategoriesContainer.innerHTML = categoryListHtml;
        }

        // --- 全投稿表示 + フィルタ機能 (記事一覧ページ) ---
        if (allPostsContainer && categoryFilter && tagFilter) {
            const categories = new Set();
            const tags = new Set();

            posts.forEach(post => {
                const postCategories = Array.isArray(post.category) ? post.category : [post.category];
                postCategories.forEach(cat => cat && categories.add(cat));
                
                if (post.tags) {
                    post.tags.forEach(tag => tag && tags.add(tag));
                }
            });

            // カテゴリフィルターオプションの追加
            categoryFilter.innerHTML = '<option value="all">全てのカテゴリ</option>';
            [...categories].sort().forEach(category => {
                categoryFilter.insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`);
            });

            // タグフィルターオプションの追加
            tagFilter.innerHTML = '<option value="all">全てのタグ</option>';
            [...tags].sort().forEach(tag => {
                tagFilter.insertAdjacentHTML('beforeend', `<option value="${tag}">${tag}</option>`);
            });

            /**
             * フィルタリングされた記事を表示する
             */
            function displayFilteredPosts(filtered) {
                allPostsContainer.innerHTML = '';
                if (filtered.length === 0) {
                    allPostsContainer.innerHTML = '<p>表示する記事がありません。</p>';
                    return;
                }
                
                filtered.forEach(post => {
                    const linkUrl = post.url || post.link || '#'; 
                    const tagsText = post.tags ? post.tags.join(', ') : '';
                    const categoryText = Array.isArray(post.category) ? post.category.join(', ') : post.category;

                    const card = `
                        <div class="post-card fade-in">
                            ${post.image ? `<img src="${post.image}" alt="${post.title}のサムネイル" class="article-thumbnail">` : ''}
                            <h2><a href="${linkUrl}">${post.title}</a></h2>
                            <p class="post-date">${post.date}</p>
                            <p><strong>カテゴリ:</strong> ${categoryText}</p>
                            <p><strong>タグ:</strong> ${tagsText}</p>
                        </div>`;
                    allPostsContainer.insertAdjacentHTML('beforeend', card);
                });
                
                // フィルタリング後の表示にもアニメーションを適用
                setupIntersectionObserver('.post-card'); 
            }

            /**
             * カテゴリとタグに基づいて記事をフィルタリングし、表示を更新する
             */
            function filterAndDisplayPosts() {
                const selectedCategory = categoryFilter.value;
                const selectedTag = tagFilter.value;

                const filteredPosts = posts.filter(post => {
                    const postCategories = Array.isArray(post.category) ? post.category : [post.category];
                    const categoryMatch = (selectedCategory === 'all' || postCategories.includes(selectedCategory));
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

    // AdSense Scriptの追加
    (function() {
        var script = document.createElement("script");
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2597955691662954";
        script.setAttribute("async", "true");
        script.setAttribute("crossorigin", "anonymous");
        document.head.appendChild(script);
    })();
});