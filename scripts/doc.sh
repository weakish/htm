#!/bin/sh

if [ "$(uname)" = "Linux" -a "$(uname -m)" = "x86_64" ]; then
  ./scripts/bun-linux-amd64 ./scripts/doc.ts
else
  echo 'Currently, only Linux amd64 is supported.'
  echo 'Pull request to support other platform is welcome.'
fi
