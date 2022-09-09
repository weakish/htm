#!/bin/sh
if [ "$(uname)" = "Linux" -a "$(uname -m)" = "x86_64" ]; then
  ./scripts/bun-linux-amd64 ./scripts/doc.ts
else
  echo 'Currently, only Linux amd64 is supported.'
  echo 'Pull request to support other platform is welcome.'
  echo 'Some Linux distributions cannot run bun.sh due to GLIBC version mismatch.'
  echo 'See https://github.com/oven-sh/bun/issues/255'
fi
