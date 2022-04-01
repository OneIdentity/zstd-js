#!/bin/bash
EMSDK_DIR="../../node_modules/emscripten"
# Download and install the latest SDK tools.
$EMSDK_DIR/emsdk install latest

# Make the "latest" SDK "active" for the current user. (writes .emscripten file)
$EMSDK_DIR/emsdk activate latest

# Activate PATH and other environment variables in the current terminal
source $EMSDK_DIR/emsdk_env.sh

# Go to the compiler's folder
cd ../../compiler

# Run the compile
node ./compile.js

# Print list of created files
ls ../tmp
