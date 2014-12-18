'use strict';

var Vue = require('vue'),
    TweenMax = require('TweenMax'),
    extend = require('extend'),
    bindAll = require('bindall-standalone'),
    scrollUtil = require('common/utils/scroll-util'),
    resizeUtil = require('common/utils/resize-util'),
    preloadjs = require('preloadjs'),
    section = require('base/section');

module.exports = extend(true, {}, section, {
    template: require('./home.html'),
    route: {
        id: 'home',
        transitionMode: 'outAndAfterIn',
        path: '/home'
    },
    data: {
        progress: 0
    },
    manifest: [
        // /home assets
        '../assets/images/home/background.jpg',
        '../assets/images/home/middleground.png',
        '../assets/images/home/foreground.png',
        '../assets/images/home/cloud-right.png',
        '../assets/images/home/cloud-left.png',
        '../assets/images/logo-transilien.png',
        // /travel assets
        '../assets/images/universes/gnor/background.jpg',
        '../assets/images/universes/gnor/cloud.png',
        '../assets/images/universes/gnor/middleground-1.png',
        '../assets/images/universes/gnor/cloud.png',
        '../assets/images/universes/gnor/middleground-2.png',
        '../assets/images/universes/gnor/middleground-3.png',
        '../assets/images/universes/gnor/foreground.png',
        '../assets/images/universes/lyo1/background.jpg',
        '../assets/images/universes/lyo1/middleground.png',
        '../assets/images/universes/lyo1/foreground.png',
        '../assets/images/universes/crtp/background.jpg',
        '../assets/images/universes/crtp/middleground.png',
        '../assets/images/universes/crtp/foreground.png',
        '../assets/images/universes/line.svg',
        '../assets/images/universes/transition/rock.png',
        '../assets/images/universes/transition/cloud-right.png',
        '../assets/images/universes/transition/cloud-left.png',
        // stations assets
        '../assets/images/stations/station-01.jpg',
        '../assets/images/stations/station-02.jpg'
    ],
    methods: {
        load: function () {
            /*
                Load manifest with PreloadJS
             */
            TweenMax.set(this.$findOne('.main'), {alpha: 0});
            TweenMax.set(this.$findOne('.loader'), {alpha: 1});
            var manifest = this.$options.manifest;

            this.preloader = new createjs.LoadQueue();
            this.preloader.on('error', this.onLoadError);
            this.preloader.on('progress', this.onLoadProgress);
            this.preloader.on('complete', this.onLoadComplete);
            this.preloader.loadManifest(manifest);
        },
        onLoadError: function (e) {
            console.error("Can not load manifest");
        },
        onLoadProgress: function (e) {
            this.progress = e.progress;
            this.$findOne('#percent').innerText = Math.floor(this.progress*100);
        },
        onLoadComplete: function (e) {
            /*
                Hide loader and display home page
             */
            this.progress = 1;
            this.$findOne('#percent').innerText = Math.floor(this.progress*100);
            TweenMax.to(this.$findOne('.main'), 0.2, {alpha: 1});
            TweenMax.to(this.$findOne('.loader'), 0.2, {alpha: 0});
            this.playTransitionIn();
        },
        insertTweens: function() {
            /*
                Insert twenns in global timeline
             */
            this.tlTransition.fromTo(this.$el, 0.3, {alpha: 0}, {alpha: 1, ease: Expo.easeOut}, 0);
            this.tlTransition.fromTo(this.$findOne('.cloud.left'), 0.8, {xPercent: '-100%'}, {xPercent: 0, ease: Expo.easeOut}, 0.4);
            this.tlTransition.fromTo(this.$findOne('.cloud.right'), 0.8, {xPercent: '100%'}, {xPercent: 0, ease: Expo.easeOut}, 0.4);
            this.tlTransition.staggerFromTo(
                [this.$findOne('.content img'), this.$findOne('.content h1'), [this.$findOne('.button'), this.$findOne('.button-background')]],
                1.0,
                {y: 100, alpha: 0},
                {y: 0, alpha: 1, ease: Expo.easeOut},
                0.08,
                0.9);
        },
        beforeTransitionIn: function() {
            this.resize();
        },
        onMouseEnter: function () {
            /*
                Animation on button mouse hover
             */
            if(this.tlMouseOut) this.tlMouseOut.kill();

            var points = this.$findOne('.button-background polygon').points;
            this.tlMouseEnter = new TimelineMax();
            this.tlMouseEnter.set(points[0], {x: 0}, 0);
            this.tlMouseEnter.set(points[3], {x: 0}, 0);
            this.tlMouseEnter.fromTo(points[2], 0.4, {x: 0}, {x: 170, ease: Expo.easeOut}, 0);
            this.tlMouseEnter.fromTo(this.$findOne('.button'), 0.4, {color: '#0087CD'}, {color: '#e7e7e7', ease: Expo.easeOut}, 0);
            this.tlMouseEnter.fromTo(points[1], 0.4, {x: 0}, {x: 170, ease: Expo.easeOut}, 0.06);
        },
        onMouseOut: function () {
            /*
                Animation on button mouse out
             */
            if(this.tlMouseEnter) this.tlMouseEnter.kill();

            var points = this.$findOne('.button-background polygon').points;
            this.tlMouseOut = new TimelineMax();
            this.tlMouseOut.set(points[1], {x: 170}, 0);
            this.tlMouseOut.set(points[2], {x: 170}, 0);
            this.tlMouseOut.fromTo(points[3], 0.4, {x: 0}, {x: 170, ease: Expo.easeOut}, 0);
            this.tlMouseOut.fromTo(this.$findOne('.button'), 0.4, {color: '#e7e7e7'}, {color: '#0087CD', ease: Expo.easeOut}, 0);
            this.tlMouseOut.fromTo(points[0], 0.4, {x: 0}, {x: 170, ease: Expo.easeOut}, 0.06);
        },
        resize: function() {
            TweenMax.set(this.$findOne('.main'), {width: resizeUtil.width, height: resizeUtil.height});
        },
        scroll: function() {
            // Prevent scrollX
            // Even if horizontal scrollbar is not visible, people using trackbad can scroll on X
            // I know it's bad but overflow-x: hidden kills my images
            if (scrollUtil.x > 0) {
                TweenMax.set(window, {scrollTo: {x: 0}});
            }
        },
        init: function() {
            /*
                Add events
             */
            resizeUtil.addListener(this.resize);
            scrollUtil.addListener(this.scroll);
        }
    },

    ready: function() {
        bindAll(this, 'load', 'init', 'resize', 'scroll', 'onMouseEnter', 'onMouseOut', 'onLoadProgress', 'onLoadComplete', 'onLoadError');

        this.$once('section:transitionInComplete', function() {
            this.$findOne('.button').addEventListener('mouseenter', this.onMouseEnter);
            this.$findOne('.button').addEventListener('mouseleave', this.onMouseOut);
        });

        this.$once('section:routed', function () {
            this.load();
        });

        Vue.nextTick(this.init);
    },

    beforeDestroy: function() {
        /*
            Remove events
         */
        resizeUtil.removeListener(this.resize);
        scrollUtil.removeListener(this.scroll);
        this.$findOne('.button').removeEventListener('mouseenter', this.onMouseEnter);
        this.$findOne('.button').removeEventListener('mouseleave', this.onMouseOut);
    }
});
