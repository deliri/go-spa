(function() {
    'use strict';
    angular.module('app.group', [
            'ui.router',
            'ngDialog',
            'angular-storage',
            'angular-jwt',
            'app.main'
        ])
        .config(Config)
        .factory('Group', ['$http', '$q', Group])
        .controller('GroupListCtrl', ['ngDialog', 'groups', 'Group', 'Flash', GroupListCtrl])
        .controller('GroupEditCtrl', ['group', GroupEditCtrl])
        .controller('GroupNewCtrl', ['$state', 'Flash', 'Group', GroupNewCtrl]);

    function Config($stateProvider) {
        $stateProvider
            .state('group', {
                abstract: true,
                url: '/group',
                template: '<ui-view/>',
                resolve: {
                    Group: 'Group'
                }
            })
            .state('group.list', {
                url: '/list',
                templateUrl: 'app/group/group.list.tmpl.html',
                controller: 'GroupListCtrl as vm',
                resolve: {
                    groups: function(Group) {
                        return Group.getAll();
                    }
                }
            })
            .state('group.edit', {
                url: '/edit/:groupId',
                templateUrl: 'app/group/group.edit.tmpl.html',
                controller: 'GroupEditCtrl as vm',
                resolve: {
                    group: function($stateParams, Group) {
                        return Group.getById($stateParams.groupId);
                    }
                }
            })
            .state('group.new', {
                url: '/new',
                templateUrl: 'app/group/group.new.tmpl.html',
                controller: 'GroupNewCtrl as vm'
            });
    }

    function Group($http, $q) {
        function getAll() {
            var deferred = $q.defer();
            $http.get("/api/v1/group")
                .then(function success(response) {
                    deferred.resolve(response.data);
                })
                .catch(function error(response) {
                    deferred.reject(response.data.error);
                });
            return deferred.promise;
        }

        function getById(id) {
            var deferred = $q.defer();
            $http.get("/api/v1/group/" + id)
                .then(function success(response) {
                    deferred.resolve(response.data);
                })
                .catch(function error(response) {
                    deferred.reject(response.data.error);
                });
            return deferred.promise;
        }

        function remove(group) {
            var deferred = $q.defer();
            $http.delete("/api/v1/group/" + group.id)
                .then(function success(response) {
                    deferred.resolve(response.data);
                })
                .catch(function error(response) {
                    deferred.reject(response.data.error);
                });
            return deferred.promise;
        }

        function add(group) {
            var deferred = $q.defer();
            $http.post("/api/v1/group", group)
                .then(function success(response) {
                    deferred.resolve(response.data);
                })
                .catch(function error(response) {
                    deferred.reject(response.data.error);
                });
            return deferred.promise;
        }
        return {
            getAll: getAll,
            getById: getById,
            remove: remove,
            add: add
        }
    }

    function GroupListCtrl(ngDialog, groups, Group, Flash) {
        var vm = this;
        vm.groups = groups;
        vm.deleteDlg = function(group) {
            vm.group = group;
            ngDialog.open({
                template: 'deleteDlgTmpl',
                data: vm
            });
        }
        vm.delete = function() {
            Group.remove(vm.group)
                .then(function success(response) {
                    Group.getAll()
                        .then(function success(response) {
                            vm.groups = response;
                        });
                    Flash.show("Deleted");
                    vm.group = null;
                })
                .catch(function error(response) {
                    Flash.show("Error!");
                });
        }
    }

    function GroupEditCtrl(group) {
        var vm = this;
        vm.group = group;
    }

    function GroupNewCtrl($state, Flash, Group) {
        var vm = this;
        vm.error = null;
        vm.group = {};
        vm.save = function(valid) {
            Group.add(vm.group)
                .then(function success(response) {
                    Flash.show('Group ' + vm.group.name + ' created!');
                    $state.go('group.list');
                })
                .catch(function error(response) {
                    vm.error = response;
                });
        }
    }
})();
