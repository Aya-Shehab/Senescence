(function($) {
	
	"use strict";
	
	//Hide Loading Box (Preloader)
	function handlePreloader() {
		if($('.loader-wrap').length){
			$('.loader-wrap').delay(1000).fadeOut(500);
		}
	}

	if ($(".preloader-close").length) {
        $(".preloader-close").on("click", function(){
            $('.loader-wrap').delay(200).fadeOut(500);
        })
    }

	
	
	//Update Header Style and Scroll to Top
	function headerStyle() {
		if($('.main-header').length){
			var windowpos = $(window).scrollTop();
			var siteHeader = $('.main-header');
			var scrollLink = $('.scroll-top');
			if (windowpos >= 110) {
				siteHeader.addClass('fixed-header');
				scrollLink.addClass('open');
				// Force black text color for sticky header
				$('.sticky-header .main-menu .navigation > li > a').css('color', '#000');
				$('.sticky-header .menu-right-content .search-box-btn').css('color', '#000');
				$('.sticky-header .menu-right-content .cart-btn a').css('color', '#000');
				$('.sticky-header .menu-right-content .user-btn a').css('color', '#000');
				$('.sticky-header .menu-right-content .cart-btn a span').css('color', '#000');
				$('.sticky-header .menu-right-content .user-btn a span').css('color', '#000');
			} else {
				siteHeader.removeClass('fixed-header');
				scrollLink.removeClass('open');
			}
		}
	}
	
	headerStyle();
	$(window).on('scroll', function() {
		headerStyle();
	});


	//Submenu Dropdown Toggle
	if($('.main-header li.dropdown ul').length){
		$('.main-header .navigation li.dropdown').append('<div class="dropdown-btn"><span class="fas fa-angle-down"></span></div>');
		
	}

	//Mobile Nav Hide Show
	if($('.mobile-menu').length){
		
		$('.mobile-menu .menu-box').mCustomScrollbar();
		
		var mobileMenuContent = $('.main-header .menu-area .main-menu').html();
		$('.mobile-menu .menu-box .menu-outer').append(mobileMenuContent);
		$('.sticky-header .main-menu').append(mobileMenuContent);
		
		//Dropdown Button
		$('.mobile-menu li.dropdown .dropdown-btn').on('click', function() {
			$(this).toggleClass('open');
			$(this).prev('ul').slideToggle(500);
		});
		//Dropdown Button
		$('.mobile-menu li.dropdown .dropdown-btn').on('click', function() {
			$(this).prev('.megamenu').slideToggle(900);
		});
		//Menu Toggle Btn
		$('.mobile-nav-toggler').on('click', function() {
			$('body').addClass('mobile-menu-visible');
		});

		//Menu Toggle Btn
		$('.mobile-menu .menu-backdrop,.mobile-menu .close-btn').on('click', function() {
			$('body').removeClass('mobile-menu-visible');
		});
	}


	// Scroll to a Specific Div
	if($('.scroll-to-target').length){
		$(".scroll-to-target").on('click', function() {
			var target = $(this).attr('data-target');
		   // animate
		   $('html, body').animate({
			   scrollTop: $(target).offset().top
			 }, 1000);
	
		});
	}

	// Elements Animation
	if($('.wow').length){
		var wow = new WOW({
		mobile:       false
		});
		wow.init();
	}
////////////////////////////////////////////////////////////////////////
	//Contact Form Validation
	if($('#contact-form').length){
		$('#contact-form').validate({
			rules: {
				username: {
					required: true
				},
				email: {
					required: true,
					email: true
				},
				phone: {
					required: true
				},
				subject: {
					required: true
				},
				message: {
					required: true
				}
			},
			messages: {
				username: {
					required: "Please enter your name"
				},
				email: {
					required: "Please enter your email address",
					email: "Please enter a valid email address"
				},
				phone: {
					required: "Please enter your phone number"
				},
				subject: {
					required: "Please enter a subject"
				},
				message: {
					required: "Please enter your message"
				}
			}
		});
	}

	//Fact Counter + Text Count
	if($('.count-box').length){
		$('.count-box').appear(function(){
	
			var $t = $(this),
				n = $t.find(".count-text").attr("data-stop"),
				r = parseInt($t.find(".count-text").attr("data-speed"), 10);
				
			if (!$t.hasClass("counted")) {
				$t.addClass("counted");
				$({
					countNum: $t.find(".count-text").text()
				}).animate({
					countNum: n
				}, {
					duration: r,
					easing: "linear",
					step: function() {
						$t.find(".count-text").text(Math.floor(this.countNum));
					},
					complete: function() {
						$t.find(".count-text").text(this.countNum);
					}
				});
			}
			
		},{accY: 0});
	}


	//LightBox / Fancybox
	if($('.lightbox-image').length) {
		$('.lightbox-image').fancybox({
			openEffect  : 'fade',
			closeEffect : 'fade',
			helpers : {
				media : {}
			}
		});
	}


	//Tabs Box
	if($('.tabs-box').length){
		$('.tabs-box .tab-buttons .tab-btn').on('click', function(e) {
			e.preventDefault();
			var target = $($(this).attr('data-tab'));
			
			if ($(target).is(':visible')){
				return false;
			}else{
				target.parents('.tabs-box').find('.tab-buttons').find('.tab-btn').removeClass('active-btn');
				$(this).addClass('active-btn');
				target.parents('.tabs-box').find('.tabs-content').find('.tab').fadeOut(0);
				target.parents('.tabs-box').find('.tabs-content').find('.tab').removeClass('active-tab');
				$(target).fadeIn(300);
				$(target).addClass('active-tab');
			}
		});
	}



	//Accordion Box
	if($('.accordion-box').length){
		$(".accordion-box").on('click', '.acc-btn', function() {
			
			var outerBox = $(this).parents('.accordion-box');
			var target = $(this).parents('.accordion');
			
			if($(this).hasClass('active')!==true){
				$(outerBox).find('.accordion .acc-btn').removeClass('active');
			}
			
			if ($(this).next('.acc-content').is(':visible')){
				return false;
			}else{
				$(this).addClass('active');
				$(outerBox).children('.accordion').removeClass('active-block');
				$(outerBox).find('.accordion').children('.acc-content').slideUp(300);
				target.addClass('active-block');
				$(this).next('.acc-content').slideDown(300);	
			}
		});	
	}


	// banner-carousel
	if ($('.banner-carousel').length) {
        $('.banner-carousel').owlCarousel({
            loop:true,
			margin:0,
			nav:true,
			animateOut: 'fadeOut',
    		animateIn: 'fadeIn',
    		active: true,
			smartSpeed: 1000,
			autoplay: 6000,
            navText: [ '<span class="icon-Arrow-Left"></span>', '<span class="icon-Arrow-Right"></span>' ],
            responsive:{
                0:{
                    items:1
                },
                600:{
                    items:1
                },
                800:{
                    items:1
                },
                1024:{
                    items:1
                }
            }
        });
    }


    //three-item-carousel
	if ($('.three-item-carousel').length) {
		$('.three-item-carousel').owlCarousel({
			loop:true,
			margin:30,
			nav:true,
			smartSpeed: 500,
			autoplay: 1000,
			navText: [ '<span class="icon-Arrow-Left"></span>', '<span class="icon-Arrow-Right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				480:{
					items:1
				},
				600:{
					items:2
				},
				800:{
					items:2
				},
				1024:{
					items:3
				}
			}
		});    		
	}


	 //project-carousel
	if ($('.project-carousel').length) {
		$('.project-carousel').owlCarousel({
			loop:true,
			margin:0,
			nav:true,
			smartSpeed: 500,
			autoplay: 1000,
			navText: [ '<span class="icon-Arrow-Left"></span>', '<span class="icon-Arrow-Right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				480:{
					items:1
				},
				600:{
					items:2
				},
				800:{
					items:2
				},
				1024:{
					items:3
				}
			}
		});    		
	}


	// Four Item Carousel
	if ($('.four-item-carousel').length) {
		$('.four-item-carousel').owlCarousel({
			loop:true,
			margin:30,
			nav:true,
			smartSpeed: 500,
			autoplay: 1000,
			navText: [ '<span class="icon-Arrow-Left"></span>', '<span class="icon-Arrow-Right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				600:{
					items:2
				},
				800:{
					items:3
				},
				1024:{
					items:3
				},
				1200:{
					items:4
				}
			}
		});    		
	}


	// single-item-carousel
	if ($('.single-item-carousel').length) {
		$('.single-item-carousel').owlCarousel({
			loop:true,
			margin:30,
			nav:false,
			smartSpeed: 3000,
			autoplay: true,
			navText: [ '<span class="icon-Arrow-Left"></span>', '<span class="icon-Arrow-Right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				480:{
					items:1
				},
				600:{
					items:1
				},
				800:{
					items:1
				},			
				1200:{
					items:1
				}

			}
		});    		
	}


	// clients-carousel
	if ($('.clients-carousel').length) {
		$('.clients-carousel').owlCarousel({
			loop:true,
			margin:30,
			nav:false,
			smartSpeed: 3000,
			autoplay: true,
			navText: [ '<span class="icon-Arrow-Left"></span>', '<span class="icon-Arrow-Right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				480:{
					items:2
				},
				600:{
					items:3
				},
				800:{
					items:5
				},			
				1200:{
					items:6
				}

			}
		});    		
	}


	//Product Tabs
	if($('.project-tab').length){
		$('.project-tab .project-tab-btns .p-tab-btn').on('click', function(e) {
			e.preventDefault();
			var target = $($(this).attr('data-tab'));
			
			if ($(target).hasClass('actve-tab')){
				return false;
			}else{
				$('.project-tab .project-tab-btns .p-tab-btn').removeClass('active-btn');
				$(this).addClass('active-btn');
				$('.project-tab .p-tabs-content .p-tab').removeClass('active-tab');
				$(target).addClass('active-tab');
			}
		});
	}


	//Add One Page nav
	if($('.scroll-nav').length) {
		$('.scroll-nav').onePageNav();
	}


	//Sortable Masonary with Filters
	function enableMasonry() {
		if($('.sortable-masonry').length){
	
			var winDow = $(window);
			// Needed variables
			var $container=$('.sortable-masonry .items-container');
			var $filter=$('.filter-btns');
	
			$container.isotope({
				filter:'*',
				 masonry: {
					columnWidth : '.masonry-item.small-column'
				 },
				animationOptions:{
					duration:500,
					easing:'linear'
				}
			});
			
	
			// Isotope Filter 
			$filter.find('li').on('click', function(){
				var selector = $(this).attr('data-filter');
	
				try {
					$container.isotope({ 
						filter	: selector,
						animationOptions: {
							duration: 500,
							easing	: 'linear',
							queue	: false
						}
					});
				} catch(err) {
	
				}
				return false;
			});
	
	
			winDow.on('resize', function(){
				var selector = $filter.find('li.active').attr('data-filter');

				$container.isotope({ 
					filter	: selector,
					animationOptions: {
						duration: 500,
						easing	: 'linear',
						queue	: false
					}
				});
			});
	
	
			var filterItemA	= $('.filter-btns li');
	
			filterItemA.on('click', function(){
				var $this = $(this);
				if ( !$this.hasClass('active')) {
					filterItemA.removeClass('active');
					$this.addClass('active');
				}
			});
		}
	}
	
	enableMasonry();


    // Progress Bar
	if ($('.count-bar').length) {
		$('.count-bar').appear(function(){
			var el = $(this);
			var percent = el.data('percent');
			$(el).css('width',percent).addClass('counted');
		},{accY: -50});

	}


	$(document).ready(function() {
      $('select:not(.ignore)').niceSelect();
    });


	// page direction
	function directionswitch() {
	  	if ($('.page_direction').length) {

	    	$('.direction_switch button').on('click', function() {
			   $('body').toggleClass(function(){
			      return $(this).is('.rtl, .ltr') ? 'rtl ltr' : 'rtl';
			  })
			});
	  	};
	}


	//Price Range Slider
	if($('.price-range-slider').length){
		$( ".price-range-slider" ).slider({
			range: true,
			min: 0,
			max: 999,
			values: [ 0, 550 ],
			slide: function( event, ui ) {
			$( "input.property-amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			}
		});
		
		$( "input.property-amount" ).val( $( ".price-range-slider" ).slider( "values", 0 ) + " - $" + $( ".price-range-slider" ).slider( "values", 1 ) );	
	}


	if ($('.product-details-content .bxslider').length) {
		$('.product-details-content .bxslider').bxSlider({
	        nextSelector: '.product-details-content #slider-next',
	        prevSelector: '.product-details-content #slider-prev',
	        nextText: '<i class="fa fa-angle-right"></i>',
	        prevText: '<i class="fa fa-angle-left"></i>',
	        mode: 'fade',
	        auto: 'true',
	        speed: '700',
	        pagerCustom: '.product-details-content .slider-pager .thumb-box'
	    });
	}; 


	//Jquery Spinner / Quantity Spinner
	if($('.quantity-spinner').length){
		$("input.quantity-spinner").TouchSpin({
		  verticalbuttons: true
		});
	}


	if ($('.banner-carousel-2').length) {
        var testimonialsTwoThumbCarousel = new Swiper('.banner-carousel-2', {
            slidesPerView: 1,
            spaceBetween: 0,
            mousewheel: true,
            speed: 1400,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
            loop: true,
            autoplay: {
                delay: 5000,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.banner-slider-button-next',
                prevEl: '.banner-slider-button-prev',
            },
        });
    }



	/*	=========================================================================
	When document is Scrollig, do
	========================================================================== */

	jQuery(document).on('ready', function () {
		(function ($) {
			// add your functions
			directionswitch();
		})(jQuery);
	});



	/* ==========================================================================
   When document is Scrollig, do
   ========================================================================== */
	
	$(window).on('scroll', function() {
		headerStyle();
	});

	
	
	/* ==========================================================================
   When document is loaded, do
   ========================================================================== */
	
	$(window).on('load', function() {
		handlePreloader();
		enableMasonry();
	});

	

	$(document).ready(function() {
        // Handle sorting functionality with AJAX
        $('#sort-select').on('change', function() {
            const sortBy = $(this).val();
            const currentUrl = new URL(window.location.href);
            const currentCategory = currentUrl.searchParams.get('category');

            let newUrl = '/shop';
            const params = new URLSearchParams();

            if (currentCategory) {
                params.append('category', currentCategory);
            }
            if (sortBy && sortBy !== 'featured') { // 'featured' is default, no need to add param
                params.append('sort', sortBy);
            }

            const queryString = params.toString();
            if (queryString) {
                newUrl += '?' + queryString;
            }

            // Update URL without full page reload
            history.pushState({}, '', newUrl);

            fetchProducts(newUrl); // Fetch products via AJAX
        });

        function fetchProducts(url) {
            $.ajax({
                url: url,
                method: 'GET',
                success: function(response) {
                    // Assuming the response is the full HTML of the shop-products page
                    // We need to extract only the product list section
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response, 'text/html');
                    const newProductListHtml = $(doc).find('#product-list-container').html();

                    // Before replacing content, get current sort value to preserve it
                    const currentSortValue = $('#sort-select').val();

                    $('#product-list-container').html(newProductListHtml);

                    // Reinitialize nice-select for the sort dropdown
                    // Check if nice-select was already initialized on this element
                    if ($('#sort-select').hasClass('has-nice-select')) {
                        $('#sort-select').niceSelect('destroy'); // Destroy existing instance
                    }
                    $('#sort-select').niceSelect(); // Reinitialize

                    // Set the value back after reinitialization
                    $('#sort-select').val(currentSortValue);
                    $('#sort-select').niceSelect('update'); // Update the nice-select display

                },
                error: function(xhr, status, error) {
                    console.error('Error fetching products:', error);
                    // Optionally, show an error message to the user
                }
            });
        }

        // Initial fetch to set up the page based on current URL (if reloaded)
        const initialUrl = new URL(window.location.href);
        // Check if there's a sort parameter in the URL on initial load and set the select box
        const initialSort = initialUrl.searchParams.get('sort');
        if (initialSort) {
            $('#sort-select').val(initialSort);
            if ($('.nice-select').length) {
                $('#sort-select').niceSelect('update');
            }
        }
    });





	//Jquery Pretty Photo
	$("a[data-rel^='prettyPhoto']").prettyPhoto({
		animation_speed:'normal',
		theme:'light_square',
		slideshow:3000,
		autoplay_slideshow: false,
		facebook:false,
		deeplinking:false
	});

	
	/*	When this line is executed, the DOM is not yet ready.
		This is likely causing issues for plugins that need the DOM to be fully loaded.
		Move functions that interact with the DOM inside a $(document).ready() block.
	*/

	// Scroll to a Specific Div
	if($('.scroll-to-target').length){
		$(".scroll-to-target").on('click', function() {
			var target = $(this).attr('data-target');
		   // animate
		   $('html, body').animate({
			   scrollTop: $(target).offset().top
			 }, 1000);
	
		});
	}

	// Elements Animation
	if($('.wow').length){
		var wow = new WOW({
		mobile:       false
		});
		wow.init();
	}




	/* ========================================================================== */
	/*                   cart-btn in shop-products ejs                          */
	/* ========================================================================== */


	function addToCart(product) {
		fetch('/api/v1/cart', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(product),
		})
		.then(response => {
			if (!response.ok) {
				// If the response is not OK, it might be a server error or a validation error.
				// Try to parse the error message from the response body.
				return response.json().then(err => {
					throw new Error(err.message || 'Failed to add to cart');
				});
			}
			return response.json();
		})
		.then(data => {
			if (data.success) {
				showNotification('success', data.message);
				updateCartUI(); // Update cart icon/count on success
			} else {
				showNotification('error', data.message);
			}
		})
		.catch(error => {
			console.error('Error adding to cart:', error);
			showNotification('error', error.message || 'An error occurred.');
		});
	}


	// Update cart UI function (dummy for now)
	function updateCartUI() {
		// This function would typically fetch the latest cart quantity
		// and update the cart icon/count in the header.
		console.log("Cart UI updated.");
		// Example: Fetch new cart quantity from API
		fetch('/api/v1/cart/quantity')
		.then(response => response.json())
		.then(data => {
			if(data.success && data.quantity !== undefined) {
				$('#cart-item-count').text(data.quantity);
			}
		})
		.catch(error => console.error('Error updating cart quantity:', error));
	}




	// Call updateCartUI on page load to set initial cart count
	// updateCartUI();


})(jQuery);