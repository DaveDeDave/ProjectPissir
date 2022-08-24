import jwt from "jsonwebtoken";
import argon2 from "argon2";
import fs from "fs/promises";
import { getUser } from "./db.js";
import { HTTP } from "./error.js";

const privateKey = process.env.ENV != "Test" ? await fs.readFile("/app/auth-data/RS256.key") : await fs.readFile("../lib/src/test/auth-data/RS256.key");
const publicKey = process.env.ENV != "Test" ? await fs.readFile("/app/auth-data/RS256.pub") : await fs.readFile("../lib/src/test/auth-data/RS256.pub");

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);

const generateRandomPassword = () => {
  let password = "";
  for (let i = 0; i < 5; i++) password += String.fromCharCode(randomNumber(65, 90)); // A - Z
  for (let i = 0; i < 5; i++) password += String.fromCharCode(randomNumber(97, 122)); // a - z 
  for (let i = 0; i < 4; i++) password += String.fromCharCode(randomNumber(48, 57)); // 0 - 9
  for (let i = 0; i < 4; i++) password += String.fromCharCode(randomNumber(33, 47)); // [! " # $ % ' ( ) * + , - . /]
  return password;
};

const generateHash = async (password) => {
  return await argon2.hash(password);
};

const verifyHash = async (password, hash) => {
  return await argon2.verify(hash, password);
};

const generateJWT = (payload, expiresIn = "7d") => new Promise((resolve, reject) => {
  jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn }, (err, token) => {
    if (err) reject(err);
    else resolve(token);
  });
});

const verifyJWT = (token) => new Promise((resolve, reject) => {
  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, async (err, token) => {
    if (err) reject(err);
    else {
      const user = await getUser(token.id);
      if (!user) reject(HTTP.unauthorized("User does not exist"));
      else resolve(token);
    }
  });
});

export {
  generateHash,
  verifyHash,
  generateJWT,
  verifyJWT,
  generateRandomPassword
};