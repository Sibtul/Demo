(function() {
    var trackNL = function(evtName, props) {
        if (typeof nolimit !== 'undefined' && nolimit.track) {
            if (props) {
                nolimit.track(evtName, props);
            } else {
                nolimit.track(evtName);
            }
        }
        if (typeof heap !== 'undefined' && heap.track) {
            if (props) {
                heap.track(evtName, props);
            } else {
                heap.track(evtName);
            }
        }
    };
    try {
        localStorage.test = 2;
    } catch (e) {
        trackNL("Safari Private Browsing");
    }
    var BrowserDetect = {
        init: function() {
            this.browser = this.searchString(this.dataBrowser) || "Other";
            this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
        },
        searchString: function(data) {
            for (var i = 0; i < data.length; i++) {
                var dataString = data[i].string;
                this.versionSearchString = data[i].subString;
                if (dataString.indexOf(data[i].subString) !== -1) {
                    return data[i].identity;
                }
            }
        },
        searchVersion: function(dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index === -1) {
                return;
            }
            var rv = dataString.indexOf("rv:");
            if (this.versionSearchString === "Trident" && rv !== -1) {
                return parseFloat(dataString.substring(rv + 3));
            } else {
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            }
        },
        dataBrowser: [{
            string: navigator.userAgent,
            subString: "Edge",
            identity: "MS Edge"
        }, {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        }, {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer"
        }, {
            string: navigator.userAgent,
            subString: "Trident",
            identity: "Explorer"
        }, {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        }, {
            string: navigator.userAgent,
            subString: "Safari",
            identity: "Safari"
        }, {
            string: navigator.userAgent,
            subString: "Opera",
            identity: "Opera"
        }]
    };
    var REQUEST_DELAY = 300;
    var $headerSearchPeople = $('#header-search-people')
      , $headerSearchPhone = $('#header-search-phone')
      , $headerSearchEmail = $('#header-search-email')
      , $headerSearchProperty = $('#header-search-property')
      , $addressField = $('#fullAddress')
      , $stateSelects = $('select[name=state]')
      , $yVideo = $('#youtube');
    $(".backToTop").click(function() {
        $('html, body').animate({
            scrollTop: $(".home-search").offset().top
        }, 500);
    });
    $('.home-carousel-indicator').on('click', function() {
        $('.home-carousel-indicator').removeClass('active');
        $(this).addClass('active');
    });
    var initAddress = function() {
        var liveaddress = $.LiveAddress({
            debug: false,
            key: "137296413373292866",
            addresses: [{
                street: $addressField
            }],
            ambiguousMessage: "Choose the exact address",
            invalidMessage: "We did not find that address in our records<br><span class='line_two'>Be sure to include a building number and leave out resident names</span>",
            stateFilter: "AL,AK,AZ,AR,CA,CO,CT,DE,FL,GA,HI,ID,IL,IN,IA,KS,KY,LA,ME,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VT,VA,WA,WV,WI,WY",
            submitVerify: true
        });
        liveaddress.on("AddressWasAmbiguous", function(event, data, previousHandler) {
            previousHandler(event, data);
        });
        liveaddress.on("InvalidAddressRejected", function(event, data, previousHandler) {
            $addressField.focus();
        });
        liveaddress.on("AddressChanged", function(event, data, previousHandler) {
            $addressField.removeClass("success");
            previousHandler(event, data);
        });
        liveaddress.on("AddressAccepted", function(event, data, previousHandler) {
            var chosen = data.response.chosen;
            $addressField.addClass("success");
            $addressField.focus();
            previousHandler(event, data);
        });
    };
    $.validator.addMethod("notEmail", function(value, element) {
        return this.optional(element) || !/^[ a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[ a-zA-Z0-9](?:[ a-zA-Z0-9-]{0,61}[ a-zA-Z0-9])?(?:\.[ a-zA-Z0-9](?:[ a-zA-Z0-9-]{0,61}[ a-zA-Z0-9])?)*$/.test(value);
    }, "Email addresses are not searchable here");
    if ($headerSearchPeople.length !== 0) {
        $headerSearchPeople.validate({
            validClass: "success",
            rules: {
                fn: {
                    required: true,
                    notEmail: true
                },
                ln: {
                    required: true,
                    notEmail: true
                },
            },
            messages: {
                fn: "Please enter a first name",
                ln: "Please enter a last name"
            },
            onkeyup: false,
            onclick: false,
            onsubmit: true,
            submitHandler: function(form) {
                trackNL("Submitted Search Form - People");
                window.setTimeout(function() {
                    form.submit();
                }, REQUEST_DELAY);
            }
        });
    }
    if ($headerSearchPhone.length !== 0) {
        $.validator.addMethod("phoneUS", function(phone_number, element) {
            phone_number = phone_number.replace(/\s+/g, "");
            return this.optional(element) || phone_number.length > 9 && phone_number.match(/^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]([02-9]\d|1[02-9])-?\d{4}$/);
        }, "Please specify a valid phone number");
        $headerSearchPhone.validate({
            validClass: "success",
            rules: {
                "phone": {
                    required: true,
                    phoneUS: true
                }
            },
            messages: {
                phone: "Please enter a phone number. e.g., 2125556789"
            },
            onkeyup: false,
            onclick: false,
            onsubmit: true,
            submitHandler: function(form) {
                trackNL("Submitted Search Form - Phone");
                window.setTimeout(function() {
                    form.submit();
                }, REQUEST_DELAY);
            }
        });
    }
    if ($headerSearchEmail.length !== 0) {
        $headerSearchEmail.validate({
            validClass: "success",
            rules: {
                "emailaddress": {
                    required: true,
                    email: true
                },
            },
            messages: {
                "emailaddress": "Please enter an Email Address"
            },
            onkeyup: false,
            onclick: false,
            onsubmit: true,
            submitHandler: function(form) {
                trackNL("Submitted Search Form - Email");
                window.setTimeout(function() {
                    form.submit();
                }, REQUEST_DELAY);
            }
        });
    }
    if ($headerSearchProperty.length !== 0) {
        $headerSearchProperty.validate({
            rules: {
                $fullAddress: "required"
            },
            messages: {
                address: "Please enter an address"
            },
            onkeyup: false,
            onclick: false,
            onsubmit: true,
            submitHandler: function(form) {
                trackNL("Submitted Search Form - Reverse Property");
                window.setTimeout(function() {
                    form.submit();
                }, REQUEST_DELAY);
            }
        });
    }
    var playVideo = function() {
        $('#youtube').click(function() {
            var video = '<iframe src="' + $(this).attr('data-video') + '"></iframe>';
            $(this).replaceWith(video);
        });
    };
    var scrollAnimation = function() {
        var animateFooter = function() {
            var $s1 = $('#footer .star-one');
            var $s2 = $('#footer .star-two');
            var $s3 = $('#footer .star-three');
            var $s4 = $('#footer .star-four');
            var $s5 = $('#footer .star-five');
            var sequence = [{
                e: $s1,
                p: {
                    opacity: 1
                },
                o: {
                    duration: 300,
                    sequenceQueue: false
                }
            }, {
                e: $s2,
                p: {
                    opacity: 1
                },
                o: {
                    duration: 300
                }
            }, {
                e: $s3,
                p: {
                    opacity: 1
                },
                o: {
                    duration: 300
                }
            }, {
                e: $s4,
                p: {
                    opacity: 1
                },
                o: {
                    duration: 300
                }
            }, {
                e: $s5,
                p: {
                    opacity: 1
                },
                o: {
                    duration: 300
                }
            }];
            $.Velocity.RunSequence(sequence);
        };
        var animateCarla = function() {
            var $c1 = $('.carla-hand');
            var sequence = [{
                e: $c1,
                p: {
                    bottom: "-10px",
                    rotateZ: "80deg",
                    rotateY: "0deg"
                },
                o: {
                    duration: 800
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "55deg"
                },
                o: {
                    duration: 200
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "80deg"
                },
                o: {
                    duration: 200
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "55deg"
                },
                o: {
                    duration: 200
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "80deg"
                },
                o: {
                    duration: 200
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "55deg"
                },
                o: {
                    duration: 200
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "80deg"
                },
                o: {
                    duration: 200
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "55deg"
                },
                o: {
                    duration: 200
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "80deg"
                },
                o: {
                    duration: 200
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "55deg"
                },
                o: {
                    duration: 200
                }
            }, {
                e: $c1,
                p: {
                    rotateZ: "0deg",
                    rotateY: "90deg"
                },
                o: {
                    duration: 600
                }
            }];
            $.Velocity.RunSequence(sequence);
        };
        var footerWaypoint = $('#footer .trigger').waypoint(function(direction) {
            animateFooter();
            var goCarla = _.debounce(animateCarla, 1500, {
                leading: true,
                trailing: false
            });
            $('.carla-box').on('click', goCarla);
            _.delay(goCarla, 1500);
            this.destroy();
        }, {
            offset: 'bottom-in-view'
        });
    };
    var selectState = function(state) {
        if (typeof state === "string" && state !== "") {
            state = state.toUpperCase();
        } else {
            state = "All";
        }
        var $opt = $stateSelects.find("option[value=" + state + "]");
        $opt.attr("selected", "selected");
    };
    var findStateByIP = function() {
        $.ajax({
            type: "GET",
            url: "https://www.beenverified.com/internal/api/state_for_ip",
            dataType: "json",
            success: function(data, textStatus) {
                selectState(data['state']);
            }
        });
    };
    $('.home-carousel-indicator').on('click', function() {
        $('.home-carousel-indicator').removeClass('active');
        $(this).addClass('active');
    });
    $(".backToTop").click(function() {
        $('html, body').animate({
            scrollTop: $(".home-search").offset().top
        }, 500);
    });
    var expandPeopleSearch = function() {
        $('#header-search-people button').unbind('click');
        $('.xs-search').removeClass('hidden-xs').hide(0, function() {
            $('#fn').attr('placeholder', 'First Name');
            $('.xs-search').slideDown('400', function() {
                $(this).addClass('visible-xs');
                $('#fn').focus();
            });
        });
    };
    var setupMobileSearch = function() {
        if ($(window).width() < 767) {
            $('#fn').attr('placeholder', 'Enter a Name');
            $('#fn').removeClass('focus-me');
            $('#fn').blur();
            $('#header-search-people button').on('click', function(evt) {
                evt.preventDefault();
                expandPeopleSearch();
            });
            $('#fn').on('click', function() {
                expandPeopleSearch();
            });
        } else {
            $('#fn').focus();
            $('.xs-search').addClass('hidden-xs').removeClass('visible-xs');
            $('.xs-search').show();
            $('#header-search-people button').unbind('click');
            $('#fn').unbind('click');
            $('#fn').attr('placeholder', 'First Name');
        }
    };

    var InlineVideo = function (settings) {
        if (settings.element.length === 0) {
          return;
        }
        this.init(settings);
      };
    
      InlineVideo.prototype.init = function (settings) {
        this.$element = $(settings.element);
        this.settings = settings;
        this.videoDetails = this.getVideoDetails();
    
        $(this.settings.closeTrigger).hide();
        this.setFluidContainer();
        this.bindUIActions();
    
        if (this.videoDetails.teaser && Modernizr.video && !Modernizr.touch) {
          this.appendTeaserVideo();
        }
      };
    
      InlineVideo.prototype.bindUIActions = function () {
        var that = this;
        $(this.settings.playTrigger).on('click', function (e) {
          e.preventDefault();
          if (!Modernizr.video || (BrowserDetect.browser === 'Explorer' && BrowserDetect.version <= 11)) {
            $('#video-modal').on('shown.bs.modal', function (e) {
              $("#vimeoplayer").vimeo("play");
            });
            $('#video-modal').modal('show');
            $('#video-modal').on('hide.bs.modal', function (e) {
              $("#vimeoplayer").vimeo("pause");
            });
          } else {
            that.animateOpen();
            that.appendIframe();
          }
        });
        $(this.settings.closeTrigger).on('click', function (e) {
          e.preventDefault();
          that.animateClosed();
          that.removeIframe();
        });
      };
    
      InlineVideo.prototype.animateOpen = function () {
        var that = this;
        $('#timeline').removeClass('slant').addClass('no-slant');
      };
    
      InlineVideo.prototype.animateClosed = function () {
        var that = this;
        $('#timeline').removeClass('no-slant').addClass('slant');
      };
    
      InlineVideo.prototype.appendIframe = function () {
        var html = '<iframe id="inline-video__video-element" src="' + this.videoDetails.videoURL + '?title=0&amp;byline=0&amp;portrait=0&amp;color=3d96d2&autoplay=1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
        // YOUTUBE ?rel=0&amp;hd=1&autohide=1&showinfo=0&autoplay=1&enablejsapi=1&origin=*
        // VIMEO http://player.vimeo.com/video/'+videoDetails.id+'?title=0&amp;byline=0&amp;portrait=0&amp;color=3d96d2&autoplay=1
        $(this.settings.playTrigger).fadeOut();
        $(this.settings.closeTrigger).fadeIn();
        this.$element.append(html);
      };
    
      InlineVideo.prototype.removeIframe = function () {
        $(this.settings.playTrigger).fadeIn();
        $(this.settings.closeTrigger).fadeOut();
        this.$element.find('#inline-video__video-element').remove();
      };
    
      InlineVideo.prototype.appendTeaserVideo = function () {
        var source = this.videoDetails.teaser;
        var html = '<video autoplay="true" loop="true" muted id="inline-video__teaser-video" class="inline-video__teaser-video"><source src="' + source + '.webm" type="video/mp4"><source src="' + source + '.mp4" type="video/mp4"></video>';
        this.$element.append(html);
      };
    
      InlineVideo.prototype.setFluidContainer = function () {
        var element = this.$element;
        element.data('aspectRatio', this.videoDetails.videoHeight / this.videoDetails.videoWidth);
    
        $(window).resize(function () {
          var windowWidth = $(window).width();
          var windowHeight = $(window).height();
    
          element.width(Math.ceil(windowWidth));
          element.height(Math.ceil(windowWidth * element.data('aspectRatio'))); //Set the videos aspect ratio, see https://css-tricks.com/fluid-width-youtube-videos/
    
          if (windowHeight < element.height()) {
            element.width(Math.ceil(windowWidth));
            element.height(Math.ceil(windowHeight));
          }
        }).trigger('resize');
      };
    
      InlineVideo.prototype.getVideoDetails = function () {
        var mediaElement = $(this.settings.media);
    
        return {
          videoURL: mediaElement.attr('data-video-URL'),
          teaser: mediaElement.attr('data-teaser'),
          videoHeight: mediaElement.attr('data-video-height'),
          videoWidth: mediaElement.attr('data-video-width')
        };
      };
    
      var initVideo = function () {
        $('.inline-video').each(function (i, elem) {
          var inlineVideo = new InlineVideo({
            element: elem,
            media: '.inline-video__media',
            playTrigger: '.inline-video__play-trigger',
            closeTrigger: '.inline-video__close-trigger'
          });
        });
      };

    var setReadMoreEvent = function () {
      $('.read-more').on('click', function (e) {
        e.preventDefault();

        var $content = $(this).closest('.testimonial-description');
        var $ellipsis = $content.find('.ellipsis');
        var $extraContent = $content.find('.extra-content');

        // var $content = $(this).parent().siblings();

        if ($ellipsis.hasClass('show')) {
          $ellipsis.removeClass('show');
          $extraContent.addClass('show');
          $(this).text('Close');
        } else {
          $ellipsis.addClass('show');
          $extraContent.removeClass('show');
          $(this).text('Read More');
        }
      });
    }

    var init = function() {
        BrowserDetect.init();
        $.slidebars({
            siteClose: true,
            hideControlClasses: true,
            scrollLock: true
        });
        scrollAnimation();
        setReadMoreEvent();
        initVideo();
        findStateByIP();
        $('.carousel').carousel();
        $('.carousel').on('slid.bs.carousel', function(evt) {
            if (($('.carousel div.active').index() + 1) === 4) {
                initAddress();
            }
        });
        $('a.smarty-popup-close').html('<span class="glyphicon glyphicon-remove-circle"></span>');
        setupMobileSearch();
        $(window).on('resize', _.debounce(setupMobileSearch, 150, {
            'leading': false,
            'trailing': true
        }));
        $('.focus-me').focus();
        $('.tooltipThis').tooltip();
        $("#page-menu-sidebar a.list-group-item[href$='/" + location.pathname.replace(/\/$/, "").split('/').pop() + "/']").addClass('active');
        $('#navCollapse').on('hidden.bs.collapse', function() {
            $('#nav-icon-closed').show();
            $('#nav-icon-open').hide();
        });
        $('#navCollapse').on('shown.bs.collapse', function() {
            $('#nav-icon-closed').hide();
            $('#nav-icon-open').show();
        });
        if ($yVideo.length !== 0) {
            playVideo();
        }
        ;$(window).scroll(function() {
            var wtop = parseInt($(window).scrollTop());
            $("#header").css('top', wtop + 'px');
        });
    };
    init();
}());
