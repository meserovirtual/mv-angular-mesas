(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    if (currentScriptPath.length == 0) {
        currentScriptPath = window.installPath + '/mv-angular-mesas/includes/mv-mesas.php';
    }

    angular.module('mvMesas', [])
        .factory('MesasService', MesasService)
        .service('MesasVars', MesasVars);


    MesasService.$inject = ['$http', 'MesasVars', '$cacheFactory', 'MvUtils', 'MvUtilsGlobals', 'ErrorHandler', '$q'];
    function MesasService($http, MesasVars, $cacheFactory, MvUtils, MvUtilsGlobals, ErrorHandler, $q) {
        //Variables
        var service = {};

        var url = currentScriptPath.replace('mv-mesas.js', '/includes/mv-mesas.php');


        service.get = get;
        service.getByParams = getByParams;

        service.create = create;
        service.update = update;
        service.remove = remove;
        service.save = save;
        service.exist = exist;

        service.goToPagina = goToPagina;
        service.next = next;
        service.prev = prev;

        return service;

        function get() {
            MvUtilsGlobals.startWaiting();
            var urlGet = url + '?function=get';
            var $httpDefaultCache = $cacheFactory.get('$http');
            var cachedData = [];

            // Verifica si existe el cache de usuarios
            if ($httpDefaultCache.get(urlGet) != undefined) {
                if (MesasVars.clearCache) {
                    $httpDefaultCache.remove(urlGet);
                }
                else {
                    var deferred = $q.defer();
                    cachedData = $httpDefaultCache.get(urlGet);
                    deferred.resolve(cachedData);
                    MvUtilsGlobals.stopWaiting();
                    return deferred.promise;
                }
            }

            return $http.get(urlGet, {cache: true})
                .then(function (response) {

                    for (var x in response.data) {
                        response.data[x].cajas = [];
                        for (var i = 1; i <= response.data[x].pos_cantidad; i++) {
                            response.data[x].cajas.push({caja_id: i, nombre: 'Caja ' + i})
                        }
                    }

                    $httpDefaultCache.put(urlGet, response.data);
                    MesasVars.clearCache = false;
                    MesasVars.paginas = (response.data.length % MesasVars.paginacion == 0) ? parseInt(response.data.length / MesasVars.paginacion) : parseInt(response.data.length / MesasVars.paginacion) + 1;
                    MvUtilsGlobals.stopWaiting();
                    return response.data;
                })
                .catch(function (response) {
                    MvUtilsGlobals.stopWaiting();
                    ErrorHandler(response);
                });
        }

        /**
         * @description Retorna la lista filtrada de sucursals
         * @param param -> String, separado por comas (,) que contiene la lista de par?metros de b?squeda, por ej: nombre, sku
         * @param value
         * @param callback
         */
        function getByParams(params, values, exact_match, callback) {
            get(function (data) {
                MvUtils.getByParams(params, values, exact_match, data, callback);
            })
        }


        /*
        function save(mesa) {
            var deferred = $q.defer();

            if (mesa.mesa_id != undefined) {
                console.log('update');
                deferred.resolve(update(mesa));
            } else {
                console.log('create');
                deferred.resolve(create(mesa));
            }
            return deferred.promise;
        }
        */

        function save(mesa) {
            var deferred = $q.defer();

            exist(mesa).then(function(data){
                //console.log(data);
                if(data.length > 0) {
                    //console.log('update');
                    deferred.resolve(update(mesa));
                } else {
                    //console.log('create');
                    deferred.resolve(create(mesa));
                }
            }).catch(function(error){
               console.log(error);
            });
            return deferred.promise;
        }


        /** @name: remove
         * @param sucursal_id
         * @param callback
         * @description: Elimina el sucursal seleccionado.
         */
        function remove(mesa_id) {
            return $http.post(url,
                {function: 'remove', 'mesa_id': mesa_id})
                .then(function (data) {
                    MesasVars.clearCache = true;
                    return data;
                })
                .catch(function (data) {
                    MesasVars.clearCache = true;
                    ErrorHandler(data);
                });
        }

        /**
         * @description: Crea un sucursal.
         * @param sucursal
         * @param callback
         * @returns {*}
         */
        function create(mesa) {
            return $http.post(url,
                {
                    'function': 'create',
                    'mesa': JSON.stringify(mesa)
                })
                .then(function (response) {
                    MesasVars.clearCache = true;
                    return response.data;
                })
                .catch(function (response) {
                    MesasVars.clearCache = true;
                    ErrorHandler(response);
                });
        }

        function exist(mesa) {
            return $http.post(url,
                {
                    'function': 'exist',
                    'mesa': JSON.stringify(mesa)
                })
                .then(function (response) {
                    MesasVars.clearCache = true;
                    return response.data;
                })
                .catch(function (response) {
                    MesasVars.clearCache = true;
                    ErrorHandler(response);
                });
        }


        /** @name: update
         * @param sucursal
         * @param callback
         * @description: Realiza update al sucursal.
         */
        function update(mesa) {
            return $http.post(url,
                {
                    'function': 'update',
                    'mesa': JSON.stringify(mesa)
                })
                .then(function (response) {
                    MesasVars.clearCache = true;
                    return response.data;
                })
                .catch(function (response) {
                    MesasVars.clearCache = true;
                    ErrorHandler(response);
                });
        }

        /**
         * Para el uso de la p?ginaci?n, definir en el controlador las siguientes variables:
         *
         vm.start = 0;
         vm.pagina = SucursalesVars.pagina;
         SucursalesVars.paginacion = 5; Cantidad de registros por p?gina
         vm.end = SucursalesVars.paginacion;


         En el HTML, en el ng-repeat agregar el siguiente filtro: limitTo:appCtrl.end:appCtrl.start;

         Agregar un bot?n de next:
         <button ng-click="appCtrl.next()">next</button>

         Agregar un bot?n de prev:
         <button ng-click="appCtrl.prev()">prev</button>

         Agregar un input para la p?gina:
         <input type="text" ng-keyup="appCtrl.goToPagina()" ng-model="appCtrl.pagina">

         */


        /**
         * @description: Ir a p?gina
         * @param pagina
         * @returns {*}
         * uso: agregar un m?todo
         vm.goToPagina = function () {
                vm.start= SucursalesService.goToPagina(vm.pagina).start;
            };
         */
        function goToPagina(pagina) {

            if (isNaN(pagina) || pagina < 1) {
                MesasVars.pagina = 1;
                return SucursalesVars;
            }

            if (pagina > MesasVars.paginas) {
                MesasVars.pagina = MesasVars.paginas;
                return MesasVars;
            }

            MesasVars.pagina = pagina - 1;
            MesasVars.start = MesasVars.pagina * MesasVars.paginacion;
            return MesasVars;

        }

        /**
         * @name next
         * @description Ir a pr?xima p?gina
         * @returns {*}
         * uso agregar un metodo
         vm.next = function () {
                vm.start = SucursalesService.next().start;
                vm.pagina = SucursalesVars.pagina;
            };
         */
        function next() {
            if (MesasVars.pagina + 1 > MesasVars.paginas) {
                return MesasVars;
            }
            MesasVars.start = (MesasVars.pagina * MesasVars.paginacion);
            MesasVars.pagina = MesasVars.pagina + 1;
            //SucursalesVars.end = SucursalesVars.start + SucursalesVars.paginacion;
            return MesasVars;
        }

        /**
         * @name previous
         * @description Ir a p?gina anterior
         * @returns {*}
         * uso, agregar un m?todo
         vm.prev = function () {
                vm.start= SucursalesService.prev().start;
                vm.pagina = SucursalesVars.pagina;
            };
         */
        function prev() {
            if (MesasVars.pagina - 2 < 0) {
                return MesasVars;
            }
            //MesasVars.end = MesasVars.start;
            MesasVars.start = (MesasVars.pagina - 2 ) * MesasVars.paginacion;
            MesasVars.pagina = MesasVars.pagina - 1;
            return MesasVars;
        }
    }


    MesasVars.$inject = [];
    /**
     * @description Almacena variables temporales de sucursales
     * @constructor
     */
    function MesasVars() {
        // Cantidad de páginas total del recordset
        this.paginas = 1;
        // Página seleccionada
        this.pagina = 1;
        // Cantidad de registros por página
        this.paginacion = 10;
        // Registro inicial, no es página, es el registro
        this.start = 0;


        // Indica si se debe limpiar el cache la próxima vez que se solicite un get
        this.clearCache = true;

    }
})();