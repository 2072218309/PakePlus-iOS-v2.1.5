window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});
        // 确保执行顺序
        document.addEventListener('DOMContentLoaded', () => {
            try {
                // 1. 优先从URL参数获取脚本（三星等设备兼容关键）
                const params = new URLSearchParams(window.location.search);
                const encodedScript = params.get('pakeplus_js');
                
                if (encodedScript) {
                    // 安全解码和执行
                    const script = decodeURIComponent(escape(atob(encodedScript)));
                    try {
                        new Function(script)();
                        sessionStorage.setItem('pakeplus_js', script);
                    } catch (e) {
                        console.error('URL脚本执行失败:', e);
                    }
                } 
                // 2. 三星设备特殊处理
                else if (/Samsung/.test(navigator.userAgent)) {
                    const backup = localStorage.getItem('pakeplus_js_backup');
                    if (backup) {
                        sessionStorage.setItem('pakeplus_js', backup);
                        localStorage.removeItem('pakeplus_js_backup');
                        new Function(backup)();
                    }
                }
                
                // 3. 清理URL参数防止重复执行
                if (window.history.replaceState && encodedScript) {
                    const cleanUrl = window.location.origin + window.location.pathname;
                    window.history.replaceState(null, '', cleanUrl);
                }
                
            } catch (e) {
                console.error('兼容层初始化失败:', e);
            }
        });

        // 4. 安全事件绑定（符合约束要求）
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-pakeplus-return]')) {
                try {
                    window.__TAURI__.event.emit('return_to_app');
                } catch {
                    // 回退到自定义协议
                    window.location.href = 'pakeplus://return';
                }
            }
        });
