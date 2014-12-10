'use strict';

var Vue = require('vue'),
    TweenMax = require('TweenMax'),
    extend = require('extend'),
    section = require('base/section'),
    forEach = require('forEach'),
    resizeUtil = require('common/utils/resize-util'),
    scrollUtil = require('common/utils/scroll-util'),
    bindAll = require('bindall-standalone'),
    request = require('superagent'),
    config = require('common/config'),
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
        freeScroll: false,
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
            if(!config.useFakeData) {
                this.getData();
            }
            this.resize();
        },
        getData: function () {
            // general informations
            request.get(config.apiUrl + '/general', function(res){
                if(res.status >= 400) {
                    return;
                }

                var data = JSON.parse(res.text);
                travelTexts[16].first.content = data.nbVoyagers/1000000;
                travelTexts[15].first.content = data.nbTrainsDay;
                travelTexts[14].first.content = data.nbStations;
                travelTexts[13].second.content = data.sncf.percentOfNetwork + '%';
                travelTexts[12].first.content = data.sncf.percentOfTraffic + '%';
                travelTexts[11].first.content = data.sncf.percentOfTravellers + '%';
            });

            // data about Gare de Lyon
            request.get(config.apiUrl + '/ecs/LYO1', function(res) {
                if (res.status >= 400) {
                    return;
                }

                var travellersDay = JSON.parse(res.text);
                travelTexts[8].second.content = 'c\'est ' + travellersDay;

                request.get(config.apiUrl + '/ecs-rushhour/LYO1', function(res) {
                    if (res.status >= 400) {
                        return;
                    }
                    var data = JSON.parse(res.text);
                    travelTexts[7].second.content = (travellersDay > 0) ? Math.floor(100*(data/ travellersDay)) + '%' : 0 + '%';
                });
            });

            request.get(config.apiUrl + '/ecs-time/LYO1/0905', function(res) {
                if (res.status >= 400) {
                    return;
                }

                var data = JSON.parse(res.text);
                var prevCount = 0;
                travelTexts[6].first.content = prevCount = data;

                request.get(config.apiUrl + '/ecs-time/LYO1/0850', function(res) {
                    if (res.status >= 400) {
                        return;
                    }

                    var data = (JSON.parse(res.text) > 0) ? JSON.parse(res.text) : 1;
                    var end = (prevCount > data) ? ' fois moins' : ' fois plus';
                    travelTexts[5].first.content = Math.floor(prevCount/data) + end;

                    var seatsBusy = (1/prevCount/data)*1850;
                    var seatsFree = 1850 - seatsBusy;
                    travelTexts[3].second.content = 'c\'est ' +  Math.floor(seatsFree*100/1850) + '%';

                });
            });

        },
        resize: function() {
            var backgrounds = this.$find('.background');
            var universes = this.$find('.universe');
            this.transitions.rock = this.$findOne('.transition.crtp-lyo1');
            this.transitions.cloudLeft = this.$findOne('.transition.lyo1-gnor .cloud.left');
            this.transitions.cloudRight = this.$findOne('.transition.lyo1-gnor .cloud.right');
            this.transitions.cloudEndLeft = this.$findOne('.transition.gnor-end .cloud.left');
            this.transitions.cloudEndRight = this.$findOne('.transition.gnor-end .cloud.right');
            this.railway = this.$findOne('.railway svg');

            // Set last screen
            TweenMax.set(this.$findOne('.end'), {height: resizeUtil.height});

            // Set universes sizes
            var sum = 0;
            forEach(backgrounds, function(bg, i) {
                TweenMax.set(universes[i], {height: bg.offsetHeight});
                sum += bg.offsetHeight;
            });

            // Set train & railway
            TweenMax.set(this.railway, {y: resizeUtil.height,height: sum, width: this.$findOne('.universes').offsetWidth});
            this.railway.pauseAnimations();

            // Set transitions
            TweenMax.set(this.transitions.rock, {y: (-(sum/3)-((11/24)*this.transitions.rock.offsetHeight))});
            TweenMax.set(this.transitions.cloudLeft, {y: (-2*(sum/3)-(0.5*this.transitions.cloudLeft.offsetHeight))});
            TweenMax.set(this.transitions.cloudRight, {y: (-2*(sum/3)-(0.5*this.transitions.cloudRight.offsetHeight))});
            TweenMax.set(this.transitions.cloudEndLeft, {y: -(sum)-(0.5*this.transitions.cloudEndLeft.offsetHeight)});
            TweenMax.set(this.transitions.cloudEndRight, {y: -(sum)-(0.5*this.transitions.cloudEndRight.offsetHeight)});

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
                    y: resizeUtil.height + text.posPercent.y/100*height + 'px'
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

            this.crossedPercent = 100 - ( scrollUtil.y / this.$findOne('.universes').offsetHeight )*100;
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
                    case 'gnor':
                        // Move clouds appart
                        TweenMax.to(this.transitions.cloudEndLeft, 0.4, {x: -1.2*crossedPercentInUniverse, ease: Cubic.easeOut});
                        TweenMax.to(this.transitions.cloudEndRight, 0.4, {x: 1.2*crossedPercentInUniverse, ease: Cubic.easeOut});

                        break;
                }
            }
        },
        init: function() {
            this.scrollInit = true;
            // Back to top
            TweenMax.to(window, 80, {
                scrollTo: {
                    y: 0,
                    x: 0
                },
                ease: Linear.easeNone,
                delay:  1,
                onComplete: function () {
                    this.freeScroll = true;
                }.bind(this)
            });
            resizeUtil.addListener(this.resize);
            scrollUtil.addListener(this.scroll);

            this.$el.addEventListener('mousewheel', function (e) {
                if (false === this.freeScroll) {
                    e.preventDefault();
                }
            }.bind(this));
            this.$el.addEventListener('DOMMouseScroll', function (e) {
                // firefox
                if (false === this.freeScroll) {
                    e.preventDefault();
                }
            }.bind(this));
        }
    },

    ready: function() {
        this.$once('section:transitionInComplete', function() {
            this.init();
        });
        bindAll(this, 'resize', 'scroll', 'init', 'getData');
    },
    beforeDestroy: function() {
        resizeUtil.removeListener(this.resize);
        scrollUtil.removeListener(this.scroll);
    }
});
