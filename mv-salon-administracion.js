(function () {
    'use strict';

    angular.module('mvSalonAdministracion', [])
        .component('mvSalonAdministracion', mvSalonAdministracion());

    function mvSalonAdministracion() {
        return {
            bindings: {
                searchFunction: '&'
            },
            templateUrl: window.installPath + '/mv-angular-mesas/mv-salon-administracion.html',
            controller: MvSalonController
        }
    }

    MvSalonController.$inject = ["MesasVars", 'MesasService', "MvUtils", "StockService", "$scope"];
    /**
     * @param AcUsuarios
     * @constructor
     */
    function MvSalonController(MesasVars, MesasService, MvUtils, StockService, $scope) {
        var vm = this;

        vm.mesas = [];
        vm.mesa = {};
        vm.formasMesas = [];
        vm.formaMesa = {};
        vm.tamanioMesas = [];
        vm.tamanioMesa = {};
        vm.detailsOpen = false;

        vm.save = save;
        vm.cancel = cancel;
        vm.setData = setData;
        vm.loadMesas = loadMesas;
        vm.openMesa = openMesa;
        vm.showMesa = showMesa;


        

        vm.formasMesas = [
            {forma_id: 1, forma: 'Redonda'},
            {forma_id: 2, forma: 'Cuadrada'},
            {forma_id: 3, forma: 'Rectangular'}
        ];

        vm.tamanioMesas = [
            {id: 1, cantidad: 2},
            {id: 2, cantidad: 4},
            {id: 3, cantidad: 6},
            {id: 4, cantidad: 8},
            {id: 5, cantidad: 10},
            {id: 6, cantidad: 12}
        ];

        vm.formaMesa = vm.formasMesas[0];
        vm.tamanioMesa = vm.tamanioMesas[0];

        if(vm.mesa.status != undefined && vm.mesa.status < 3) {
            window.document.getElementById('searchProducto').getElementsByTagName('input')[0].addEventListener('keyup', function (event) {
                console.log('busco');
                if (event.keyCode == 13) {
                    var el = document.getElementById('cantidad');
                    if (el != null) {
                        el.focus();
                    }
                }
            });
        }



        vm.searchProducto = searchProducto;

        function searchProducto(callback) {
            StockService.get().then(callback).then(function (data) {
                console.log(data);
            }).catch(function (data) {
                console.log(data);
            });
        }

        loadMesas();

        function loadMesas() {
            MesasService.get().then(function (mesas) {
                setData(mesas);
            });
        }

        function showMesa(mesa) {
            vm.mesa = mesa;
            console.log(vm.mesa);
        }

        function getTamanioMesa(cantidad) {
            for(var i=0; i < vm.tamanioMesas.length; i++) {
                if(vm.tamanioMesas[i].cantidad == cantidad)
                    return vm.tamanioMesas[i];
            }
        }

        function getFormaMesa(forma_id) {
            for(var i=0; i < vm.formasMesas.length; i++) {
                if(vm.formasMesas[i].forma_id == forma_id)
                    return vm.formasMesas[i];
            }
        }

        function openMesa(mesa) {
            mesa.status = 0;
            MesasService.save(mesa).then(function(data){
                console.log(data);
            }).catch(function (error) {
                console.log(error);
                MvUtils.showMessage('error', 'Ocurrio un error al abrir la mesa');
            });
        }

        function save() {

            if(vm.mesa.mesa === undefined || vm.mesa.mesa.length === 0) {
                element1[0].classList.add('error-input');
                MvUtils.showMessage('error', 'El n�mero no puede ser vacio');
                return;
            }

            vm.mesa.mesa_id = vm.mesa.mesa;
            vm.mesa.salon_id = 1;
            vm.mesa.cantidad = vm.tamanioMesa.cantidad;
            vm.mesa.forma_id = vm.formaMesa.forma_id;
            vm.mesa.status = 0;

            MesasService.save(vm.mesa).then(function (data) {
                vm.detailsOpen = (data === undefined || data < 0) ? true : false;
                if(data === undefined) {
                    element1[0].classList.add('error-input');
                    MvUtils.showMessage('error', 'Error actualizando el dato');
                }
                else {
                    vm.mesa = {};
                    loadMesas();
                    element1[0].classList.remove('error-input');
                    MvUtils.showMessage('success', 'La operaci�n se realiz� satisfactoriamente');
                }
            }).catch(function (error) {
                console.log(error);
                vm.mesa = {};
                vm.detailsOpen = true;
            });

        }

        function setData(mesas) {
            console.log(mesas);
            vm.mesas = mesas;
            vm.paginas = MesasVars.paginas;
        }


        function cancel() {
            vm.mesas = [];
            vm.mesa={};
            vm.detailsOpen=false;
            MesasVars.clearCache = true;
            loadMesas();
        }


        // Implementaci�n de la paginaci�n
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
