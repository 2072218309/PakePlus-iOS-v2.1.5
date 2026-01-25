window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});(function() {
    'use strict';
    
    // 设备检测辅助函数
    const isSamsungDevice = () => /Samsung|SM-/i.test(navigator.userAgent);
    const isAndroid = () => /Android/i.test(navigator.userAgent);
    
    // 增强版链接拦截处理器
    const linkInterceptor = (function() {
        // 内部状态管理
        const state = {
            lastPreventedTime: 0,
            preventThreshold: 300, // 防止重复拦截的时间阈值(ms)
            isHandling: false
        };
        
        // 验证URL是否有效
        const isValidUrl = (url) => {
            if (!url) return false;
            try {
                const parsed = new URL(url, window.location.href);
                return ['http:', 'https:'].includes(parsed.protocol);
            } catch {
                return false;
            }
        };
        
        // 检查是否为内部链接
        const isInternalLink = (url) => {
            try {
                const parsed = new URL(url, window.location.href);
                return parsed.origin === window.location.origin;
            } catch {
                return false;
            }
        };
        
        // 安全跳转函数
        const safeNavigate = (url) => {
            if (state.isHandling) return;
            
            try {
                state.isHandling = true;
                state.lastPreventedTime = Date.now();
                
                // 优先使用 replace 避免历史记录污染
                window.location.replace(url);
            } catch (e) {
                // 失败回退到 href 跳转
                window.location.href = url;
            } finally {
                setTimeout(() => {
                    state.isHandling = false;
                }, 100);
            }
        };
        
        // 主拦截处理器
        const handleClick = (e) => {
            // 1. 三星设备需要更严格的事件捕获
            if (isSamsungDevice() && Date.now() - state.lastPreventedTime < state.preventThreshold) {
                return;
            }
            
            // 2. 获取最接近的链接元素
            let targetElement = e.target;
            while (targetElement && targetElement !== document) {
                if (targetElement.tagName === 'A' && targetElement.href) {
                    break;
                }
                targetElement = targetElement.parentElement;
            }
            
            if (!targetElement || targetElement.tagName !== 'A') return;
            
            const link = targetElement;
            const isModifiedEvent = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
            const isLeftClick = e.button === 0;
            const isTouchEvent = e.type === 'touchstart' || e.type === 'touchend';
            const hasBaseTargetBlank = !!document.head.querySelector('base[target="_blank"]');
            
            // 3. 严格条件判断 - 三星设备需要额外条件
            const shouldHandle = (
                isValidUrl(link.href) &&
                isLeftClick &&
                !isModifiedEvent &&
                (
                    link.target === '_blank' ||
                    hasBaseTargetBlank ||
                    link.getAttribute('data-force-internal') === 'true' ||
                    // 三星设备特殊处理：部分WebView会忽略target属性
                    (isSamsungDevice() && link.target !== '_self')
                )
            );
            
            if (shouldHandle) {
                e.preventDefault();
                e.stopPropagation();
                
                // 4. 三星设备需要额外延迟确保preventDefault生效
                const delay = isSamsungDevice() ? 30 : 10;
                
                setTimeout(() => {
                    safeNavigate(link.href);
                }, delay);
                
                console.log('[LinkInterceptor] 拦截成功:', {
                    url: link.href,
                    target: link.target,
                    baseTarget: hasBaseTargetBlank ? '_blank' : 'none',
                    device: isSamsungDevice() ? 'Samsung' : 'Other',
                    timestamp: new Date().toISOString()
                });
            }
        };
        
        // 5. window.open 拦截器
        const hookWindowOpen = () => {
            const originalOpen = window.open;
            
            window.open = function(url, target, features) {
                // 只处理有效URL
                if (url && isValidUrl(url)) {
                    console.log('[LinkInterceptor] window.open 拦截:', {url, target, features});
                    
                    // 三星设备特殊处理
                    if (isSamsungDevice()) {
                        setTimeout(() => safeNavigate(url), 30);
                    } else {
                        safeNavigate(url);
                    }
                    
                    return null; // 阻止原始行为
                }
                
                // 非HTTP(S)链接，调用原始方法
                return originalOpen.apply(window, arguments);
            };
        };
        
        // 6. 初始化拦截器
        const init = () => {
            // 双重事件监听（捕获+冒泡）
            ['click', 'touchstart'].forEach(eventType => {
                document.addEventListener(eventType, handleClick, { 
                    capture: true,
                    passive: false 
                });
                
                document.addEventListener(eventType, handleClick, { 
                    capture: false,
                    passive: false 
                });
            });
            
            hookWindowOpen();
            
            // 7. 额外保护：监控动态添加的链接
            if (MutationObserver) {
                const observer = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // ELEMENT_NODE
                                // 检查新添加的元素中是否包含链接
                                const links = node.querySelectorAll('a[href]');
                                links.forEach(link => {
                                    // 确保链接有正确的target属性
                                    if (link.target === '_blank' && isAndroid()) {
                                        link.setAttribute('data-force-internal', 'true');
                                    }
                                });
                            }
                        });
                    });
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
            
            console.log('%c[LinkInterceptor] 已激活 - 设备兼容模式: ' + 
                      (isSamsungDevice() ? '三星优化' : '标准'), 
                      'color: #4caf50; font-weight: bold;');
        };
        
        return {
            init: init,
            debug: () => console.log('Interceptor state:', state)
        };
    })();
    
    // 8. 确保在DOMContentLoaded前初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', linkInterceptor.init, { once: true });
    } else {
        linkInterceptor.init();
    }
    
    // 9. 全局暴露调试接口（生产环境可移除）
    window.LinkInterceptor = {
        debug: () => linkInterceptor.debug(),
        forceInit: () => {
            console.warn('[LinkInterceptor] 手动强制初始化');
            linkInterceptor.init();
        }
    };
})();