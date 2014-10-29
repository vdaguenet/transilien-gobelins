'use strict';

var Vue = require('vue'),
    bindAll = require('bindall-standalone'),
    resizeUtil = require('common/utils/resize-util');

module.exports = {
    replace: true,
    template: require('./travel-section.html'),
    data: {
    },
    ready: function() {
        bindAll(this, 'resize', 'init');

        // this.$parent.$once('$page.transitionInComplete', function() {
        Vue.nextTick(this.init);
        // }.bind(this));
        resizeUtil.addListener(this.resize);
    },
    beforeDestroy: function() {
        resizeUtil.removeListener(this.resize);
    },
    methods: {
        resize: function() {
            this.$el.style.width = resizeUtil.width + 'px';
            this.$el.style.height = resizeUtil.height + 'px';
        },
        init: function() {
            this.resize();
        }
    }
};