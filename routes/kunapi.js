const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
var passport = require("passport");
const crypto = require("crypto");
const async = require("async");
const SMTPServer = require("smtp-server").SMTPServer;
// const server = new SMTPServer(options);

const Users = mongoose.model("Users");
const Reservations = mongoose.model("Reservations");
const Invoicereceipts = mongoose.model("Invoicereceipts");
const paypal = require("paypal-rest-sdk");

/**
 * GET /api
 * List of API examples.
 */
exports.getTestForm = (req, res) => {
	res.render("page-user-test-validation", {
		title: "API Examples"
	});
};

/**
 * POST /api
 * List of API examples.
 */
exports.postTestForm = (req, res) => {

	req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    res.status(200).json({
			status: "success",
			message: "Welcome to the project-name api",
			data: req.body.data
		});
  }

};