'use strict';

var Vue = require('vue'),
    TweenMax = require('TweenMax'),
    extend = require('extend'),
    bindAll = require('bindall-standalone'),
    scrollUtil = require('common/utils/scroll-util'),
    resizeUtil = require('common/utils/resize-util'),
    section = require('base/section');

module.exports = extend(true, {}, section, {
    template: require('./home.html'),
    route: {
        id: 'home',
        transitionMode: 'outAndAfterIn',
        path: '/home'
    },
    data: {

    },
    methods: {
        insertTweens: function() {
            this.tlTransition.fromTo(this.$el, 0.3, {alpha: 0}, {alpha: 1, ease: Expo.easeOut}, 0.4);
            this.tlTransition.fromTo(this.$findOne('.cloud.left'), 0.8, {xPercent: '-100%'}, {xPercent: 0, ease: Expo.easeOut}, 0.7);
            this.tlTransition.fromTo(this.$findOne('.cloud.right'), 0.8, {xPercent: '100%'}, {xPercent: 0, ease: Expo.easeOut}, 0.7);
            this.tlTransition.staggerFromTo(
                [this.$findOne('.content img'), this.$findOne('.content h1'), [this.$findOne('.button'), this.$findOne('.button-background')]],
                1.0,
                {y: 100, alpha: 0},
                {y: 0, alpha: 1, ease: Expo.easeOut},
                0.08,
                1.2);
        },
        beforeTransitionIn: function() {
            this.resize();
        },
        onMouseEnter: function () {
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
            TweenMax.set(this.$el, {width: resizeUtil.width, height: resizeUtil.height});
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
            resizeUtil.addListener(this.resize);
            scrollUtil.addListener(this.scroll);
        }
    },

    ready: function() {
        this.$once('section:transitionInComplete', function() {
            this.$findOne('.button').addEventListener('mouseenter', this.onMouseEnter.bind(this));
            this.$findOne('.button').addEventListener('mouseleave', this.onMouseOut.bind(this));
        });

        bindAll(this, 'init', 'resize', 'scroll');
        Vue.nextTick(this.init);
    },

    beforeDestroy: function() {
        resizeUtil.removeListener(this.resize);
        scrollUtil.removeListener(this.scroll);
        this.$findOne('.button').removeEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.$findOne('.button').removeEventListener('mouseleave', this.onMouseOut.bind(this));
    }
});
