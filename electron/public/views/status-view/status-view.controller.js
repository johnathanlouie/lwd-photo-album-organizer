const angular = require('angular');
const _ = require('lodash');
import QueryServerService from '../../services/query-server.service.js';
import ModalService from '../../services/modal.service.js';
import OptionsService from '../../services/options.service.js';
import MongoDbService from '../../services/mongodb.service.js';


class Evaluations {

    arr = [];

    add(e) { this.arr.push(e); }

    isEvaluated(model) {
        for (let i of this.arr) {
            if (_.isEqual(i.model, model)) { return true; }
        }
        return false;
    }

}


class Controller {

    #scope;
    #queryServer;
    #modal;
    #options;
    #mongoDb;

    #evaluations;
    #quit = false;

    static $inject = ['$scope', 'queryServer', 'modal', 'options', 'mongoDb'];

    /**
     * @param {angular.IScope} $scope 
     * @param {QueryServerService} queryServer
     * @param {ModalService} modal
     * @param {OptionsService} options
     * @param {MongoDbService} mongoDb
     */
    constructor($scope, queryServer, modal, options, mongoDb) {
        this.#scope = $scope;
        this.#queryServer = queryServer;
        this.#modal = modal;
        this.#options = options;
        this.#mongoDb = mongoDb;

        this.#evaluations = new Evaluations();
        $scope.evaluations = this.#evaluations;

        let progressBar = {
            total() { return options.modelCount(); },
            current() { return $scope.evaluations.arr.length; },
            percentage() { return Math.round(this.current() / this.total() * 100); },
            style() { return { width: `${this.percentage()}%` }; },
        };

        $scope.progressBar = progressBar;

        this.init();
    }

    $onDestroy() { this.#quit = true; }

    async evaluateAll() {
        this.#modal.showLoading('EVALUATING...');
        this.#evaluations.arr = await this.#queryServer.evaluateAll();
        this.#modal.hideLoading();
        this.#scope.$apply();
    }

    async doAll() {
        for (let model of this.#options.models()) {
            if (this.#quit) { return; }
            if (!this.#evaluations.isEvaluated(model)) {
                try {
                    let result = await this.#queryServer.evaluate(model);
                    await this.#mongoDb.insertOne('evaluations', result);
                    this.#evaluations.add(result);
                    this.#scope.$apply();
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    }

    async loadOptions() {
        await this.#options.load();
    }

    async getEvaluated() {
        this.#evaluations.arr = await this.#mongoDb.getAll('evaluations');
    }

    async init() {
        try {
            this.#modal.showLoading('RETRIEVING...');
            await Promise.all([this.getEvaluated(), this.loadOptions()]);
            this.#modal.hideLoading();
            await this.doAll();
        } catch (e) {
            console.error(e);
            this.#modal.hideLoading();
            this.#modal.showError(e, 'ERROR: Deep Learning', 'Error while evaluating');
        }
    }

}


export default Controller;
