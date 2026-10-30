import { useEffect } from 'react';

/**
 * Hook profesional para registrar atajos de teclado globales o por módulo.
 * Soporta handlers directos (`'alt+n': () => ...`) u objetos de configuración
 * (`'escape': { allowInInput: true, handler: () => ... }`).
 */
export function useKeyboardShortcuts(shortcutsMap) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.defaultPrevented) return;

            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) ||
                activeEl.isContentEditable
            );

            for (const [combo, entry] of Object.entries(shortcutsMap)) {
                const handler = typeof entry === 'function' ? entry : entry?.handler;
                const allowInInput = typeof entry === 'object' && entry !== null ? Boolean(entry.allowInInput) : false;

                if (typeof handler !== 'function') continue;

                const parts = combo.toLowerCase().split('+').map(k => k.trim());
                const needsAlt = parts.includes('alt');
                const needsCtrl = parts.includes('ctrl') || parts.includes('cmd');
                const needsShift = parts.includes('shift');

                const mainKey = parts.find(k => !['alt', 'ctrl', 'cmd', 'shift', 'meta'].includes(k));
                if (!mainKey) continue;

                const eventKey = event.key.toLowerCase();

                // Caso especial para '?' que en muchos teclados requiere Shift
                if (mainKey === '?' && event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
                    if (isTyping && !allowInInput) continue;
                    event.preventDefault();
                    handler(event);
                    return;
                }

                const matchAlt = needsAlt === event.altKey;
                const matchCtrl = needsCtrl === (event.ctrlKey || event.metaKey);
                const matchShift = needsShift === event.shiftKey;

                let matchKey = false;
                if (mainKey === 'escape' && eventKey === 'escape') matchKey = true;
                else if (mainKey === 'enter' && eventKey === 'enter') matchKey = true;
                else if (mainKey === 'space' && (event.key === ' ' || eventKey === 'spacebar')) matchKey = true;
                else if (mainKey === 'arrowright' && eventKey === 'arrowright') matchKey = true;
                else if (mainKey === 'arrowleft' && eventKey === 'arrowleft') matchKey = true;
                else if (mainKey === 'arrowup' && eventKey === 'arrowup') matchKey = true;
                else if (mainKey === 'arrowdown' && eventKey === 'arrowdown') matchKey = true;
                else if (mainKey === eventKey) matchKey = true;

                if (!matchAlt || !matchCtrl || !matchShift || !matchKey) continue;

                // Si el usuario está escribiendo en un input, solo permitir si allowInInput=true, Escape o combinaciones con Ctrl/Alt
                if (isTyping && !allowInInput && !needsCtrl && !needsAlt && mainKey !== 'escape') {
                    continue;
                }

                event.preventDefault();
                handler(event);
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });
}

export default useKeyboardShortcuts;

