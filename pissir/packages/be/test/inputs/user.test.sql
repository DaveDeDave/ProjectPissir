INSERT INTO user VALUES ('01G525HN80C7R507VC3SSM0TBV', 'admin@test.test', 'test', 'test', '$argon2i$v=19$m=4096,t=3,p=1$86MEwPYtqXKGfjgyZijCzA$39A9nDKzUoVafYajET9XuvYWfUSQDOwTqjXF5bdvtwo', '1990-01-01');
INSERT INTO admin VALUES ('01G525HN80C7R507VC3SSM0TBV');
INSERT INTO company VALUES ('abc', '01G525HN80C7R507VC3SSM0TBV', 'Company', 'Street 1234');
INSERT INTO user VALUES ('01G525HN80C6R507VC3SSM0TBV', 'farmer@test.test', 'test', 'test', '$argon2i$v=19$m=4096,t=3,p=1$86MEwPYtqXKGfjgyZijCzA$39A9nDKzUoVafYajET9XuvYWfUSQDOwTqjXF5bdvtwo', '1990-01-01');
INSERT INTO user VALUES ('01G525HN80C5R507VC3SSM0TBV', 'collaborator@test.test', 'test', 'test', '$argon2i$v=19$m=4096,t=3,p=1$86MEwPYtqXKGfjgyZijCzA$39A9nDKzUoVafYajET9XuvYWfUSQDOwTqjXF5bdvtwo', '1990-01-01');
INSERT INTO employee VALUES ('01G525HN80C6R507VC3SSM0TBV', 'farmer', true, 'abc');
INSERT INTO employee VALUES ('01G525HN80C5R507VC3SSM0TBV', 'collaborator', true, 'abc');