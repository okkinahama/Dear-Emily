document.addEventListener('DOMContentLoaded', function() {
    // --- ハンバーガーメニューの処理 ---
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const scrollableMenu = document.querySelector('.scrollable-menu');

    if (hamburgerMenu && scrollableMenu) {
        hamburgerMenu.addEventListener('click', function() {
            scrollableMenu.classList.toggle('open');
            hamburgerMenu.classList.toggle('open');
        });
    }

    // --- 各種アニメーションの処理 ---
    // フェードイン
    const fadeIns = document.querySelectorAll('.fade-in');
    const fadeInObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    });
    fadeIns.forEach(fadeIn => {
        fadeInObserver.observe(fadeIn);
    });

    // スライドイン（左から）
    const slideInsLeft = document.querySelectorAll('.slide-in-left');
    const slideInLeftObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                slideInLeftObserver.unobserve(entry.target);
            }
        });
    });
    slideInsLeft.forEach(slideIn => {
        slideInLeftObserver.observe(slideIn);
    });

    // スライドイン（右から）
    const slideInsRight = document.querySelectorAll('.slide-in-right');
    const slideInRightObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                slideInRightObserver.unobserve(entry.target);
            }
        });
    });
    slideInsRight.forEach(slideIn => {
        slideInRightObserver.observe(slideIn);
    });

    // スライドイン（下から）
    const slideInsBottom = document.querySelectorAll('.slide-in-bottom');
    const slideInBottomObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                slideInBottomObserver.unobserve(entry.target);
            }
        });
    });
    slideInsBottom.forEach(slideIn => {
        slideInBottomObserver.observe(slideIn);
    });

    // --- スクロールプログレスバーの処理 ---
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercentage = (scrollTop / documentHeight) * 100;
            scrollProgress.style.width = scrollPercentage + '%';
        });
    }

    // --- NASA APIキーの定義 (共通化) ---
    const nasaApiKey = '2xltSsPMjbXB66oDPVCdT6qPhKURghrTPdbhKEzj';
    const today = new Date().toISOString().slice(0, 10);

    // --- APOD (Astronomy Picture of the Day) の取得と表示 ---
    const apodTitle = document.getElementById('apod-title-hero');
    const apodMediaContainer = document.getElementById('apod-media-container-hero');
    const apodExplanation = document.getElementById('apod-explanation-hero');
    const apodCopyright = document.getElementById('apod-copyright-hero');
    const apodContainer = document.getElementById('apod-container-hero'); // エラー時用
    const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`;

    fetch(apodUrl)
        .then(res => {
            if (!res.ok) {
                return Promise.reject(res.status);
            }
            return res.json();
        })
        .then(data => {
            if (apodTitle) apodTitle.textContent = data.title;
            if (apodExplanation) apodExplanation.textContent = data.explanation;
            if (apodCopyright) {
                apodCopyright.textContent = data.copyright ? `© ${data.copyright}` : '出典: NASA / パブリックドメインの可能性';
            }

            if (apodMediaContainer) {
                apodMediaContainer.innerHTML = ''; // 既存の内容をクリア
                if (data.media_type === 'video') {
                    const iframe = document.createElement('iframe');
                    iframe.src = data.url;
                    iframe.width = '100%';
                    iframe.style.aspectRatio = '16 / 9'; // アスペクト比を固定
                    iframe.frameBorder = '0';
                    iframe.allowFullscreen = true;
                    apodMediaContainer.appendChild(iframe);
                } else if (data.media_type === 'image') {
                    const img = document.createElement('img');
                    img.src = data.url;
                    img.alt = data.title;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    apodMediaContainer.appendChild(img);
                }
            }
        })
        .catch(err => {
            console.error('APOD取得エラー:', err);
            if (apodContainer) {
                apodContainer.innerHTML = '<p>今日の宇宙画像を取得できませんでした。</p>';
            } else if (apodTitle) {
                apodTitle.textContent = '今日の宇宙画像を取得できませんでした';
            }
        });

    // --- 太陽フレア情報の取得と表示 ---
    const flareContainer = document.getElementById('solar-flare-container');
    const flareUrl = `https://api.nasa.gov/DONKI/FLR?startDate=${today}&endDate=${today}&api_key=${nasaApiKey}`;

    fetch(flareUrl)
        .then(res => {
            if (!res.ok) {
                return Promise.reject(res.status);
            }
            return res.json();
        })
        .then(data => {
            if (!flareContainer) return;
            if (data.length === 0) {
                flareContainer.innerHTML = '<p>現在のところ、太陽フレアの活動は観測されていません。</p>';
                return;
            }
            flareContainer.innerHTML = '<ul>' + data.map(f => `
                <li>
                    <div><strong>開始日時:</strong> ${f.beginTime}</div>
                    <div><strong>ピーク日時:</strong> ${f.peakTime}</div>
                    <div><strong>終了日時:</strong> ${f.endTime}</div>
                    <div><strong>強度:</strong> ${f.classType || f.class} ${f.intensity ? f.intensity : ''}</div>
                    <div><strong>領域:</strong> ${f.sourceLocation}</div>
                </li>`).join('') + '</ul>';
        })
        .catch(err => {
            console.error('太陽フレア取得エラー:', err);
            if (flareContainer) {
                flareContainer.innerHTML = '<p>太陽フレア情報を取得できませんでした。</p>';
            }
        });

    // --- 地磁気嵐情報の取得と表示 ---
    const stormContainer = document.getElementById('geomagnetic-storm-container');
    const stormUrl = `https://api.nasa.gov/DONKI/GST?startDate=${today}&endDate=${today}&api_key=${nasaApiKey}`;

    fetch(stormUrl)
        .then(res => {
            if (!res.ok) {
                return Promise.reject(res.status);
            }
            return res.json();
        })
        .then(data => {
            if (!stormContainer) return;
            if (data.length === 0) {
                stormContainer.innerHTML = '<p>現在のところ、地磁気嵐は観測されていません。</p>';
                return;
            }
            stormContainer.innerHTML = '<ul>' + data.map(s => `
                <li>
                    <strong>開始日時:</strong> ${s.beginTime}<br>
                    <strong>Kp指数:</strong> ${s.kpIndex}<br>
                    <strong>強度:</strong> ${s.gstID}<br>
                    <strong>ソース:</strong> ${s.source}
                </li>`).join('') + '</ul>';
        })
        .catch(err => {
            console.error('地磁気嵐取得エラー:', err);
            if (stormContainer) {
                stormContainer.innerHTML = '<p>地磁気嵐情報を取得できませんでした。</p>';
            }
        });

    // --- NASAニュースRSSの取得 ---
    const rssFeedUrl = 'https://www.nasa.gov/rss/dyn/breaking_news.rss';
    const rssApiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssFeedUrl);

    fetch(rssApiUrl)
        .then(res => res.json())
        .then(data => {
            const newsContainer = document.getElementById("space-news");
            if (newsContainer && data.items) {
                // 最大5件のニュースを表示
                newsContainer.innerHTML = ''; // ロード中のメッセージをクリア
                data.items.slice(0, 5).forEach(item => {
                    const div = document.createElement("div");
                    div.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
                    newsContainer.appendChild(div);
                });
            }
        })
        .catch(err => console.error("RSS取得エラー:", err));

    // --- 記事関連の処理 (posts.jsonからの読み込み、最新記事、カテゴリ、フィルタ) ---
    const latestPostsContainer = document.getElementById('latest-posts');
    const sidebarCategoriesContainer = document.getElementById("sidebar-categories");
    const allPostsContainer = document.getElementById('all-posts');
    const categoryFilter = document.getElementById('category-filter');
    const tagFilter = document.getElementById('tag-filter');

    fetch('posts.json') // JSONのパスを正しく
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            // 最新記事の表示
            if (latestPostsContainer) {
                latestPostsContainer.innerHTML = ''; // ロード中のメッセージをクリア
                const latestPosts = posts
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5); // 最新5件を表示

                latestPosts.forEach(post => {
                    const div = document.createElement('div');
                    div.className = 'post-item';
                    div.innerHTML = `
                        <h3><a href="${post.url || post.link}">${post.title}</a></h3>
                        <p>${post.date} ｜ カテゴリ：${post.category}</p>
                    `;
                    latestPostsContainer.appendChild(div);
                });
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

                // カテゴリリストのHTML構造を生成
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
                    if (post.tags) { // post.tagsの存在チェックを追加
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

                function displayPosts(filtered) {
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

                // --- ここに filterPosts 関数を定義します ---
                function filterPosts() {
                    const selectedCategory = categoryFilter.value;
                    const selectedTag = tagFilter.value;

                    const filteredPosts = posts.filter(post => {
                        const categoryMatch = (selectedCategory === 'all' || post.category === selectedCategory);
                        // post.tags が存在しない場合を考慮
                        const tagMatch = (selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag)));
                        return categoryMatch && tagMatch;
                    });

                    displayPosts(filteredPosts);
                }
                // --- filterPosts 関数定義の終わり ---

                // フィルターイベントリスナー
                categoryFilter.addEventListener('change', filterPosts);
                tagFilter.addEventListener('change', filterPosts);

                // 初期表示
                filterPosts();
            }
        })
        .catch(error => {
            console.error('記事の読み込みに失敗しました:', error);
            if (latestPostsContainer) latestPostsContainer.innerHTML = '<p>記事の読み込みに失敗しました。</p>';
            if (sidebarCategoriesContainer) sidebarCategoriesContainer.innerHTML = '<p>カテゴリ情報の読み込みに失敗しました。</p>';
            if (allPostsContainer) allPostsContainer.innerHTML = '<p>記事の読み込みに失敗しました。</p>';
        });

    // --- スクロールによるセクション表示 (汎用フェードインアニメーション) ---
    const sections = document.querySelectorAll('.section');
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2
    });
    sections.forEach(section => sectionObserver.observe(section));

     // about-emily.html のコンテンツを読み込む関数
    const loadAboutEmilyContent = async () => {
        const aboutContentArea = document.getElementById('main-content-area');
        if (aboutContentArea) {
            try {
                const response = await fetch('about-emily.html');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();

                // HTML全体ではなく、<body>タグの中身だけを抽出して挿入する
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const bodyContent = doc.body.innerHTML;

                // h2タイトルはHTML側に既に存在するので、それ以外のコンテンツを挿入
                // また、HTML側に含まれるheaderやfooterは除外したい場合がある
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = bodyContent;
                
                // 例: about-emily.html内に特定のIDやクラスのメインコンテンツ領域がある場合
                const specificContent = tempDiv.querySelector('.about-page-content') || tempDiv; // about-page-contentがあればそれを使う、なければbodyContent全体

                // 既存のh2とpタグを保持しつつ、その下にコンテンツを追加
                // または、h2とpタグを置き換えるか、#main-content-areaを完全に置き換えるか
                aboutContentArea.innerHTML = specificContent.innerHTML; // シンプルに置き換え

            } catch (error) {
                console.error('about-emily.htmlの読み込みに失敗しました:', error);
                aboutContentArea.innerHTML = '<h2>About Emily (読み込みエラー)</h2><p>コンテンツの読み込みに失敗しました。</p>';
            }
        }
    };


    // 全ての初期化関数を呼び出す
    fetchApod();
    fetchSpaceNews();
    displayLatestPosts();
    populateCategoryFilter();
    populateTagFilter();
    displayAllPosts(); // 初期表示として全ての記事を表示
    fetchSolarFlares();
    fetchGeomagneticStorms();
    loadAboutEmilyContent(); // アバウトコンテンツの読み込み
});