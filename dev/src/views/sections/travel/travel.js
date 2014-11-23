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
        crossedPercent: 0,
        universes: {
            count: 3,
            current: 0,
            order: ['crtp', 'lyo1', 'gnor']
        },
    },
    components: {},
    methods: {
        insertTweens: function() {
            this.tlTransition.fromTo(window, 0.7, {scrollTo: {y: 0,x: 0}}, {scrollTo: {y: this.$el.offsetHeight, x: 0}, ease: Expo.easeOut}, 0.4);
            this.tlTransition.fromTo(this.$el, 0.7, {alpha: 0}, {alpha: 1, ease: Expo.easeOut});
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
            if (false === this.scrollInit) return;

            this.crossedPercent = 100 - ( (scrollUtil.y + resizeUtil.height) / this.$findOne('.universes').offsetHeight)*100;
            this.universes.current = Math.floor( this.crossedPercent/(100/this.universes.count) );

            if (this.universes.order[ this.universes.current ]) {
                var currentClass = '.' + this.universes.order[ this.universes.current ];
                var foregroundEls = this.$find(currentClass + ' .foreground');
                var middlegroundEls = this.$find(currentClass + ' .middleground');

                var crossedPercentInUniverse = 100*( this.crossedPercent/(100/this.universes.count) - this.universes.current );

                TweenMax.set(middlegroundEls, {y: -0.8*crossedPercentInUniverse});
                TweenMax.set(foregroundEls, {y: 0.9*crossedPercentInUniverse});
            }
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
