(function() {
    var trackNL = function(evtName, props) {
      if (typeof nolimit !== "undefined" && nolimit.track) {
        if (props) {
          nolimit.track(evtName, props);
        } else {
          nolimit.track(evtName);
        }
      }
      if (typeof heap !== "undefined" && heap.track) {
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
    var $headerSearchPeople = $("#header-search-people"),
      $headerSearchPhone = $("#header-search-phone"),
      $headerSearchEmail = $("#header-search-email"),
      $headerSearchProperty = $("#header-search-property"),
      $addressField = $("#fullAddress");
    // $.ajax({
    //   url: "https://www.beenverified.com/stats/report_count.json",
    //   dataType: "json",
    //   success: function(data) {
    //     jCounter({
    //       startCount: data.startCount,
    //       slope: data.slope,
    //       afterUpdateCallback: function(currentCount) {
    //         count = currentCount + "";
    //         count_items = count.padWithZeros(8).split("");
    //         for (i = 0; i < count_items.length; i++) {
    //           $("#tick_" + i).html(count_items[i]);
    //         }
    //       }
    //     }).countIt();
    //   }
    // });
    var autoPlayYouTubeModal = function() {
      var trigger = $("body").find('[data-toggle="modal"]');
      trigger.click(function(e) {
        e.preventDefault();
        var theModal = $(this).data("target"),
          videoSRC = $(this).attr("data-theVideo"),
          videoSRCauto = videoSRC + "?autoplay=1";
        $(theModal + " iframe").attr("src", videoSRCauto);
        $(theModal).on("hide.bs.modal", function(e) {
          $(theModal + " iframe").attr("src", videoSRC);
        });
      });
    };
    $(".backToTop").click(function() {
      $("html, body").animate({
        scrollTop: $(".home-search").offset().top
      }, 500);
    });
    $(".home-carousel-indicator").on("click", function() {
      $(".home-carousel-indicator").removeClass("active");
      $(this).addClass("active");
    });

    $firstNameInput = $("#fn");
    $lastNameInput = $("#ln");
    var checkRemover = function(inputField) {
      if (inputField.val() === "" && inputField.hasClass("success")) {
        inputField.removeClass("success");
      }
    };
    $firstNameInput.on("change", function() {
      checkRemover($firstNameInput);
    });
    $lastNameInput.on("change", function() {
      checkRemover($lastNameInput);
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
        amplify.store("propertySearchData", {
          address: chosen.delivery_line_1 + " " + chosen.last_line,
          street: chosen.delivery_line_1 || "",
          last_line: chosen.last_line || "",
          city: chosen.components.city_name || "",
          state: chosen.components.state_abbreviation || "",
          unit: chosen.components.secondary_number || "",
          zip5: chosen.components.zipcode || "",
          zip4: chosen.components.plus4_code || ""
        });
        amplify.store("propertyCurrentRecord", {
          _framerida_click: "store propertyCurrentRecord",
          _framerida_mapped: "TeaserRecord",
          parcel_address: {
            address: chosen.delivery_line_1 + " " + chosen.last_line,
            full: chosen.delivery_line_1 || "",
            parts: {
              carrier_route: chosen.metadata.carrier_route || "",
              city: chosen.components.city_name || "",
              house_number: chosen.components.primary_number || "",
              post_direction: chosen.components.street_postdirection || "",
              pre_direction: chosen.components.street_predirection || "",
              state: chosen.components.state_abbreviation || "",
              street_name: chosen.components.street_name || "",
              street_type: chosen.components.street_suffix || "",
              unit: chosen.components.secondary_number || "",
              zip: chosen.components.zipcode || "",
              zip4: chosen.components.plus4_code || ""
            }
          }
        });
        $addressField.addClass("success");
        $addressField.focus();
        previousHandler(event, data);
      });
    };
    var removeDiacritics = function(str) {
      var defaultDiacriticsRemovalMap = [{
        base: "A",
        letters: /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g
      }, {
        base: "AA",
        letters: /[\uA732]/g
      }, {
        base: "AE",
        letters: /[\u00C6\u01FC\u01E2]/g
      }, {
        base: "AO",
        letters: /[\uA734]/g
      }, {
        base: "AU",
        letters: /[\uA736]/g
      }, {
        base: "AV",
        letters: /[\uA738\uA73A]/g
      }, {
        base: "AY",
        letters: /[\uA73C]/g
      }, {
        base: "B",
        letters: /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g
      }, {
        base: "C",
        letters: /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g
      }, {
        base: "D",
        letters: /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g
      }, {
        base: "DZ",
        letters: /[\u01F1\u01C4]/g
      }, {
        base: "Dz",
        letters: /[\u01F2\u01C5]/g
      }, {
        base: "E",
        letters: /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g
      }, {
        base: "F",
        letters: /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g
      }, {
        base: "G",
        letters: /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g
      }, {
        base: "H",
        letters: /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g
      }, {
        base: "I",
        letters: /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g
      }, {
        base: "J",
        letters: /[\u004A\u24BF\uFF2A\u0134\u0248]/g
      }, {
        base: "K",
        letters: /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g
      }, {
        base: "L",
        letters: /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g
      }, {
        base: "LJ",
        letters: /[\u01C7]/g
      }, {
        base: "Lj",
        letters: /[\u01C8]/g
      }, {
        base: "M",
        letters: /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g
      }, {
        base: "N",
        letters: /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g
      }, {
        base: "NJ",
        letters: /[\u01CA]/g
      }, {
        base: "Nj",
        letters: /[\u01CB]/g
      }, {
        base: "O",
        letters: /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g
      }, {
        base: "OI",
        letters: /[\u01A2]/g
      }, {
        base: "OO",
        letters: /[\uA74E]/g
      }, {
        base: "OU",
        letters: /[\u0222]/g
      }, {
        base: "P",
        letters: /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g
      }, {
        base: "Q",
        letters: /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g
      }, {
        base: "R",
        letters: /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g
      }, {
        base: "S",
        letters: /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g
      }, {
        base: "T",
        letters: /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g
      }, {
        base: "TZ",
        letters: /[\uA728]/g
      }, {
        base: "U",
        letters: /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g
      }, {
        base: "V",
        letters: /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g
      }, {
        base: "VY",
        letters: /[\uA760]/g
      }, {
        base: "W",
        letters: /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g
      }, {
        base: "X",
        letters: /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g
      }, {
        base: "Y",
        letters: /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g
      }, {
        base: "Z",
        letters: /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g
      }, {
        base: "a",
        letters: /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g
      }, {
        base: "aa",
        letters: /[\uA733]/g
      }, {
        base: "ae",
        letters: /[\u00E6\u01FD\u01E3]/g
      }, {
        base: "ao",
        letters: /[\uA735]/g
      }, {
        base: "au",
        letters: /[\uA737]/g
      }, {
        base: "av",
        letters: /[\uA739\uA73B]/g
      }, {
        base: "ay",
        letters: /[\uA73D]/g
      }, {
        base: "b",
        letters: /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g
      }, {
        base: "c",
        letters: /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g
      }, {
        base: "d",
        letters: /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g
      }, {
        base: "dz",
        letters: /[\u01F3\u01C6]/g
      }, {
        base: "e",
        letters: /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g
      }, {
        base: "f",
        letters: /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g
      }, {
        base: "g",
        letters: /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g
      }, {
        base: "h",
        letters: /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g
      }, {
        base: "hv",
        letters: /[\u0195]/g
      }, {
        base: "i",
        letters: /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g
      }, {
        base: "j",
        letters: /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g
      }, {
        base: "k",
        letters: /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g
      }, {
        base: "l",
        letters: /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g
      }, {
        base: "lj",
        letters: /[\u01C9]/g
      }, {
        base: "m",
        letters: /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g
      }, {
        base: "n",
        letters: /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g
      }, {
        base: "nj",
        letters: /[\u01CC]/g
      }, {
        base: "o",
        letters: /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g
      }, {
        base: "oi",
        letters: /[\u01A3]/g
      }, {
        base: "ou",
        letters: /[\u0223]/g
      }, {
        base: "oo",
        letters: /[\uA74F]/g
      }, {
        base: "p",
        letters: /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g
      }, {
        base: "q",
        letters: /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g
      }, {
        base: "r",
        letters: /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g
      }, {
        base: "s",
        letters: /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g
      }, {
        base: "t",
        letters: /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g
      }, {
        base: "tz",
        letters: /[\uA729]/g
      }, {
        base: "u",
        letters: /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g
      }, {
        base: "v",
        letters: /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g
      }, {
        base: "vy",
        letters: /[\uA761]/g
      }, {
        base: "w",
        letters: /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g
      }, {
        base: "x",
        letters: /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g
      }, {
        base: "y",
        letters: /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g
      }, {
        base: "z",
        letters: /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g
      }];
      for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
        str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
      }
      return str;
    };
    var cleanSearchValues = function(mapval) {
      var pattern = new RegExp("[^A-Za-z'-s]", "gi");
      return removeDiacritics(mapval);
    };
    var parseMiddleInitial = function(data) {
      var parsed_mi = data.fn.match(/^.*\s([A-Za-z])$/);
      if (parsed_mi) {
        if (!data.mi || data.mi.length === 0) {
          data.mi = parsed_mi[1];
        }
        data.fn = data.fn.replace(/\s[A-Za-z]$/, "").replace(/\s+/g, "");
      } else {
        data.fn = data.fn.replace(/\s+/g, "");
      }
      return data;
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
            dataArray = $(form).serializeArray();
            var formVals = {};
            _.forEach(dataArray, function(v, k) {
              formVals[v.name] = v.value;
            });
            var data = _.mapValues(formVals, cleanSearchValues);
            data = parseMiddleInitial(data);
            window.location.href = $(form).attr("action") + "?" + $.param(data);
          }, REQUEST_DELAY);
        }
      });
    }
    if ($headerSearchPhone.length !== 0) {
      $.validator.addMethod("phoneUS", function(phone_number, element) {
          phone_number=phone_number.replace(/\s+/g, "");
          return this.optional(element)||phone_number.length>9&&phone_number.match(/^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]([02-9]\d|1[02-9])-?\d {4}$/);
      }
      , "Please specify a valid phone number");
    $headerSearchPhone.validate({
      validClass: "success",
      rules: {
        phone: {
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
        emailaddress: {
          required: true,
          email: true
        }
      },
      messages: {
        emailaddress: "Please enter an Email Address"
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
  $(".testimonial-photo").on("click", function() {
    $(".testimonial-photo").removeClass("active");
    $(this).addClass("active");
  }); $(".testi-press").on("click", function() {
    $(".testi-press").removeClass("active");
    $(this).addClass("active");
  });
  var scrollAnimation = function() {
    var animateShimmer = function() {
      var $s1 = $("#home-search-carousel.search-form");
      var $b1 = $(".carousel-inner .item .btn-search");
      var sequence = [{
        e: $s1,
        p: {
          backgroundPositionX: 0
        },
        o: {
          delay: 600,
          duration: 3600,
          easing: "easeInCubic"
        }
      }];
      $.Velocity.RunSequence(sequence);
      _.delay(function() {
        $b1.velocity({
          backgroundColor: "#72c23f"
        }, {
          duration: 800,
          loop: true
        });
      }, 3300);
    };
    var shimmerWaypoint = $(".home-search .trigger").waypoint(function(direction) {
      animateShimmer();
      this.destroy();
    }, {
      offset: "60%"
    });
    $("#background-checks .screenshot").velocity({
      scale: 0.9
    }, {
      duration: 0
    });
    var animateBullets = function() {
      var $screenshot = $("#background-checks .screenshot");
      var $b1 = $("#background-checks .bullet-one");
      var $b2 = $("#background-checks .bullet-two");
      var $b3 = $("#background-checks .bullet-three");
      var $b4 = $("#background-checks .bullet-four");
      var $button = $("#background-checks .box-button a.btn");
      $screenshot.velocity({
        scale: 1,
        top: 15
      }, {
        duration: 1200
      });
      var sequence = [{
        e: $b1,
        p: {
          left: 0
        },
        o: {
          duration: 600,
          easing: "easeInOutQuad"
        }
      }, {
        e: $b2,
        p: {
          left: 0
        },
        o: {
          duration: 600,
          easing: "easeInOutQuad"
        }
      }, {
        e: $b3,
        p: {
          left: 0
        },
        o: {
          duration: 600,
          easing: "easeInOutQuad"
        }
      }, {
        e: $b4,
        p: {
          left: 0
        },
        o: {
          duration: 600,
          easing: "easeInOutQuad"
        }
      }, {
        e: $button,
        p: {
          scaleX: 0.9,
          scaleY: 0.9
        },
        o: {
          duration: 300
        }
      }, {
        e: $button,
        p: {
          scaleX: 1,
          scaleY: 1
        },
        o: {
          duration: 300
        }
      }];
      $.Velocity.RunSequence(sequence);
    };
    var bulletsWaypoint = $("#background-checks .trigger").waypoint(function(direction) {
      animateBullets();
      this.destroy();
    }, {
      offset: "60%"
    });
    var animateApps = function() {
      var $b1 = $("#app .app-one");
      var $b2 = $("#app .app-two");
      var $b3 = $("#app .app-three");
      var $b4 = $("#app .app-four");
      var $s1 = $("#app .star-one");
      var $s2 = $("#app .star-two");
      var $s3 = $("#app .star-three");
      var $s4 = $("#app .star-four");
      var $s5 = $("#app .star-five");
      var sequence = [{
        e: $b1,
        p: {
          top: 0
        },
        o: {
          duration: 800
        }
      }, {
        e: $b2,
        p: {
          top: 0
        },
        o: {
          duration: 800,
          delay: 100,
          sequenceQueue: false
        }
      }, {
        e: $b3,
        p: {
          top: 0
        },
        o: {
          duration: 800,
          delay: 200,
          sequenceQueue: false
        }
      }, {
        e: $b4,
        p: {
          top: 0
        },
        o: {
          duration: 800,
          delay: 300,
          sequenceQueue: false
        }
      }, {
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
    var appsWaypoint = $("#app .trigger").waypoint(function(direction) {
      animateApps();
      this.destroy();
    }, {
      offset: "bottom-in-view"
    });
    var animateVideo = function() {
      var $videoBtn = $("#video .video-play-btn");
      $videoBtn.velocity({
        scale: 1.2
      }, {
        duration: 1000,
        loop: true
      });
    };
    var videoWaypoint = $("#video .trigger").waypoint(function(direction) {
      animateVideo();
    }, {
      offset: "50%"
    });
    var animateTimeline = function() {
      var $b1img = $("#timeline .bullet-one img");
      var $b1span = $("#timeline .bullet-one span");
      var $b2img = $("#timeline .bullet-two img");
      var $b2span = $("#timeline .bullet-two span");
      var $b3img = $("#timeline .bullet-three img");
      var $b3span = $("#timeline .bullet-three span");
      var $b4img = $("#timeline .bullet-four img");
      var $b4span = $("#timeline .bullet-four span");
      var sequence = [{
        e: $b1img,
        p: {
          opacity: 1
        },
        o: {
          duration: 100
        }
      }, {
        e: $b1img,
        p: {
          scaleX: 1.3,
          scaleY: 1.3
        },
        o: {
          duration: 200,
          easing: "easeInExpo"
        }
      }, {
        e: $b1img,
        p: {
          scaleX: 1,
          scaleY: 1
        },
        o: {
          duration: 300
        }
      }, {
        e: $b1span,
        p: {
          opacity: 1
        },
        o: {
          sequenceQueue: false,
          duration: 300
        }
      }, {
        e: $b2img,
        p: {
          opacity: 1
        },
        o: {
          duration: 100
        }
      }, {
        e: $b2img,
        p: {
          scaleX: 1.3,
          scaleY: 1.3
        },
        o: {
          duration: 200,
          easing: "easeInExpo"
        }
      }, {
        e: $b2img,
        p: {
          scaleX: 1,
          scaleY: 1
        },
        o: {
          duration: 300
        }
      }, {
        e: $b2span,
        p: {
          opacity: 1
        },
        o: {
          sequenceQueue: false,
          duration: 300
        }
      }, {
        e: $b3img,
        p: {
          opacity: 1
        },
        o: {
          duration: 100
        }
      }, {
        e: $b3img,
        p: {
          scaleX: 1.3,
          scaleY: 1.3
        },
        o: {
          duration: 200,
          easing: "easeInExpo"
        }
      }, {
        e: $b3img,
        p: {
          scaleX: 1,
          scaleY: 1
        },
        o: {
          duration: 300
        }
      }, {
        e: $b3span,
        p: {
          opacity: 1
        },
        o: {
          sequenceQueue: false,
          duration: 300
        }
      }, {
        e: $b4img,
        p: {
          opacity: 1
        },
        o: {
          duration: 100
        }
      }, {
        e: $b4img,
        p: {
          scaleX: 1.3,
          scaleY: 1.3
        },
        o: {
          duration: 200,
          easing: "easeInExpo"
        }
      }, {
        e: $b4img,
        p: {
          scaleX: 1,
          scaleY: 1
        },
        o: {
          duration: 300
        }
      }, {
        e: $b4span,
        p: {
          opacity: 1
        },
        o: {
          sequenceQueue: false,
          duration: 300
        }
      }];
      $.Velocity.RunSequence(sequence);
    };
    var timelineWaypoint = $("#timeline .trigger").waypoint(function(direction) {
      animateTimeline();
      this.destroy();
    }, {
      offset: "50%"
    });
    var animateFooter = function() {
      var $s1 = $("#footer .star-one");
      var $s2 = $("#footer .star-two");
      var $s3 = $("#footer .star-three");
      var $s4 = $("#footer .star-four");
      var $s5 = $("#footer .star-five");
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
      var $c1 = $(".carla-hand");
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
    var footerWaypoint = $("#footer .trigger").waypoint(function(direction) {
      animateFooter();
      var goCarla = _.debounce(animateCarla, 1500, {
        leading: true,
        trailing: false
      });
      $(".carla-box").on("click", goCarla);
      _.delay(goCarla, 1500);
      this.destroy();
    }, {
      offset: "bottom-in-view"
    });
  };
  var InlineVideo = function(settings) {
    if (settings.element.length === 0) {
      return;
    }
    this.init(settings);
  }; InlineVideo.prototype.init = function(settings) {
    this.$element = $(settings.element);
    this.settings = settings;
    this.videoDetails = this.getVideoDetails();
    $(this.settings.closeTrigger).hide();
    this.setFluidContainer();
    this.bindUIActions();
    if (this.videoDetails.teaser && Modernizr.video && !Modernizr.touch) {
      this.appendTeaserVideo();
    }
  }; InlineVideo.prototype.bindUIActions = function() {
    var that = this;
    $(this.settings.playTrigger).on("click", function(e) {
      e.preventDefault();
      if (!Modernizr.video || (BrowserDetect.browser === "Explorer" && BrowserDetect.version <= 11)) {
        $("#video-modal").on("shown.bs.modal", function(e) {
          $("#vimeoplayer").vimeo("play");
        });
        $("#video-modal").modal("show");
        $("#video-modal").on("hide.bs.modal", function(e) {
          $("#vimeoplayer").vimeo("pause");
        });
      } else {
        that.animateOpen();
        that.appendIframe();
      }
    });
    $(this.settings.closeTrigger).on("click", function(e) {
      e.preventDefault();
      that.animateClosed();
      that.removeIframe();
    });
  }; InlineVideo.prototype.animateOpen = function() {
    var that = this;
    $("#timeline").removeClass("slant").addClass("no-slant");
  }; InlineVideo.prototype.animateClosed = function() {
    var that = this;
    $("#timeline").removeClass("no-slant").addClass("slant");
  }; InlineVideo.prototype.appendIframe = function() {
    var html = '<iframe id="inline-video__video-element" src="' + this.videoDetails.videoURL + '?title=0&amp;byline=0&amp;portrait=0&amp;color=3d96d2&autoplay=1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    $(this.settings.playTrigger).fadeOut();
    $(this.settings.closeTrigger).fadeIn();
    this.$element.append(html);
  }; InlineVideo.prototype.removeIframe = function() {
    $(this.settings.playTrigger).fadeIn();
    $(this.settings.closeTrigger).fadeOut();
    this.$element.find("#inline-video__video-element").remove();
  }; InlineVideo.prototype.appendTeaserVideo = function() {
    var source = this.videoDetails.teaser;
    var html = '<video autoplay="true" loop="true" muted id="inline-video__teaser-video" class="inline-video__teaser-video"><source src="' + source + '.webm" type="video/mp4"><source src="' + source + '.mp4" type="video/mp4"></video>';
    this.$element.append(html);
  }; InlineVideo.prototype.setFluidContainer = function() {
    var element = this.$element;
    element.data("aspectRatio", this.videoDetails.videoHeight / this.videoDetails.videoWidth);
    $(window).resize(function() {
      var windowWidth = $(window).width();
      var windowHeight = $(window).height();
      element.width(Math.ceil(windowWidth));
      element.height(Math.ceil(windowWidth * element.data("aspectRatio")));
      if (windowHeight < element.height()) {
        element.width(Math.ceil(windowWidth));
        element.height(Math.ceil(windowHeight));
      }
    }).trigger("resize");
  }; InlineVideo.prototype.getVideoDetails = function() {
    var mediaElement = $(this.settings.media);
    return {
      videoURL: mediaElement.attr("data-video-URL"),
      teaser: mediaElement.attr("data-teaser"),
      videoHeight: mediaElement.attr("data-video-height"),
      videoWidth: mediaElement.attr("data-video-width")
    };
  };
  var initVideo = function() {
    $(".inline-video").each(function(i, elem) {
      var inlineVideo = new InlineVideo({
        element: elem,
        media: ".inline-video__media",
        playTrigger: ".inline-video__play-trigger",
        closeTrigger: ".inline-video__close-trigger"
      });
    });
  };
  var init = function() {
    BrowserDetect.init();
    scrollAnimation();
    initVideo();
    $(".carousel").carousel();
    $(".focus-me").focus();
    $(".carousel").on("slid.bs.carousel", function(evt) {
      if ($(".carousel div.active").index() + 1 === 4) {
        initAddress();
      }
    });
    $("a.smarty-popup-close").html('<span class="glyphicon glyphicon-remove-circle"></span>');
  }; init();
})();
(function($, _) {
  var bv_info = {};
  var parseQueryArgs = function(query) {
    if (!query) {
      return null;
    }
    var args = _.chain(query.split("&")).map(function(params) {
      var p = params.split("=");
      var key = p[0];
      var val = window.decodeURIComponent(p[1]);
      val = val.replace(/\/+$/g, "");
      val = val.replace(/\+/g, " ");
      return [key, val];
    }).object().value();
    return args;
  };
  var findDynamicContent = function() {
    return $("[data-bv-content]");
  };
  var displayTargetedContent = function(queryArgs, $dynamicElems) {
    var ref = queryArgs.pagetype,
      kw = ref && ref.toLowerCase().replace(" ", "");
    if (!ref) return;
    _.forEach($dynamicElems, function(elem) {
      var $elem = $(elem),
        $defaults = $elem.find("[data-bv-ref=default]");
      $target = $elem.find("[data-bv-ref=" + kw + "]");
      if (!$target || $target.length === 0) {
        $defaults.show();
      } else {
        $defaults.hide();
        $target.show();
      }
    });
  };
  var show = function() {
    $("body").removeClass("hide");
  };
  var decodeSearchArgs = function(keywordString) {
    var keywords = keywordString.split("+");
    keywords = _.map(keywords, function(kw) {
      if (kw) {
        return kw.toLowerCase();
      }
      return kw;
    });
    return keywords;
  };
  var initialize = function() {
    var query = window.location.search.substring(1),
      queryArgs = parseQueryArgs(query);
    var referrer = window.referrer;
    if (queryArgs) {
      $dynamicElems = findDynamicContent();
      displayTargetedContent(queryArgs, $dynamicElems);
    }
    $("#navCollapse").on("hidden.bs.collapse", function() {
      $("#nav-icon-closed").show();
      $("#nav-icon-open").hide();
    });
    $("#navCollapse").on("shown.bs.collapse", function() {
      $("#nav-icon-closed").hide();
      $("#nav-icon-open").show();
    });
  };
  try {
    initialize();
    show();
  } catch (err) {
    show();
    throw err;
  }
  window.targeted = {
    initialize: initialize
  };
})(jQuery, _);