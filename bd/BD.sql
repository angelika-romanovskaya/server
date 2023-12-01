use filesmanagers;

DELIMITER $$
CREATE PROCEDURE addClient(in login varchar(45), in password varchar(255), in name varchar(50), in surname varchar(50), in patronymic varchar(50), in email varchar(50), in phone varchar(20), in iv varchar(255))
BEGIN
	declare id int;
	insert into users(login, password, roleId, iv) value(login, password, 3, iv);
    set id = last_insert_id();
    insert into clients(name, surname, patronymic, email, phone, userId, status) value(name, surname, patronymic, email, phone, (select id from users where users.login = login and users.password = password), "active");
    select id;
end;

drop procedure addClient;

DELIMITER $$
CREATE PROCEDURE addManager(in login varchar(45), in password varchar(255), in name varchar(50), in surname varchar(50), in phone varchar(20), in iv varchar(255))
BEGIN
	insert into users(login, password, roleId, iv) value(login, password, 2, iv);
    insert into managers(name, surname, phone, userId) value(name, surname, phone, (select id from users where users.login = login and users.password = password));
end;

drop procedure addManager;

DELIMITER $$
CREATE PROCEDURE addBid(in id_user int, in type varchar(255), in description varchar(255), in id_manager int, in type_user varchar(255), in data_start date)
BEGIN
	declare id_client int;
    set id_client = (select clients.id from clients where clients.userId = id_user);
    insert into bids(clientId, type, description, managerId, statusId, type_user, data_start) value(id_client, type, description, id_manager, 10, type_user, data_start);
end;

drop procedure addBid;

DELIMITER $$
CREATE PROCEDURE updateClient(in id int, in login varchar(45), in password varchar(255), in name varchar(50), in surname varchar(50), in patronymic varchar(50), in phone varchar(20), in email varchar(50), in iv varchar(255))
BEGIN
	declare id_client int;
    set id_client= (select clients.id from clients where clients.userId = id);
    update users set users.login = login,
						users.password = password,
                        users.iv = iv
						where users.id = id;
	update clients set clients.name = name,
					clients.surname = surname, 
                    clients.patronymic = patronymic,
                    clients.phone = phone,
                    clients.email = email where clients.id = id_client;
end;

drop procedure updateClient;

DELIMITER $$
CREATE PROCEDURE updateManager(in id int, in login varchar(45), in password varchar(255), in name varchar(50), in surname varchar(50), in phone varchar(20), in iv varchar(255))
BEGIN
	declare id_manager int;
    set id_manager = (select managers.id from managers where managers.userId = id);
    update users set users.login = login,
						users.password = password,
                        users.iv = iv
						where users.id = id;
	update managers set managers.name = name,
					managers.surname = surname, 
                    managers.phone = phone where managers.id = id_manager;
end;

drop procedure updateManager;

DELIMITER $$
CREATE PROCEDURE updateAdmin(in id int, in login varchar(45), in password varchar(255), in iv varchar(255))
BEGIN
    update users set users.login = login,
						users.password = password,
                        users.iv = iv
						where users.id = id;
end;

drop procedure updateAdmin;



