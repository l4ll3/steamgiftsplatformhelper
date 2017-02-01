// ==UserScript==
// @name        Platformhelper for Steamgifts++
// @namespace   lalle.se
// @version     0.2
// @description Show and filter platform for SG++
// @require     http://code.jquery.com/jquery.min.js
// @require     https://cdn.jsdelivr.net/simplestorage/0.2.1/simpleStorage.min.js
// @author      lalle
// @include     http://www.steamgifts.com/*
// @include     https://www.steamgifts.com/*
// @exlcude     http://www.steamgifts.com/user/*
// @exlcude     https://www.steamgifts.com/user/*
// @grant       GM_xmlhttpRequest
// ==/UserScript==

$("head link:last")
    .after("<link rel=stylesheet type=text/css href=https://steamstore-a.akamaihd.net/public/css/v6/store.css>")
    .after("<style>span.platform_img {background-color: black; height:20px; display: inline-block; opacity: 0.80;} div.lalle__platform {position: absolute; top: 5px; right: 5px;} </style>");

function appendPlatform(appendToNode, platformhtml, isImg) {
    if (isImg) {
        appendToNode.append("<div class=\"lalle__platform\">" + platformhtml + "</div>");
    } else {
        appendToNode.append("<div>" + platformhtml + "</div>");
    }
}

function setPlatformHtml(steamUrl, appendToNode, filterNode, isImg)  {
    try {
        var platformhtml = "";
        if (!steamUrl.length) {
            return;
        }

        if (simpleStorage.canUse()) {
            if (simpleStorage.hasKey(steamUrl))
            {
                platformhtml = simpleStorage.get(steamUrl);
                appendPlatform(appendToNode, platformhtml, isImg);
            }
        }
        else {
            console.warn("Local storage not supported, retrieving platforms will be slow!");
        }

        if (platformhtml === undefined || !platformhtml.length) {
            GM_xmlhttpRequest({
                method: "GET",
                url: steamUrl,
                onload: function(response) {
                    var responseN = $(response.responseText);
                    var platform = responseN.find("div.game_area_purchase_platform");
                    if (platform.length) {
                        appendPlatform(appendToNode, platform.html(), isImg);
                        if (simpleStorage.canUse())  {
                            simpleStorage.set(steamUrl, platform.html(), {TTL: 2592000000});
                        }
                        if (filterNode !== null)
                            filterPlatform(filterNode);
                    }
                }
            });
        }
        else if (filterNode !== null) {
            filterPlatform(filterNode);
        }
    } catch (e) {
        console.error("Failed to set platform html on node: " + e);
    }
}

function getHref(node, aClass) {
    try {
        return node.find(aClass).attr("href").trim();
    } catch (e) {
        console.error("get steam url error: " + e + " on node: " + node);
        return "";
    }
}

function addPlatformToGrid(gridTitle) {
    if (gridTitle === null)
        return;
    var steamURL = getHref(gridTitle, "a.giveaway__icon");

    setPlatformHtml(steamURL, gridTitle.find("a:first"), gridTitle, true);
}

function filterPlatform(node) {
    if (window.location.href.indexOf("wishlist") != -1 ||
        window.location.href.indexOf("/user/") != -1 ) {
        return;
    }
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
        setPlatformHtml(steamURL, wrap.find("div.featured__heading"),null, false);
    });
}

function addPlatformGAs() {
    var giveaways = $("h2.giveaway__heading");
    giveaways.each(function() {
        var header = $(this);
        var steamURL = getHref(header,"a.giveaway__icon");
        setPlatformHtml(steamURL, header, header.closest(".giveaway__row-outer-wrap"), false);
        if (!steamURL.length) {
            return;
        }
    });
}


//Add and filter
$(document).ready(function() {
    addPlatformToGiveawayPage();
    addPlatformToSGPPGrid();
});

addPlatformGAs();
