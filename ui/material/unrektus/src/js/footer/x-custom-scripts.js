(function ($) {
  
  var static = $('.noiseBG');
  staticAnimate(static);

  function staticAnimate(object) {
      TweenMax.to(object, .03, {
          backgroundPosition: Math.floor(Math.random() * 100) + 1 + "% " + Math.floor(Math.random() * 10) + 1 + "%", 
          onComplete: staticAnimate,
          onCompleteParams: [object],
          ease:SteppedEase.config(1)
      });
  }

  // Mobile menu toggle
  // $(".mobile-menu-toggle").on("click", function () {
  //   $(this).toggleClass("active");
  //   $(".header-nav").toggleClass("active");

  //   // Animate hamburger icon
  //   if ($(this).hasClass("active")) {
  //     $(this)
  //       .find("span:nth-child(1)")
  //       .css({ transform: "rotate(45deg) translate(5px, 5px)" });
  //     $(this).find("span:nth-child(2)").css({ opacity: "0" });
  //     $(this)
  //       .find("span:nth-child(3)")
  //       .css({ transform: "rotate(-45deg) translate(7px, -7px)" });
  //   } else {
  //     $(this).find("span").css({ transform: "none", opacity: "1" });
  //   }
  // });

  // bg color of header when scrolled
  // let scrollThrottleTimer;
  // $(window).scroll(function () {
  //   if (!scrollThrottleTimer) {
  //     scrollThrottleTimer = setTimeout(function () {
  //       if ($(window).scrollTop() > 1) {
  //         $("header").addClass("scrolled");
  //       } else {
  //         $("header").removeClass("scrolled");
  //       }
  //       scrollThrottleTimer = null;
  //     }, 100); // Throttle to run max once every 100ms
  //   }
  // });

  // Smooth scroll for anchor links

  // Open links
  sitedomain = window.location.hostname;
  siteprotocol = window.location.protocol;
  siteaddress = siteprotocol + "//" + sitedomain;

  $("a").attr({
    rel: "internal",
  });
  $('a[href^="http://"], a[href^="https://"]').attr({
    target: "_blank",
    rel: "external",
  });
  $('a[href^="' + siteaddress + '"]').attr({
    target: "_self",
    rel: "internal",
  });

  // open in new window if external or pdf
  $(
    ".container a[href$='pdf'],.container a[href$='doc'],.container a[href$='docx'],.container a[href$='xls'],.container a[href$='xlsx']"
  ).attr("target", "_blank");


  // Gsap Animations
  gsap.registerPlugin(ScrollTrigger);
  
    if ($(".slideInUp").length) {
      $(
        `.slideInUp, 
        main > div > .wp-block-buttons`
      ).each(function () {
        var triggerEl = $(this);
        let slideInUpTl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerEl,
            start: "top 97%",
            end: "+=500",
            scrub: false,
            toggleActions: "play none none reverse",
            //markers: true,
          },
        });
  
        slideInUpTl.from(triggerEl, {
          duration: 1,
          y: 30,
          autoAlpha: 0,
          ease: "power2.inOut",
        });
      });
    }

  if ($(".slideInRight").length) {
    $(`.slideInRight`).each(function () {
      var triggerEl = $(this);
      let slideInRightTl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          start: "top 95%",
          end: "+=500",
          scrub: false,
          toggleActions: "play none none reverse",
          //markers: true,
        },
      });

      slideInRightTl.from(triggerEl, {
        duration: 1,
        x: 30,
        autoAlpha: 0,
        ease: "power2.inOut",
      });
    });
  }

  if ($(".slideInLeft").length) {
    $(`.slideInLeft`).each(function () {
      var triggerEl = $(this);
      let slideInLeftTl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          start: "top 95%",
          end: "+=500",
          scrub: false,
          toggleActions: "play none none reverse",
          //markers: true,
        },
      });

      slideInLeftTl.from(triggerEl, {
        duration: 1,
        x: -30,
        autoAlpha: 0,
        ease: "power2.inOut",
      });
    });
  }

})(jQuery);
