import { getCompany, prepareInputs, truncateAllTables } from "@pissir/lib/src/db.js";
import request from "supertest";
import app from "../app.js";
import { adminJWT } from "@pissir/lib/src/test/data/data.js";

const data = {};

describe("company.test.js", function() {

  before(async function() {
    await app.ready();
    await prepareInputs("test/inputs/company.test.sql");
  });
  
  after(async function() {
    await truncateAllTables();
  });
  
  describe("Test company end-points (/v1/admin/company)", function() {
  
    describe("POST /", function() {

      it("create a company", function(done) {
        request(app.server)
          .post("/v1/admin/company")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "New Company",
            address: "Street 40"
          })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            data.companies = [{ id: res.body.id }];
            done();
          });
      });

    });

    describe("GET /:id", function() {

      it("get a company", function(done) {
        request(app.server)
          .get(`/v1/admin/company/${data.companies[0].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200, {
            id: data.companies[0].id,
            name: "New Company",
            address: "Street 40"
          }, done);
      });

      it("try to get a company that you don't own", function(done) {
        request(app.server)
          .get(`/v1/admin/company/abcde`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

      it("try to get a company that doesn't exist", function(done) {
        request(app.server)
          .get(`/v1/admin/company/1234`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

    });

    describe("GET /all", function() {

      it("get all companies", function(done) {
        request(app.server)
          .get(`/v1/admin/company/all?page=1&quantity=100`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            if (res.body.result.length != 3) return done(new Error("incorrect result"));
            done();
          })
      });

    });

    describe("PUT /:id", function() {

      it("update a company data", function(done) {
        request(app.server)
          .put(`/v1/admin/company/${data.companies[0].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "New Company V2",
            address: "Street 42"
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const company = await getCompany(data.companies[0].id);
            if (
              company.name != "New Company V2" ||
              company.address != "Street 42"
            ) return done(new Error("company data didn't change"));
            done();
          })
      });

      it("try to update a company data that you don't own", function(done) {
        request(app.server)
          .put(`/v1/admin/company/abcde`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "New Company V2",
            address: "Street 42"
          })
          .expect(404, done);
      });

      it("try to update a company data that doesn't exist", function(done) {
        request(app.server)
          .put(`/v1/admin/company/1234`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "New Company V2",
            address: "Street 42"
          })
          .expect(404, done);
      });

    });

    describe("DELETE /:id", function() {

      it("delete a company", function(done) {
        request(app.server)
          .delete(`/v1/admin/company/${data.companies[0].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "New Company V2",
            address: "Street 42"
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const company = await getCompany(data.companies[0].id);
            if (company) return done(new Error("company wasn't deleted"));
            done();
          })
      });

      it("try to delete a company that you don't own", function(done) {
        request(app.server)
          .delete(`/v1/admin/company/abcde`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "New Company V2",
            address: "Street 42"
          })
          .expect(404, done);
      });

      it("try to delete a company that doesn't exist", function(done) {
        request(app.server)
          .delete(`/v1/admin/company/1234`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "New Company V2",
            address: "Street 42"
          })
          .expect(404, done);
      });

    });

  });

});
