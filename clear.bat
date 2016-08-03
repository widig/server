
if EXIST users (

	cd users
	IF EXIST user1 (
		cd user1
		del *.*
		cd ..
		rmdir user1
	)
	if EXIST info.json (
		del info.json
	)
	
	cd ..
	rmdir users
	
)

if EXIST session.json (
	del session.json
)