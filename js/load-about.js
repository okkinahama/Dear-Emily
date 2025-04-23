// js/load-about.js
document.addEventListener("DOMContentLoaded", () => {
    fetch("about-emily.html")
      .then(response => response.text())
      .then(html => {
        document.getElementById("about-emily-container").innerHTML = html;
      })
      .catch(error => {
        console.error("読み込み失敗:", error);
      });
  });
  