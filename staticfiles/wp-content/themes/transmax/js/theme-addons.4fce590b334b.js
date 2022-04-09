"use strict";
// Toggle/Accordion
function wglAccordionInit() {
    var item = jQuery('.wgl-accordion');

    item.each( function() {
        var header = jQuery(this).find('.wgl-accordion_header');
        var content = jQuery(this).find('.wgl-accordion_content');
        var acc_type = jQuery(this).data('type');
        var speed = 400;
        header.off("click");

        header.each( function() {
            if (jQuery(this).data('default') == 'yes') {
                jQuery(this).addClass('active');
                jQuery(this).next().slideDown(speed);
            }
        })

        header.on('click', function(e) {
            e.preventDefault();
            var $this = jQuery(this);

            if ( acc_type == 'accordion' ) {
                $this.toggleClass('active');
                $this.next().slideToggle(speed);
            } else if ( acc_type == 'toggle' ) {
                $this.toggleClass('active');
                $this.next().slideToggle(speed);
                content.not($this.next()).slideUp(speed);
                header.not($this).removeClass('active');
            }
        })
    })
}

// Accordion Services
function wglServicesAccordionInit() {
    var widgetList = jQuery('.wgl-accordion-services');

    widgetList.each(function () {
        var itemClass = '.service__item';

        jQuery(this).find(itemClass + ':first-child').addClass('active');

        var item = jQuery(this).find(itemClass);
        item.on('mouseover', function () {
            jQuery(this).addClass('active').siblings().removeClass('active');
        });
    });
}

(function($) {
    jQuery(document).ready(function() {
        wglAjaxLoad();
    });

    function wglAjaxLoad() {
        var i, section;
        var sections = document.getElementsByClassName('wgl_cpt_section');
        for (i = 0; i < sections.length; i++) {
            section = sections[i];
            var infinity_item = section.getElementsByClassName('infinity_item');
            var load_more = section.getElementsByClassName('load_more_item');
            if (infinity_item.length || load_more.length) {
                wglAjaxInit(section);
            }
        }
    }

    var wait_load = false;
    var offset_items = 0;
    var infinity_item;
    var js_offset;

    function wglAjaxQuery(grid, section, request_data) {
        if (wait_load) return;
        wait_load = true;
        request_data['offset_items'] = request_data.js_offset
            ? request_data.js_offset
            : offset_items;

        request_data['remainings_loading_btn_items_amount'] = request_data.remainings_loading_btn_items_amount;

        request_data['js_offset'] = request_data.js_offset
            ? request_data.js_offset
            : offset_items;

        // For the mode_security enabled, removed sql request
        if (request_data.query && request_data.query.request) {
            delete request_data.query.request;
        }

        $.post(
            wgl_core.ajaxurl,
            {
                action: 'wgl_ajax',
                data: request_data
            },
            function(response, status) {
                var resp, new_items, load_more_hidden, count_products;
                resp = document.createElement('div');
                resp.innerHTML = response;
                new_items = $('.item', resp);
                count_products = $('.woocommerce-result-count', resp);

                load_more_hidden = $('.hidden_load_more', resp);

                if (load_more_hidden.length) {
                    jQuery(section)
                        .find('.load_more_wrapper')
                        .fadeOut(300, function() {
                            $(this).remove();
                        });
                } else {
                    jQuery(section)
                        .find('.load_more_wrapper .load_more_item')
                        .removeClass('loading').blur();
                }

                jQuery(section)
                    .find('.woocommerce-result-count')
                    .html(jQuery(count_products).html());

                if ($(grid).hasClass('carousel')) {
                    $(grid)
                        .find('.swiper-wrapper')
                        .append(new_items);
                    $(grid)
                        .find('.swiper-pagination')
                        .remove();
                    $(grid)
                        .find('.wgl-carousel_swiper')
                        .update();
                } else if ($(grid).hasClass('grid')) {
                    new_items = new_items.hide();
                    $(grid).append(new_items);
                    new_items.fadeIn('slow');
                } else {
                    var items = jQuery(new_items);
                    jQuery(grid)
                        .imagesLoaded()
                        .always(function() {
                            jQuery(grid)
                                .append(items)
                                .isotope('appended', items)
                                .isotope('reloadItems');

                            setTimeout(function() {
                                wglScrollAnimation();
                                jQuery(grid).isotope('layout');
                                updateFilter(grid);
                                updateCarousel(grid);
                            }, 500);
                        });
                }

                // Call video background settings
                if (typeof jarallax === 'function') {
                    wglParallaxVideo();
                } else {
                    jQuery(grid)
                        .find('.parallax-video')
                        .each(function() {
                            jQuery(this).jarallax({
                                loop: true,
                                speed: 1,
                                videoSrc: jQuery(this).data('video'),
                                videoStartTime: jQuery(this).data('start'),
                                videoEndTime: jQuery(this).data('end')
                            });
                        });
                }

                // Call swiper settings
                updateCarousel(grid);

                wglScrollAnimation();
                // Update Items

                var offset_data = $('.js_offset_items', resp);
                request_data.js_offset = parseInt(offset_data.data('offset'));

                wait_load = false;
            }
        );
    }

    function updateCarousel(grid) {
        if ( jQuery(grid).find('.wgl-carousel_swiper').size() > 0 ) {
            jQuery(grid)
                .find('.wgl-carousel_swiper')
                .each(function() {
                    swiperCarousel(jQuery(this));
                    if (jQuery(grid).hasClass('blog_masonry')) {
                        jQuery(grid).isotope('layout');
                    }
                });
        }
    }

    function wglAjaxInit(section) {
        offset_items = 0;
        var grid, form, data_field, data, request_data, load_more;

        if (section == undefined) {
            return;
        }

        // Get grid CPT
        grid = section.getElementsByClassName('container-grid');
        if (!grid.length) { return; }
        grid = grid[0];

        // Get form CPT
        form = section.getElementsByClassName('posts_grid_ajax');
        if (!form.length) { return; }
        form = form[0];

        // Get field form ajax
        data_field = form.getElementsByClassName('ajax_data');
        if (!data_field.length) { return; }
        data_field = data_field[0];

        data = data_field.value;
        data = JSON.parse(data);
        request_data = data;

        // Add pagination
        offset_items += request_data.post_count;

        infinity_item = section.getElementsByClassName('infinity_item');

        if (infinity_item.length) {
            infinity_item = infinity_item[0];
            if (jQuery(infinity_item).wglIsVisible()) {
                wglAjaxQuery(grid, section, request_data);
            }
            var lastScrollTop = 0;

            jQuery(window).on('resize scroll', function() {
                if (jQuery(infinity_item).wglIsVisible()) {
                    var st = jQuery(this).scrollTop();
                    if (st > lastScrollTop) {
                        wglAjaxQuery(grid, section, request_data);
                    }
                    lastScrollTop = st;
                }
            });
        }

        load_more = section.getElementsByClassName('load_more_item');
        if (load_more.length) {
            load_more = load_more[0];
            load_more.addEventListener(
                'click',
                function(e) {
                    e.preventDefault();
                    jQuery(this).addClass('loading');
                    wglAjaxQuery(grid, section, request_data);
                },
                false
            );
        }
    }

    function swiperCarousel(grid) {
        var wglSwiper = {},
            config = {
                effect: "fade",
                speed: 900,
            };

        if ('undefined' === typeof Swiper) {
            const asyncSwiper = window.elementorFrontend.utils.swiper;
            new asyncSwiper(grid, config).then((newSwiperInstance) => {
                var wglSwiper = newSwiperInstance;
            });
        } else {
            var wglSwiper = new Swiper(grid, config);
        }

        wglSwiper.update();

    }

    function updateFilter(grid) {
        jQuery(grid).isotope({ sortBy : 'original-order' });
        jQuery('.isotope-filter a').each(function() {
            var $this = jQuery(this);
            var data_filter = this.getAttribute('data-filter');
            var num;

            if ($this.parent().parent().parent().hasClass('product__filter')) {
                num = $this
                    .closest('.wgl-products-grid')
                    .find('.product')
                    .filter(data_filter).length;
                $this
                    .find('.filter_counter')
                    .text('(' + num + ')');
            } else {
                num = $this
                    .closest('.wgl-portfolio')
                    .find('.portfolio__item')
                    .filter(data_filter).length;
                $this
                    .find('.filter_counter')
                    .text('(' + num + ')');
            }

            if (
                num !== 0
                && $this.hasClass('empty')
            ) {
                $this.removeClass('empty').addClass('swiper-slide');
            }
        });
    }
})(jQuery);

