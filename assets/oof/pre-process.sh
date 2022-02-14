#!/bin/bash
ffmpeg -hide_banner -loglevel error -y -stream_loop -1 -i cover.webm -i steve-hurt.ogg -shortest -map 0:v:0 -map 1:a:0 oof-steve.webm
ffmpeg -hide_banner -loglevel error -y -stream_loop -1 -i cover.webm -i roblox-death.ogg -shortest -map 0:v:0 -map 1:a:0 oof-roblox.webm
