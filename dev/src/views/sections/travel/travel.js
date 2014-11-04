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
        sections: [
            {
                bg: 'assets/images/conceptborad-02.jpg'
            },
            {
                bg: 'assets/images/conceptborad-01.jpg'
            }
        ],
        menuOpen: false,
        scrollInit: false,
        userHasScrolled: false
    },
    components: {
        'travel-section': require('./components/travel-section/travel-section')
    },
    methods: {
        insertTweens: function() {
            this.tlTransition.fromTo(window, 0.7, {scrollTo: {y: 0,x: 0}}, {scrollTo: {y: this.$el.scrollHeight,x: 0}, ease: Expo.easeOut}, 0.4);
            this.tlTransition.fromTo(this.$el, 0.7, {alpha: 0}, {alpha: 1, ease: Expo.easeOut}, 0.4);
        },
        beforeTransitionIn: function() {},
        resize: function() {
            if(true === this.scrollInit && false === this.userHasScrolled) {
                TweenMax.set(window, {scrollTo: {y: this.$el.scrollHeight,x: 0}});
            }

            var train = this.$findOne('.train');
            var trainHalfW = Math.floor(train.offsetWidth / 2);
            TweenMax.set(train, {x: resizeUtil.halfWidth - trainHalfW});
        },
        toggleMenu: function () {
            this.menuOpen = !this.menuOpen;
        },
        scroll: function () {
            if(false === this.scrollInit) return;

            this.userHasScrolled = true;
        },
        init: function() {
            var train = this.$findOne('.train');
            var trainHalfW = Math.floor(train.offsetWidth / 2);
            TweenMax.set(train, {x: resizeUtil.halfWidth - trainHalfW});

            this.$findOne('.arrow').addEventListener('click', this.toggleMenu);
            resizeUtil.addListener(this.resize);
            scrollUtil.addListener(this.scroll);
        }
    },

    ready: function() {
        this.$once('section:transitionInComplete', function() {
            this.scrollInit = true;
        });
        bindAll(this, 'resize', 'scroll', 'init', 'toggleMenu');
        Vue.nextTick(this.init);
    },

    beforeDestroy: function() {
        resizeUtil.removeListener(this.resize);
        scrollUtil.removeListener(this.scroll);
    }
});
