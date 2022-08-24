import { getActuatorTopic, getUser, prepareInputs, truncateAllTables } from "@pissir/lib/src/db.js";
import request from "supertest";
import app from "../app.js";
import { adminJWT, farmerJWT } from "@pissir/lib/src/test/data/data.js";

const data = {};

describe("actuator.test.js", function() {

  before(async function() {
    await app.ready();
    await prepareInputs("test/inputs/topic.test.sql");
  });
  
  after(async function() {
    await truncateAllTables();
  });

  describe("Test actuator end-points (/v1/mosquito/actuator)", function() {

    describe("POST /", function() {

      it("add an actuator (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "f02"
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const actuator = await getActuatorTopic({ topic: "light-controls", fieldID: "f02" });
            if (!actuator) return done(new Error("actuator wasn't created"));
            data.actuators = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });

      it("add an actuator (admin)", function(done) {
        request(app.server)
          .post("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "f03"
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const actuator = await getActuatorTopic({ topic: "light-controls", fieldID: "f03" });
            if (!actuator) return done(new Error("actuator wasn't created"));
            data.actuators.push({ topic: "light-controls", fieldID: "f03" });
            done();
          });
      });

      it("try to add an actuator to a field that you don't own (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "f03"
          })
          .expect(404)
          .end(async function(err, res) {
            if (err) return done(err);
            data.actuators = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });

      it("try to add an actuator to a field that you don't own (admin)", function(done) {
        request(app.server)
          .post("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "f01"
          })
          .expect(404)
          .end(async function(err, res) {
            if (err) return done(err);
            data.actuators = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });

      it("try to add an actuator to a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "acb"
          })
          .expect(404)
          .end(async function(err, res) {
            if (err) return done(err);
            data.actuators = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });

      it("try to add an actuator to a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .post("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "abc"
          })
          .expect(404)
          .end(async function(err, res) {
            if (err) return done(err);
            data.actuators = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });
  
    });

    describe("GET /:fieldID/all", function() {
  
      it("get all actuators (farmer)", function(done) {
        request(app.server)
          .get("/v1/mosquito/actuator/f02/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(200)
          .end(async function(err, res) {
            if (err) return done(err);
            const actuators = res.body.result;
            if (actuators.length != 2) return done(new Error("incorrect result"));
            done();
          });
      });

      it("get all actuators (admin)", function(done) {
        request(app.server)
          .get("/v1/mosquito/actuator/f03/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200)
          .end(async function(err, res) {
            if (err) return done(err);
            const actuators = res.body.result;
            if (actuators.length != 1) return done(new Error("incorrect result"));
            done();
          });
      });

      it("get all actuators of a field that you don't own (farmer)", function(done) {
        request(app.server)
          .get("/v1/mosquito/actuator/f01/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done);
      });

      it("get all actuators of a field that you don't own (admin)", function(done) {
        request(app.server)
          .get("/v1/mosquito/actuator/f01/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

      it("get all actuators of a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .get("/v1/mosquito/actuator/abc/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done);
      });

      it("get all actuators of a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .get("/v1/mosquito/actuator/abc/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

    });
  
    describe("DELETE /", function() {
    
      it("delete an actuator (farmer)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send(data.actuators[0])
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const actuator = await getActuatorTopic(data.actuators[0]);
            if (actuator) return done(new Error("actuator wasn't deleted"));
            data.actuators.slice(0, 1);
            done();
          });
      });

      it("delete an actuator (admin)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send(data.actuators[0])
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const actuator = await getActuatorTopic(data.actuators[0]);
            if (actuator) return done(new Error("actuator wasn't deleted"));
            done();
          });
      });

      it("try to delete an actuator of a field that you don't own (farmer)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "temperature-controls",
            fieldID: "f03"
          })
          .expect(404, done);
      });

      it("try to delete an actuator of a field that you don't own (admin)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            topic: "temperature-controls",
            fieldID: "f01"
          })
          .expect(404, done);
      });
  
      it("try to delete an actuator of a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "temperature-controls",
            fieldID: "f04"
          })
          .expect(404, done);
      });

      it("try to delete an actuator of a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/actuator")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            topic: "temperature-controls",
            fieldID: "f04"
          })
          .expect(404, done);
      });
  
    });
  
  });

});
