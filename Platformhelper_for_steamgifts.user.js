// ==UserScript==
// @name        Platformhelper for Steamgifts++
// @namespace   lalle.se
// @version     0.1
// @description Show and filter platform for SG++
// @require     http://code.jquery.com/jquery.min.js
// @author      lalle
// @include     http://www.steamgifts.com/*
// @include     https://www.steamgifts.com/*
// @grant       GM_xmlhttpRequest
// ==/UserScript==

$("head link:last")
.after("<link rel=stylesheet type=text/css href=https://steamstore-a.akamaihd.net/public/css/v6/store.css>")
.after("<style>span.platform_img {background-color: black; height:20px; display: inline-block; opacity: 0.80;} span.lalle__platform {position: absolute; top: 5px; right: 5px;} </style>");

function getHtml5Storage() {
  try {
    if('localStorage' in window)  {
      return window['localStorage'];
    }
    else {
      console.log("HTML5 storage does not exist");
      return null;
    }
  } catch (e) {
    console.log("Failed get HTML5 storage");
    return null;
  }
}

function getHref(node, aClass) {
  try {
    return node.find(aClass).attr("href").trim();  
  } catch (e) {
    console.log("get steam url error: " + e + " on node: " + node);
    return "";
  }  
}

function addPlatformToGrid(gridTitle) {
    var steamURL = getHref(gridTitle, "a.giveaway__icon");
    if (!steamURL.length) {
      return;
    }
    var storage = getHtml5Storage();
    var platformhtml = "";
    if (storage != null) {
      platformhtml = storage.getItem(steamURL);
    }

  if (platformhtml != null)  {
    gridTitle.find("a:first").append("<span class=\"lalle__platform\">" + platformhtml + "</div>");
    if (window.location.href.indexOf("wishlist") == -1) {
      filterPlatform(gridTitle);
    }        
  }
  else {
    GM_xmlhttpRequest({
      method: "GET",
      url: steamURL,
      onload: function(response) {
        var platform = $(response.responseText).find("div.game_area_purchase_platform");
        if (platform.length) {
          gridTitle.find("a:first").append("<span class=\"lalle__platform\">" + platform.html() + "</div>");
          if (storage != null)  {
            storage.setItem(steamURL, platform.html());
          }
          filterPlatform(gridTitle);
        }
      }
    });
  }
}

function filterPlatform(node) {
    var hasPlatform = node.find("span.platform_img");
    var isLinux = node.find("span.linux");
    if (hasPlatform.length && !isLinux.length) {
      node.hide();
    }
}

function addPlatformToSGPPGrid() {
  var sgppGridTitles = $("div.SGPP__gridTile");
  sgppGridTitles.each(function() {
    var gridTitle = $(this);
    addPlatformToGrid(gridTitle);
  });  
}

function addPlatformToGiveawayPage() {
  var wrappers = $("div.featured__container").find("div.featured__inner-wrap");
  wrappers.each(function() {
    var wrap = $(this);
    var steamURL = getHref(wrap, "a.global__image-outer-wrap");
    if (!steamURL.length) {
      return;
    }
    var storage = getHtml5Storage();
    var platformhtml = "";
    if (storage != null) {
      platformhtml = storage.getItem(steamURL);
    }
    if (platformhtml != null)  {
      wrap.find("div.featured__heading").append("<span>" + platformhtml + "</span>");
    }
    else {
      GM_xmlhttpRequest({
        method: "GET",
        url: steamURL,
        onload: function(response) {
          var platform = $(response.responseText).find("div.game_area_purchase_platform");
          if (platform.length) {
            wrap.find("div.featured__heading").append("<span>" + platform.html() + "</span>");
            if (storage != null)  {
              storage.setItem(steamURL, platform.html());
            }
          }
        }
      });
    }
  });
}

function addPlatformGAs() {
  var giveaways = $("h2.giveaway__heading");
  giveaways.each(function() {
    var header = $(this);
    var steamURL = getHref(header,"a.giveaway__icon");
    if (!steamURL.length) {
      return;
    }

    var storage = getHtml5Storage();

    var platformhtml = "";
    if (storage != null) {
        platformhtml = storage.getItem(steamURL);
      }

    if (platformhtml != null) {
      header.append("<span>" + platformhtml + "</div>");
    }
    else {
      GM_xmlhttpRequest({
        method: "GET",
        url: steamURL,
        onload: function(response) {
          var platform = $(response.responseText).find("div.game_area_purchase_platform");
          if (platform.length) {
            header.append("<span>" + platform.html() + "</div>");
            if (storage != null)  {
              storage.setItem(steamURL, platform.html());
            }
          }
        }
      });
    }
    filterPlatform(header.closest(".giveaway__row-outer-wrap"));
  });
}


//Add and filter
$(document).ready(function() {
  addPlatformToGiveawayPage();
  addPlatformToSGPPGrid();
});

addPlatformGAs();