function wglScrollAnimation(){
  var portfolio = jQuery('.wgl-portfolio_container');
  var shop = jQuery('.wgl-products.appear-animation');
  var gallery = jQuery('.wgl-gallery_items.appear-animation');

  //Scroll Animation
  (function($) {

      var docElem = window.document.documentElement;

      function getViewportH() {
        var client = docElem['clientHeight'],
          inner = window['innerHeight'];

        if( client < inner )
          return inner;
        else
          return client;
      }

      function scrollY() {
        return window.pageYOffset || docElem.scrollTop;
      }

      // http://stackoverflow.com/a/5598797/989439
      function getOffset( el ) {
        var offsetTop = 0, offsetLeft = 0;
        do {
          if ( !isNaN( el.offsetTop ) ) {
            offsetTop += el.offsetTop;
          }
          if ( !isNaN( el.offsetLeft ) ) {
            offsetLeft += el.offsetLeft;
          }
        } while( el = el.offsetParent )

        return {
          top : offsetTop,
          left : offsetLeft
        }
      }

      function inViewport( el, h ) {
        var elH = el.offsetHeight,
          scrolled = scrollY(),
          viewed = scrolled + getViewportH(),
          elTop = getOffset(el).top,
          elBottom = elTop + elH,
          h = h || 0;

        return (elTop + elH * h) <= viewed && (elBottom - elH * h) >= scrolled;
      }

      function extend( a, b ) {
        for( var key in b ) {
          if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
          }
        }
        return a;
      }

      function AnimOnScroll( el, options ) {
        this.el = el;
        this.options = extend( this.defaults, options );
        if(this.el.length){
          this._init();
        }
      }

      AnimOnScroll.prototype = {
        defaults : {
          viewportFactor : 0
        },
        _init : function() {
          this.items = Array.prototype.slice.call( jQuery(this.el ).children() );
          this.itemsCount = this.items.length;
          this.itemsRenderedCount = 0;
          this.didScroll = false;
          this.delay = 100;


          var self = this;

          if(typeof imagesLoaded === 'function'){
            imagesLoaded( this.el, this._imgLoaded(self));
          }else{
            this._imgLoaded(self);
          }

        },
        _imgLoaded : function(self) {

          var interval;

              // the items already shown...
              self.items.forEach( function( el, i ) {
                if( inViewport( el ) ) {

                  self._checkTotalRendered();
                  if(!jQuery(el).hasClass('show') && !jQuery(el).hasClass('animate') && inViewport( el, self.options.viewportFactor )){
                    self._itemClass(jQuery(el), self.delay, interval );
                    self.delay += 200;
                    setTimeout( function() {
                      self.delay = 100;
                    }, 200 );
                  }
                }
              } );

              // animate on scroll the items inside the viewport
              window.addEventListener( 'scroll', function() {
                self._onScrollFn();
              }, false );
              window.addEventListener( 'resize', function() {
                self._resizeHandler();
              }, false );
        },

        _onScrollFn : function() {
          var self = this;
          if( !this.didScroll ) {
            this.didScroll = true;
            setTimeout( function() { self._scrollPage(); }, 60 );
          }
        },
        _itemClass : function(item_array, delay, interval) {

          interval = setTimeout(function(){
            if ( item_array.length) {
              jQuery(item_array).addClass( 'animate' );
            } else {
              clearTimeout( interval );
            }
          }, delay);

        },

        _scrollPage : function() {
          var self = this;
          var interval;

          this.items.forEach( function( el, i ) {
            if( !jQuery(el).hasClass('show') && !jQuery(el).hasClass('animate') && inViewport( el, self.options.viewportFactor ) ) {
              setTimeout( function() {
                var perspY = scrollY() + getViewportH() / 2;

                self._checkTotalRendered();
                self._itemClass(jQuery(el), self.delay, interval);
                self.delay += 200;
                setTimeout( function() {
                  self.delay = 100;
                }, 200 );

              }, 25 );
            }
          });
          this.didScroll = false;
        },
        _resizeHandler : function() {
          var self = this;
          function delayed() {
            self._scrollPage();
            self.resizeTimeout = null;
          }
          if ( this.resizeTimeout ) {
            clearTimeout( this.resizeTimeout );
          }
          this.resizeTimeout = setTimeout( delayed, 1000 );
        },
        _checkTotalRendered : function() {
          ++this.itemsRenderedCount;
          if( this.itemsRenderedCount === this.itemsCount ) {
            window.removeEventListener( 'scroll', this._onScrollFn );
          }
        }
      }

      // add to global namespace
      window.AnimOnScroll = AnimOnScroll;

  })(jQuery);

  new AnimOnScroll( portfolio, {} );
  new AnimOnScroll( shop, {} );
  new AnimOnScroll( gallery, {} );

}
// Scroll Up button
function wglScrollUp() {
    (function($) {
        $.fn.goBack = function(options) {
            var defaults = {
                scrollTop: jQuery(window).height(),
                scrollSpeed: 600,
                fadeInSpeed: 1000,
                fadeOutSpeed: 500
            };
            var options = $.extend(defaults, options);
            var $this = $(this);
            $(window).on('scroll', function() {
                if ($(window).scrollTop() > options.scrollTop) {
                    $this.addClass('active');
                } else {
                    $this.removeClass('active');
                }
            });
            $this.on('click', function() {
                $('html,body').animate(
                    {
                        scrollTop: 0
                    },
                    options.scrollSpeed
                );
            });
        };
    })(jQuery);

    jQuery('#scroll_up').goBack();
}

