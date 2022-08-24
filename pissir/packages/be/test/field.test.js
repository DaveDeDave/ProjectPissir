import { getField, prepareInputs, truncateAllTables } from "@pissir/lib/src/db.js";
import request from "supertest";
import app from "../app.js";
import { adminJWT, collaboratorJWT, farmerJWT } from "@pissir/lib/src/test/data/data.js";

const data = {};

describe("field.test.js", function() {

  before(async function() {
    await app.ready();
    await prepareInputs("test/inputs/field.test.sql");
  });
  
  after(async function() {
    await truncateAllTables();
  });
  
  describe("Test field end-points (/v1/field)", function() {
  
    describe("POST /", function() {

      it("create a field (farmer)", function(done) {
        request(app.server)
          .post("/v1/field")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            name: "New Company",
            outdoor: true,
            address: "Street 40",
            companyID: "abc"
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            data.fields = [{ id: res.body.id }];
            done();
          });
      });

      it("try to create a field that you don't own (farmer)", function(done) {
        request(app.server)
          .post("/v1/field")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            name: "Test",
            outdoor: true,
            address: "Street test",
            companyID: "abcd"
          })
          .expect(404, done);
      });

      it("try to create a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .post("/v1/field")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            name: "Test",
            outdoor: true,
            address: "Street test",
            companyID: "abcdefgh"
          })
          .expect(404, done);
      });

      it("create a field (admin)", function(done) {
        request(app.server)
          .post("/v1/field")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "Very new Company",
            outdoor: true,
            address: "Street 41",
            companyID: "abc"
          })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            data.fields.push({ id: res.body.id });
            done();
          });
      });

      it("try to create a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .post("/v1/field")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "Test",
            outdoor: true,
            address: "Street test",
            companyID: "abcdefgh"
          })
          .expect(404, done);
      });

      it("try to create a field (collaborator)", function(done) {
        request(app.server)
          .post("/v1/field")
          .set("Authorization", `Bearer ${collaboratorJWT}`)
          .send({
            name: "New Company",
            outdoor: true,
            address: "Street 40",
            companyID: "abc"
          })
          .expect(403, done);
      });
      
    });

    describe("PUT /:id", function() {

      it("update a field (farmer)", function(done) {
        request(app.server)
          .put(`/v1/field/${data.fields[0].id}`)
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            name: "New Company V2",
            outdoor: false,
            address: "Street 44"
          })
          .expect(204)
          .end(async function (err, res) {
            if (err) return done(err);
            const field = await getField(data.fields[0].id);
            if (
              field.name != "New Company V2" ||
              field.outdoor != false ||
              field.address != "Street 44"
            ) return done(new Error("field data didn't change"));
            done();
          });
      });

      it("update a field (admin)", function(done) {
        request(app.server)
          .put(`/v1/field/${data.fields[1].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "Very new Company V2",
            outdoor: false,
            address: "Street 42"
          })
          .expect(204)
          .end(async function (err, res) {
            if (err) return done(err);
            const field = await getField(data.fields[1].id);
            if (
              field.name != "Very new Company V2" ||
              field.outdoor != false ||
              field.address != "Street 42"
            ) return done(new Error("field data didn't change"));
            done();
          });
      });

      it("try to update a field (collaborator)", function(done) {
        request(app.server)
          .put(`/v1/field/${data.fields[0].id}`)
          .set("Authorization", `Bearer ${collaboratorJWT}`)
          .send({
            name: "New Company V2",
            outdoor: false,
            address: "Street 44"
          })
          .expect(403, done);
      });

      it("try to update a field that you don't own (farmer)", function(done) {
        request(app.server)
          .put(`/v1/field/f01`)
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            name: "New Company V2",
            outdoor: false,
            address: "Street 44"
          })
          .expect(404, done);
      });

      it("try to update a field that you don't own (admin)", function(done) {
        request(app.server)
          .put(`/v1/field/f01`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "New Company V2",
            outdoor: false,
            address: "Street 44"
          })
          .expect(404, done);
      });
      
      it("try to update a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .put(`/v1/field/abc`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "New Company V2",
            outdoor: false,
            address: "Street 44"
          })
          .expect(404, done);
      });

    });

    describe("GET /:id", function() {

      it("get a field (farmer)", function(done) {
        request(app.server)
          .get(`/v1/field/${data.fields[0].id}`)
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(200, {
            id: data.fields[0].id,
            name: "New Company V2",
            outdoor: false,
            address: "Street 44",
            companyID: "abc"
          }, done);
      });

      it("get a field (admin)", function(done) {
        request(app.server)
          .get(`/v1/field/${data.fields[0].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200, {
            id: data.fields[0].id,
            name: "New Company V2",
            outdoor: false,
            address: "Street 44",
            companyID: "abc"
          }, done);
      });

      it("try to get a field you don't own (farmer)", function(done) {
        request(app.server)
          .get(`/v1/field/f01`)
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done);
      });

      it("try to get a field you don't own (admin)", function(done) {
        request(app.server)
          .get(`/v1/field/f01`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

      it("try to get a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .get(`/v1/field/abc`)
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done)
      });

      it("try to get a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .get(`/v1/field/abc`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done)
      });

    });

    describe("GET /all/:companyID", function() {

      it("get all fields (farmer)", function(done) {
        request(app.server)
          .get(`/v1/field/all/abc?page=1&quantity=100`)
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            if (res.body.result.length != 3) return done(new Error("incorrect result"));
            done();
          });
      });

      it("try to get all fields of a company you don't own (farmer)", function(done) {
        request(app.server)
          .get(`/v1/field/all/abcde?page=1&quantity=100`)
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done);
      });

      it("try to get all fields of a company you don't own (admin)", function(done) {
        request(app.server)
          .get(`/v1/field/all/abcde?page=1&quantity=100`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

      it("try to get all fields of a company that doesn't exist (farmer)", function(done) {
        request(app.server)
          .get(`/v1/field/all/abcdefg?page=1&quantity=100`)
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done);
      });

      it("try to get all fields of a company that doesn't exist (admin)", function(done) {
        request(app.server)
          .get(`/v1/field/all/abcdefg?page=1&quantity=100`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

    });

    describe("GET /all", function() {

      it("get all fields (admin)", function(done) {
        request(app.server)
          .get(`/v1/field/all?page=1&quantity=100`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            if (res.body.result.length != 4) return done(new Error("incorrect result"));
            done();
          });
      });

    });

    describe("DELETE /:id", function() {

      it("try to delete a field (collaborator)", function(done) {
        request(app.server)
          .delete(`/v1/field/${data.fields[0].id}`)
          .set("Authorization", `Bearer ${collaboratorJWT}`)
          .expect(403, done);
      });

      it("delete a field (farmer)", function(done) {
        request(app.server)
          .delete(`/v1/field/${data.fields[0].id}`)
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const field = await getField(data.fields[0].id);
            if (field) return done(new Error("field wasn't deleted"));
            data.fields.splice(0, 1);
            done();
          });
      });

      it("delete a field (admin)", function(done) {
        request(app.server)
          .delete(`/v1/field/${data.fields[0].id}`)
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const field = await getField(data.fields[0].id);
            if (field) return done(new Error("field wasn't deleted"));
            done();
          });
      });

      it("try to delete a field you don't own (farmer)", function(done) {
        request(app.server)
          .delete("/v1/field/f01")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done);
      });

      it("try to delete a field you don't own (admin)", function(done) {
        request(app.server)
          .delete("/v1/field/f01")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

      it("try to delete a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .delete("/v1/field/abc")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done);
      });

      it("try to delete a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .delete("/v1/field/abc")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

    });

  });

});
