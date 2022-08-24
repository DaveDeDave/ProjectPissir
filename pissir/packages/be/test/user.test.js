import { verifyHash } from "@pissir/lib/src/authentication.js";
import { getUser, prepareInputs, truncateAllTables } from "@pissir/lib/src/db.js";
import request from "supertest";
import app from "../app.js";
import { adminJWT, collaboratorJWT, farmerJWT } from "@pissir/lib/src/test/data/data.js";

describe("user.test.js", function() {

  before(async function() {
    await app.ready();
    await prepareInputs("test/inputs/user.test.sql");
  });
  
  after(async function() {
    await truncateAllTables();
  });

  describe("Test user end-points (/v1/admin/employee)", function() {

    describe("PATCH /password", function() {
  
      it("update password (admin)", function(done) {
        request(app.server)
          .patch("/v1/user/password")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            oldPassword: "Password12.",
            newPassword: "Password123."
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const user = await getUser("01G525HN80C7R507VC3SSM0TBV");
            if (!(await verifyHash("Password123.", user.password))) return done(new Error("password didn't change"));
            done();
          });
      });
  
      it("update password (farmer)", function(done) {
        request(app.server)
          .patch("/v1/user/password")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            oldPassword: "Password12.",
            newPassword: "Password123."
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const user = await getUser("01G525HN80C6R507VC3SSM0TBV");
            if (!(await verifyHash("Password123.", user.password))) return done(new Error("password didn't change"));
            done();
          });
      });
  
      it("try to update password with wrong old password (collaborator)", function(done) {
        request(app.server)
          .patch("/v1/user/password")
          .set("Authorization", `Bearer ${collaboratorJWT}`)
          .send({
            oldPassword: "Password14.",
            newPassword: "Password123."
          })
          .expect(403, done)
      });
  
      it("update password (collaborator)", function(done) {
        request(app.server)
          .patch("/v1/user/password")
          .set("Authorization", `Bearer ${collaboratorJWT}`)
          .send({
            oldPassword: "Password12.",
            newPassword: "Password123."
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const user = await getUser("01G525HN80C5R507VC3SSM0TBV");
            if (!(await verifyHash("Password123.", user.password))) return done(new Error("password didn't change"));
            done();
          });
      });
  
    });
  
    describe("PATCH /", function() {
    
      it("update user data (admin)", function(done) {
        request(app.server)
          .patch("/v1/user")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            name: "Luigi",
            surname: "Bianchi",
            birthDate: "1992-01-01"
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const user = await getUser("01G525HN80C7R507VC3SSM0TBV");
            if (
              user.name != "Luigi" ||
              user.surname != "Bianchi" ||
              user.birthDate.toISOString().slice(0, 10) != "1992-01-01"
            ) return done(new Error("user data didn't change"));
            done();
          });
      });
  
      it("update user data (farmer)", function(done) {
        request(app.server)
          .patch("/v1/user")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            name: "Luigi",
            surname: "Bianchi",
            birthDate: "1992-01-01"
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const user = await getUser("01G525HN80C6R507VC3SSM0TBV");
            if (
              user.name != "Luigi" ||
              user.surname != "Bianchi" ||
              user.birthDate.toISOString().slice(0, 10) != "1992-01-01"
            ) return done(new Error("user data didn't change"));
            done();
          });
      });
  
      it("update user data (collaborator)", function(done) {
        request(app.server)
          .patch("/v1/user")
          .set("Authorization", `Bearer ${collaboratorJWT}`)
          .send({
            name: "Luigi",
            surname: "Bianchi",
            birthDate: "1992-01-01"
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const user = await getUser("01G525HN80C5R507VC3SSM0TBV");
            if (
              user.name != "Luigi" ||
              user.surname != "Bianchi" ||
              user.birthDate.toISOString().slice(0, 10) != "1992-01-01"
            ) return done(new Error("user data didn't change"));
            done();
          });
      });
  
    });
  
    describe("DELETE /", function() {
  
      it("delete current user (admin)", function(done) {
        request(app.server)
          .delete("/v1/user")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const user = await getUser("01G525HN80C7R507VC3SSM0TBV");
            if (user) return done(new Error("user wasn't deleted"));
            done();
          });
      });
  
      it("delete current user (farmer)", function(done) {
        request(app.server)
          .delete("/v1/user")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const user = await getUser("01G525HN80C6R507VC3SSM0TBV");
            if (user) return done(new Error("user wasn't deleted"));
            done();
          });
      });
  
      it("delete current user (collaborator)", function(done) {
        request(app.server)
          .delete("/v1/user")
          .set("Authorization", `Bearer ${collaboratorJWT}`)
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const user = await getUser("01G525HN80C5R507VC3SSM0TBV");
            if (user) return done(new Error("user wasn't deleted"));
            done();
          });
      });
  
    });
  
  });

});