function wglBlogMasonryInit() {
    var blog = jQuery('.blog-posts > .masonry');
    if (blog.length) {
        var blog_dom = blog.get(0);
        var $grid = imagesLoaded(blog_dom, function () {
            // initialize masonry
            //* Wrapped in a short timeout function because $grid.imagesLoaded doesn't reliably lay out correctly
            setTimeout(function(){
                blog.isotope({
                    layoutMode: 'masonry',
                    masonry: {
                        columnWidth: '.item',
                    },
                    itemSelector: '.item',
                    percentPosition: true
                });
                jQuery(window).trigger('resize');
            }, 250);
        });
    }
}
// WGL Carousel
function wglCarouselSwiper() {
    var carousel_2D = jQuery('.wgl-carousel_swiper[data-item-carousel]')
    var carousel_3D = jQuery('.wgl-carousel.animation-style-3d')

    if (carousel_2D.length) {
        carousel_2D.each(function (item, value) {
            var swiperContainer = jQuery(this);
            var itemID = jQuery(this).data('item-carousel') ? '[data-carousel="' + jQuery(this).data('item-carousel') + '"]' : '';
            var effect = jQuery(this).hasClass('fade_swiper') ? 'fade' : 'slide';

            var configData = jQuery(this).data('swiper') ? jQuery(this).data('swiper') : {};
            var speed = configData.speed ? configData.speed / 10 : 300;
            var autoplay = configData.autoplaySpeed ? configData.autoplaySpeed : 3000;
            var autoplayEnable = configData.autoplay ? configData.autoplay : false;
            var loop = configData.infinite ? configData.infinite : false;
            var adaptiveHeight = configData.adaptiveHeight ? configData.adaptiveHeight : false;
            var pause_on_hover = configData.pauseOnHover ? configData.pauseOnHover : true;
            var centeredSlides = configData.centerMode ? configData.centerMode : false;

            var pagination = swiperContainer.data('pagination') !== undefined ? swiperContainer.data('pagination') : '.swiper-pagination' + itemID;
            var arrow_next = swiperContainer.data('arrow-next') !== undefined ? swiperContainer.data('arrow-next') : '.elementor-swiper-button-next' + itemID;
            var arrow_prev = swiperContainer.data('arrow-prev') !== undefined ? swiperContainer.data('arrow-prev') : '.elementor-swiper-button-prev' + itemID;

            var config = {
                direction: 'horizontal',
                loop: loop,
                speed: speed,
                effect: effect,
                slidesPerView: 1,
                slidesPerGroup: 1,
                autoHeight: adaptiveHeight,
                grabCursor: false,
                paginationClickable: true,
                centeredSlides: centeredSlides,
                autoplay: {
                    delay: autoplay
                },
                pagination: {
                    el: pagination,
                    clickable: true,
                    renderBullet: (index, className) => '<li class="' + className + '" role="presentation"><button type="button" role="tab" tabindex="-1">' + (index + 1) + '</button></li>',
                },
                navigation: {
                    nextEl: arrow_next,
                    prevEl: arrow_prev
                },
                breakpoints: {},
                autoplayEnable: autoplayEnable,
                pause_on_hover: pause_on_hover,
            };

            if (jQuery(this).hasClass('fade_swiper')) {
                config.fadeEffect = {
                    crossFade: true
                };
            }

            if (configData.responsive) {
                var obj = {};
                configData.responsive.forEach(function (item) {
                    if (item.breakpoint) {
                        obj[item.breakpoint] = {
                            slidesPerView: item.slidesToShow,
                            slidesPerGroup: item.slidesToScroll
                                ? item.slidesToScroll
                                : 1,
                        };

                        if (item.gap) {
                            obj[item.breakpoint].spaceBetween = item.gap;
                        }
                    }
                });

                config.breakpoints = obj;
            }

            if (window.elementorFrontend) {
                if (window.elementorFrontend.isEditMode()) {
                    wglInitSwiper(swiperContainer, config);
                } else {
                    elementorFrontend.on('components:init', () => {
                        wglInitSwiper(swiperContainer, config, elementorFrontend);
                    });
                }
            } else {
                wglInitSwiper(swiperContainer, config);
            }
        });
    }

    /* @see https://3dtransforms.desandro.com/carousel */
    if (carousel_3D.length) {
        carousel_3D.each(function () {
            var container = jQuery(this),
                carousel_wrapper = container.find('.wgl-carousel_wrap'),
                cells = carousel_wrapper.find('.testimonials__wrapper'),
                direction = container.hasClass('animation-direction-vertical') ? 'rotateX' : 'rotateY';

            var cell,
                cellCount = cells.length,
                cellHeight = carousel_wrapper.outerHeight(),
                angle,
                cellAngle,
                currentCell,
                selectedIndex = 0,
                radius,
                theta;

            function initHeightCarousel() {
                if ('rotateY' === direction) {
                    var maxHeight = 0;
                    cells.each(function () {
                        var thisH = jQuery(this).outerHeight();
                        if (thisH > maxHeight) {
                            maxHeight = thisH;
                        }
                    });
                    container.css({'height': maxHeight});
                }
            }
            initHeightCarousel();

            function rotateCarousel() {
                angle = theta * selectedIndex * -1;
                carousel_wrapper.css({ 'transform': 'translateZ(' + -radius + 'px) ' + direction + '(' + angle + 'deg)' });
            }

            container.find('.motion-prev').on('click', function () {
                throttleFunction(changeCarousel_prev, 200)
            });
            container.find('.motion-next').on('click', function () {
                throttleFunction(changeCarousel_next, 200)
            });

            function changeCarousel_prev() {
                selectedIndex--;
                changeCarousel(selectedIndex);
            }
            function changeCarousel_next() {
                selectedIndex++;
                changeCarousel(selectedIndex);
            }

            if (container.hasClass('animated-by-mouse-wheel')) {
                container.on('wheel', function (e) {
                    if (e.originalEvent.deltaY < 0) throttleFunction(changeCarousel_next, 400);
                    else throttleFunction(changeCarousel_prev, 400);
                    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
                });
            }

            function changeCarousel() {
                cells.removeClass('active current next prev');
                theta = 360 / cellCount;

                if ('rotateX' === direction) {
                    radius = Math.round(
                        (cellHeight / cellCount) * 0.7 * Math.sqrt(cellCount / 1.5)
                    );
                } else {
                    if (jQuery('#main').width() <= 992) {
                        radius = Math.round(
                            (cellHeight / cellCount) * 0.5 * Math.sqrt(cellCount / 1.2)
                        );
                    } else {
                        radius = Math.round(
                            (cellHeight / cellCount) * 1.3 * Math.sqrt(cellCount / 1.2)
                        );
                    }
                }

                cells.each(function (i) {
                    cell = jQuery(this);
                    cellAngle = theta * i;
                    angle = (theta * selectedIndex * -1) + cellAngle;
                    cell.css({ 'transform': direction + '(' + cellAngle + 'deg) translateZ(' + radius + 'px)' + direction + '(' + (angle * -1) + 'deg) ' });

                    if (selectedIndex < 0) {
                        currentCell = cellCount - (Math.abs(selectedIndex + 1) % cellCount) - 1;
                    } else {
                        currentCell = selectedIndex % cellCount;
                    }

                    if (currentCell === i) {
                        cell.addClass('active current');
                        if (currentCell === 0) cells.last().addClass('active prev');
                        if (currentCell === cellCount - 1) cells.first().addClass('active next');
                    } else if (i === (currentCell - 1)) {
                        cell.addClass('active prev')
                    } else if (i === (currentCell + 1)) {
                        cell.addClass('active next')
                    }
                });

                rotateCarousel();

                cells.children().off();
                container.find('.prev').children().on('click', changeCarousel_prev);
                container.find('.next').children().on('click', changeCarousel_next);
            }

            function throttleFunction(func, interval) {
                if (!func.lastRunTime || func.lastRunTime < Date.now() - interval) {
                    func.lastRunTime = Date.now();

                    return func.apply(arguments);
                }
            }

            // set initials
            changeCarousel();
            jQuery(window).resize(function () {
                initHeightCarousel();
                changeCarousel();
            });
        });
    }
}

function wglInitSwiper(swiperContainer, config, elementorFrontend = false) {
    if ('undefined' === typeof Swiper) {
        const asyncSwiper = window.elementorFrontend.utils.swiper;
        new asyncSwiper(swiperContainer, config).then((newSwiperInstance) => {
            var wglSwiper = newSwiperInstance;
            wglSwiperControl(wglSwiper, swiperContainer, config);
        });
    } else {
        var wglSwiper = new Swiper(swiperContainer, config);
        wglSwiperControl(wglSwiper, swiperContainer, config);
    }
}

function wglSwiperControl(element, swiperContainer, config){
    if (!config.autoplayEnable) {
        element.autoplay.stop();
    }

    if (config.pause_on_hover && config.autoplayEnable) {
        swiperContainer.on('mouseenter', function () {
            element.autoplay.stop();
        });
        swiperContainer.on('mouseleave', function () {
            element.autoplay.start();
        });
    }
}

function wglCircuitService() {
    if (jQuery('.wgl-circuit-service').length) {
      jQuery('.wgl-circuit-service').each(function(){
        var $circle = jQuery(this).find('.wgl-services_icon-wrap');

        var agle = 360 / $circle.length;
        var agleCounter = -1;

        $circle.each(function() {
          var $this = jQuery(this);

          jQuery(this).parents('.wgl-services_item:first-child').addClass('active');
          $this.on('mouseover', function(){
            jQuery(this).parents('.wgl-services_item').addClass('active').siblings().removeClass('active');
          })

          var percentWidth = (100 * parseFloat($this.css('width')) / parseFloat($this.parent().css('width')));
          var curAgle = agleCounter * agle;
          var radAgle = curAgle * Math.PI / 180;
          var x = (50 + ((50 - (percentWidth / 2)) * Math.cos(radAgle))) - (percentWidth / 2);
          var y = (50 + ((50 - (percentWidth / 2)) * Math.sin(radAgle))) - (percentWidth / 2);

          $this.css({
            left: x + '%',
            top: y + '%'
          });

          agleCounter++;
        });

      });
    }
}
// wgl Countdown function init
function wglCountdownInit () {
    var countdown = jQuery('.wgl-countdown');
    if (countdown.length !== 0 ) {
        countdown.each(function () {
            var data_atts = jQuery(this).data('atts');
            var time = new Date(+data_atts.year, +data_atts.month-1, +data_atts.day, +data_atts.hours, +data_atts.minutes);
            jQuery(this).countdown({
                until: time,
                padZeroes: true,
                 digits: [
                 '<span>0</span>',
                 '<span>1</span>',
                 '<span>2</span>',
                 '<span>3</span>',
                 '<span>4</span>',
                 '<span>5</span>',
                 '<span>6</span>',
                 '<span>7</span>',
                 '<span>8</span>',
                 '<span>9</span>',
                 ],
                format: data_atts.format ? data_atts.format : 'yowdHMS',
                labels: [data_atts.labels[0],data_atts.labels[1],data_atts.labels[2],data_atts.labels[3],data_atts.labels[4],data_atts.labels[5], data_atts.labels[6], data_atts.labels[7]],
                labels1: [data_atts.labels[0],data_atts.labels[1],data_atts.labels[2], data_atts.labels[3], data_atts.labels[4], data_atts.labels[5], data_atts.labels[6], data_atts.labels[7]]
            });
        });
    }
}
// WGL Counter
function wglCounterInit() {
    var counters = jQuery('.wgl-counter');

    if (counters.length) {
        counters.each( function() {
            var counter = jQuery(this).find('.wgl-counter__value');

            counter.appear(function() {
                var from = jQuery(this).data('start-value'),
                    max = jQuery(this).data('end-value'),
                    speed = jQuery(this).data('speed');

                counter.countTo({
                    from: from,
                    to: max,
                    speed: speed,
                    refreshInterval: 10
                });
            });
        });
    }
}
function wglDynamicStyles() {
    var style = jQuery('#transmax-footer-inline-css');

    (function ($) {
        $.fn.wglAddDynamicStyles = function () {
            if (this.length === 0) {
                return this;
            }

            return this.each(function () {
                var $style = '',
                    self = jQuery(this);

                var init = function () {
                        $style += self.text();
                        self.remove();
                        appendStyle();
                    },
                    appendStyle = function () {
                        jQuery('head').append('<style>' + $style + '</style>');
                    };

                // Init
                init();
            });
        };
    })(jQuery);

    style.wglAddDynamicStyles();
}

