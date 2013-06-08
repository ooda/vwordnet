import os

from vwordnet import app

#os.environ["FLASK_DEV_SERVER"] = "true"

# Bind to PORT if defined, otherwise default to 5000.
port = int(os.environ.get('PORT', 5000))
app.run(debug=True, host='0.0.0.0', port=port)
