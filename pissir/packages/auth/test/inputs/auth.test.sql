INSERT INTO user VALUES ('4321', 'admin@test.test', 'test', 'test', '$argon2i$v=19$m=4096,t=3,p=1$86MEwPYtqXKGfjgyZijCzA$39A9nDKzUoVafYajET9XuvYWfUSQDOwTqjXF5bdvtwo', '1990-01-01');
INSERT INTO admin VALUES ('4321');
INSERT INTO company VALUES ('abc', '4321', 'Company', 'Street 1234');
INSERT INTO user VALUES ('1234', 'farmer@test.test', 'test', 'test', '$argon2i$v=19$m=4096,t=3,p=1$86MEwPYtqXKGfjgyZijCzA$39A9nDKzUoVafYajET9XuvYWfUSQDOwTqjXF5bdvtwo', '1990-01-01'); -- password = Password12.
INSERT INTO user VALUES ('12345', 'collaborator@test.test', 'test', 'test', '$argon2i$v=19$m=4096,t=3,p=1$86MEwPYtqXKGfjgyZijCzA$39A9nDKzUoVafYajET9XuvYWfUSQDOwTqjXF5bdvtwo', '1990-01-01'); -- password = Password12.
INSERT INTO employee VALUES ('1234', 'farmer', false, 'abc');
INSERT INTO employee VALUES ('12345', 'collaborator', false, 'abc');