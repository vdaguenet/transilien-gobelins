'use strict';

var Vue = require('vue'),
    TweenMax = require('TweenMax'),
    extend = require('extend'),
    section = require('base/section'),
    forEach = require('forEach'),
    resizeUtil = require('common/utils/resize-util'),
    scrollUtil = require('common/utils/scroll-util'),
    _ = require('common/utils/_'),
    bindAll = require('bindall-standalone'),
    travelTexts = require('../../../../assets/data/travelTexts.js');

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
        transitions: {
            rock: undefined,
            cloudLeft: undefined,
            cloudRight: undefined
        },
        railway: undefined,
        train: undefined,
        texts: []
    },
    components: {
        'travel-text': require('../../components/travel-text/travel-text')
    },
    methods: {
        insertTweens: function() {
            this.tlTransition.fromTo(this.$el, 0.7, {alpha: 0}, {alpha: 1, ease: Expo.easeOut}, 0.4);
            this.tlTransition.set(window, {scrollTo: {y: this.$findOne('.universes').offsetHeight, x: 0}}, 0.4);
        },
        beforeTransitionIn: function() {
            this.resize();
        },
        resize: function() {
            var backgrounds = this.$find('.background');
            var universes = this.$find('.universe');
            this.transitions.rock = this.$findOne('.transition.crtp-lyo1');
            this.transitions.cloudLeft = this.$findOne('.transition.lyo1-gnor .cloud.left');
            this.transitions.cloudRight = this.$findOne('.transition.lyo1-gnor .cloud.right');
            this.railway = this.$findOne('.railway');
            this.train = this.$findOne('.train');
            var sum = 0;
            // Set universes sizes
            forEach(backgrounds, function(bg, i) {
                TweenMax.set(universes[i], {height: bg.offsetHeight});
                sum += bg.offsetHeight;
            });
            // Set train & railway
            TweenMax.set(this.railway, {height: sum});
            TweenMax.set(this.train, {height: 0.135*(sum/3)});
            // Set transitions
            TweenMax.set(this.transitions.rock, {y: (-(sum/3)-((11/24)*this.transitions.rock.offsetHeight))});
            TweenMax.set(this.transitions.cloudLeft, {y: (-2*(sum/3)-(0.5*this.transitions.cloudLeft.offsetHeight))});
            TweenMax.set(this.transitions.cloudRight, {y: (-2*(sum/3)-(0.5*this.transitions.cloudRight.offsetHeight))});
            // Set texts
            this.setTextsPositions();
        },
        setTextsPositions: function () {
            this.texts = [];
            var width = this.$findOne('.universes').offsetWidth;
            var height = this.$findOne('.universes').offsetHeight;

            forEach(travelTexts, function(text, i) {
                text.pos = {
                    x: text.posPercent.x/100*width + 'px',
                    y: text.posPercent.y/100*height + 'px'
                };
                this.texts.push(text);
            }.bind(this));
            console.log(travelTexts[0].pos);
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

            // Move train
            TweenMax.to(this.train, 0.2, {y: -this.crossedPercent, ease: Cubic.easeOut});

            if (this.universes.order[ this.universes.current ]) {
                var currentClass = '.' + this.universes.order[ this.universes.current ];
                var foregroundEls = this.$find(currentClass + ' .foreground');
                var middlegroundEls = this.$find(currentClass + ' .middleground');

                var crossedPercentInUniverse = 100*( this.crossedPercent/(100/this.universes.count) - this.universes.current );

                TweenMax.to(middlegroundEls, 0.2, {y: -crossedPercentInUniverse, ease: Cubic.easeOut});
                TweenMax.to(foregroundEls, 0.2, {y: 1.1*crossedPercentInUniverse, ease: Cubic.easeOut});

                switch (this.universes.order[ this.universes.current ]) {
                    case 'crtp':
                        if(crossedPercentInUniverse > 55) {
                            var groups = this.$find('.transition.crtp-lyo1 #transition g');
                            TweenMax.staggerTo(groups, 2.0, {y: 1000, autoAlpha: 0, ease: Cubic.easeOut}, 0.08);
                        }

                        break;
                    case 'lyo1':
                        // Move clouds appart
                        TweenMax.to(this.transitions.cloudLeft, 0.2, {x: -crossedPercentInUniverse, ease: Cubic.easeOut});
                        TweenMax.to(this.transitions.cloudRight, 0.2, {x: crossedPercentInUniverse, ease: Cubic.easeOut});

                        break;
                }
            }
        },
        init: function() {
            this.scrollInit = true;
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
