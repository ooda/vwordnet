VWordNet
========

Another way of looking at [WordNet](http://wordnet.princeton.edu/). There are a
lot of WordNet viewers (see this
[list](http://wordnet.princeton.edu/wordnet/related-projects/#web)). This web
app shows the synset hierarchy (hypernyms/hyponyms) as a horizontal tree with
fixed width levels.

Installation:
-------------
sudo apt-get install libffi-dev

virtualenv --no-site-packages env
source env/bin/activate
pip install -r requirements.txt

Running the server:
python runserver.py

Warning:
--------
In order to use NLTK 3.0 instead of 2.0, code rewritting will be necessary because item "synsets" have become functions instead of objects. Also note that Heroku latest Stack Cedar-14 used setuptools version 11 which is not comptatible with NLTK 2.0.4. This has been solved in the NLTK 2.0.5 package.

Licence
-------

MIT
