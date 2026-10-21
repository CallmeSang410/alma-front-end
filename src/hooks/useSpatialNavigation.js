import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled]):not([type="hidden"])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[data-spatial-item="true"]:not([disabled])'
].join(', ');

/**
 * Implementa navegación espacial 2D con teclas direccionales (↑, ↓, ←, →)
 * basada en la geometría visual en vivo (getBoundingClientRect), respetando:
 * - Modales y drawers activos ([data-modal-root="true"])
 * - Selectores desplegables abiertos ([data-dropdown-open="true"])
 * - Regiones lógicas (Sidebar vs Contenido Principal)
 * - Scroll suave natural cuando no hay candidatos cercanos en la dirección pulsada
 */
export function useSpatialNavigation(containerRef, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
            if (e.defaultPrevented) return;
            if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

            const target = e.composedPath ? e.composedPath()[0] : e.target;
            if (!target || !(target instanceof HTMLElement)) return;

            // Si el elemento actual tiene un dropdown personalizado abierto, dejar que el dropdown controle ↑/↓
            if (target.closest('[data-dropdown-open="true"]')) {
                return;
            }

            // Controles nativos que consumen flechas por sí mismos
            if (target.matches('select, input[type="range"], [role="slider"]')) {
                return;
            }

            // En inputs editables o textareas, permitir movimiento interno del cursor
            // pero habilitar salida con flechas cuando el cursor está en el borde o es arriba/abajo en input de 1 línea
            if (target.matches(':read-write')) {
                const tag = target.tagName;
                if (tag === 'TEXTAREA') {
                    const start = target.selectionStart ?? 0;
                    const end = target.selectionEnd ?? 0;
                    const len = (target.value || '').length;
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') return;
                    if (e.key === 'ArrowUp' && start > 0) return;
                    if (e.key === 'ArrowDown' && end < len) return;
                } else if (tag === 'INPUT') {
                    const type = (target.getAttribute('type') || 'text').toLowerCase();
                    const supportsSelection = ['text', 'search', 'tel', 'url', 'password'].includes(type);
                    const val = target.value || '';

                    if (e.key === 'ArrowLeft') {
                        if (supportsSelection && (target.selectionStart ?? 0) > 0) return;
                        if (!supportsSelection && val.length > 0) return;
                    }
                    if (e.key === 'ArrowRight') {
                        if (supportsSelection && (target.selectionEnd ?? 0) < val.length) return;
                        if (!supportsSelection && val.length > 0) return;
                    }
                } else {
                    return;
                }
            }

            // 1. Determinar si hay un modal o drawer activo ([data-modal-root="true"])
            const modalRoots = Array.from(document.querySelectorAll('[data-modal-root="true"]')).filter(el => {
                if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('inert')) return false;
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < window.innerWidth;
            });

            const isModalActive = modalRoots.length > 0;
            const activeScope = isModalActive
                ? modalRoots[modalRoots.length - 1]
                : (containerRef?.current || document.body);

            // 2. Recolectar candidatos visibles y dentro del viewport horizontal
            const isInsideMain = !isModalActive && Boolean(target.closest('[data-main-content="true"]'));
            const isVerticalKey = e.key === 'ArrowUp' || e.key === 'ArrowDown';

            const allCandidates = Array.from(activeScope.querySelectorAll(FOCUSABLE_SELECTOR)).filter(el => {
                if (el.disabled) return false;
                if (el.closest('[aria-hidden="true"], [inert], .invisible, .pointer-events-none')) return false;
                if (el.checkVisibility && !el.checkVisibility()) return false;

                // Cuando el usuario navega con ↑/↓ dentro del contenido principal, no saltar al botón flotante del chat ni al sidebar lateral
                if (isInsideMain && isVerticalKey) {
                    if (el.closest('aside') || el.hasAttribute('data-floating-fab')) return false;
                }

                const rect = el.getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) return false;
                // Excluir elementos fuera del viewport horizontal (como drawers cerrados con translate-x-full)
                if (rect.right <= 0 || rect.left >= window.innerWidth) return false;
                return true;
            });

            if (allCandidates.length === 0) {
                if (isModalActive && isVerticalKey) {
                    e.preventDefault();
                    const scrollable = activeScope.querySelector('[data-modal-scroll="true"], .overflow-y-auto');
                    if (scrollable) {
                        scrollable.scrollBy({ top: e.key === 'ArrowDown' ? 90 : -90, behavior: 'smooth' });
                    }
                }
                return;
            }

            // Si el foco no está aún en ningún candidato del scope activo, enfocar el primero visible en pantalla
            if (!allCandidates.includes(target)) {
                e.preventDefault();
                const visibleInMain = allCandidates.find(el => {
                    const r = el.getBoundingClientRect();
                    return el.closest('[data-main-content="true"]') && r.top >= 0 && r.bottom <= window.innerHeight;
                });
                const visibleAny = allCandidates.find(el => {
                    const r = el.getBoundingClientRect();
                    return r.top >= 0 && r.bottom <= window.innerHeight;
                });
                const first = visibleInMain || visibleAny || allCandidates[0];
                first.focus({ preventScroll: true });
                first.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                return;
            }

            const currRect = target.getBoundingClientRect();
            const currCenterX = currRect.left + currRect.width / 2;
            const currCenterY = currRect.top + currRect.height / 2;
            const tolerance = 5;

            const isHorizontal = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
            const directionalCandidates = [];

            for (const cand of allCandidates) {
                if (cand === target) continue;
                // Evitar saltar entre padre e hijo anidados directamente en vertical si el hijo está dentro del padre
                if (target.contains(cand) || cand.contains(target)) continue;

                const candRect = cand.getBoundingClientRect();

                let inDirection = false;
                let gap = 0;

                if (e.key === 'ArrowRight') {
                    inDirection = candRect.left >= currRect.right - tolerance;
                    gap = Math.max(0, candRect.left - currRect.right);
                } else if (e.key === 'ArrowLeft') {
                    inDirection = candRect.right <= currRect.left + tolerance;
                    gap = Math.max(0, currRect.left - candRect.right);
                } else if (e.key === 'ArrowDown') {
                    inDirection = candRect.top >= currRect.bottom - tolerance;
                    gap = Math.max(0, candRect.top - currRect.bottom);
                } else if (e.key === 'ArrowUp') {
                    inDirection = candRect.bottom <= currRect.top + tolerance;
                    gap = Math.max(0, currRect.top - candRect.bottom);
                }

                if (!inDirection) continue;

                // Evitar saltos bruscos hacia elementos que están muy lejos fuera de la vista actual
                if (isVerticalKey && gap > 320) continue;

                const candCenterX = candRect.left + candRect.width / 2;
                const candCenterY = candRect.top + candRect.height / 2;

                const overlapsPerpendicular = isHorizontal
                    ? Math.min(currRect.bottom, candRect.bottom) > Math.max(currRect.top, candRect.top)
                    : Math.min(currRect.right, candRect.right) > Math.max(currRect.left, candRect.left);

                const perpendicularCentreOffset = isHorizontal
                    ? Math.abs(candCenterY - currCenterY)
                    : Math.abs(candCenterX - currCenterX);

                const sameMainRegion = Boolean(target.closest('[data-main-content="true"]')) === Boolean(cand.closest('[data-main-content="true"]'));

                directionalCandidates.push({
                    el: cand,
                    gap,
                    overlapsPerpendicular,
                    perpendicularCentreOffset,
                    sameMainRegion
                });
            }

            // Si no hay candidato en esa dirección:
            if (directionalCandidates.length === 0) {
                if (isModalActive && isVerticalKey) {
                    // Dentro de un modal (ej. Guía de Comandos), desplazar el contenido interno del modal sin mover el fondo
                    e.preventDefault();
                    const scrollable = activeScope.querySelector('[data-modal-scroll="true"], .overflow-y-auto');
                    if (scrollable) {
                        scrollable.scrollBy({ top: e.key === 'ArrowDown' ? 90 : -90, behavior: 'smooth' });
                    }
                }
                // Fuera de modales, no llamamos preventDefault() para permitir el scroll nativo suave del navegador
                return;
            }

            const aligned = directionalCandidates.filter(c => c.overlapsPerpendicular);
            let winner = null;

            if (aligned.length > 0) {
                aligned.sort((a, b) => {
                    if (a.sameMainRegion !== b.sameMainRegion) return a.sameMainRegion ? -1 : 1;
                    if (Math.abs(a.gap - b.gap) > 4) return a.gap - b.gap;
                    return a.perpendicularCentreOffset - b.perpendicularCentreOffset;
                });
                winner = aligned[0].el;
            } else {
                const weight = 2.2;
                directionalCandidates.sort((a, b) => {
                    if (a.sameMainRegion !== b.sameMainRegion && isVerticalKey) return a.sameMainRegion ? -1 : 1;
                    const scoreA = a.gap + weight * a.perpendicularCentreOffset;
                    const scoreB = b.gap + weight * b.perpendicularCentreOffset;
                    return scoreA - scoreB;
                });
                winner = directionalCandidates[0].el;
            }

            if (winner) {
                e.preventDefault();
                const rovingGroup = winner.closest('[data-roving-group="true"]');
                if (rovingGroup && target.closest('[data-roving-group="true"]') === rovingGroup) {
                    target.setAttribute('tabindex', '-1');
                    winner.setAttribute('tabindex', '0');
                }
                winner.focus({ preventScroll: true });
                winner.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [containerRef, enabled]);
}

export default useSpatialNavigation;
