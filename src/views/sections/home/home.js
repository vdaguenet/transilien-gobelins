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
                [this.$findOne('.content img'), this.$findOne('.content h1'), this.$findOne('.button')],
                1.0,
                {y: 100, alpha: 0},
                {y: 0, alpha: 1, ease: Expo.easeOut},
                0.08,
                1.2);
        },
        beforeTransitionIn: function() {

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
            this.resize();
            // TEST
            TweenMax.set(this.$findOne('.content svg'), {scaleX: 2});
            resizeUtil.addListener(this.resize);
            scrollUtil.addListener(this.scroll);
        }
    },

    ready: function() {
        bindAll(this, 'init', 'resize', 'scroll');
        Vue.nextTick(this.init);
    },

    beforeDestroy: function() {
        resizeUtil.removeListener(this.resize);
    }
});
