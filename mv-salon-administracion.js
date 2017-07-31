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
        vm.producto = {};
        vm.productos = [];
        vm.mesasDerecha = [];
        vm.mesasIzquierda = [];

        vm.save = save;
        vm.cancel = cancel;
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
                //console.log(data);
            }).catch(function (error) {
                console.log(error);
            });
        }

        loadMesas();

        function loadMesas() {
            MesasService.get().then(function (mesas) {
                for(var i=0; i <= mesas.length - 1; i++) {
                    if(mesas[i].ubicacion == 1) {
                        vm.mesasDerecha.push(mesas[i]);
                    } else {
                        vm.mesasIzquierda.push(mesas[i]);
                    }
                }
            }).catch(function (error) {
                console.log(error);
            });
        }

        function showMesa(mesa) {
            vm.mesa = mesa;
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
            console.log(vm.producto);
            console.log(vm.productos);
            var encontrado = false;

            if(vm.productos.length == 0) {
                vm.productos.push(vm.producto);
            } else {
                for(var i=0; i <= vm.productos.length -1; i++) {
                    if(vm.productos[i].producto_id == vm.producto.producto_id) {
                        vm.productos[i].cantidad = vm.productos[i].cantidad + vm.cantidad;
                        encontrado = true;
                    }
                }
            }
            if(!encontrado) {
                vm.productos.push(vm.producto);
            }

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
