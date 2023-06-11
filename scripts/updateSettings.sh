#!/bin/bash
sed -i -E "s/ENV:\s\'development\'/ENV: \'production\'/g" settings.js
