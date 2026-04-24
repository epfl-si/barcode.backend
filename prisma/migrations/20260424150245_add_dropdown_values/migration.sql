-- This is an empty migration.

INSERT INTO room_type (room_type) VALUES ('Labo');
INSERT INTO room_type (room_type) VALUES ('Stockroom');
INSERT INTO room_type (room_type) VALUES ('Store Room');
INSERT INTO room_type (room_type) VALUES ('Receiving Location');

insert into product_type (product_type) values ('Produit chimique');
insert into product_type (product_type) values ('Bouteille de gaz');
insert into product_type (product_type) values ('Autres Articles');

insert into storage_type (storage_type) values ('Armoire');
insert into storage_type (storage_type) values ('Boite à gants');
insert into storage_type (storage_type) values ('Congélateur');
insert into storage_type (storage_type) values ('Local extérieur');
insert into storage_type (storage_type) values ('Local intérieur');
insert into storage_type (storage_type) values ('Rayonnage');
insert into storage_type (storage_type) values ('Réfrigérateur');
insert into storage_type (storage_type) values ('Autre');

insert into storage_subtype (storage_subtype) values ('Standard (ni ventilé, ni résistant au feu)');
insert into storage_subtype (storage_subtype) values ('Ventilé');
insert into storage_subtype (storage_subtype) values ('Résistant au feu (EI90)');
insert into storage_subtype (storage_subtype) values ('Ventilé et résistant au feu (EI90)');
insert into storage_subtype (storage_subtype) values ('Standard (pas ATEX)');
insert into storage_subtype (storage_subtype) values ('ATEX');
insert into storage_subtype (storage_subtype) values ('Autre');
