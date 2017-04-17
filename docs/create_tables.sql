
# MESAS
CREATE TABLE mesas (
  mesa_id varchar(45) NOT NULL,
  salon_id int(11) DEFAULT NULL,
  comanda_id int(11) DEFAULT NULL,
  usuario_id int(11) DEFAULT NULL,
  cantidad int(11) DEFAULT NULL,
  forma_id int(11) DEFAULT NULL,
  status int(1) DEFAULT 0 COMMENT '0- Pendiente, 1- Enviada, 2- Entregada',
  mesa varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

