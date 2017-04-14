<?php


session_start();


// Token

if (file_exists('../../../includes/MyDBi.php')) {
    require_once '../../../includes/MyDBi.php';
    require_once '../../../includes/utils.php';
} else {
    require_once 'MyDBi.php';
}


class Mesas extends Main
{
    private static $instance;

    public static function init($decoded)
    {
        self::$instance = new Main(get_class(), $decoded['function']);
        try {
            call_user_func(get_class() . '::' . $decoded['function'], $decoded);
        } catch (Exception $e) {

            $file = 'error.log';
            $current = file_get_contents($file);
            $current .= date('Y-m-d H:i:s') . ": " . $e . "\n";
            file_put_contents($file, $current);

            header('HTTP/1.0 500 Internal Server Error');
            echo $e;
        }
    }


    function get()
    {
        $db = self::$instance->db;

        $results = $db->rawQuery('SELECT mesa_id, salon_id, comanda_id, usuario_id, cantidad, forma, status, mesa FROM mesas ORDER BY mesa_id');

        echo json_encode($results);
    }


    /**
     * @description Crea una mesa
     * @param $sucursal
     */
    function create($params)
    {
        $db = self::$instance->db;
        $mesa_decoded = self::checkMesa(json_decode($params["mesa"]));

        $SQL = 'Select mesa_id from mesas where mesa_id ="' . $mesa_decoded->mesa_id . '"';

        $result = $db->rawQuery($SQL);

        if ($db->count > 0) {
            header('HTTP/1.0 500 Internal Server Error');
            echo 'Existe una sucursal con ese nombre';
            return;
        }

        $db = self::$instance->db;
        $db->startTransaction();
        $mesa_decoded = self::checkMesa(json_decode($params["mesa"]));

        $data = array(
            'salon_id' => $mesa_decoded->salon_id,
            'comanda_id' => $mesa_decoded->comanda_id,
            'usuario_id' => $mesa_decoded->usuario_id,
            'cantidad' => $mesa_decoded->cantidad,
            'forma' => $mesa_decoded->forma,
            'status' => $mesa_decoded->status,
            'mesa' => $mesa_decoded->mesa
        );

        $result = $db->insert('mesas', $data);
        if ($result > -1) {
            $db->commit();
            header('HTTP/1.0 200 Ok');
            echo json_encode($result);
        } else {
            $db->rollback();
            header('HTTP/1.0 500 Internal Server Error');
            echo $db->getLastError();
        }
    }


    /**
     * @description Modifica una mesa
     * @param $sucursal
     */
    function update($params)
    {
        $db = self::$instance->db;
        $mesa_decoded = self::checkMesa(json_decode($params["mesa"]));

        $SQL = 'Select mesa_id from mesas where mesa_id ="' . $mesa_decoded->mesa_id . '"';

        $result = $db->rawQuery($SQL);

        if ($db->count > 0) {
            header('HTTP/1.0 500 Internal Server Error');
            echo 'Existe una mesa con ese nombre';
            return;
        }

        $db = self::$instance->db;
        $db->startTransaction();
        $mesa_decoded = self::checkMesa(json_decode($params["mesa"]));

        $db->where('mesa_id', $mesa_decoded->mesa_id);
        $data = array(
            'salon_id' => $mesa_decoded->salon_id,
            'comanda_id' => $mesa_decoded->comanda_id,
            'usuario_id' => $mesa_decoded->usuario_id,
            'cantidad' => $mesa_decoded->cantidad,
            'forma' => $mesa_decoded->forma,
            'status' => $mesa_decoded->status,
            'mesa' => $mesa_decoded->mesa
        );

        $result = $db->update('mesas', $data);
        if ($result) {
            $db->commit();
            header('HTTP/1.0 200 Ok');
            echo json_encode($result);
        } else {
            $db->rollback();
            header('HTTP/1.0 500 Internal Server Error');
            echo $db->getLastError();
        }
    }


    /**
     * @description Elimina una sucursal
     * @param $sucursal_id
     */
    function remove($params)
    {
        $db = self::$instance->db;

        $db->where("mesa_id", $params["mesa_id"]);
        $results = $db->delete('mesas');

        if ($results) {
            echo json_encode(1);
        } else {
            echo json_encode(-1);
        }
    }


    /**
     * @description Verifica todos los campos de mesa
     * @param $detalle
     * @return mixed
     */
    function checkMesa($detalle)
    {
        $detalle->salon_id = (!array_key_exists("salon_id", $detalle)) ? -1 : $detalle->salon_id;
        $detalle->comanda_id = (!array_key_exists("comanda_id", $detalle)) ? -1 : $detalle->comanda_id;
        $detalle->usuario_id = (!array_key_exists("usuario_id", $detalle)) ? -1 : $detalle->usuario_id;
        $detalle->cantidad = (!array_key_exists("cantidad", $detalle)) ? -1 : $detalle->cantidad;
        $detalle->forma = (!array_key_exists("forma", $detalle)) ? 0 : $detalle->forma;
        $detalle->status = (!array_key_exists("status", $detalle)) ? 0 : $detalle->status;
        $detalle->mesa = (!array_key_exists("mesa", $detalle)) ? 'Mesa' : $detalle->mesa;

        return $detalle;
    }
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = file_get_contents("php://input");
    $decoded = json_decode($data);
    Mesas::init(json_decode(json_encode($decoded), true));
} else {
    Mesas::init($_GET);
}
