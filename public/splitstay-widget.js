/**
 * SplitStay Embeddable Widget
 * Version: 1.0.0
 *
 * Usage:
 * <script src="https://splitstay.travel/splitstay-widget.js" async></script>
 * <div class="splitstay-widget" data-type="share-button"></div>
 */

(() => {
  // Configuration
  const SPLITSTAY_BASE_URL = 'https://splitstay.travel';
  const WIDGET_VERSION = '1.0.0';

  // Widget styles
  const CSS_STYLES = `
    .splitstay-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: inline-block;
    }
    
    .splitstay-share-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }
    
    .splitstay-share-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
      text-decoration: none;
      color: white;
    }
    
    .splitstay-share-button:active {
      transform: translateY(0);
    }
    
    .splitstay-icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
    
    .splitstay-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      max-width: 320px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    
    .splitstay-card h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
    }
    
    .splitstay-card p {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
    
    .splitstay-logo {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
    
    .splitstay-compact {
      display: inline-flex;
      align-items: center;
      background: #f3f4f6;
      color: #374151;
      padding: 8px 12px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }
    
    .splitstay-compact:hover {
      background: #e5e7eb;
      text-decoration: none;
      color: #374151;
    }
  `;

  // SVG Icons
  const SPLITSTAY_ICON = `
    <svg class="splitstay-icon" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" stroke-width="2"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" stroke-width="2"/>
    </svg>
  `;

  const PLANE_ICON = `
    <svg class="splitstay-icon" viewBox="0 0 24 24" fill="none">
      <path d="M21 16V8A2 2 0 0 0 19 6H5A2 2 0 0 0 3 8V16A2 2 0 0 0 5 18H19A2 2 0 0 0 21 16Z" stroke="currentColor" stroke-width="2"/>
      <path d="M6 12H18" stroke="currentColor" stroke-width="2"/>
    </svg>
  `;

  // Widget Templates
  const WIDGET_TEMPLATES = {
    'share-button': (config) => `
      <a href="${SPLITSTAY_BASE_URL}/post-trip?utm_source=widget&utm_medium=embed&utm_campaign=${config.campaign || 'partner'}" 
         target="_blank" 
         rel="noopener noreferrer"
         class="splitstay-share-button">
        ${SPLITSTAY_ICON}
        ${config.text || 'Share with SplitStay'}
      </a>
    `,

    'find-partner': (config) => `
      <a href="${SPLITSTAY_BASE_URL}/find-partners?utm_source=widget&utm_medium=embed&utm_campaign=${config.campaign || 'partner'}" 
         target="_blank" 
         rel="noopener noreferrer"
         class="splitstay-share-button">
        ${PLANE_ICON}
        ${config.text || 'Find Travel Partner'}
      </a>
    `,

    card: (config) => `
      <div class="splitstay-card">
        <h3>${config.title || 'Split Your Travel Costs'}</h3>
        <p>${config.description || 'Connect with verified travelers and save up to 50% on accommodation costs.'}</p>
        <a href="${SPLITSTAY_BASE_URL}?utm_source=widget&utm_medium=embed&utm_campaign=${config.campaign || 'partner'}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="splitstay-share-button">
          ${SPLITSTAY_ICON}
          ${config.buttonText || 'Get Started'}
        </a>
      </div>
    `,

    compact: (config) => `
      <a href="${SPLITSTAY_BASE_URL}?utm_source=widget&utm_medium=embed&utm_campaign=${config.campaign || 'partner'}" 
         target="_blank" 
         rel="noopener noreferrer"
         class="splitstay-compact">
        ${SPLITSTAY_ICON}
        ${config.text || 'SplitStay'}
      </a>
    `,
  };

  // Initialize widget
  function initializeWidget(element) {
    const type = element.getAttribute('data-type') || 'share-button';
    const config = {
      text: element.getAttribute('data-text'),
      title: element.getAttribute('data-title'),
      description: element.getAttribute('data-description'),
      buttonText: element.getAttribute('data-button-text'),
      campaign: element.getAttribute('data-campaign'),
      theme: element.getAttribute('data-theme') || 'default',
    };

    const template = WIDGET_TEMPLATES[type];
    if (template) {
      element.innerHTML = template(config);

      // Add tracking
      const links = element.querySelectorAll('a');
      links.forEach((link) => {
        link.addEventListener('click', () => {
          // Track widget click (you can integrate with your analytics)
          if (window.gtag) {
            window.gtag('event', 'widget_click', {
              widget_type: type,
              campaign: config.campaign || 'partner',
            });
          }
        });
      });
    }
  }

  // Inject CSS
  function injectStyles() {
    if (document.getElementById('splitstay-widget-styles')) return;

    const style = document.createElement('style');
    style.id = 'splitstay-widget-styles';
    style.textContent = CSS_STYLES;
    document.head.appendChild(style);
  }

  // Initialize all widgets
  function initializeAllWidgets() {
    injectStyles();

    const widgets = document.querySelectorAll(
      '.splitstay-widget:not([data-initialized])',
    );
    widgets.forEach((widget) => {
      initializeWidget(widget);
      widget.setAttribute('data-initialized', 'true');
    });
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllWidgets);
  } else {
    initializeAllWidgets();
  }

  // Watch for new widgets added dynamically
  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            if (
              node.classList?.contains('splitstay-widget') &&
              !node.getAttribute('data-initialized')
            ) {
              initializeWidget(node);
              node.setAttribute('data-initialized', 'true');
            }

            // Check child elements
            const childWidgets = node.querySelectorAll?.(
              '.splitstay-widget:not([data-initialized])',
            );
            if (childWidgets) {
              childWidgets.forEach((widget) => {
                initializeWidget(widget);
                widget.setAttribute('data-initialized', 'true');
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Global API
  window.SplitStayWidget = {
    version: WIDGET_VERSION,
    init: initializeAllWidgets,
    initElement: initializeWidget,
  };
})();
