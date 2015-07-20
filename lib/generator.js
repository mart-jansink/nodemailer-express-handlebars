'use strict';

var path = require('path'),
    handlebars = require('express-handlebars');

var titleRegExp = /<title[^>]*>(.*?)<\/title>\s*/i;

var TemplateGenerator = function(opts) {
    var viewEngine = opts.viewEngine || {};
    if (!viewEngine.renderView) {
        viewEngine = handlebars.create(viewEngine);
    }
    this.viewEngine = viewEngine;
    this.viewPath = opts.viewPath;
    this.extName = opts.extName || '.handlebars';
    this.extractTitle = opts.extractTitle || false;
};

TemplateGenerator.prototype.render = function render(mail, cb) {
    if (mail.data.html) return cb();

    var templatePath = path.join(this.viewPath, mail.data.template + this.extName);
    var opts = this;
    this.viewEngine.renderView(templatePath, mail.data.context, function(err, body) {
        if (err) return cb(err);

        if (opts.extractTitle && !mail.data.subject) {
            var title = body.match(titleRegExp);
            if (title && title[1]) {
                mail.data.subject = title[1];
                body = body.replace(titleRegExp,"");
            }
        }

        mail.data.html = body;
        cb();
    });
};

module.exports = TemplateGenerator;