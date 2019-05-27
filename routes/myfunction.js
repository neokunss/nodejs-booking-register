
const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const passport = require("passport");
const crypto = require("crypto");
const async = require("async");
const emoji = require("node-emoji");
const errorHandler = require("errorhandler");
const Users = mongoose.model("Users");
const Reservations = mongoose.model("Reservations");
const Invoicereceipts = mongoose.model("Invoicereceipts");

//route middleware to ensure user is logged in
exports.ensureLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else res.redirect("/user/login");
};

//route middleware to ensure user is logged in
exports.ensureLoggedInVerification = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isVerification) {
      return next();
    } else res.redirect("/user/verification/");
  } else res.redirect("/user/login");
};

exports.getFileUpload = (req, res) => {
	res.render("api/upload", {
		title: "File Upload"
	});
};

exports.postFileUpload = (req, res) => {
	req.flash("success", { msg: "File was uploaded successfully." });
	res.redirect("/api/upload");
};