// wgl Filter Swiper
function wglFilterSwiper() {
    var filter_swiper = jQuery('.wgl-filter_swiper_wrapper, .wgl-tabs_swiper-wrapper');
    if (filter_swiper.length) {
        filter_swiper.each(function() {
            if (window.elementorFrontend) {
                if (window.elementorFrontend.isEditMode()) {
                    wglFilterSwiperInit(jQuery(this));
                }else{
                    elementorFrontend.on('components:init',  () => {wglFilterSwiperInit(jQuery(this))});
                }
            }
        });
    }
}

function wglFilterSwiperInit(self) {
    if ('undefined' === typeof Swiper) {
        const asyncSwiper = window.elementorFrontend.utils.swiper;
        new asyncSwiper(self, {
            slidesPerView: 'auto',
            slideActiveClass: 'slide-active',
        }).then((newSwiperInstance) => {
            var wglSwiper = newSwiperInstance;
        });
    } else {
        var wglSwiper = new Swiper(self, {
            slidesPerView: 'auto',
            slideActiveClass: 'slide-active',
        });
    }
}
//https://gist.github.com/chriswrightdesign/7955464
function mobilecheck() {
    var check = false;
    (function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

//Add Click event for the mobile device
var click = mobilecheck() ? ('ontouchstart' in document.documentElement ? 'touchstart' : 'click') : 'click';

function initClickEvent(){
    click =  mobilecheck() ? ('ontouchstart' in document.documentElement ? 'touchstart' : 'click') : 'click';
}
jQuery(window).on('resize', initClickEvent);

/*
 ** Plugin for counter shortcode
 */
(function($) {
    "use strict";

    $.fn.countTo = function(options) {
        // merge the default plugin settings with the custom options
        options = $.extend({}, $.fn.countTo.defaults, options || {});

        // how many times to update the value, and how much to increment the value on each update
        var loops = Math.ceil(options.speed / options.refreshInterval),
            increment = (options.to - options.from) / loops;

        return $(this).each(function() {
            var _this = this,
                loopCount = 0,
                value = options.from,
                interval = setInterval(updateTimer, options.refreshInterval);

            function updateTimer() {
                value += increment;
                loopCount++;
                $(_this).html(value.toFixed(options.decimals));

                if (typeof(options.onUpdate) === 'function') {
                    options.onUpdate.call(_this, value);
                }

                if (loopCount >= loops) {
                    clearInterval(interval);
                    value = options.to;

                    if (typeof(options.onComplete) === 'function') {
                        options.onComplete.call(_this, value);
                    }
                }
            }
        });
    };

    $.fn.countTo.defaults = {
        from: 0,  // the number the element should start at
        to: 100,  // the number the element should end at
        speed: 1000,  // how long it should take to count between the target numbers
        refreshInterval: 100,  // how often the element should be updated
        decimals: 0,  // the number of decimal places to show
        onUpdate: null,  // callback method for every time the element is updated,
        onComplete: null  // callback method for when the element finishes updating
    };
})(jQuery);

/*
 ** Plugin IF visible element
 */
function wglIsVisibleInit (){
  jQuery.fn.wglIsVisible = function (){
    var elementTop = jQuery(this).offset().top;
    var elementBottom = elementTop + jQuery(this).outerHeight();
    var viewportTop = jQuery(window).scrollTop();
    var viewportBottom = viewportTop + jQuery(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
  }
}

/*
 ** Preloader
 */
jQuery(window).load(function(){
    jQuery('#preloader-wrapper').fadeOut();
});
// wgl image comparison
function wglImageComparison() {
    var item = jQuery('.wgl-image_comparison.cocoen');
    if (item.length !== 0) {
        item.each(function() {
            jQuery(this).cocoen();
        });
    }
}

// Images Gallery
function wglImagesGallery() {
    var item = '.wgl-gallery_item-wrapper',
        gallery_masonry = '.gallery-masonry',
        gallery_justified = '.gallery-justified';

    if (jQuery(gallery_masonry).length) {
        var dom = jQuery(gallery_masonry).get(0);
        var iso = jQuery(gallery_masonry).isotope({
            layoutMode: 'masonry',
            percentPosition: true,
            itemSelector: item
        });

        imagesLoaded(dom, function () {
            iso.isotope('layout');
        });

        jQuery(window).on('resize', function () {
            iso.isotope();
        });
    }

    if (jQuery(gallery_justified).length) {
        var dom = jQuery(gallery_justified).get(0);
        var jus = jQuery(gallery_justified).justifiedGallery({
            rowHeight: deviceData('height'),
            margins: deviceData('gap'),
            lastRow: 'nojustify',
            captions: false,
        });

        imagesLoaded(dom, function () {
            jus.justifiedGallery();
        });

        jQuery(window).on('resize', function () {
            jus.justifiedGallery({
                rowHeight: deviceData('height'),
                margins: deviceData('gap'),
            });
        });
    }

    function deviceData(option) {
        var data = jQuery(gallery_justified).data(option);
        if (jQuery('#main').width() <= 767) {
            data = jQuery(gallery_justified).data('mobile-' + option);
        } else if (jQuery('#main').width() <= 1024) {
            data = jQuery(gallery_justified).data('tablet-' + option);
        }
        return data;
    }
}

// Image Layers
function wglImgLayers() {
    jQuery('.wgl-image-layers').each(function() {
        var container = jQuery(this);
        var initImageLayers = function() {
            container.appear(
                function() {
                    container.addClass('img-layer_animate');
                },
                { done: true }
            );
        };
        initImageLayers();
    });
}

function wglIsotope() {
    jQuery('.isotope').each(function () {
        var $isotope = jQuery(this);
        var properties = {
            layoutMode: $isotope.hasClass('fit_rows') ? 'fitRows' : 'masonry',
            percentPosition: true,
            itemSelector: '.portfolio__item, .item, .product',
            masonry: {
                columnWidth: '.pf_item_size, .portfolio__item, .item, .product',
            }
        };

        $isotope.imagesLoaded().isotope(properties);
        wglIsotopeFilterHandler(this);
    });
}

function wglIsotopeFilterHandler(self) {
    var filterNode = jQuery(self).closest('.elementor-widget-container').find('.isotope-filter a');

    filterNode.each(function () {
        var $this = jQuery(this),
            num,
            dataFilter = this.dataset.filter;

        if ($this.parent().parent().parent().hasClass('product__filter')) {
            num = $this
                .closest('.wgl-products-grid')
                .find('.product')
                .filter(dataFilter).length;
        } else {
            num = $this
                .closest('.wgl-portfolio')
                .find('.portfolio__item')
                .filter(dataFilter).length;
        }
        $this.find('.filter_counter').text(num);

        if (0 === num) {
            // mark empty categories
            $this.addClass('empty').removeClass('swiper-slide');
        }
    });

    filterNode.on('click', function (e) {
        e.preventDefault();
        var $this = jQuery(this);
        $this.addClass('active').siblings().removeClass('active');

        var dataFilter = $this.attr('data-filter'),
            isotopeNode = $this.closest('.elementor-widget-container').find('.isotope');

        isotopeNode.isotope({ filter: dataFilter });

        if (isotopeNode.hasClass('appear-animation')) {
            isotopeNode.find('.portfolio__item').addClass('animate');
        }
    });
}

function wglMenuLavalamp() {
    var lavalamp = jQuery('.menu_line_enable > ul');
    if (lavalamp.length !== 0) {
        lavalamp.each(function() {
            var $this = jQuery(this);
            $this.lavalamp();
        });
    }
}

(function($, window) {
    var Lavalamp = function(element, options) {
        this.element = $(element).data('lavalamp', this);
        this.options = $.extend({}, this.options, options);

        this.init();
    };

    Lavalamp.prototype = {
        options: {
            current:
                '.current-menu-ancestor,.current-menu-item,.current-category-ancestor',
            items: 'li',
            bubble: '<div class="lavalamp-object"></div>',
            animation: false,
            blur: $.noop,
            focus: $.noop,
            easing: 'easeInOutCubic', // transition timing function
            duration: '0.6s' // animation duration
        },
        element: null,
        current: null,
        bubble: null,
        _focus: null,
        init: function() {
            var resizeTimer,
                self = this,
                child = self.element.children('li');

            this.onWindowResize = function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    self.reload();
                }, 100);
            };

            $(window).bind('resize.lavalamp', this.onWindowResize);

            $(child).addClass('lavalamp-item');

            this.element
                .on('mouseenter.lavalamp', '.lavalamp-item', function() {
                    self.current.each(function() {
                        self.options.blur.call(this, self);
                    });

                    self._move($(this));
                })
                .on('mouseleave.lavalamp', function() {
                    if (self.current.index(self._focus) < 0) {
                        self._focus = null;

                        self.current.each(function() {
                            self.options.focus.call(this, self);
                        });

                        self._move(self.current);
                    }
                });

            this.bubble = $.isFunction(this.options.bubble)
                ? this.options.bubble.call(this, this.element)
                : $(this.options.bubble).prependTo(this.element);

            self.element.addClass('lavalamp');
            self.element.find('.lavalamp-object').addClass(self.options.easing);

            this.reload();

            self.element.addClass('lavalamp_animate');
        },
        reload: function() {
            this.current = this.element.children(this.options.current);

            if (this.current.size() === 0) {
                this.current = this.element
                    .children()
                    .not('.lavalamp-object')
                    .eq(0);
            }

            this._move(this.current, false);
        },
        destroy: function() {
            if (this.bubble) {
                this.bubble.remove();
            }

            this.element.unbind('.lavalamp');
            $(window).unbind('resize.lavalamp', this.onWindowResize);
        },
        _move: function(el, animate) {
            var pos = el.position();
            pos.left = pos.left + parseInt(el.children('a').css('paddingLeft'));

            var child_width =
                el
                    .children('a')
                    .children('span')
                    .width() - 2;
            var translate_pos = pos.left + (child_width/2 - 2);

            this._focus = el;

            // CSS animations
            this.bubble.css({
                WebkitTransitionDuration: this.options.duration,
                MozTransitionDuration: this.options.duration,
                transitionDuration: this.options.duration,
                transform: 'translateX(' + translate_pos + 'px)'
            });
        }
    };

    $.fn.lavalamp = function(options) {
        if (typeof options === 'string') {
            var instance = $(this).data('lavalamp');
            return instance[options].apply(
                instance,
                Array.prototype.slice.call(arguments, 1)
            );
        } else {
            return this.each(function() {
                var instance = $(this).data('lavalamp');

                if (instance) {
                    $.extend(instance.options, options || {});
                    instance.reload();
                } else {
                    new Lavalamp(this, options);
                }
            });
        }
    };
})(jQuery, window);

