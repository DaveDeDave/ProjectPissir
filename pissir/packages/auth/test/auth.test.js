import { verifyHash } from "@pissir/lib/src/authentication.js";
import { getUser, prepareInputs, truncateAllTables } from "@pissir/lib/src/db.js";
import request from "supertest";
import app from "../app.js";

describe("auth.test.js", function() {

  before(async function () {
    await app.ready();
    await prepareInputs("test/inputs/auth.test.sql");
  });
  
  after(async function () {
    await truncateAllTables();
    app.close();
  });

  describe("Test auth end-points (/v1/auth)", function() {

    describe("POST /register", function() {
  
      it("register a user", function(done) {
        request(app.server)
          .post("/v1/auth/register")
          .send({
            email: "test@test.it",
            password: "Password12.",
            name: "Mario",
            surname: "Rossi",
            birthDate: "1990-01-01"
          })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            if (!res.body.token) return done(new Error("jwt token is missing"));
            done();
          });
      });
  
    });
  
    describe("POST /login", function() {
  
      it("login with correct password", function(done) {
        request(app.server)
          .post('/v1/auth/login')
          .send({
            email: "test@test.it",
            password: "Password12."
          })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            if (!res.body.token) return done(new Error("jwt token is missing"));
            done();
          });
      });
  
      it("login with wrong password", function(done) {
        request(app.server)
          .post('/v1/auth/login')
          .send({
            email: "test@test.it",
            password: "1234"
          })
          .expect(401, done);
      });
  
    });
  
    describe("POST /activate", function() {
  
      it("activate an employee (farmer)", function(done) {
        request(app.server)
          .post('/v1/auth/activate')
          .send({
            email: "farmer@test.test",
            oldPassword: "Password12.",
            newPassword: "Password123."
          })
          .expect(200)
          .end(async function(err, res) {
            if (err) return done(err);
            if (!res.body.token) return done(new Error("jwt token is missing"));
            const user = await getUser("1234");
            if (!(await verifyHash("Password123.", user.password))) return done(new Error("password didn't change"));
            done();
          });
      });
  
      it("activate an employee (collaborator)", function(done) {
        request(app.server)
          .post('/v1/auth/activate')
          .send({
            email: "collaborator@test.test",
            oldPassword: "Password12.",
            newPassword: "Password123."
          })
          .expect(200)
          .end(async function(err, res) {
            if (err) return done(err);
            if (!res.body.token) return done(new Error("jwt token is missing"));
            const user = await getUser("12345");
            if (!(await verifyHash("Password123.", user.password))) return done(new Error("password didn't change"));
            done();
          });
      });
  
    });
  
  });

});
