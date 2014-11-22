'use strict';

var Vue = require('vue'),
    TweenMax = require('TweenMax'),
    extend = require('extend'),
    section = require('base/section'),
    forEach = require('forEach'),
    resizeUtil = require('common/utils/resize-util'),
    scrollUtil = require('common/utils/scroll-util'),
    bindAll = require('bindall-standalone');

module.exports = extend(true, {}, section, {
    template: require('./travel.html'),
    route: {
        id: 'travel',
        transitionMode: 'outAndAfterIn',
        path: '/travel'
    },
    data: {
        scrollInit: false,
        xp: 0
    },
    components: {},
    methods: {
        insertTweens: function() {
            // this.tlTransition.fromTo(window, 0.7, {scrollTo: {y: 0,x: 0}}, {scrollTo: {y: this.$el.scrollHeight,x: 0}, ease: Expo.easeOut}, 0.4);
            this.tlTransition.fromTo(this.$el, 0.7, {alpha: 0}, {alpha: 1, ease: Expo.easeOut}, 0.4);
        },
        beforeTransitionIn: function() {},
        resize: function() {
            var backgrounds = this.$find('.background');
            var universes = this.$find('.universe');

            backgrounds.forEach(function(bg, i) {
                TweenMax.set(universes[i], {height: bg.offsetHeight});
            });
        },
        scroll: function () {

        },
        init: function() {
            this.resize();

            resizeUtil.addListener(this.resize);
            scrollUtil.addListener(this.scroll);
        }
    },

    ready: function() {
        this.$once('section:transitionInComplete', function() {
            this.scrollInit = true;
        });
        bindAll(this, 'resize', 'scroll', 'init');
        Vue.nextTick(this.init);
    },

    beforeDestroy: function() {
        resizeUtil.removeListener(this.resize);
        scrollUtil.removeListener(this.scroll);
    }
});
