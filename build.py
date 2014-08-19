#!/usr/bin/env python

import os

from tools.builders import BuildNamespace, BuildJS

builders = []

#walk directory structure, build list of files to process
for _root, dirs, files in os.walk('.'):
	root = os.path.relpath(_root)
	#print root, dirs, files
	if root.startswith('.'):
		continue
	elif root.startswith('tmp'):
		continue
	elif root.startswith('tools'):
		continue
	else:
		builders.append(BuildNamespace(root))
		for file in files:
			if file.startswith('.'):
				continue
		  	elif file.endswith(".js"):
				builder = BuildJS(root + '/' + file)
				builders.append(builder)
		  
#somehow figure out the order to process the files in(?)

# run the builders (TODO: could be done in parallel)
builder_outputs = []
for builder in builders:
	output = builder.build()
	builder_outputs.append(output)

#write an html file (as a stream)
from tools.minify import minify

html = open('tools/skel.html', 'r').read()
resources_html = ''
resources_js = ''
for output in builder_outputs:
	resources_html += output.html
	resources_js += output.js

html = html.replace('$RESOURCES', resources_html)
html = html.replace('$JAVASCRIPT', minify(resources_js))

f = open('index.html', 'wb')
f.write(html)
f.close()
