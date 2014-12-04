'use strict';

var API_URL = 'http://sncf-gobelins.dev/api';

var Vue = require('vue'),
    TweenMax = require('TweenMax'),
    extend = require('extend'),
    section = require('base/section'),
    forEach = require('forEach'),
    resizeUtil = require('common/utils/resize-util'),
    scrollUtil = require('common/utils/scroll-util'),
    bindAll = require('bindall-standalone'),
    request = require('superagent'),
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
        dataInit: false,
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
        scrollEnd: null,
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
            this.getData();
            this.resize();
        },
        getData: function () {
            request.get(API_URL + '/general', function(res){
                if(res.status < 400) {
                    var data = JSON.parse(res.text);
                    console.log(data);
                    travelTexts[16].first.content = data.nbVoyagers/1000000;
                    travelTexts[15].first.content = data.nbTrainsDay;
                    travelTexts[14].first.content = data.nbStations;
                    travelTexts[13].second.content = data.sncf.percentOfNetwork + '%';
                    travelTexts[12].first.content = data.sncf.percentOfTraffic + '%';
                    travelTexts[11].first.content = data.sncf.percentOfTravellers + '%';
                }
            }.bind(this));

        },
        resize: function() {
            var backgrounds = this.$find('.background');
            var universes = this.$find('.universe');
            this.transitions.rock = this.$findOne('.transition.crtp-lyo1');
            this.transitions.cloudLeft = this.$findOne('.transition.lyo1-gnor .cloud.left');
            this.transitions.cloudRight = this.$findOne('.transition.lyo1-gnor .cloud.right');
            this.railway = this.$findOne('.railway svg');

            // Set universes sizes
            var sum = 0;
            forEach(backgrounds, function(bg, i) {
                TweenMax.set(universes[i], {height: bg.offsetHeight});
                sum += bg.offsetHeight;
            });

            // Set train & railway
            TweenMax.set(this.railway, {height: sum, width: this.$findOne('.universes').offsetWidth});
            this.railway.pauseAnimations();

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
                if (this.scrollEnd) {
                    clearTimeout(this.scrollEnd);
                }
                this.railway.unpauseAnimations();
                this.scrollEnd = setTimeout(function () {
                    this.railway.pauseAnimations();
                }.bind(this), 400);

                var currentClass = '.' + this.universes.order[ this.universes.current ];
                var crossedPercentInUniverse = 100*( this.crossedPercent/(100/this.universes.count) - this.universes.current );

                var foregroundEls = this.$find(currentClass + ' .foreground');
                var middlegroundEls = this.$find(currentClass + ' .middleground');

                var origin, handleOrigin, handleDest, dest;
                var ratio = 1;

                TweenMax.to(middlegroundEls, 0.2, {y: -0.9*crossedPercentInUniverse, ease: Cubic.easeOut});
                TweenMax.to(foregroundEls, 0.2, {y: 1.6*crossedPercentInUniverse, ease: Cubic.easeOut});

                switch (this.universes.order[ this.universes.current ]) {
                    case 'crtp':
                        // Let break that rock!
                        if(crossedPercentInUniverse > 45) {
                            var groups = this.$find('.transition.crtp-lyo1 #transition g');
                            TweenMax.staggerTo(groups, 2.3, {y: 1000, autoAlpha: 0, ease: Cubic.easeOut}, 0.08);
                        }

                        break;
                    case 'lyo1':
                        // Move clouds appart
                        TweenMax.to(this.transitions.cloudLeft, 0.4, {x: -1.2*crossedPercentInUniverse, ease: Cubic.easeOut});
                        TweenMax.to(this.transitions.cloudRight, 0.4, {x: 1.2*crossedPercentInUniverse, ease: Cubic.easeOut});

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
