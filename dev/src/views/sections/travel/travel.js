'use strict';

var Vue = require('vue'),
    TweenMax = require('TweenMax'),
    extend = require('extend'),
    section = require('base/section'),
    forEach = require('forEach'),
    resizeUtil = require('common/utils/resize-util'),
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
                bg: 'assets/images/travel-section-1.jpg'
            },
            {
                bg: 'assets/images/travel-section-2.jpg'
            },
            {
                bg: 'assets/images/travel-section-3.jpg'
            }
        ]
    },
    components: {
        'travel-section': require('./components/travel-section/travel-section')
    },
    methods: {
        insertTweens: function() {
            this.tlTransition.to(window, 0.6, {scrollTo: {y: this.$el.scrollHeight,x: 0}});
        },
        beforeTransitionIn: function() {},
        resize: function() {
            TweenMax.set(window, {scrollTo: {y: this.$el.scrollHeight,x: 0}});
        },
        init: function() {
            resizeUtil.addListener(this.resize);
        }
    },

    ready: function() {
        bindAll(this, 'resize', 'init');
        Vue.nextTick(this.init);
    },

    beforeDestroy: function() {}
});
