use filesmanager;

DELIMITER $$
CREATE PROCEDURE addClient(in login varchar(45), in password varchar(255), in name varchar(50), in surname varchar(50), in patronymic varchar(50), in email varchar(50), in phone varchar(20), in iv varchar(255))
BEGIN
	insert into user(login, password, id_role, iv) value(login, password, 3, iv);
    insert into client(name, surname, patronymic, email, phone, id_user) value(name, surname, patronymic, email, phone, (select id from user where login = login and password = password));
end;

drop procedure addClient;