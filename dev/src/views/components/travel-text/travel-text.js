'use strict';

var Vue = require('vue'),
    forEach = require('forEach'),
    bindAll = require('bindall-standalone'),
    resizeUtil = require('common/utils/resize-util');

module.exports = {
    template: require('./travel-text.html'),
    replace: true,
    data: {},
    ready: function() {
        bindAll(this, 'resize', 'init');
        Vue.nextTick(function() {
            this.init();
        }.bind(this));
    },
    beforeDestroy: function() {
        resizeUtil.removeListener(this.resize);
    },
    methods: {
        resize: function() {

        },

        init: function() {
            this.resize();
            resizeUtil.addListener(this.resize);
        }
    }
};