(function( $ ) {

  $(document).on('click', '.sl-button', function() {
    var button = $(this),
        post_id = button.attr('data-post-id'),
        security = button.attr('data-nonce'),
        iscomment = button.attr('data-iscomment'),
        allbuttons;

    if (iscomment === '1') { /* Comments can have same id */
      allbuttons = $('.sl-comment-button-'+post_id);
    } else {
      allbuttons = $('.sl-button-'+post_id);
    }
    var loader = allbuttons.next('#sl-loader');
    if (post_id !== '') {
      $.ajax({
        type: 'POST',
        url: wgl_core.ajaxurl,
        data : {
          action : 'wgl_theme_like',
          post_id : post_id,
          nonce : security,
          is_comment : iscomment,
        },
        beforeSend: function() {
          loader.html('&nbsp;<div class="loader">Loading...</div>');
        },
        success: function(response) {
          var icon = response.icon;
          var count = response.count;
          allbuttons.html(icon+count);
          if (response.status === 'unliked') {
            allbuttons.prop('title', button.data('title-like'));
            allbuttons.removeClass('liked');
          } else {
            allbuttons.prop('title', button.data('title-unlike'));
            allbuttons.addClass('liked');
          }
          loader.empty();
        }
      });

    }
    return false;
  });

})( jQuery );
function wglLinkScroll() {
    jQuery('a.smooth-scroll, .smooth-scroll').on('click', function(event) {
        var href;
        if (this.tagName == 'A') {
            href = jQuery.attr(this, 'href');
        } else {
            var that = jQuery(this).find('a');
            href = jQuery(that).attr('href');
        }
        jQuery('html, body').animate(
            {
                scrollTop: jQuery(href).offset().top
            },
            500
        );
        event.preventDefault();
    });
}

function wglMessageAnimInit() {
    jQuery('body').on('click', '.message_close_button', function (e) {
        jQuery(this).closest('.wgl_module_message_box.closable').slideUp(350);
    });
}

function wglMobileHeader() {
    var menu = jQuery('.wgl-mobile-header .mobile_nav_wrapper .primary-nav > ul');

    // Create Mobile Menu plugin
    (function ($) {
        $.fn.wglMobileMenu = function (options) {
            var defaults = {
                toggleBtn: '.wgl-mobile-header .hamburger-box',
                switcher: '.button_switcher',
                back: '.back',
                overlay: '.wgl-menu_overlay',
                anchor: '.menu-item > a[href*=\\#]',
            };

            if (this.length === 0) return this;

            return this.each(function () {
                var wglMenu = {},
                    ds = $(this),
                    sub_menu = jQuery('.mobile_nav_wrapper .primary-nav > ul ul'),
                    m_width = jQuery('.mobile_nav_wrapper').data('mobileWidth'),
                    m_toggle = jQuery('.hamburger-box'),
                    body = jQuery('body'),
                    stickyMobile = jQuery('.wgl-mobile-header.wgl-sticky-element');

                // Helper Menu
                var open = 'is-active',
                    openSubMenu = 'show_sub_menu',
                    mobile_on = 'mobile_switch_on',
                    mobile_off = 'mobile_switch_off',
                    mobile_switcher = 'button_switcher';

                var init = function () {
                    wglMenu.settings = $.extend({}, defaults, options);
                    createButton();
                    showMenu();
                };
                var showMenu = function () {
                    if (jQuery(window).width() <= m_width) {
                        if (!m_toggle.hasClass(open)) {
                            createNavMobileMenu();
                        }
                    } else {
                        resetNavMobileMenu();
                    }
                };
                var createNavMobileMenu = function () {
                    sub_menu.removeClass(openSubMenu);
                    ds.hide().addClass(mobile_on);
                    body.removeClass(mobile_on);
                };
                var resetNavMobileMenu = function () {
                    sub_menu.removeClass(openSubMenu);
                    body.removeClass(mobile_on);
                    ds.show().removeClass(mobile_on);
                    m_toggle.removeClass(open);
                    jQuery('.' + mobile_switcher).removeClass('is-active');
                };
                var createButton = function () {
                    ds.find('.menu-item-has-children').each(function () {
                        jQuery(this)
                            .find('> a')
                            .append('<span class="' + mobile_switcher + '"></span>');
                    });
                };
                var toggleMobileMenu = function (e) {
                    ds.toggleClass(openSubMenu);
                    body.toggleClass(mobile_on);

                    if (body.hasClass(mobile_on)){
                        body.removeClass(mobile_off);
                        wglDisableBodyScroll(true, '.wgl-menu-outer_content');
                    }else{
                        body.addClass(mobile_off);
                        wglDisableBodyScroll(false, '.wgl-menu-outer_content');
                    }
                };
                var hideSubMenu = function (e) {
                    if (!jQuery('.button_switcher').is(e.target)) {
                        jQuery('.mobile_nav_wrapper .menu-item-has-children')
                            .find('.sub-menu')
                            .stop(true)
                            .slideUp(450)
                            .removeClass(openSubMenu);

                        jQuery('.mobile_nav_wrapper .menu-item-has-children')
                            .find('.button_switcher')
                            .removeClass(open);

                        if (jQuery(e.target).closest('.wgl-mobile-header').length) {
                            toggleMobileMenu();
                        }
                    }
                };
                var showSubMenu = function (e) {
                    e.preventDefault();
                    var item = jQuery(this).parents('li');

                    if (!jQuery(this).hasClass(open)) {
                        jQuery('.mobile_nav_wrapper .menu-item-has-children')
                            .not(item)
                            .find('.sub-menu')
                            .stop(true)
                            .slideUp(450)
                            .removeClass(openSubMenu);
                        jQuery('.mobile_nav_wrapper .menu-item-has-children')
                            .not(item)
                            .find('.button_switcher')
                            .removeClass(open);
                        jQuery('.mobile_nav_wrapper .menu-item-has-children')
                            .not(item)
                            .find('a[href*=\\#]')
                            .removeClass(open);

                        jQuery(this)
                            .parent()
                            .prev('.sub-menu')
                            .stop(true)
                            .slideDown(450)
                            .addClass(openSubMenu);
                        jQuery(this)
                            .parent()
                            .next('.sub-menu')
                            .stop(true)
                            .slideDown(450)
                            .addClass(openSubMenu);
                    } else {
                        jQuery(this)
                            .parent()
                            .prev('.sub-menu')
                            .stop(true)
                            .slideUp(450)
                            .removeClass(openSubMenu);
                        jQuery(this)
                            .parent()
                            .next('.sub-menu')
                            .stop(true)
                            .slideUp(450)
                            .removeClass(openSubMenu);
                    }

                    jQuery(this).toggleClass(open);
                };
                var eventClose = function (e) {
                    var container = $('.wgl-menu_outer');

                    if (
                        !container.is(e.target) &&
                        container.has(e.target).length === 0 &&
                        $('body').hasClass(mobile_on)
                    ) {
                        toggleMobileMenu();
                    }
                };
                var goBack = function (e) {
                    e.preventDefault();
                    jQuery(this).closest('.sub-menu').removeClass(openSubMenu);
                    jQuery(this).closest('.sub-menu').prev('a').removeClass(open);
                    jQuery(this)
                        .closest('.sub-menu')
                        .prev('a')
                        .find('.' + mobile_switcher)
                        .removeClass(open);
                };
                var mobileSticky = function(){
                    var top = jQuery(stickyMobile).height();
                    var y = jQuery(window).scrollTop();
                    if ( y >= top ) {
                        jQuery(stickyMobile).addClass( 'sticky_mobile' );
                    } else {
                        jQuery(stickyMobile).removeClass('sticky_mobile');
                    }
                };

                // Init
                init();

                jQuery(wglMenu.settings.toggleBtn).on(click, toggleMobileMenu);
                jQuery(wglMenu.settings.overlay).on(click, eventClose);

                // Switcher menu
                jQuery(wglMenu.settings.switcher).on(click, showSubMenu);
                jQuery(wglMenu.settings.anchor).on(click, hideSubMenu);

                // Go back menu
                jQuery(wglMenu.settings.back).on(click, goBack);

                jQuery(window).resize(function () {
                    showMenu();
                });

                if ( stickyMobile.length !== 0 && body.hasClass('admin-bar') ) {
                    mobileSticky();

                    jQuery( window ).scroll(
                        function() {
                            if (jQuery(window).width() <= stickyMobile.find('.mobile_nav_wrapper').data('mobileWidth')) {
                                mobileSticky();
                            }
                        }
                    );
                    jQuery( window ).resize(
                        function() {
                            if (jQuery(window).width() <= stickyMobile.find('.mobile_nav_wrapper').data('mobileWidth')) {
                                mobileSticky();
                            }
                        }
                    );
                }
            });
        };
    })(jQuery);

    menu.wglMobileMenu();
}

