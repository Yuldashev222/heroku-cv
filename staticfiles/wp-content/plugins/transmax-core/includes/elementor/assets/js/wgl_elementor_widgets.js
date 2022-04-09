(function ($) {
    "use strict";

    jQuery(window).on('elementor/frontend/init', function () {
        if (window.elementorFrontend.isEditMode()) {
            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-blog.default',
                function ($scope) {
                    wglParallaxVideo();
                    wglBlogMasonryInit();
                    wglCarouselSwiper();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-carousel.default',
                function ($scope) {
                    wglCarouselSwiper();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-portfolio.default',
                function ($scope) {
                    wglIsotope();
                    wglCarouselSwiper();
                    wglScrollAnimation();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-gallery.default',
                function ($scope) {
                    wglImagesGallery();
                    wglCarouselSwiper();
                    wglScrollAnimation();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-pie-chart.default',
                function ($scope) {
                    wglPieChartInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-progress-bar.default',
                function ($scope) {
                    wglProgressBarsInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-testimonials.default',
                function ($scope) {
                    wglCarouselSwiper();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-instagram.default',
                function ($scope) {
                    wglCarouselSwiper();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-toggle-accordion.default',
                function ($scope) {
                    wglAccordionInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-accordion-service.default',
                function ($scope) {
                    wglServicesAccordionInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-team.default',
                function ($scope) {
                    wglIsotope();
                    wglCarouselSwiper();
                    wglScrollAnimation();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-tabs.default',
                function ($scope) {
                    wglTabsInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-clients.default',
                function ($scope) {
                    wglCarouselSwiper();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-image-layers.default',
                function ($scope) {
                    wglImgLayers();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-video-popup.default',
                function ($scope) {
                    wglVideoboxInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-countdown.default',
                function ($scope) {
                    wglCountdownInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-time-line-vertical.default',
                function ($scope) {
                    wglInitTimelineAppear();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-striped-services.default',
                function ($scope) {
                    wglStripedServicesInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-image-comparison.default',
                function ($scope) {
                    wglImageComparison();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-circuit-service.default',
                function ($scope) {
                    wglCircuitService();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-counter.default',
                function ($scope) {
                    wglCounterInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-menu.default',
                function ($scope) {
                    wglMenuLavalamp();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-header-search.default',
                function ($scope) {
                    wglSearchInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-header-side_panel.default',
                function ($scope) {
                    wglSidePanelInit();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-products-grid.default',
                function ($scope) {
                    wglIsotope();
                    wglCarouselSwiper();
                }
            );

            window.elementorFrontend.hooks.addAction(
                'frontend/element_ready/wgl-header-login.default',
                function($scope) {
                    wglWoocommerceLoginIn();
                }
            );
        }
    });

})(jQuery);
