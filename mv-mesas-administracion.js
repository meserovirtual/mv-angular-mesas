(function () {
    'use strict';

    angular.module('mvMesasAdministracion', [])
        .component('mvMesasAdministracion', mvMesasAdministracion());

    function mvMesasAdministracion() {
        return {
            bindings: {
                searchFunction: '&'
            },
            templateUrl: window.installPath + '/mv-angular-mesas/mv-mesas-administracion.html',
            controller: MvMesasController
        }
    }

    MvMesasController.$inject = ["MesasVars", 'MesasService', "MvUtils"];
    /**
     * @param AcUsuarios
     * @constructor
     */
    function MvMesasController(MesasVars, MesasService, MvUtils) {
        var vm = this;

        vm.mesas = [];
        vm.mesa = {};
        vm.detailsOpen = false;

        vm.save = save;
        vm.cancel = cancel;
        vm.setData = setData;
        vm.loadMesas = loadMesas;
        vm.remove = remove;

        var element1 = angular.element(document.getElementById('nombre'));
        var element2 = angular.element(document.getElementById('direccion'));
        var element3 = angular.element(document.getElementById('telefono'));

        element1[0].addEventListener('focus', function () {
            element1[0].classList.remove('error-input');
            element1[0].removeEventListener('focus', removeFocus);
        });

        element2[0].addEventListener('focus', function () {
            element2[0].classList.remove('error-input');
            element2[0].removeEventListener('focus', removeFocus);
        });

        element3[0].addEventListener('focus', function () {
            element3[0].classList.remove('error-input');
            element3[0].removeEventListener('focus', removeFocus);
        });

        function removeFocus() { }


        loadMesas();

        function loadMesas() {
            MesasService.get().then(function (data) {
                setData(data);
            });
        }

        function save() {

            if(vm.sucursal.nombre === undefined || vm.sucursal.nombre.length === 0) {
                element1[0].classList.add('error-input');
                MvUtils.showMessage('error', 'El nombre no puede ser vacio');
                return;
            }

            if(vm.sucursal.direccion === undefined || vm.sucursal.direccion.length === 0) {
                element2[0].classList.add('error-input');
                MvUtils.showMessage('error', 'La dirección no puede ser vacio');
                return;
            }

            MesasService.save(vm.mesa).then(function (data) {
                vm.detailsOpen = (data === undefined || data < 0) ? true : false;
                if(data === undefined) {
                    element1[0].classList.add('error-input');
                    element2[0].classList.add('error-input');
                    MvUtils.showMessage('error', 'Error actualizando el dato');
                }
                else {
                    vm.mesa = {};
                    loadMesas();
                    element1[0].classList.remove('error-input');
                    element2[0].classList.remove('error-input');
                    MvUtils.showMessage('success', 'La operación se realizó satisfactoriamente');
                }
            }).catch(function (data) {
                vm.mesa = {};
                vm.detailsOpen = true;
            });

        }

        function setData(data) {
            vm.mesas = data;
            vm.paginas = MesasVars.paginas;
        }

        function remove() {
            if(vm.mesa.mesa_id == undefined) {
                alert('Debe seleccionar una mesa');
            } else {
                var result = confirm('¿Esta seguro que desea eliminar la mesa seleccionada?');
                if(result) {
                    MesasService.remove(vm.mesa.mesa_id).then(function(data){
                        vm.mesa = {};
                        vm.detailsOpen = false;
                        loadMesas();
                        MvUtils.showMessage('success', 'La registro se borro satisfactoriamente');
                    }).catch(function(data){
                        console.log(data);
                    });
                }
            }
        }


        function cancel() {
            vm.mesas = [];
            vm.mesa={};
            vm.detailsOpen=false;
            MesasVars.clearCache = true;
            loadMesas();
        }


        // Implementación de la paginación
        vm.start = 0;
        vm.limit = MesasVars.paginacion;
        vm.pagina = MesasVars.pagina;
        vm.paginas = MesasVars.paginas;

        function paginar(vars) {
            if (vars == {}) {
                return;
            }
            vm.start = vars.start;
            vm.pagina = vars.pagina;
        }

        vm.next = function () {
            paginar(MvUtils.next(MesasVars));
        };
        vm.prev = function () {
            paginar(MvUtils.prev(MesasVars));
        };
        vm.first = function () {
            paginar(MvUtils.first(MesasVars));
        };
        vm.last = function () {
            paginar(MvUtils.last(MesasVars));
        };

        vm.goToPagina = function () {
            paginar(MvUtils.goToPagina(vm.pagina, MesasVars));
        }

    }


})();
