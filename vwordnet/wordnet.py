import os
from os.path import join, dirname, abspath, exists
from collections import defaultdict

import networkx as nx
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
    definitions = get_definitions(word)
    merged = []
    # Jsonify each graph
    for defn in merge_synsets(definitions):
        try:
            defn['graph'] = tree_data(defn['graph'],
                                      defn['graph'].graph['root'])
            merged.append(defn)
        except TypeError as exception:
            log.error(exception)
    return merged


def get_definitions(word):
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
    return definitions


def merge_synsets(definitions):
    """Merge the graph of synsets having the same root."""
    # Map all synset having the same root.
    mapped = defaultdict(list)
    for definition in definitions:
        mapped[definition['graph'].graph['root']].append(definition)

    # For each list of synsets, merge them all into the first item of the list.
    merged = []
    for defs in mapped.itervalues():
        base = defs[0]
        for defn in defs[1:]:
            merge(base, defn)
        merged.append(base)
    return merged


def merge(def1, def2):
    """Merge def2 into def1. After that, you may drop def2."""
    graph1 = def1['graph']
    graph2 = def2['graph']

    # Add graph2 nodes and edges to graph1
    for node, data in graph1.nodes_iter(data=True):
        # Add graph2 edges
        for edge1, edge2 in graph2.edges_iter():
            graph1.add_edge(edge1, edge2)
        # Add graph2 nodes
        for node2, data2 in graph2.nodes_iter(data=True):
            graph1.add_node(node2, **data2)

    # Combine definition attributes
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
        graph.add_node(synset.name, path=True, **synset_data(synset))
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


# The data we need to download from NLTK to use this module. Add or remove
# appropriately in the following map. The key is the directory under which NLTK
# puts its corresponding data.
nltk_data = {
    'corpora': ['wordnet'],
}


def _download_nltk_data():
    """Install corpus data.
    """
    for directory, data in nltk_data.iteritems():
        for datum in data:
            if not exists(join(NLTK_DATA_DIR, directory, datum)):
                nltk.download(datum, download_dir=NLTK_DATA_DIR)


def tree_data(G, root):
    """Function taken from networkx and modified to allow non-tree graphs.
    A tree graph is one where the number of nodes is exactly the number
    of edges + 1:

        G.number_of_nodes() == G.number_of_edges() + 1

    However, WordNet has non-tree graphs and we want to show them.
    """
    if not G.is_directed():
        raise TypeError("G is not directed")

    def add_children(n, G):
        nbrs = G[n]
        if len(nbrs) == 0:
            return []
        children = []
        for child in nbrs:
            d = dict(id=child, **G.node[child])
            c = add_children(child, G)
            if c:
                d['children'] = c
            children.append(d)
        return children
    data = dict(id=root, **G.node[root])
    data['children'] = add_children(root, G)
    return data


_download_nltk_data()
