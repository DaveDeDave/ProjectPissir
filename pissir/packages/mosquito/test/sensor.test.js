import { getSensorTopic, getUser, prepareInputs, truncateAllTables } from "@pissir/lib/src/db.js";
import request from "supertest";
import app from "../app.js";
import { adminJWT, farmerJWT } from "@pissir/lib/src/test/data/data.js";

const data = {};

describe("sensor.test.js", function() {

  before(async function() {
    await app.ready();
    await prepareInputs("test/inputs/topic.test.sql");
  });
  
  after(async function() {
    await truncateAllTables();
  });

  describe("Test sensor end-points (/v1/mosquito/sensor)", function() {

    describe("POST /", function() {

      it("add a sensor (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "f02"
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const sensor = await getSensorTopic({ topic: "light-controls", fieldID: "f02" });
            if (!sensor) return done(new Error("actuator wasn't created"));
            data.sensors = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });

      it("add a sensor (admin)", function(done) {
        request(app.server)
          .post("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "f03"
          })
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const sensor = await getSensorTopic({ topic: "light-controls", fieldID: "f03" });
            if (!sensor) return done(new Error("actuator wasn't created"));
            data.sensors.push({ topic: "light-controls", fieldID: "f03" });
            done();
          });
      });

      it("try to add a sensor to a field that you don't own (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "f03"
          })
          .expect(404)
          .end(async function(err, res) {
            if (err) return done(err);
            data.sensors = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });

      it("try to add a sensor to a field that you don't own (admin)", function(done) {
        request(app.server)
          .post("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "f01"
          })
          .expect(404)
          .end(async function(err, res) {
            if (err) return done(err);
            data.sensors = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });

      it("try to add a sensor to a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "acb"
          })
          .expect(404)
          .end(async function(err, res) {
            if (err) return done(err);
            data.sensors = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });

      it("try to add a sensor to a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .post("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            topic: "light-controls",
            fieldID: "abc"
          })
          .expect(404)
          .end(async function(err, res) {
            if (err) return done(err);
            data.sensors = [{ topic: "light-controls", fieldID: "f02" }];
            done();
          });
      });
  
    });

    describe("GET /:fieldID/all", function() {
  
      it("get all sensors (farmer)", function(done) {
        request(app.server)
          .get("/v1/mosquito/sensor/f02/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(200)
          .end(async function(err, res) {
            if (err) return done(err);
            const sensors = res.body.result;
            if (sensors.length != 2) return done(new Error("incorrect result"));
            done();
          });
      });

      it("get all sensors (admin)", function(done) {
        request(app.server)
          .get("/v1/mosquito/sensor/f03/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(200)
          .end(async function(err, res) {
            if (err) return done(err);
            const sensors = res.body.result;
            if (sensors.length != 1) return done(new Error("incorrect result"));
            done();
          });
      });

      it("get all sensors of a field that you don't own (farmer)", function(done) {
        request(app.server)
          .get("/v1/mosquito/sensor/f01/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done);
      });

      it("get all sensors of a field that you don't own (admin)", function(done) {
        request(app.server)
          .get("/v1/mosquito/sensor/f01/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

      it("get all sensors of a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .get("/v1/mosquito/sensor/abc/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done);
      });

      it("get all sensors of a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .get("/v1/mosquito/sensor/abc/all?page=1&quantity=100")
          .set("Authorization", `Bearer ${adminJWT}`)
          .expect(404, done);
      });

    });
  
    describe("DELETE /", function() {
    
      it("delete a sensor (farmer)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send(data.sensors[0])
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const sensor = await getSensorTopic(data.sensors[0]);
            if (sensor) return done(new Error("sensor wasn't deleted"));
            data.sensors.slice(0, 1);
            done();
          });
      });

      it("delete a sensor (admin)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send(data.sensors[0])
          .expect(204)
          .end(async function(err, res) {
            if (err) return done(err);
            const sensor = await getSensorTopic(data.sensors[0]);
            if (sensor) return done(new Error("actuator wasn't deleted"));
            done();
          });
      });

      it("try to delete a sensor of a field that you don't own (farmer)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "temperature-controls",
            fieldID: "f03"
          })
          .expect(404, done);
      });

      it("try to delete a sensor of a field that you don't own (admin)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${adminJWT}`)
          .send({
            topic: "temperature-controls",
            fieldID: "f01"
          })
          .expect(404, done);
      });
  
      it("try to delete a sensor of a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/sensor")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            topic: "temperature-controls",
            fieldID: "f04"
          })
          .expect(404, done);
      });

      it("try to delete a sensor of a field that doesn't exist (admin)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/sensor")
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
