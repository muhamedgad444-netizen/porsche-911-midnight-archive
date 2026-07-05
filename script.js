/**
 * PORSCHE MIDNIGHT ARCHIVE — CORE ENGINE v5.5
 * ─────────────────────────────────────────────
 * · Dynamic product grid rendering (16 items)
 * · Delegated click handlers — O(1), no per-card listeners
 * · localStorage cart persistence
 * · IntersectionObserver scroll reveal (unobserves after trigger)
 * · GarageSystem singleton exposed on window for module scripts
 */

'use strict';

// ─── 1. PRODUCT DATABASE ──────────────────────────────────────────────────────
let ARCHIVE_MANIFEST = [
    { id: 1, name: "MAPF1 Oversized Tee", price: 85, type: "Hardware", img: "MAPF1RPMensLHOversizedfitTeeWhiteSC4_f4ea1258-1fba-46fa-9bb8-782c4eb87ed0.webp" },
    { id: 2, name: "BMW M-Power Bomber", price: 320, type: "Armor", img: "d9f55388b2984f7d910917942e4cde6f.webp" },
    { id: 3, name: "Porsche Heritage Crew", price: 165, type: "Shell", img: "OIP (6).webp" },
    { id: 4, name: "Porsche Crest Sweatshirt", price: 190, type: "Utility", img: "OIP (5).webp" },
    { id: 5, name: "RS Geometry Tech Tee", price: 110, type: "Armor", img: "OIP (4).webp" },
    { id: 6, name: "Mercedes Paddock Tee", price: 95, type: "Shell", img: "OIP (3).webp" },
    { id: 7, name: "BMW Motorsport Jacket", price: 210, type: "Utility", img: "OIP (2).webp" },
    { id: 8, name: "Stuttgart Base Layer", price: 75, type: "Base", img: "OIP (4).webp" },
    { id: 9, name: "GT3 Carbon Helmet", price: 850, type: "Armor", img: "OIP (2).webp" },
    { id: 10, name: "Midnight Nomex Gloves", price: 145, type: "Hardware", img: "OIP (3).webp" },
    { id: 11, name: "Stuttgart Track Pants", price: 130, type: "Shell", img: "OIP (4).webp" },
    { id: 12, name: "911 Silhouette Hoodie", price: 175, type: "Utility", img: "OIP (5).webp" },
    { id: 13, name: "RS Titanium Watch", price: 1200, type: "Hardware", img: "OIP (6).webp" },
    { id: 14, name: "Endurance Duffle Bag", price: 280, type: "Utility", img: "d9f55388b2984f7d910917942e4cde6f.webp" },
    { id: 15, name: "Paddock Umbrella", price: 65, type: "Hardware", img: "OIP (2).webp" },
    { id: 16, name: "Heritage Leather Jacket", price: 650, type: "Armor", img: "MAPF1RPMensLHOversizedfitTeeWhiteSC4_f4ea1258-1fba-46fa-9bb8-782c4eb87ed0.webp" },
];

// Inline SVG fallback — no network round-trip on broken images
const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect fill='%230a0a0a' width='400' height='500'/%3E%3C/svg%3E";

// ─── 2. SYSTEM STATE ──────────────────────────────────────────────────────────
const SystemState = {
    get cart() { try { return JSON.parse(localStorage.getItem('porsche_cart')) || []; } catch { return []; } },
    set cart(val) { try { localStorage.setItem('porsche_cart', JSON.stringify(val)); } catch { } },

    _cart: [],   
    selections: {},   
    isGarageOpen: false,
};

// Hydrate from localStorage once at parse time
SystemState._cart = SystemState.cart;

