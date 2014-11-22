'use strict';

var Vue = require('vue'),
    TweenMax = require('TweenMax'),
    extend = require('extend'),
    bindAll = require('bindall-standalone'),
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
            this.tlTransition.fromTo(this.$el, 0.7, {alpha: 0}, {alpha: 1, ease: Expo.easeOut}, 0.4);
        },
        beforeTransitionIn: function() {

        },
        resize: function() {
            TweenMax.set(this.$el, {width: resizeUtil.width, height: resizeUtil.height});
        },
        init: function() {
            this.resize();

            resizeUtil.addListener(this.resize);
        }
    },

    ready: function() {
        bindAll(this, 'init', 'resize');
        Vue.nextTick(this.init);
    },

    beforeDestroy: function() {
        resizeUtil.removeListener(this.resize);
    }
});
