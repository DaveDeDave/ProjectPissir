import { getSensorTopic, getUser, prepareInputs, truncateAllTables } from "@pissir/lib/src/db.js";
import request from "supertest";
import app from "../app.js";
import { adminJWT, farmerJWT } from "@pissir/lib/src/test/data/data.js";

const data = {};

describe("configuration.test.js", function() {

  before(async function() {
    await app.ready();
    await prepareInputs("test/inputs/topic.test.sql");
  });
  
  after(async function() {
    await truncateAllTables();
  });

  describe("Test configuration end-points (/v1/mosquito/configuration)", function() {

    describe("POST /", function() {

      it("add a configuration (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/configuration")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            actuatorTopic: "temperature-controls",
            fieldID: "f02",
            sensorTopic: "temperature",
            conditionType: ">",
            conditionValue: 50,
            conditionTrue: 40,
            conditionFalse: 45
          })
          .expect(204, done)
      });

      it("try to add a configuration to a field that you don't own (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/configuration")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            actuatorTopic: "temperature-controls",
            fieldID: "f01",
            sensorTopic: "temperature",
            conditionType: ">",
            conditionValue: 50,
            conditionTrue: 40,
            conditionFalse: 45
          })
          .expect(404, done)
      });

      it("try to add a configuration to a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/configuration")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            actuatorTopic: "temperature-controls",
            fieldID: "abc",
            sensorTopic: "temperature",
            conditionType: ">",
            conditionValue: 50,
            conditionTrue: 40,
            conditionFalse: 45
          })
          .expect(404, done)
      });
  
    });

    describe("PUT /", function() {

      it("update a configuration (farmer)", function(done) {
        request(app.server)
          .put("/v1/mosquito/configuration")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            actuatorTopic: "temperature-controls",
            fieldID: "f02",
            sensorTopic: "temperature",
            conditionType: ">",
            conditionValue: 40,
            conditionTrue: 10,
            conditionFalse: 30
          })
          .expect(204, done)
      });

      it("try to update a configuration to a field that you don't own (farmer)", function(done) {
        request(app.server)
          .put("/v1/mosquito/configuration")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            actuatorTopic: "temperature-controls",
            fieldID: "f01",
            sensorTopic: "temperature",
            conditionType: ">",
            conditionValue: 50,
            conditionTrue: 40,
            conditionFalse: 45
          })
          .expect(404, done)
      });

      it("try to update a configuration to a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .post("/v1/mosquito/configuration")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            actuatorTopic: "temperature-controls",
            fieldID: "abc",
            sensorTopic: "temperature",
            conditionType: ">",
            conditionValue: 50,
            conditionTrue: 40,
            conditionFalse: 45
          })
          .expect(404, done)
      });
  
    });

    describe("GET /:fieldID/:actuatorTopic", function() {

      it("get a configuration (farmer)", function(done) {
        request(app.server)
          .get("/v1/mosquito/configuration/f02/temperature-controls")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(200,{
            actuatorTopic: "temperature-controls",
            fieldID: "f02",
            sensorTopic: "temperature",
            conditionType: ">",
            conditionValue: 40,
            conditionTrue: 10,
            conditionFalse: 30,
            startTime: 0,
            endTime: 0
          }, done)
      });

      it("try to get a configuration to a field that you don't own (farmer)", function(done) {
        request(app.server)
          .get("/v1/mosquito/configuration/f01/temperature-controls")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done)
      });

      it("try to get a configuration to a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .get("/v1/mosquito/configuration/abc/temperature-controls")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .expect(404, done)
      });
  
    });

    describe("DELETE /", function() {

      it("delete a configuration (farmer)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/configuration")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            fieldID: "f02",
            actuatorTopic: "temperature-controls"
          })
          .expect(204, done)
      });

      it("try to delete a configuration to a field that you don't own (farmer)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/configuration")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            fieldID: "f01",
            actuatorTopic: "temperature-controls"
          })
          .expect(404, done)
      });

      it("try to delete a configuration to a field that doesn't exist (farmer)", function(done) {
        request(app.server)
          .delete("/v1/mosquito/configuration")
          .set("Authorization", `Bearer ${farmerJWT}`)
          .send({
            fieldID: "abc",
            actuatorTopic: "temperature-controls"
          })
          .expect(404, done)
      });
  
    });
    
  });

});
