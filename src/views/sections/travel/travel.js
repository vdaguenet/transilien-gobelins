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
        progress: 0,
        scrollInit: false,
        freeScroll: false,
        crossedPercent: 0,
        station: {
            el: undefined,
            open: false,
            url: undefined
        },
        universes: {
            count: 3,
            current: 0,
            order: ['crtp', 'lyo1', 'gnor']
        },
        transitions: {
            rock: undefined,
            cloudLeft: undefined,
            cloudRight: undefined,
            cloudEndLeft: undefined,
            cloudEndRight: undefined
        },
        railway: undefined,
        scrollEnd: null,
        texts: []
    },
    components: {
        'travel-text': require('../../components/travel-text/travel-text')
    },
    methods: {
        load: function () {
            /*
                Obtain data and update progress
             */
            this.$on('data:received', function () {
                var nbRequest = 5;
                this.progress++;
                this.$findOne('#percent').innerText = Math.floor((this.progress/nbRequest)*100);
                if ( this.progress == nbRequest ) {
                    // On complete
                    this.$emit('ready');
                }
            });

            this.getData();
        },
        insertTweens: function() {
            /*
                Insert twenns in global timeline
             */
            this.tlTransition.set(this.$findOne('.main'), {alpha: 0}, 0);
            this.tlTransition.set(this.$findOne('.loader'), {alpha: 1}, 0);
            this.tlTransition.fromTo(this.$el, 0.3, {alpha: 0}, {alpha: 1, ease: Expo.easeOut}, 0);
        },
        beforeTransitionIn: function() {
            /*
                Resize elements and pause svg animations
             */
            this.railway = this.$findOne('.railway svg');
            this.railway.pauseAnimations();
            this.resize();
        },
        getData: function () {
            /*
                Ask data to API
             */
            request.get(config.apiUrl + '/general', function(res){
                // general SNCF informations
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
                this.$emit('data:received');
            }.bind(this));

            request.get(config.apiUrl + '/ecs/LYO1/20140301', function(res) {
                // data about Gare de Lyon
                if (res.status >= 400) {
                    return;
                }

                var travellersDay = JSON.parse(res.text);
                travelTexts[8].second.content = 'c\'est <span id="value">' + travellersDay + '</span>';
                this.$emit('data:received');

                request.get(config.apiUrl + '/ecs-rushhour/LYO1/20140301', function(res) {
                    if (res.status >= 400) {
                        return;
                    }
                    var data = JSON.parse(res.text);
                    travelTexts[7].second.content = (travellersDay > 0) ? Math.floor(100*(data/ travellersDay)) + '%' : 0 + '%';
                    this.$emit('data:received');
                }.bind(this));
            }.bind(this));

            request.get(config.apiUrl + '/ecs-time/LYO1/0905', function(res) {
                // data for Gare de Lyon at time 09h05
                if (res.status >= 400) {
                    return;
                }

                var data = JSON.parse(res.text);
                var prevCount = 0;
                travelTexts[6].first.content = prevCount = data;
                this.$emit('data:received');

                request.get(config.apiUrl + '/ecs-time/LYO1/0850', function(res) {
                    // idem at time 08h50 and compare it with previous data
                    if (res.status >= 400) {
                        return;
                    }

                    var data = (JSON.parse(res.text) > 0) ? JSON.parse(res.text) : 1;
                    var end = (prevCount > data) ? ' fois moins' : ' fois plus';
                    travelTexts[5].first.content = Math.floor(prevCount/data) + end;
                    // 1850 = how many seated places a train has.
                    travelTexts[3].second.content = 'c\'est ' +  Math.floor((1/prevCount/data)*1850) + '%';
                    this.$emit('data:received');
                }.bind(this));
            }.bind(this));

        },
        resize: function() {
            /*
                Resize and replace elements
             */
            var backgrounds = this.$find('.background');
            var universes = this.$find('.universe');
            this.transitions.rock = this.$findOne('.transition.crtp-lyo1');
            this.transitions.cloudLeft = this.$findOne('.transition.lyo1-gnor .cloud.left');
            this.transitions.cloudRight = this.$findOne('.transition.lyo1-gnor .cloud.right');
            this.transitions.cloudEndLeft = this.$findOne('.transition.gnor-end .cloud.left');
            this.transitions.cloudEndRight = this.$findOne('.transition.gnor-end .cloud.right');
            this.station.el = this.$findOne('.station-modal');

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
            /*
                Place texts
             */
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
            /*
                Handle scroll
             */
            if (false === this.scrollInit) return;

            // Prevent scrollX
            // Even if horizontal scrollbar is not visible, people using trackbad can scroll on X
            // I know it's bad but overflow-x: hidden kills my images
            if (scrollUtil.x > 0) {
                TweenMax.set(window, {scrollTo: {x: 0}});
            }

            // Calc user progress
            this.crossedPercent = 100 - ( scrollUtil.y / this.$findOne('.universes').offsetHeight )*100;
            this.universes.current = Math.floor( this.crossedPercent/(100/this.universes.count) );

            if (this.universes.order[ this.universes.current ]) {
                // In an universe
                var currentClass = '.' + this.universes.order[ this.universes.current ];
                var crossedPercentInUniverse = 100*( this.crossedPercent/(100/this.universes.count) - this.universes.current );

                var foregroundEls = this.$find(currentClass + ' .foreground');
                var middlegroundEls = this.$find(currentClass + ' .middleground');

                // paralax
                TweenMax.to(middlegroundEls, 0.2, {y: -0.9*crossedPercentInUniverse, ease: Cubic.easeOut});
                TweenMax.to(foregroundEls, 0.2, {y: 1.6*crossedPercentInUniverse, ease: Cubic.easeOut});

                // transitions
                switch (this.universes.order[ this.universes.current ]) {
                    case 'crtp':
                        // Reverse train
                        if(crossedPercentInUniverse > 90) {
                            this.addClass('reversed', '.train');
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
        animateTexts: function () {
            /*
                Animations to make texts appear
             */
            var travellersDay = parseInt(this.$findOne('#value').innerText);

            this.tlTexts = new TimelineMax();
            this.tlTexts.set(this.$findOne('#text-16'), {alpha: 1}, 0);
            this.tlTexts.staggerFromTo(this.$find('#text-16 .line'), 0.6, {x: 100, alpha: 0}, {x: 0, alpha: 1, ease: Expo.easeInOut}, 0.06, 0);
            this.tlTexts.set(this.$findOne('#text-15'), {alpha: 1}, 0.4);
            this.tlTexts.staggerFromTo(this.$find('#text-15 .line'), 0.6, {x: -100, alpha: 0}, {x: 0, alpha: 1, ease: Expo.easeInOut}, 0.06, 0.4);
            this.tlTexts.set(this.$findOne('#text-14'), {alpha: 1}, 0.8);
            this.tlTexts.staggerFromTo(this.$find('#text-14 .line'), 0.6, {x: 100, alpha: 0}, {x: 0, alpha: 1, ease: Expo.easeInOut}, 0.06, 0.8);
            this.tlTexts.set(this.$findOne('#text-13'), {alpha: 1}, 4);
            this.tlTexts.staggerFromTo(this.$find('#text-13 .line'), 0.6, {x: -100, alpha: 0}, {x: 0, alpha: 1, ease: Expo.easeInOut}, 0.06, 4);
            this.tlTexts.set(this.$findOne('#text-12'), {alpha: 1}, 6);
            this.tlTexts.staggerFromTo(this.$find('#text-12 .line'), 0.6, {scale: 0}, {scale: 1, ease: Back.easeOut}, 0.06, 6);
            this.tlTexts.set(this.$findOne('#text-11'), {alpha: 1}, 9);
            this.tlTexts.staggerFromTo(this.$find('#text-11 .line'), 0.6, {scale: 0}, {scale: 1, ease: Back.easeOut}, 0.06, 9);
            this.tlTexts.set(this.$findOne('#text-10'), {alpha: 1}, 12);
            this.tlTexts.staggerFromTo(this.$find('#text-10 .line'), 0.6, {y: -70, alpha: 0}, {y: 0, alpha: 1, ease: Expo.easeOut}, 0.06, 12);
            this.tlTexts.set(this.$findOne('#text-9'), {alpha: 1}, 24);
            this.tlTexts.staggerFromTo(this.$find('#text-9 .line'), 0.6, {alpha: 0}, {alpha: 1, ease: Expo.easeInOut}, 0.06, 24);
            this.tlTexts.set(this.$findOne('#text-8'), {alpha: 1}, 26);
            this.tlTexts.staggerFromTo(this.$find('#text-8 .line'), 0.6, {alpha: 0}, {alpha: 1, ease: Expo.easeInOut}, 0.06, 26);
            this.tlTexts.fromTo(this.$findOne('#value'), 1.2, {innerText: 0}, {innerText: travellersDay, ease: Linear.easeNone,
                onUpdate: function () {
                    this.$findOne('#value').innerText = Math.floor(this.$findOne('#value').innerText);
                }.bind(this)
            }, 26);
            this.tlTexts.set(this.$findOne('#text-7'), {alpha: 1}, 32);
            this.tlTexts.staggerFromTo(this.$find('#text-7 .line'), 0.6, {x: 100, alpha: 0}, {x: 0, alpha: 1, ease: Back.easeOut}, 0.06, 32);
            this.tlTexts.set(this.$findOne('#text-6'), {alpha: 1}, 37);
            this.tlTexts.staggerFromTo(this.$find('#text-6 .line'), 0.6, {alpha: 0}, {alpha: 1, ease: Expo.easeInOut}, 0.06, 37);
            this.tlTexts.set(this.$findOne('#text-5'), {alpha: 1}, 44.2);
            this.tlTexts.fromTo(this.$find('#text-5 .line')[0], 0.4, {y: -50, alpha: 0}, {y: 0, alpha: 1,ease: Quart.easeOut}, 44.2);
            this.tlTexts.fromTo(this.$find('#text-5 .line')[1], 0.4, {y: 50, alpha: 0}, {y: 0, alpha: 1, ease: Quart.easeOut},44.3);
            this.tlTexts.set(this.$findOne('#text-4'), {alpha: 1}, 52);
            this.tlTexts.staggerFromTo(this.$find('#text-4 .line'), 0.6, {alpha: 0}, {alpha: 1, ease: Expo.easeInOut}, 0.06, 52);
            this.tlTexts.set(this.$findOne('#text-3'), {alpha: 1}, 58);
            this.tlTexts.staggerFromTo(this.$find('#text-3 .line'), 0.6, {scale: 0}, {scale: 1, ease: Back.easeOut}, 0.06, 58);
            this.tlTexts.set(this.$findOne('#text-2'), {alpha: 1}, 63);
            this.tlTexts.staggerFromTo(this.$find('#text-2 .line'), 0.6, {y: -70, alpha: 0}, {y: 0, alpha: 1, ease: Expo.easeOut}, 0.06, 63);
            this.tlTexts.set(this.$findOne('#text-1'), {alpha: 1}, 64.5);
            this.tlTexts.staggerFromTo(this.$find('#text-1 .line'), 1.5, {y: -100, alpha: 0}, {y: 0, alpha: 1, ease: Expo.easeOut}, 0.2, 64.5);
            this.tlTexts.set(this.$findOne('#text-0'), {alpha: 1}, 71);
            this.tlTexts.staggerFromTo(this.$find('#text-0 .line'), 0.6, {x: -100, alpha: 0}, {x: 0, alpha: 1, ease: Back.easeOut}, 0.06, 71);
        },
        onStationClick: function (id) {
            /*
                Open station modal
             */
            if (!id) {
                return;
            }

            this.railway.pauseAnimations();
            this.tlScroll.pause();
            this.tlTexts.pause();
            if(this.tlStation) {
                this.tlStation.kill();
            }
            this.tlStation = new TimelineMax({
                onStart: function () {
                    this.station.open = true;
                    this.station.url = '../assets/images/stations/' + id + '.jpg';
                }.bind(this),
                onReverseComplete: function () {
                    this.station.open = false;
                    this.station.url = undefined;
                    this.railway.unpauseAnimations();
                    this.tlScroll.play();
                    this.tlTexts.play();
                }.bind(this)
            });
            this.tlStation.fromTo(this.station.el, 0.7,
                {width: '0%', height: 4},
                {width: '100%', height: 4, ease: Expo.easeInOut},
            0);
            this.tlStation.fromTo(this.station.el, 0.4,
                {height: 4},
                {height: '100%', ease: Expo.easeInOut},
            0.7);
            this.tlStation.fromTo(this.$findOne('.station-modal .content'), 0.4,
                {alpha: 0},
                {alpha: 1, ease: Expo.easeInOut},
            0.8);
            this.tlStation.fromTo(this.$findOne('.station-modal .close'), 0.3,
                {alpha: 0},
                {alpha: 1, ease: Expo.easeInOut},
            1.1);
        },
        onCloseStationClick: function () {
            /*
                Close station modal
             */
            if(this.tlStation) {
                this.tlStation.kill();
            }
            this.tlStation.reverse();
        },
        init: function() {
            /*
                Init events and launch automatic scroll
             */
            this.scrollInit = true;

            this.tlScroll = new TimelineMax({
                onComplete: function () {
                    this.freeScroll = true;
                }.bind(this)
            });
            this.tlScroll.set(window, {scrollTo: {y: this.$findOne('.universes').offsetHeight, x: 0}}, 0);
            this.tlScroll.to(this.$findOne('.main'), 0.2, {alpha: 1}, 0);
            this.tlScroll.to(this.$findOne('.loader'), 0.2, {alpha: 0}, 0);
            this.tlScroll.call(this.animateTexts, [], this, 0.2);
            // Back to top
            this.tlScroll.to(window, 80, {
                scrollTo: {
                    y: 0,
                    x: 0
                },
                ease: Linear.easeNone,
                onStart: function () {
                    this.railway.unpauseAnimations();
                }.bind(this)
            }, 2);

            //
            // Events
            //
            resizeUtil.addListener(this.resize);
            scrollUtil.addListener(this.scroll);

            this.$findOne('.close').addEventListener('click', this.onCloseStationClick.bind(this));

            this.$findOne('#stations').addEventListener('click', function (e) {
                if (e.target == e.currentTarget) {
                    return;
                }

                this.onStationClick(e.target.id);
            }.bind(this));

            // My apologizes to the #TeamScrollLibre :(
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
        /*
            VueModel is ready
         */
        this.$once('ready', function() {
            this.init();
        });

        this.$once('section:transitionInComplete', function() {
            if(config.useFakeData) {
                this.$emit('ready');
            } else {
                this.load();
            }
        });

        bindAll(this, 'resize', 'scroll', 'init', 'getData');
    },
    beforeDestroy: function() {
        /*
            Remove all listeners
         */
        resizeUtil.removeListener(this.resize);
        scrollUtil.removeListener(this.scroll);
        this.$findOne('.close').removeEventListener('click', this.onCloseStationClick.bind(this));
        this.$findOne('#stations').removeEventListener('click', function (e) {
            if (e.target == e.currentTarget) {
                return;
            }
            this.onStationClick(e.target.id);
        }.bind(this));
        this.$el.removeEventListener('mousewheel', function (e) {
            if (false === this.freeScroll) {
                e.preventDefault();
            }
        }.bind(this));
        this.$el.removeEventListener('DOMMouseScroll', function (e) {
            // firefox
            if (false === this.freeScroll) {
                e.preventDefault();
            }
        }.bind(this));
    }
});
