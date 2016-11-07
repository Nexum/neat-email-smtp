"use strict";

// @IMPORTS
var Application = require("neat-base").Application;
var Module = require("neat-base").Module;
var Tools = require("neat-base").Tools;
var nodemailer = require('nodemailer');
var striptags = require("striptags");
var Promise = require("bluebird");

module.exports = class Email extends Module {
    static defaultConfig() {
        return {
            transport: "smtps://127.0.0.1:25",
            sender: {
                name: "neat-email-sendmail",
                email: "foo@bar.com"
            }
        }
    }

    init() {
        return new Promise((resolve, reject) => {
            this.log.debug("Initializing...");
            this.transporter = nodemailer.createTransport(this.config.transport);
            resolve(this);
        });
    }

    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");
            return resolve(this);
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        });
    }

    /**
     * Send an email via sendmail
     *
     * @param object recipient
     * @param options options
     * @param object sender OPTIONAL
     */
    sendMail(recipient, options, sender) {
        sender = sender || {};
        recipient = recipient || {};
        options = options || {};

        var senderEmail = sender.email || this.config.sender.email;
        var senderName = sender.name || this.config.sender.name;

        var recipientName = recipient.name || "";
        var recipientEmail = recipient.email || "";

        if (!recipientEmail) {
            return Promise.reject(new Error("No recipient email given"));
        }

        var from = `"${senderName}" <${senderEmail}>`;
        var to = `"${recipientName}" <${recipientEmail}>`;

        options.textContent = options.textContent || striptags(options.htmlContent);

        if (!options.textContent && !options.htmlContent && !options.subject) {
            return Promise.reject(new Error("Can't send a completely empty email... no content or subject was given..."));
        }

        var mailOptions = {
            from: from,
            to: to,
            subject: options.subject,
            text: options.textContent,
            html: options.htmlContent
        };

        return new Promise((resolve, reject) => {
            this.transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    this.log.error(err);
                    return reject(err);
                }

                resolve(info);
            });
        })
    }
}