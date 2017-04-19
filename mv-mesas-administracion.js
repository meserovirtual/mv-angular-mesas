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
        vm.formasMesas = [];
        vm.formaMesa = {};
        vm.tamanioMesas = [];
        vm.tamanioMesa = {};
        vm.detailsOpen = false;

        vm.save = save;
        vm.cancel = cancel;
        vm.setData = setData;
        vm.loadMesas = loadMesas;
        vm.remove = remove;
        vm.mesaToUpdate = mesaToUpdate;
        vm.createMesa = createMesa;

        var element1 = angular.element(document.getElementById('numero'));

        element1[0].addEventListener('focus', function () {
            element1[0].classList.remove('error-input');
            element1[0].removeEventListener('focus', removeFocus);
        });


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

        function removeFocus() { }

        loadMesas();

        function loadMesas() {
            MesasService.get().then(function (mesas) {
                setData(mesas);
            });
        }

        function mesaToUpdate(mesa) {
            vm.mesa = mesa;
            vm.tamanioMesa = getTamanioMesa(mesa.cantidad);
            vm.formaMesa = getFormaMesa(mesa.forma_id);
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

        function createMesa() {
            vm.mesa = {};
            vm.formaMesa = vm.formasMesas[0];
            vm.tamanioMesa = vm.tamanioMesas[0];
            vm.detailsOpen = true;
        }

        function save() {

            if(vm.mesa.mesa === undefined || vm.mesa.mesa.length === 0) {
                element1[0].classList.add('error-input');
                MvUtils.showMessage('error', 'El número no puede ser vacio');
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
                    MvUtils.showMessage('success', 'La operación se realizó satisfactoriamente');
                }
            }).catch(function (error) {
                console.log(error);
                vm.mesa = {};
                vm.detailsOpen = true;
            });

        }

        function setData(mesas) {
            vm.mesas = mesas;
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