var wglDisableBodyScroll = (function () {

    var _selector = false,
        _element = false,
        _clientY;

    if (!Element.prototype.matches)
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;

    if (!Element.prototype.closest)
        Element.prototype.closest = function (s) {
            var ancestor = this;
            if (!document.documentElement.contains(el)) return null;
            do {
                if (ancestor.matches(s)) return ancestor;
                ancestor = ancestor.parentElement;
            } while (ancestor !== null);
            return el;
        };

    var preventBodyScroll = function (event) {
        if (false === _element || !event.target.closest(_selector)) {
            event.preventDefault();
        }
    };

    var captureClientY = function (event) {
        if (event.targetTouches.length === 1) {
            _clientY = event.targetTouches[0].clientY;
        }
    };

    var preventOverscroll = function (event) {
        if (event.targetTouches.length !== 1) {
            return;
        }

        var clientY = event.targetTouches[0].clientY - _clientY;

        if (_element.scrollTop === 0 && clientY > 0) {
            event.preventDefault();
        }

        if ((_element.scrollHeight - _element.scrollTop <= _element.clientHeight) && clientY < 0) {
            event.preventDefault();
        }
    };

    return function (allow, selector) {
        if (typeof selector !== "undefined") {
            _selector = selector;
            _element = document.querySelector(selector);
        }

        if (true === allow) {
            if (false !== _element) {
                _element.addEventListener('touchstart', captureClientY, false);
                _element.addEventListener('touchmove', preventOverscroll, false);
            }
            document.body.addEventListener("touchmove", preventBodyScroll, false);
        } else {
            if (false !== _element) {
                _element.removeEventListener('touchstart', captureClientY, false);
                _element.removeEventListener('touchmove', preventOverscroll, false);
            }
            document.body.removeEventListener("touchmove", preventBodyScroll, false);
        }
    };
}());
// wgl Page Title Parallax
function wglPageTitleParallax() {
    var page_title = jQuery('.page-header.page_title_parallax')
    if (page_title.length !== 0 ) {
        page_title.paroller();
    }
}

// wgl Extended Parallax
function wglExtendedParallax() {
    var item = jQuery('.extended-parallax')
    if (item.length !== 0 ) {
        item.each( function() {
            jQuery(this).paroller();
        })
    }
}
// wgl Portfolio Single Parallax
function wglPortfolioParallax() {
    var portfolio = jQuery('.wgl-portfolio-item_bg.portfolio_parallax')
    if (portfolio.length !== 0 ) {
        portfolio.paroller();
    }
}

function wglParallaxVideo() {
    jQuery('.parallax-video').each(function() {
        jQuery(this).jarallax({
            loop: true,
            speed: 1,
            videoSrc: jQuery(this).data('video'),
            videoStartTime: jQuery(this).data('start'),
            videoEndTime: jQuery(this).data('end')
        });
    });
}

function wglParticlesCustom() {
    jQuery('.wgl-particles-js').each(function() {
        var id = jQuery(this).attr('id');
        var type = jQuery(this).data('particles-type');
        var color_type = jQuery(this).data('particles-colors-type');
        var color = jQuery(this).data('particles-color');
        var color_line = jQuery(this).data('particles-color');
        var number = jQuery(this).data('particles-number');
        var lines = jQuery(this).data('particles-line');
        var size = jQuery(this).data('particles-size');
        var speed = jQuery(this).data('particles-speed');
        var hover = jQuery(this).data('particles-hover');
        var hover_mode = jQuery(this).data('particles-hover-mode');
        switch (type) {
            case 'particles':
            default:
                type = 'circle';
                break;
            case 'hexagons':
                type = 'polygon';
                break;
        }
        if (color_type == 'random_colors') {
            color = color.split(',');
            color_line = color[0];
        }

        tsParticles.load(id, {
            particles: {
                number: {
                    value: number,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: color
                },
                shape: {
                    type: type,
                    polygon: {
                        nb_sides: 6
                    }
                },
                opacity: {
                    value: 1,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: size,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 30,
                        size_min: 1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: lines,
                    distance: 150,
                    color: color_line,
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: speed,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: hover,
                        mode: hover_mode
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 150,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 200,
                        size: size * 1.6,
                        duration: 20,
                        opacity: 1,
                        speed: 30
                    },
                    repulse: {
                        distance: 80,
                        duration: 0.4
                    },
                    push: { particles_nb: 4 },
                    remove: { particles_nb: 2 }
                }
            },
            retina_detect: true
        });
        var update;
        update = function() {
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    });
}

