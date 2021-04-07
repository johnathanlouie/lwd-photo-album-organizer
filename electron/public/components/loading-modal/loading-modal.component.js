'use strict';



angular.module('components').component('loadingModal', {
    templateUrl: 'components/loading-modal/loading-modal.template.html',
    controller: ['$scope', '$rootScope', '$interval', function ($scope, $rootScope, $interval) {

        var loadingOverlay = {
            _stopwatch: {
                _time: 0,
                _interval: null,
                get time() { return this._time; },
                reset() { this._time = 0; },

                stop() {
                    if (this._interval !== null) {
                        $interval.cancel(this._interval);
                        this._interval = null;
                    }
                },

                start() { this._interval = $interval(() => { this._time += .01; }, 10); },

                restart() {
                    this.stop();
                    this.reset();
                    this.start();
                },

                isActive() { return this._interval !== null; },
            },

            get timeElapsed() { return this._stopwatch.time; },

            show() {
                if (!this._stopwatch.isActive()) {
                    this._stopwatch.restart();
                    $('#loadingModal').modal();
                }
            },

            hide() {
                this._stopwatch.stop();
                $('#loadingModal').modal('hide');
            },
        };

        $rootScope.$on('LOADING_MODAL_SHOW', () => { loadingOverlay.show(); });
        $rootScope.$on('LOADING_MODAL_HIDE', () => { loadingOverlay.hide(); });
        $scope.timeElapsed = function () { return loadingOverlay.timeElapsed; };

    }],
});
