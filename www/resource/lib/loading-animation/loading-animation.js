//检测是否加载完成
setInterval(() => {
    let skinlib_loading = document.getElementsByClassName("loading_cover")[0];
    // let main = document.getElementsByClassName(".Page-container")
    if (document.readyState == 'complete') {
        skinlib_loading.style.display = "none";
        // main.style.display = "block";
    } else {
        skinlib_loading.style.display = "block";
        // main.style.display = "none";
    }
    }, 100);