window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});const hookClick = (e) => {
    // 仅处理主鼠标点击（排除右键/中键）
    if (e.button !== 0) return;
    
    const origin = e.target.closest('a[href]');
    if (!origin) return;
    
    // 获取最终生效的target值
    const baseTarget = document.querySelector('head base[target]')?.target || '';
    const finalTarget = origin.target || baseTarget;
    
    // 仅处理_target="_blank"_且HTTP/HTTPS协议的链接
    if (finalTarget === '_blank' && 
        /^https?:\/\//i.test(origin.href)) {
        
        e.preventDefault();
        e.stopPropagation();
        
        // 延迟跳转解决部分WebView竞争条件
        setTimeout(() => {
            location.href = origin.href;
        }, 50);
    }
};

// 强化window.open重写
window.open = new Proxy(window.open, {
    apply: (target, thisArg, args) => {
        const [url] = args;
        if (url && /^https?:\/\//i.test(url)) {
            setTimeout(() => location.href = url, 50);
            return null;
        }
        return Reflect.apply(target, thisArg, args);
    }
});

// 关键：添加_passive: false_确保移动端preventDefault生效
document.addEventListener('click', hookClick, { 
    capture: true,
    passive: false 
});