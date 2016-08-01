echo off
cd users
cd user1
del *.*
cd ..
rmdir user1
del info.json
cd ..
rmdir users
del session.json

