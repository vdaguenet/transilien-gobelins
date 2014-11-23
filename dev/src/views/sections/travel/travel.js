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
            this.tlTransition.fromTo(this.$el, 0.7, {alpha: 0}, {alpha: 1, ease: Expo.easeOut}, 0.4);
        },
        beforeTransitionIn: function() {},
        resize: function() {
            var backgrounds = this.$find('.background');
            var universes = this.$find('.universe');
            var rock = this.$findOne('.transition.crtp-lyo1');
            var clouds = this.$findOne('.transition.lyo1-gnor');

            forEach(backgrounds, function(bg, i) {
                TweenMax.set(universes[i], {height: bg.offsetHeight});
            });

            TweenMax.set(rock, {y: (-backgrounds[0].offsetHeight-((11/24)*rock.offsetHeight))});
            TweenMax.set(clouds, {y: (-2*backgrounds[0].offsetHeight-(0.5*clouds.offsetHeight))});
        },
        scroll: function () {
            if (false === this.scrollInit) return;

            // Prevent scrollX
            // Even if horizontal scrollbar is not visible, people using trackbad can scroll on X
            // I know it's bad but overflow-x: hidden kills my images
            if (scrollUtil.x > 0) {
                TweenMax.set(window, {scrollTo: {x: 0}});
            }

            this.crossedPercent = 100 - ( (scrollUtil.y + resizeUtil.height) / this.$findOne('.universes').offsetHeight)*100;
            this.universes.current = Math.floor( this.crossedPercent/(100/this.universes.count) );

            if (this.universes.order[ this.universes.current ]) {
                var currentClass = '.' + this.universes.order[ this.universes.current ];
                var foregroundEls = this.$find(currentClass + ' .foreground');
                var middlegroundEls = this.$find(currentClass + ' .middleground');

                var crossedPercentInUniverse = 100*( this.crossedPercent/(100/this.universes.count) - this.universes.current );

                TweenMax.set(middlegroundEls, {y: -crossedPercentInUniverse});
                TweenMax.set(foregroundEls, {y: 1.1*crossedPercentInUniverse});
            }
        },
        init: function() {
            this.scrollInit = true;
            this.resize();

            TweenMax.fromTo(window, 2.75, {scrollTo: {y: 0,x: 0}}, {scrollTo: {y: this.$findOne('.universes').offsetHeight, x: 0}, ease: Expo.easeOut});

            resizeUtil.addListener(this.resize);
            scrollUtil.addListener(this.scroll);
        }
    },

    ready: function() {
        this.$once('section:transitionInComplete', function() {
            this.init();
        });
        bindAll(this, 'resize', 'scroll', 'init');
    },

    beforeDestroy: function() {
        resizeUtil.removeListener(this.resize);
        scrollUtil.removeListener(this.scroll);
    }
});
