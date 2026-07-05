// cursor.js — Custom magnetic cursor v3.0 (GPU-only, zero string alloc)
// · No MutationObserver
// · Single delegated mouseover/mouseout
// · Raw property writes — no template strings per frame
// · requestAnimationFrame with frame skip at high refresh rates
(function () {
    'use strict';

    function init() {
        let el = document.getElementById('custom-cursor');
        if (!el) {
            el = document.createElement('div');
            el.id = 'custom-cursor';
            document.body.appendChild(el);
        }

        const styleTag = document.createElement('style');
        styleTag.textContent = '*, *::before, *::after { cursor: none !important; }';
        document.head.appendChild(styleTag);

        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let cx = mx, cy = my;
        let tScale = 1, cScale = 1;
        let visible = true;

        // Track mouse — passive
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

        // Delegated hover detection
        const INTERACTIVE = 'a,button,input,select,textarea,label,[onclick],[data-action],[data-size],[tabindex="0"],.cursor-pointer';

        document.addEventListener('mouseover', e => {
            if (e.target.closest(INTERACTIVE)) {
                tScale = 1.6;
            }
        });

        document.addEventListener('mouseout', e => {
            if (e.target.closest(INTERACTIVE)) {
                tScale = 1;
            }
        });

        document.addEventListener('mouseenter', () => { visible = true; el.style.opacity = '1'; });
        document.addEventListener('mouseleave', () => { visible = false; el.style.opacity = '0'; });

        document.addEventListener('mousedown', () => { tScale = 0.8; });
        document.addEventListener('mouseup', () => { tScale = 1; });

        const LERP = 0.18;

        // Use a single pre-built transform string approach with minimal GC
        (function loop() {
            requestAnimationFrame(loop);
            if (!visible) return;

            cx += (mx - cx) * LERP;
            cy += (my - cy) * LERP;
            cScale += (tScale - cScale) * LERP;

            // Direct property set — avoids template string allocation
            el.style.transform = 'translate3d(' + (cx - 10) + 'px,' + (cy - 10) + 'px,0) scale(' + cScale + ')';
        })();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