function wglParticlesImageCustom() {

    jQuery('.wgl-particles-img-js').each(function () {
        var id = jQuery(this).attr('id');
        var color = jQuery(this).data('particles-color') || "#000000";

        var number = jQuery(this).data('particles-number');
        var lines = jQuery(this).data('particles-line');
        var size = jQuery(this).data('particles-size');
        var speed = jQuery(this).data('particles-speed');
        var hover = jQuery(this).data('particles-hover');
        var hover_mode = jQuery(this).data('particles-hover-mode');
        var rotate = jQuery(this).data('particles-rotate');
        rotate = rotate === 'yes' ? true : false;
        var rotate_speed = jQuery(this).data('particles-rotate-animation') || 0;

        var img_src = jQuery(this).data('image').split(",");

        var imageElement = [];

        img_src.forEach(function (item, i, arr) {
            var url = new URL(item);
            var element = {};
            element.height = url.searchParams.get('height');
            element.replaceColor = true;
            element.src = item.split('?')[0];
            element.width = url.searchParams.get('width');
            element.fill = true;
            element.close = true;
            imageElement.push(element);
        });

        tsParticles.load(id, {
            "detectRetina": true,
            "fpsLimit": 60,
            "particles": {
                "number": {
                    "value": number,
                    "density": {
                        "enable": true,
                        "area": 800
                    },
                    "limit": 0,
                },
                "color": {
                    "value": color
                },
                "shape": {
                    "image": imageElement,
                    "polygon": {
                        "close": true,
                        "fill": true,
                        "sides": 5
                    },
                    "type": "image",
                    "custom": {}
                },
                "opacity": {
                    "animation": {
                        "enable": false,
                        "minimumValue": 0.1,
                        "speed": 1,
                        "sync": false
                    },
                    "random": {
                        "enable": false,
                        "minimumValue": 1
                    },
                    "value": 1
                },
                "size": {
                    "animation": {
                        "enable": false,
                        "minimumValue": 1,
                        "speed": 40,
                        "sync": false
                    },
                    "random": {
                        "enable": false,
                        "minimumValue": 1
                    },
                    "value": size
                },

                "lineLinked": {
                    "blink": false,
                    "color": {
                        "value": color
                    },
                    "consent": false,
                    "distance": 150,
                    "enable": lines,
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "collisions": false,
                    "direction": "none",
                    "enable": true,
                    "outMode": "out",
                    "random": false,
                    "speed": speed,
                    "straight": false,
                    "attract": {
                        "enable": false,
                        "rotate": {
                            "x": 600,
                            "y": 1200
                        }
                    },
                },
                "rotate": {
                    "animation": {
                        "enable": rotate,
                        "speed": rotate_speed,
                        "sync": false
                    },
                    "direction": "random",
                    "random": true,
                    "value": 0
                },
                "stroke": {
                    "color": {
                        "value": color
                    },
                    "width": 0,
                    "opacity": 1
                }
            },
            "interactivity": {
                "detectsOn": "canvas",
                "events": {
                    "onClick": {
                        "enable": false,
                        "mode": "push"
                    },
                    "onHover": {
                        "enable": hover,
                        "mode": hover_mode,
                        "parallax": {
                            "enable": false,
                            "force": 60,
                            "smooth": 10
                        }
                    },
                    "resize": true
                },
                "modes": {
                    "bubble": {
                        "distance": 200,
                        "duration": 20,
                        "opacity": 1,
                        "size": size * 1.6,
                    },
                    "connect": {
                        "distance": 80,
                        "lineLinked": {
                            "opacity": 0.5
                        },
                        "radius": 60
                    },
                    "grab": {
                        "distance": 150,
                        "lineLinked": {
                            "opacity": 1,
                        }
                    },
                    "push": {
                        "quantity": 4
                    },
                    "remove": {
                        "quantity": 2
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "slow": {
                        "factor": 1,
                        "radius": 0
                    }
                }
            },
            "backgroundMask": {
                "cover": {
                  "color": {
                    "value": "#fff"
                  },
                  "opacity": 1
                },
                "enable": false
              },
              "pauseOnBlur": true,
              "background": {}
        });

        var update;
        update = function () {
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);



    });
}

// wgl Pie Chart
function wglPieChartInit() {

    var item = jQuery('.wgl-pie_chart');

    if (item.length) {
        item.each(function() {
            var chart = item.find('.chart');

			item.appear(function() {
				jQuery(chart).easyPieChart({
            		barColor: jQuery(this).data("barColor"),
					trackColor: jQuery(this).data("trackColor"),
					scaleColor: false,
					lineCap: 'square',
					lineWidth: jQuery(this).data("lineWidth"),
					animate: { duration: 1400, enabled: true },
					size: jQuery(this).data("size"),
					onStep: function(from, to, percent) {
						jQuery(this.el).find('.chart__percent').text(Math.round(percent) + '%');
					}
        		});
			});
        });
    }
}
// http://brutaldesign.github.io/swipebox/
function wglVideoboxInit() {
    var gallery = jQuery(".videobox, .swipebox, .gallery a[href$='.jpg'], .gallery a[href$='.jpeg'], .gallery a[href$='.JPEG'], .gallery a[href$='.gif'], .gallery a[href$='.png']");
    if (gallery.length !== 0 ) {
        gallery.each(function() {
            jQuery(this).attr('data-elementor-open-lightbox', 'yes');
        });
    }
}
// wgl Progress Bars
function wglProgressBarsInit(e) {
    var item = jQuery('.wgl-progress-bar');

    if (item.length) {
        item.each(function() {
            var item = jQuery(this),
                slidable_label = false,
                item_label = item.find('.progress__content'),
                bar = item.find('.bar__filled'),
                data_width = bar.data('width'),
                counter = item.find('.value__digit'),
                duration = parseFloat(bar.css('transition-duration')) * 1000,
                interval = Math.floor(duration / data_width),
                temp = 0;

            if (item.hasClass('dynamic-value')) {
                slidable_label = true;
            }

            if (!e) {
                item.appear(function() {
                    bar.css('width', data_width + '%');
                    if (slidable_label == true) {
                        item_label.css('width', data_width + '%');
                    }
                    var recap = setInterval(function() {
                        counter.text(temp);
                        temp++;
                    }, interval);
                    var stopCounter = setTimeout(function() {
                        clearInterval(recap);
                        counter.text(data_width);
                    }, duration);
                });
            } else {
                bar.css('width', data_width + '%');
                if (slidable_label) {
                    item_label.css('width', data_width + '%');
                }
                var recap = setInterval(function() {
                    counter.text(temp);
                    temp++;
                }, interval);
                var stopCounter = setTimeout(function() {
                    clearInterval(recap);
                    counter.text(data_width);
                }, duration);
            }
        });
    }
}

function wglSearchInit() {

    // Create plugin Search
    (function($) {

        $.fn.wglSearch = function(options) {
            var defaults = {
                'toggleID'    : '.header_search-button',
                'closeID'     : '.header_search-close',
                'searchField' : '.header_search-field',
                'body'        : 'body > *:not(header)',
            };

            if (this.length === 0) { return this; }

            return this.each(function() {
                var wglSearch = {},
                    s = $(this),
                    openClass = 'header_search-open',
                    searchClass = '.header_search',

                init = function() {
                    wglSearch.settings = $.extend({}, defaults, options);
                },
                open = function() {
                    $(s).addClass(openClass);
                    setTimeout(function() {
                        $(s)
                            .find('input.search-field')
                            .focus();
                    }, 400);
                    return false;
                },
                close = function() {
                    $(s).removeClass(openClass);
                },
                toggleSearch = function(e) {
                    if (! $(s).closest(searchClass).hasClass(openClass)) {
                        open();
                    } else {
                        close();
                    }
                },
                eventClose = function(e) {
                    if (! $(e.target).closest('.search-form').length) {
                        if ($(searchClass).hasClass(openClass)) {
                            close();
                        }
                    }
                };
                $(document).bind('keydown', function(e) {
                    if (e.which === 27 && $(searchClass).hasClass(openClass)) close();
                });

                // Init
                init();

                if ($(this).hasClass('search_standard')) {
                    $(this).find(wglSearch.settings.toggleID).on(click, toggleSearch);
                    $(this).find(wglSearch.settings.closeID).on(click, eventClose);
                } else {
                    $(wglSearch.settings.toggleID).on(click, toggleSearch);
                    $(wglSearch.settings.searchField).on(click, eventClose);
                }

                $(wglSearch.settings.body).on(click, eventClose);

            });

        };

    })(jQuery);

    jQuery('.header_search').wglSearch();

}
function wglSidePanelInit() {

    // Create plugin Side Panel
    (function($) {

        $.fn.wglSidePanel = function(options) {
            var defaults = {
                "toggleID"     : ".side_panel-toggle",
                "closeID"      : ".side-panel_close",
                "closeOverlay" : ".side-panel_overlay",
                "body"         : "body > *:not(header)",
                "sidePanel"    : "#side-panel .side-panel_sidebar"
            };

            if (this.length === 0) { return this; }

            return this.each(function () {
                var wglSidePanel = {},
                    s = $(this),
                    openClass = 'side-panel_open',
                    wglScroll,
                    sidePanelClass = '.side_panel',
                    $side_panel = $('#side-panel'),

                init = function() {
                    wglSidePanel.settings = $.extend({}, defaults, options);
                },
                open = function () {
                    if (! $side_panel.hasClass('side-panel_active')) {
                        $side_panel.addClass('side-panel_active');
                    }

                    $side_panel.addClass(openClass);
                    $(s).addClass(openClass);
                    $('body').removeClass('side-panel--closed').addClass('side-panel--opened');

                    var wglClassAnimated = $side_panel.find('section.elementor-element').data('settings');
                    if (wglClassAnimated && wglClassAnimated.animation) {
                        $side_panel.find('section.elementor-element').removeClass('elementor-invisible').addClass('animated').addClass(wglClassAnimated.animation);
                    }
                },
                close = function () {
                    $(s).removeClass(openClass);
                    $side_panel.removeClass(openClass);
                    $('body').removeClass('side-panel--opened').addClass('side-panel--closed');
                    var wglClassAnimated = $side_panel.find('section.elementor-element').data('settings');
                    if (wglClassAnimated && wglClassAnimated.animation) {
                        $side_panel.find('section.elementor-element').removeClass(wglClassAnimated.animation);
                    }
                },
                togglePanel = function(e) {
                    e.preventDefault();
                    wglScroll = $(window).scrollTop();

                    if (! $(s).closest(sidePanelClass).hasClass(openClass)) {
                        open();
                        $(window).scroll(function() {
                            if (450 < Math.abs($(this).scrollTop() - wglScroll)) {
                                close();
                            }
                        });
                    } else {

                    }
                },
                closePanel = function(e) {
                    e.preventDefault();
                    if ($(s).closest(sidePanelClass).hasClass(openClass)) {
                        close();
                    }
                },
                eventClose = function(e) {
                    var element = $(sidePanelClass);

                    if (! $side_panel.is(e.target) && $side_panel.has(e.target).length === 0) {
                        if ($(element).hasClass(openClass)) {
                            close();
                        }
                    }
                };

                init();

                $(wglSidePanel.settings.toggleID).on(click, togglePanel);
                $(wglSidePanel.settings.body).on(click, eventClose);
                $(wglSidePanel.settings.closeID).on(click, closePanel);
                $(wglSidePanel.settings.closeOverlay).on(click, closePanel);

                $(document).bind('keydown', function(e) {
                    if (e.which === 27 && $(sidePanelClass).hasClass(openClass)) close();
                });
            });
        };

    })(jQuery);

    if (jQuery('#side-panel').length) {
        jQuery('.side_panel').wglSidePanel();
    }
}
function wglSkrollrInit() {
    var blog_scroll = jQuery('.blog_skrollr_init');
    if (blog_scroll.length) {
        if ( !/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent || navigator.vendor || window.opera) ) {
            // wgl Skrollr
            skrollr.init({
                smoothScrolling: false,
                forceHeight: false
            });
        }
    }
}


