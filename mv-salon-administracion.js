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

    MvSalonController.$inject = ["MesasVars", 'MesasService', "MvUtils", "StockService", "$scope", "UserService",
        "$location", "ComandasService"];
    /**
     * @param AcUsuarios
     * @constructor
     */
    function MvSalonController(MesasVars, MesasService, MvUtils, StockService, $scope, UserService,
                               $location, ComandasService) {
        var vm = this;

        vm.mesas = [];
        vm.mesa = {};
        vm.formasMesas = [];
        vm.formaMesa = {};
        vm.tamanioMesas = [];
        vm.tamanioMesa = {};
        vm.detailsOpen = false;
        vm.producto = {};
        vm.detalle = {};
        vm.detalles = [];
        vm.total = 0.0;
        vm.mesasDerecha = [];
        vm.mesasIzquierda = [];
        vm.mozo = {};
        vm.mozos = [];
        vm.titulo = "ABRIR MESA";
        vm.titulo2 = "¿Deseas abrir la mesa?";
        vm.codigo_reserva = "";

        vm.save = save;
        vm.cancel = cancel;
        vm.loadMesas = loadMesas;
        vm.openMesa = openMesa;
        vm.showMesa = showMesa;
        vm.loadMozos = loadMozos;
        vm.removeDetalle = removeDetalle;
        vm.cocina = cocina;
        vm.saveComanda = saveComanda;


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
            document.getElementById('searchProducto').getElementsByTagName('input')[0].addEventListener('keyup', function (event) {
                console.log('busco');
                if (event.keyCode == 13) {
                    var el = document.getElementById('cantidad');
                    if (el != null) {
                        el.focus();
                    }
                }
            });
        }

        // Funciones para Autocomplete
        vm.searchProducto = searchProducto;

        function searchProducto(callback) {
            StockService.get().then(callback).then(function (data) {
                console.log(data);
            }).catch(function (data) {
                console.log(data);
            });
        }

        loadMesas();
        loadMozos();

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

        function loadMozos() {
            UserService.get(1).then(function (mozos) {
                vm.mozos = mozos;
                vm.mozo = mozos[0];
            }).catch(function (error) {
                console.log(error);
            });
        }

        function showMesa(mesa) {
            vm.mesa = mesa;
            console.log(mesa);
            vm.titulo = "ABRIR MESA" + " - " + mesa.mesa;

            if(mesa.status > 0) {
                vm.total = 0.00;
                vm.detalle = {};
                vm.detalles = [];

                ComandasService.getComandaByMesa(mesa.mesa_id).then(function(comandas){
                    console.log(comandas[0]);
                    vm.total = comandas[0].total;
                    //console.log(comandas[0].detalles);

                    for(var i=0; i <= vm.mozos.length - 1; i++) {
                        if(vm.mozos[i].usuario_id = comandas[0].usuario_id) {
                            vm.mozo = vm.mozos[i];
                        }
                    }

                    var list = Object.getOwnPropertyNames(comandas[0].detalles);
                    list.forEach(function (item, index, array) {
                        if (typeof comandas[0].detalles[item] === 'object') {

                            var prod = angular.copy(comandas[0].detalles[item]);

                            vm.detalle = {
                                producto_id: prod.producto_id,
                                sku: '',
                                producto_nombre: prod.nombre,
                                cantidad: prod.cantidad,
                                precio_unidad: prod.precio / prod.cantidad,
                                precio_total: prod.precio,
                                stock: [],
                                productos_kit: [],
                                productos_tipo: 0,
                                mp: false,
                                iva: 0,
                                observaciones: prod.comentarios,
                                status: 1
                            };

                            vm.detalles.push(vm.detalle);
                        }
                    });

                    console.log(vm.detalles);
                }).catch(function (error) {
                    console.log(error);
                });
            }
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
            mesa.status = 1; //Le pongo el estado abierta a la mesa.
            MesasService.save(mesa).then(function(data){
                console.log(data);
            }).catch(function (error) {
                console.log(error);
                MvUtils.showMessage('error', 'Ocurrio un error al abrir la mesa');
            });
        }

        // Funciones para Autocomplete
        vm.searchCliente = searchCliente;

        function searchCliente(callback) {
            UserService.get(3).then(callback).then(function (data) {
                console.log(data);
            }).catch(function (data) {
                console.log(data);
            });
        }

        function save() {
            console.log(vm.producto);

            if (vm.producto.producto_tipo == 3) {
                vm.cantidad = 1;
            }

            if (vm.cantidad == undefined || vm.cantidad <= 0) {
                alert('Ingreso una cantidad menor o igual a 0. Corrija el valor');
                return;
            }

            if (vm.producto.producto_id === undefined || vm.producto.producto_id == -1
                || vm.producto.producto_id == '' || isNaN(vm.producto.producto_id) || vm.producto.producto_id == null
                || vm.producto.producto_id < 1) {
                MvUtils.showMessage('error', 'Debe seleccionar un producto');
                return;
            }


            if (!validarCantidad(vm.producto, vm.cantidad)) {
                return;
            }

            var encontrado = false;
            for (var i = 0; i < vm.detalles.length; i++) {
                if (vm.producto.producto_id == vm.detalles[i].producto_id) {

                    // El producto 99999 es reservado para los gastos de envío, es un servicio que no se crea como tal en la base.
                    if (vm.producto.producto_id == 99999) {
                        return;
                    }

                    if (!validarCantidad(vm.producto, parseInt(vm.detalles[i].cantidad) + parseInt(vm.cantidad))) {
                        return;
                    }

                    vm.detalles[i].cantidad = parseInt(vm.detalles[i].cantidad) + parseInt(vm.cantidad);
                    if (vm.producto.producto_tipo == 3) {
                        vm.detalles[i].precio_total = parseInt(vm.detalles[i].precio_total) + parseFloat(vm.producto.precios[0].precio);
                    } else {
                        vm.detalles[i].precio_total = parseInt(vm.detalles[i].cantidad) * parseFloat(vm.detalles[i].precio_unidad);
                    }

                    encontrado = true;
                }
            }

            var prod = angular.copy(vm.producto);


            if (!encontrado) {
                vm.detalle = {
                    producto_id: prod.producto_id,
                    sku: prod.sku,
                    producto_nombre: prod.nombre,
                    cantidad: vm.cantidad,
                    precio_unidad: ((prod.precios[vm.tipo_precio] != undefined) ? prod.precios[vm.tipo_precio].precio : prod.precios[0].precio),
                    precio_total: parseInt(vm.cantidad) * parseFloat(((prod.precios[vm.tipo_precio] != undefined) ? prod.precios[vm.tipo_precio].precio : prod.precios[0].precio)),
                    stock: prod.stocks,
                    productos_kit: prod.kits,
                    productos_tipo: prod.producto_tipo,
                    mp: false,
                    iva: prod.iva,
                    observaciones: vm.observaciones,
                    status: 1
                };

                vm.detalles.push(vm.detalle);
            }

            console.log(vm.detalles);

            vm.producto = {};
            vm.observaciones = '';
            //vm.producto.fotos == undefined;
            var el = document.getElementById('searchProducto').getElementsByTagName('input');
            if (el[0] != null) {
                el[0].focus();
                el[0].value = '';
            }

            vm.cantidad = undefined;
            calcularTotal();
            var elem = angular.element(document.querySelector('#txtSearchId'));
            //elem[0].focus();
            vm.searchProductText = '';
            vm.listaProductos = [];
            //var elem = document.getElementById('producto-search');
            //elem.focus();
            elem.value = '';
        }


        function calcularTotal() {
            vm.total = 0.0;

            for (var i = 0; i < vm.detalles.length; i++) {
                vm.total = parseFloat(vm.total) + parseFloat(vm.detalles[i].precio_total);
                //vm.detalles[i].precio_unidad = Math.round((parseFloat(vm.detalles[i].precio_total) / vm.detalles[i].cantidad) * 100) / 100;
            }
        }

        function validarCantidad(producto, cantidad) {
            if (producto.producto_tipo == 0) {
                var total_en_suc = 0;
                for (var i in producto.stocks) {
                    total_en_suc += producto.stocks[i].cant_actual;
                }

                if (cantidad > total_en_suc) {
                    MvUtils.showMessage('error', 'Solo quedan ' + total_en_suc + ' productos');
                    return false;
                }
            }

            if (producto.producto_tipo == 2) {

                var prod_id = -1;
                var cant_actual = -1;
                var aux_cant = -1;
                for (var x in vm.producto.kits) {
                    aux_cant = 0;
                    for (var i in vm.producto.kits[x].stocks) {
                        aux_cant += vm.producto.kits[x].stocks[i].cant_actual;
                    }
                    if (prod_id == -1 || aux_cant < cant_actual) {
                        prod_id = vm.producto.kits[x].producto_id;
                        cant_actual = aux_cant;
                    }
                }

                if (cantidad > cant_actual) {
                    MvUtils.showMessage('error', 'Solo se pueden armar solo ' + cant_actual + ' kits.');
                    return false;
                }
            }

            if (producto.producto_tipo == 3) {
                return true;
            }
            return true;
        }

        function createComanda() {
            var comanda = {
                origen_id: -1, //El origen del cobro es Mostrador
                total: vm.total,
                status: 0,
                mesa_id: vm.mesa.mesa_id,
                usuario_id: vm.mozo.usuario_id,
                detalles: []
            };
            comanda.detalles = createComandaDetalle();

            console.log(comanda);
            return comanda;
        }

        function createComandaDetalle() {
            //TODO: Hacer que genere la comanda
            var detalles = [];

            for (var i = 0; i <= vm.detalles.length - 1; i++) {
                var detalle = {};
                detalle.producto_id = vm.detalles[i].producto_id;
                detalle.status = 0;
                detalle.comentarios = vm.detalles[i].observaciones;
                detalle.cantidad = vm.detalles[i].cantidad;
                detalle.precio = vm.detalles[i].precio_total;
                detalle.kits = [];

                var kit = {};
                kit = {
                    comanda_detalle_id: 0,
                    selected: false,
                    opcional: 1,
                    producto_id: vm.detalles[i].producto_id,
                    cantidad: vm.detalles[i].cantidad,
                    precio: vm.detalles[i].precio_total
                }
                detalle.kits.push(kit);

                detalles.push(detalle);
            }
            console.log(detalles);

            return detalles;
        }

        function saveComanda() {
            ComandasService.save(createComanda()).then(function (data) {
                console.log(data);
                cleanVariables();
            }).catch(function (data) {
                console.log(data);
            });
        }

        function cleanVariables() {
            vm.detalles = [];
            vm.detalle = {};
            vm.producto = {};
        }

        function cancel() {
            vm.mesasIzquierda = [];
            vm.mesasDerecha = [];
            vm.mesa = {};
            vm.detailsOpen=false;
            MesasVars.clearCache = true;
            loadMesas();
        }

        function cocina() {
            $location.path("cocina/comandas");
        }

        function removeDetalle(index) {
            var result = confirm('Realmente desea eliminar el producto de la campaña?');
            if (result) {
                vm.detalles.splice(index, 1);
            }
            calcularTotal();
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
