import { generateHash } from "@pissir/lib/src/authentication.js";
import { getUser, prepareInputs, truncateAllTables, updateUserPasswordAndActivateEmployee } from "@pissir/lib/src/db.js";
import request from "supertest";
import app from "../app.js";
import { adminJWT } from "@pissir/lib/src/test/data/data.js";

const data = {};

describe("employee.test.js", function() {

  before(async function() {
    await app.ready();
    await prepareInputs("test/inputs/employee.test.sql");
  });
  
  after(async function() {
    await truncateAllTables();
  });
  
  describe("Test employee end-points (/v1/admin/employee)", function() {
  
    describe("POST /", function() {
      it("create an employee (farmer)", function(done) {
        request(app.server)
          .post("/v1/admin/employee")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            email: "farmer@test.it",
            name: "Mario",
            surname: "Rossi",
            birthDate: "1990-01-01",
            type: "farmer",
            companyID: "abc"
          })
          .expect(200)
          .end(async function(err, res) {
            if (err) return done(err);
            await updateUserPasswordAndActivateEmployee(res.body.id, generateHash("Password12."));
            data.users = [{ id: res.body.id, password: res.body.password }];
            done();
          });
      });
  
      it("create an employee (collaborator)", function(done) {
        request(app.server)
          .post("/v1/admin/employee")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            email: "collaborator@test.it",
            name: "Mario",
            surname: "Rossi",
            birthDate: "1990-01-01",
            type: "collaborator",
            companyID: "abc"
          })
          .expect(200)
          .end(async function(err, res) {
            if (err) return done(err);
            await updateUserPasswordAndActivateEmployee(res.body.id, generateHash("Password12."));
            data.users.push({ id: res.body.id, password: res.body.password });
            done();
          });
      });
    });
  
    describe("GET /:id", function() {
      it("get an employee (farmer)", function(done) {
        request(app.server)
          .get(`/v1/admin/employee/${data.users[0].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200, {
            id: data.users[0].id,
            active: true,
            email: "farmer@test.it",
            name: "Mario",
            surname: "Rossi",
            birthDate: "1990-01-01",
            type: "farmer",
            companyID: "abc"
          }, done);
      });
  
      it("get an employee (collaborator)", function(done) {
        request(app.server)
          .get(`/v1/admin/employee/${data.users[1].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200, {
            id: data.users[1].id,
            active: true,
            email: "collaborator@test.it",
            name: "Mario",
            surname: "Rossi",
            birthDate: "1990-01-01",
            type: "collaborator",
            companyID: "abc"
          }, done);
      });
  
      it("try to get an employee that doesn't exist", function(done) {
        request(app.server)
          .get(`/v1/admin/employee/12345`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });
  
    });
  
    describe("GET /all/:companyID", function() {
  
      it("get all employees of the company abc", function(done) {
        request(app.server)
          .get("/v1/admin/employee/all/abc?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            if (res.body.result.length != 2) return done(new Error("incorrect result"));
            done();
          });
      });
  
      it("get all employees of the company abcd", function(done) {
        request(app.server)
          .get("/v1/admin/employee/all/abcd?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            if (res.body.result.length != 0) return done(new Error("incorrect result"));
            done();
          });
      });
  
      it("try to get all employees of a company that you don't own", function(done) {
        request(app.server)
          .get("/v1/admin/employee/all/abcde?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done)
      });
  
      it("try to get all employees of a company that doesn't exist", function(done) {
        request(app.server)
          .get("/v1/admin/employee/all/abcdef?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done)
      });
  
    });
  
    describe("GET /all", function() {
      it("get all employees", function(done) {
        request(app.server)
          .get("/v1/admin/employee/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            if (res.body.result.length != 2) return done(new Error("incorrect result"));
            done();
          });
      });
    });
  
    describe("DELETE /:id", function() {
  
      it("delete an employee (farmer)", function(done) {
        request(app.server)
          .delete(`/v1/admin/employee/${data.users[0].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const employee = await getUser(data.users[0].id);
            if (employee) return done(new Error("employee doesnt deleted"));
            data.users.splice(0, 1);
            done();
          });
      });
  
      it("delete an employee (collaborator)", function(done) {
        request(app.server)
          .delete(`/v1/admin/employee/${data.users[0].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const employee = await getUser(data.users[0].id);
            if (employee) return done(new Error("employee doesnt deleted"));
            data.users.splice(0, 1);
            done();
          });
      });
  
      it("try delete an employee that doesn't exist", function(done) {
        request(app.server)
          .delete(`/v1/admin/employee/1234`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done)
      });
  
    });
  
  });

});
