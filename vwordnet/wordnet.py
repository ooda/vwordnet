import os
from os.path import join, dirname, abspath
from collections import defaultdict

import networkx as nx
from networkx.readwrite import json_graph
import nltk
from nltk.corpus import wordnet as wn

from cloudly import logger

# Initialize the path to the NLTK corpus data. If there is no environment
# variable NLTK_DATA_DIR defined, use directory *nltk_data* at the
# root of the package, cf. http://stackoverflow.com/a/2817302
NLTK_DATA_DIR = join(dirname(dirname(abspath(__file__))), "nltk_data")
NLTK_DATA_DIR = os.environ.get("NLTK_DATA_DIR", NLTK_DATA_DIR)
nltk.data.path = [NLTK_DATA_DIR]

log = logger.init(__name__)


def define(word):
    """Return a list of definitions for the given word.
    A definition is a group of WordNet synsets having the same root hypernym.
    """
    definitions = []
    for synset in wn.synsets(word):
        graph = get_hypernym_graph(synset)
        definition = {
            'synsets': [{
                'id': synset.name,
                'definition': synset.definition,
                'lemmas': [lemma_attr(l) for l in synset.lemmas],
            }],
            'graph': graph,
            'rootsynset': graph.graph['root'],
            'word': word,
        }
        definitions.append(definition)

    merged = []
    # Jsonify each graph
    for defn in merge_definitions(definitions):
        try:
            defn['graph'] = json_graph.tree_data(defn['graph'],
                                                 defn['graph'].graph['root'])
            merged.append(defn)
        except TypeError as exception:
            log.error(exception)
    return merged


def merge_definitions(definitions):
    """Merge all definitions having the same root synset."""
    # Map all synset having the same root.
    mapped = defaultdict(list)
    for definition in definitions:
        mapped[definition['graph'].graph['root']].append(definition)

    # For each list of synsets, merge them all into the first item of a list.
    merged = []
    for defs in mapped.itervalues():
        base = defs[0]
        for defn in defs[1:]:
            merge(base, defn)
        merged.append(base)
    return merged


def merge(def1, def2):
    """Merge def2 into def1. After that, you may drop def2."""
    # TODO: only trees are merged right now. Other attributes should follow.
    graph1 = def1['graph']
    graph2 = def2['graph']

    for node, data in graph1.nodes_iter(data=True):
        # Add edges
        for edge1, edge2 in graph2.edges_iter():
            graph1.add_edge(edge1, edge2)
        # Add nodes
        for node2, data2 in graph2.nodes_iter(data=True):
            graph1.add_node(node2, **data2)

    # Merge definition strings
    def1['synsets'].extend(def2['synsets'])


def get_hypernym_graph(synset):
    """Return the first hypernym graph of the given synset.
    A graph is the full hierarchy of synsets that lead from the top synset to
    the one given in argument."""
    # We consider only one path for now. There are few cases when we do have
    # more than 1 and we ignore those for the time being.
    return [hierarchy(path) for path in synset.hypernym_paths()][0]
    #if graphs:
        #return graphs[0]
    #else:
        #return [nx.DiGraph(root=synset.name)]


def hierarchy(path):
    """Build a synset hierarchy from the given path."""
    graph = nx.DiGraph(root=path[0].name)
    for synset in path:
        graph.add_node(synset.name, **synset_data(synset))
        for hyponym in synset.hyponyms():
            graph.add_node(hyponym.name, **synset_data(hyponym))
            graph.add_edge(synset.name, hyponym.name)
    return graph


def synset_data(synset):
    """Return a dict of attributes from a synset."""
    return  {
        'definition': synset.definition,
        'lemmas': [lemma_attr(l) for l in synset.lemmas],
    }


def lemma_attr(lemma):
    return {
        'id': lemma.name,
        'count': lemma.count(),
    }