function wglStickyInit() {

    var section = '.wgl-sticky-header',
        top = jQuery(section).height(),
        data = jQuery(section).data('style'),
        previousScroll = 0;

    function init(element) {
        if ( ! element ) {
            return;
        }

        var y = jQuery(window).scrollTop();
        if ( data == 'standard' ) {

            if ( y >= top ) {
                jQuery(section).addClass( 'sticky_active' );
            } else {
                jQuery(section).removeClass( 'sticky_active' );
            }

        } else {
            if ( y > top ) {
                if ( y > previousScroll ) {
                    jQuery(section).removeClass( 'sticky_active' );
                } else {
                    jQuery(section).addClass( 'sticky_active' );
                }
            } else {
                jQuery(section).removeClass('sticky_active');
            }
            previousScroll = y;

        }
    };

    if ( jQuery( '.wgl-sticky-header' ).length !== 0 ) {
        jQuery( window ).scroll( function() {
            init(jQuery(this));
        } );

        jQuery( window ).resize( function() {
            init(jQuery(this));
        } );
    }
}
function wglStickySidebar() {
    if (jQuery('.sticky-sidebar').length) {
        jQuery('body').addClass('sticky-sidebar_init');
        jQuery('.sticky-sidebar').each(function() {
            jQuery(this).theiaStickySidebar({
                additionalMarginTop: 150,
                additionalMarginBottom: 30
            });
        });
    }

    if (jQuery('.sticky_layout .info-wrapper').length) {
        jQuery('.sticky_layout .info-wrapper').each(function() {
            jQuery(this).theiaStickySidebar({
                additionalMarginTop: 150,
                additionalMarginBottom: 150
            });
        });
    }
}

// Tabs

function wglTabsInit() {
    let $tabs = jQuery('.wgl-tabs');
    if ($tabs.length) {
        $tabs.each(function(){
            let $this = jQuery(this);
            let tab = $this.find('.wgl-tabs_headings .wgl-tabs_header');
            let	data = $this.find('.wgl-tabs_content-wrap .wgl-tabs_content');
            let $contentWrap = $this.find('.wgl-tabs_content-wrap');
            let height = data.filter(':first').outerHeight();

            tab.filter(':first').addClass('active');

            data.filter(':first').addClass('active');
            data.filter(':not(:first)').hide();
            $contentWrap.css({ 'height': height });
            tab.each(function(){
                let currentTab = jQuery(this);

                currentTab.on('click tap', function(){
                    let id = currentTab.data('tab-id');
                    let currentData = jQuery('.wgl-tabs .wgl-tabs_content[data-tab-id='+id+']');
                    height = currentData.outerHeight();

                    $contentWrap.css({ 'height': height });
                    currentTab.addClass('active').siblings().removeClass('active');
                    currentData.addClass('active').slideDown().siblings().removeClass('active').slideUp();
                });
            });
        })
    }
}

function wglTextBackground() {
    var anim_text = jQuery('.wgl-animation-background-text');
    if (anim_text.length) {
        anim_text.each(function(index) {
            var paralax_text = jQuery('<div class="wgl-background-text"/>');

            jQuery(this)
                .find('>div:eq(0)')
                .before(paralax_text);
            var text = window.getComputedStyle(this, ':before').content;

            text = text.slice(1, -1);

            paralax_text.addClass('element-' + index);
            paralax_text.attr('data-info', index);

            jQuery(this)
                .find(paralax_text)
                .html(
                    text.replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>")
                );

            var self = jQuery(this);

            anim_text.appear(function() {
                if (typeof anime === 'function') {
                    var item_anime = jQuery(this)
                        .find('.wgl-background-text')
                        .data('info');

                    if (item_anime === index) {
                        anime.timeline({ loop: false }).add({
                            targets: '.element-' + index + ' .letter',
                            translateY: [100, 0],
                            translateZ: 0,
                            opacity: [0, 1],
                            easing: 'easeOutExpo',
                            duration: 1400,
                            delay: function(el, i) {
                                return 0 + 350 * i;
                            }
                        });
                    }
                }
            });
        });
    }
}

// WGL Time Line Vertical appear
function wglInitTimelineAppear() {

    var item = jQuery('.wgl-timeline-vertical.appear_animation [class*="tlv__items-"]');

    if (item.length) {
        item.each(function() {
            var item = jQuery(this);
            item.appear(function() {
                item.addClass('show');
            });
        });
    }
}
function wglWoocommerceHelper(){
    jQuery('body').on('click', '.quantity.number-input span.minus', function(e){
        this.parentNode.querySelector('input[type=number]').stepDown();
        if(document.querySelector('.woocommerce-cart-form [name=update_cart]')){
            document.querySelector('.woocommerce-cart-form [name=update_cart]').disabled = false;
        }
    });

    jQuery('body').on('click', '.quantity.number-input span.plus', function(e){
        this.parentNode.querySelector('input[type=number]').stepUp();
        if(document.querySelector('.woocommerce-cart-form [name=update_cart]')){
            document.querySelector('.woocommerce-cart-form [name=update_cart]').disabled = false;
        }
    });

    jQuery('.wgl-products .product a.add_to_cart_button.ajax_add_to_cart').on( "click", function() {
        jQuery(this).closest('.product').addClass('added_to_cart_item');
    });

    jQuery(".wgl_woo_button_wrapper .button").on('touchstart mouseenter', function (e) {
        let obj = jQuery(this);
        obj.closest('.woo_product_image').addClass("hover_animage");
    }).on("touchend mouseleave", function () {
        let obj = jQuery(this);
        obj.closest('.woo_product_image').removeClass("hover_animage");
    });
}

function wglWoocommerceLoginIn() {
    var login_in = jQuery('.login-in');
    if (login_in.length) {
        var mc = login_in,
            icon = mc.find('a.login-in_link'),
            overlay = mc.find('div.overlay');

        icon.on('click tap', function(e) {
            e.preventDefault();
            mc.toggleClass('open_login');
        });

        var eventClose = function(e) {
            if (
                !jQuery(e.target).closest('.modal_content').length &&
                !jQuery(e.target).is('.modal_content')
            ) {
                mc.removeClass('open_login');
            }
        };

        overlay.on('click tap', eventClose);

        jQuery(document).bind('keydown', function(e) {
            if (e.which === 27) eventClose(e);
        });
    }
}
function wglWoocommerceMiniCart(){
    var mini_cart = jQuery('header .wgl-cart-header .mini-cart');
    if (mini_cart.length) {
        mini_cart.each(function(){
            jQuery(this).prepend('<div class="mini_cart-overlay"></div>');
            var self = jQuery(this),
                overlay = self.find('div.mini_cart-overlay'),
                eventClose = function(e) {
                    self.removeClass('open_cart');
                };

            jQuery('a.woo_icon').on('click tap', function() {
                self.toggleClass('open_cart');
            });
            overlay.on('click tap', eventClose);
            jQuery('body').on('click', 'header a.close_mini_cart', eventClose);

            jQuery(document).bind('keydown', function(e) {
                if (e.which === 27) eventClose(e);
            });
        });
    }
}

function wglWoocommerceNotifications() {
    if (!jQuery.fn.notify) {
        return
    }
    jQuery.notify.addStyle("wgl_notify", {
        html: '<div><div class="message_icon_wrap"><span class="message_icon"></span></div><span data-notify-text/></div>'
    });

    var noticeWrapper = jQuery('.woocommerce-notices-wrapper');
    noticeWrapper.bind("DOMSubtreeModified",function(){
        startNotifications();
    });

    startNotifications();
}

function startNotifications(){
    var notice = jQuery(".wgl_module_message_box:not(.type_info)");
    if (notice.length !== 0 ) {
        jQuery.each(notice, function(i, c) {
            var content = jQuery(c);

            jQuery.notify.addStyle("wgl_woocommerce_notify_css", {
                html:
                    "<div>" +
                    "<div class='text-wrapper'>" +
                    "<div class='text' data-notify-html='text'/>" +
                    "</div>" +
                    "</div>",
            });

            jQuery.notify({
                text: content[0],
            }, {
                style: 'wgl_woocommerce_notify_css',
                autoHide: false,
                clickToHide: true,
                showAnimation: 'fadeIn',
                hideAnimation: 'slideDown',
                autoHideDelay: 5000,
                elementPosition: 'bottom left',
                globalPosition: 'bottom left',
            });
        });
    }
}

// Select Wrapper
function wglSelectWrap() {
    jQuery('select').each(function () {
        var $select = jQuery(this);
        if ($select.hasClass('first-disable')){
            jQuery('option:first-child', $select).attr('disabled',true);
        }
    });
}

function wglButtonAnimation() {
    jQuery('.wgl-button.with-border:not(.load_more_item)').each(function () {
        let $_this = jQuery(this);
        $_this.on('click tap', function(){
            $_this.addClass('animated');
            setTimeout(function(){
                $_this.removeClass('animated');
            },600)
        });
    });
}
