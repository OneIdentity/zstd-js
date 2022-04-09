#!/bin/bash
CONTRIB_DIR="node_modules/zstd/contrib/single_file_libs"
LIB_DIR="node_modules/zstd/lib"
OUT_DIR="tmp"

# Clear $OUT_DIR if already exists
rm -rf $OUT_DIR

# Create $OUT_DIR
mkdir $OUT_DIR

# Combine zstd FULL(compress, decompress) library's c files to a merged file
# It's possible to create a compressor-only library but since the decompressor is so small in comparison
# this doesn't bring much of a gain (but for the curious, simply remove the files
# in the decompress section at the end of zstd-in.c).
$CONTRIB_DIR/combine.sh -r $LIB_DIR -o $OUT_DIR/zstd.c $CONTRIB_DIR/zstd-in.c

# Combine zstd DECOMPRESS library's c files to a merged file
$CONTRIB_DIR/combine.sh -r $LIB_DIR -o $OUT_DIR/zstddeclib.c $CONTRIB_DIR/zstddeclib-in.c

