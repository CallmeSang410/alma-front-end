import React, { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled]):not([type="hidden"])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])'
].join(', ');

/**
 * Contenedor accesible con Focus Trap y bloqueo de scroll de fondo para modales,
 * diálogos y paneles flotantes (como el Chatbot o la Guía de Comandos).
 */
export default function FocusTrap({
    children,
    active = true,
    onClose,
    onEscape,
    className = ''
}) {
    const containerRef = useRef(null);
    const previousFocusRef = useRef(null);
    const closeHandlerRef = useRef(onClose || onEscape);

    useEffect(() => {
        closeHandlerRef.current = onClose || onEscape;
    }, [onClose, onEscape]);

    useEffect(() => {
        if (!active) return;

        previousFocusRef.current = document.activeElement;

        // Bloquear el scroll de la página de fondo mientras el modal/drawer esté activo
        const prevBodyOverflow = document.body.style.overflow;
        const prevHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        const focusInitial = () => {
            if (!containerRef.current) return;
            const autoFocusEl = containerRef.current.querySelector('[data-autofocus="true"]:not([disabled])');
            if (autoFocusEl) {
                autoFocusEl.focus({ preventScroll: true });
                return;
            }
            const focusables = Array.from(
                containerRef.current.querySelectorAll(FOCUSABLE_ELEMENTS)
            ).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
            if (focusables.length > 0) {
                focusables[0].focus({ preventScroll: true });
            }
        };

        const timer = setTimeout(focusInitial, 30);

        const handleKeyDown = (e) => {
            if (!containerRef.current) return;

            // Verificar que este FocusTrap sea el modal activo superior
            const allModals = Array.from(document.querySelectorAll('[data-modal-root="true"]')).filter(
                el => el.offsetWidth > 0 || el.offsetHeight > 0
            );
            const topModal = allModals[allModals.length - 1];
            if (topModal && topModal !== containerRef.current) return;

            if (e.key === 'Escape' && closeHandlerRef.current) {
                e.preventDefault();
                e.stopPropagation();
                closeHandlerRef.current();
                return;
            }

            // Si el foco se escapó fuera del modal, devolverlo adentro inmediatamente
            if (
                ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
                !containerRef.current.contains(document.activeElement)
            ) {
                const focusables = Array.from(
                    containerRef.current.querySelectorAll(FOCUSABLE_ELEMENTS)
                ).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
                if (focusables.length > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    focusables[0].focus({ preventScroll: true });
                    return;
                }
            }

            if (e.key === 'Tab') {
                const focusables = Array.from(
                    containerRef.current.querySelectorAll(FOCUSABLE_ELEMENTS)
                ).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);

                if (focusables.length === 0) {
                    e.preventDefault();
                    return;
                }

                const firstEl = focusables[0];
                const lastEl = focusables[focusables.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstEl || !containerRef.current.contains(document.activeElement)) {
                        e.preventDefault();
                        lastEl.focus({ preventScroll: true });
                    }
                } else {
                    if (document.activeElement === lastEl || !containerRef.current.contains(document.activeElement)) {
                        e.preventDefault();
                        firstEl.focus({ preventScroll: true });
                    }
                }
            }

            // Evitar que PageUp/PageDown/Space/Flechas hagan scroll en la ventana de fondo
            const activeTag = document.activeElement?.tagName;
            const isEditable = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || document.activeElement?.isContentEditable;
            if (!isEditable && ['PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) {
                if (e.key === ' ' && ['BUTTON', 'A'].includes(activeTag)) return;
                const scrollable = containerRef.current.querySelector('[data-modal-scroll="true"], .overflow-y-auto');
                if (scrollable) {
                    e.preventDefault();
                    const delta = e.key === 'PageUp' || e.key === 'Home' ? -250 : 250;
                    scrollable.scrollBy({ top: delta, behavior: 'smooth' });
                } else {
                    e.preventDefault();
                }
            }
        };

        // Bloquear rueda del ratón fuera del área scrollable interna del modal
        const handleWheel = (e) => {
            if (!containerRef.current) return;
            const scrollable = e.target.closest?.('[data-modal-scroll="true"], .overflow-y-auto');
            if (!scrollable || !containerRef.current.contains(scrollable)) {
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            clearTimeout(timer);
            document.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('wheel', handleWheel);

            // Solo restaurar el scroll si no queda otro modal activo
            const remainingModals = document.querySelectorAll('[data-modal-root="true"]');
            if (remainingModals.length <= 1) {
                document.body.style.overflow = prevBodyOverflow || '';
                document.documentElement.style.overflow = prevHtmlOverflow || '';
            }

            if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
                setTimeout(() => {
                    try {
                        previousFocusRef.current.focus({ preventScroll: true });
                    } catch {
                        // Elemento ya no existe en el DOM
                    }
                }, 10);
            }
        };
    }, [active]);

    return (
        <div
            ref={containerRef}
            data-modal-root={active ? 'true' : undefined}
            className={className}
        >
            {children}
        </div>
    );
}
