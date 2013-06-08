"""
URL routes declarations.

All views are currently declared here.

"""
import os

from flask import render_template, jsonify

from vwordnet import app, make_json_error, wordnet
from cloudly import logger

log = logger.init(__name__)


@app.errorhandler(Exception)
def error_handler(error):
    return make_json_error(error)


@app.route('/')
def index():
    """The webapp entry point.
    Configuration options are set here and available to the client via the
    global variable `appConfig`, see templates/base.html.
    """
    webapp_config = {
    }
    return render_template('index.html', config=webapp_config)


@app.route('/define/<word>')
def define(word):
    return jsonify(definitions=wordnet.define(word))


def in_production():
    return os.environ.get("IS_PRODUCTION", "").lower() in ['true', 'yes']
