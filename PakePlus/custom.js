window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// 新增优化代码开始
document.addEventListener('DOMContentLoaded', () => {
    // 拦截所有链接点击
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        const target = link.getAttribute('target');
        
        // 仅处理需要跳转的链接
        if (href && href !== '#' && !href.startsWith('javascript:') && target !== '_self') {
            e.preventDefault();
            
            // 优先使用 Tauri API 处理
            if (window.__TAURI__?.shell?.open) {
                window.__TAURI__.shell.open(href);
            } 
            // 备用方案：修改 location
            else {
                window.location.href = href;
            }
        }
    });

    // 拦截 window.open 调用
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        if (url && target !== '_self') {
            if (window.__TAURI__?.shell?.open) {
                window.__TAURI__.shell.open(url);
                return null;
            }
            return originalOpen.call(window, url, '_self', features);
        }
        return originalOpen.apply(window, arguments);
    };
});
// 新增优化代码结束