// ─── 3. RENDER ENGINE ─────────────────────────────────────────────────────────
const RenderEngine = {
    async init() {
        await this.fetchProducts();
        this.renderGrid();
        this.updateCartUI();
        requestAnimationFrame(() => this.bindScrollObserver());
    },

    async fetchProducts() {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    ARCHIVE_MANIFEST = data;
                }
            }
        } catch (e) {
            console.warn("Failed to fetch products from Supabase backend API, falling back to static manifest.", e);
        }
    },

    renderGrid() {
        const container = document.getElementById('product-container');
        if (!container) return;

        container.innerHTML = ARCHIVE_MANIFEST.map(item => `
            <div class="product-card" id="item-${item.id}" style="clip-path:polygon(12% 0,100% 0,100% 88%,88% 100%,0 100%,0 12%)">
                <div class="card-image-wrapper p-4">
                    <div class="card-image-inner" style="clip-path:polygon(12% 0,100% 0,100% 88%,88% 100%,0 100%,0 12%)">
                        <img src="${item.img}" alt="${item.name}" loading="lazy"
                             onerror="this.onerror=null;this.src='${PLACEHOLDER_SVG}'">
                    </div>
                </div>
                <div class="p-8">
                    <div class="flex justify-between items-start mb-8">
                        <div>
                            <span class="text-[7px] text-zinc-600 uppercase tracking-widest block mb-2">${item.type} // LOG_${String(item.id).padStart(2, '0')}</span>
                            <h4 class="text-[11px] font-black uppercase tracking-widest text-zinc-200">${item.name}</h4>
                        </div>
                        <span class="text-[10px] font-bold text-zinc-500 italic">$${item.price}</span>
                    </div>
                    <div class="grid grid-cols-4 gap-[1px] bg-[#1a1a1a] border border-[#1a1a1a] mb-8" id="size-group-${item.id}">
                        ${['S', 'M', 'L', 'XL'].map(s => `
                            <div class="bg-[#050505] p-4 text-center text-[9px] font-black text-[#444] hover:text-white hover:bg-[#0f0f0f] transition-colors"
                                 data-product="${item.id}" data-size="${s}">${s}</div>
                        `).join('')}
                    </div>
                    <button class="w-full bg-[#111] text-white p-5 text-[9px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all"
                            data-action="add" data-product="${item.id}" id="action-btn-${item.id}">
                        Add To Archive
                    </button>
                </div>
            </div>
        `).join('');

        // ── Single delegated listener for the entire grid ──
        container.addEventListener('click', e => {
            const sizeEl = e.target.closest('[data-size]');
            if (sizeEl) {
                LogicSystem.selectSize(parseInt(sizeEl.dataset.product), sizeEl.dataset.size, sizeEl);
                return;
            }
            const addEl = e.target.closest('[data-action="add"]');
            if (addEl) LogicSystem.addToBag(parseInt(addEl.dataset.product));
        });
    },

    bindScrollObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('revealed');
                    observer.unobserve(e.target);   
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px 120px 0px' });

        document.querySelectorAll('.product-card').forEach(c => observer.observe(c));
    },

    updateCartUI() {
        const badge = document.getElementById('bag-indicator');
        if (!badge) return;
        badge.textContent = `Bag (${SystemState._cart.length})`;
        badge.style.transform = 'scale(1.12)';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            badge.style.transform = 'scale(1)';
        }));
    },
};

// ─── 4. GARAGE SYSTEM ─────────────────────────────────────────────────────────
const GarageSystem = {
    toggle() {
        SystemState.isGarageOpen = !SystemState.isGarageOpen;
        const panel = document.getElementById('garage-drawer');
        const body = document.getElementById('body');
        if (panel) panel.style.transform = SystemState.isGarageOpen ? 'translateX(0)' : 'translateX(100%)';
        if (body) body.classList.toggle('garage-active', SystemState.isGarageOpen);

        if (panel) panel.setAttribute('aria-hidden', SystemState.isGarageOpen ? 'false' : 'true');
    },
};
window.GarageSystem = GarageSystem;

// ─── 5. BUSINESS LOGIC ────────────────────────────────────────────────────────
const LogicSystem = {
    selectSize(productId, size, element) {
        const group = document.getElementById(`size-group-${productId}`);
        if (!group) return;

        group.querySelectorAll('[data-size]').forEach(opt => {
            opt.style.background = '#050505';
            opt.style.color = '#444';
        });

        element.style.background = '#fff';
        element.style.color = '#000';
        SystemState.selections[productId] = size;

        document.getElementById(`item-${productId}`)?.classList.remove('shake');
    },

    addToBag(productId) {
        const size = SystemState.selections[productId];
        const btn = document.getElementById(`action-btn-${productId}`);
        const card = document.getElementById(`item-${productId}`);
        if (!btn || !card) return;

        if (!size) {
            card.classList.add('shake');
            const prev = btn.textContent;
            btn.textContent = 'CHOOSE SIZE';
            btn.style.color = '#ff0000';
            setTimeout(() => {
                card.classList.remove('shake');
                btn.textContent = prev;
                btn.style.color = '';
            }, 1000);
            return;
        }

        const item = ARCHIVE_MANIFEST.find(p => p.id === productId);
        if (!item) return;

        const cartItem = { ...item, selectedSize: size, cartId: `MANIFEST-${Date.now()}` };
        SystemState._cart.push(cartItem);
        SystemState.cart = SystemState._cart;     

        RenderEngine.updateCartUI();

        btn.textContent = 'MANIFESTED ✓';
        btn.style.background = '#fff';
        btn.style.color = '#000';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = 'Add To Archive';
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
        }, 2000);
    },
};
window.LogicSystem = LogicSystem;

// ─── 6. BOOT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => RenderEngine.init(), { once: true });