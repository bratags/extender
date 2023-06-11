#!/bin/bash
sed -i -E "s/ENV:\s'development'/ENV: 'production'/g" src/settings.js

cat src/settings.js