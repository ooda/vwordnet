from os.path import join, dirname

from setuptools import setup, find_packages

# IMPORTANT: updates to the following must also be done in __init__.py.
__version__ = "0.1.0"
__author__ = "Hugues Demers"
__email__ = "hugues.demers@ooda.ca"
__license__ = "MIT"

GITHUB = "github.com/ooda"

# Put your dependencies here. Note that a tag of the form v0.1.3 must exists in
# your repo, since links of the following form will be automatically generated:
#
# git+http://username:password@github.com/ooda/package@v0.1.3#egg=package-0.1.3
#
dependencies = [
    ('cloudly', '3.0.0'),
]

# Generate links
dependency_links = [
    "git+https://{github}/{pkg}@{ver}#egg={pkg}-{ver}".format(
        github=GITHUB,
        pkg=package,
        ver=version
    )
    for package, version in dependencies
]

github_install_requires = [
    "{pkg}=={ver}".format(
        pkg=package,
        ver=version,
    )
    for package, version in dependencies
]

setup(
    name='vwordnet',
    version=__version__,
    description='WordNet Visualized',
    long_description=open(join(dirname(__file__), 'README.md')).read(),
    author=__author__,
    author_email=__email__,
    license=__license__,
    packages=find_packages(exclude=('tests', 'docs', 'data')),
    dependency_links=dependency_links,
    scripts=['bin/env_run.sh'],
    install_requires=[
        'flask',
    ] + github_install_requires
)
