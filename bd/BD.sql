use filesmanager;

DELIMITER $$
CREATE PROCEDURE addClient(in login varchar(45), in password varchar(255), in name varchar(50), in surname varchar(50), in patronymic varchar(50), in email varchar(50), in phone varchar(20), in iv varchar(255))
BEGIN
	insert into user(login, password, id_role, iv) value(login, password, 3, iv);
    insert into client(name, surname, patronymic, email, phone, id_user, status) value(name, surname, patronymic, email, phone, (select id from user where user.login = login and user.password = password), "active");
end;

drop procedure addClient;

DELIMITER $$
CREATE PROCEDURE addManager(in login varchar(45), in password varchar(255), in name varchar(50), in surname varchar(50), in phone varchar(20), in iv varchar(255))
BEGIN
	insert into user(login, password, id_role, iv) value(login, password, 2, iv);
    insert into manager(name, surname, phone, id_user) value(name, surname, phone, (select id from user where user.login = login and user.password = password));
end;

drop procedure addManager;

DELIMITER $$
CREATE PROCEDURE updateClient(in id int, in login varchar(45), in password varchar(255), in name varchar(50), in surname varchar(50), in patronymic varchar(50), in phone varchar(20), in email varchar(50), in iv varchar(255))
BEGIN
	declare id_user int;
    set id_user = (select client.id_user from client where client.id = id);
    update user set user.login = login,
						user.password = password,
                        user.iv = iv
						where user.id = id_user;
	update client set client.name = name,
					client.surname = surname, 
                    client.patronymic = patronymic,
                    client.phone = phone,
                    client.email = email where client.id = id;
end;

drop procedure updateClient;

DELIMITER $$
CREATE PROCEDURE updateManager(in id int, in login varchar(45), in password varchar(255), in name varchar(50), in surname varchar(50), in phone varchar(20), in iv varchar(255))
BEGIN
	declare id_user int;
    set id_user = (select manager.id_user from manager where client.id = id);
    update user set user.login = login,
						user.password = password,
                        user.iv = iv
						where user.id = id_user;
	update manager set client.name = name,
					client.surname = surname, 
                    client.phone = phone where client.id = id;
end;

drop procedure updateManager;

DELIMITER $$
CREATE PROCEDURE updateAdmin(in id int, in login varchar(45), in password varchar(255), in iv varchar(255))
BEGIN
    update user set user.login = login,
						user.password = password,
                        user.iv = iv
						where user.id = id;
end;

drop procedure updateAdmin;



