#!/bin/sh
#==============================================================================
# Create a zip archive from the source directory and put it into the dist directory.
# The package name will be obtained from the package.json file.
#==============================================================================
source=src

cd $(dirname "${0}")/..
wd=${PWD}
name=$(jq -r '.name' package.json)
cd ${source}
mkdir -p "${wd}/dist" 2>/dev/null
rm "${wd}/dist/${name}.zip" 2>/dev/null
echo "Create package with '${name}' lambda function"
echo "Source code from ${PWD}"
zip -J "${wd}/dist/${name}.zip" * **/* \
&& echo "Success" && du -h ${wd}/dist/${name}.zip
