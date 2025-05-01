document.addEventListener('DOMContentLoaded', function() {
    // ハンバーガーメニューの処理
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', function() {
            navLinks.classList.toggle('open');
            hamburgerMenu.classList.toggle('open'); // ハンバーガーメニューの見た目を変更する場合 (例: バツ印にする)
        });
    }

    // フェードインアニメーションの処理
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

    // スライドイン（左から）アニメーションの処理
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

    // スライドイン（右から）アニメーションの処理
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

    // スライドイン（下から）アニメーションの処理
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

    // スクロールプログレスバーの処理
    const scrollProgress = document.getElementById('scroll-progress');

    if (scrollProgress) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercentage = (scrollTop / documentHeight) * 100;
            scrollProgress.style.width = scrollPercentage + '%';
        });
    }

    // 宇宙天気（太陽フレア）情報の取得と表示
    const spaceWeatherContainer = document.getElementById('space-weather-container');
    const apiKey = '2xltSsPMjbXB66oDPVCdT6qPhKURghrTPdbhKEzj'; // ← あなたのAPIキー
    const today = new Date().toISOString().slice(0, 10);
    const donkiApiUrl = `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=${today}&endDate=${today}&api_key=${apiKey}`;

    fetch(donkiApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`DONKI API error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displaySpaceWeather(data);
        })
        .catch(error => {
            console.error('DONKI APIの取得エラー (Solar Flare):', error);
            if (spaceWeatherContainer) {
                spaceWeatherContainer.innerHTML = '<p>太陽フレア情報を取得できませんでした。</p>';
            }
        });

    function displaySpaceWeather(data) {
        if (spaceWeatherContainer) {
            if (data && data.length > 0) {
                let weatherInfoHTML = '<ul>';
                data.forEach(flare => {
                    weatherInfoHTML += `<li>
                        <strong>開始日時:</strong> ${flare.beginTime}<br>
                        <strong>ピーク日時:</strong> ${flare.peakTime}<br>
                        <strong>終了日時:</strong> ${flare.endTime}<br>
                        <strong>強度:</strong> ${flare.class} ${flare.intensity}<br>
                        <strong>領域:</strong> ${flare.sourceLocation}
                    </li>`;
                });
                weatherInfoHTML += '</ul>';
                spaceWeatherContainer.innerHTML = weatherInfoHTML;
            } else {
                spaceWeatherContainer.innerHTML = '<p>現在のところ、太陽フレアの活動は観測されていません。</p>';
            }
        }
    }

    // 他のコードがあればここに記述
});

const posts = [
    {
      title: "火星ってどんな星？",
      date: "2025-04-25",
      category: "惑星",
      link: "articles/mars.html"
    },
    {
      title: "月の満ち欠けのひみつ",
      date: "2025-04-22",
      category: "月",
      link: "articles/moon-phases.html"
    },
    // …以下、他の記事
  ];

  const latestPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const container = document.getElementById("latest-posts");
  latestPosts.forEach(post => {
    const div = document.createElement("div");
    div.innerHTML = `<a href="${post.link}">${post.title}</a>`;
    container.appendChild(div);
  });
 
  const categories = {};
posts.forEach(post => {
  if (!categories[post.category]) categories[post.category] = [];
  categories[post.category].push(post);
});

const sidebar = document.getElementById("sidebar");
for (let cat in categories) {
  const section = document.createElement("div");
  section.innerHTML = `<h3>${cat}</h3>`;
  categories[cat].forEach(post => {
    const item = document.createElement("div");
    item.innerHTML = `<a href="${post.link}">${post.title}</a>`;
    section.appendChild(item);
  });
  sidebar.appendChild(section);
}
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });
  
    sections.forEach(section => observer.observe(section));
  });
  