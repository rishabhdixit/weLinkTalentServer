To create dummy admin user
==================================

There are two options :
---------------
- Go inside scripts directory using 'cd' command and run following command to insert admin record
		
		sh insert_dummy_admin.sh local	(for adding dummy admin user locally)
		[or]
		sh insert_dummy_admin.sh remote  	(for adding dummy admin user in cloud db)

- Another option is you can directly run create_dummy_admin_local.js file with mongo. eg:

		mongo path/create_dummy_admin_local.js  (for adding dummy admin user locally)
		[or]
		mongo path/create_dummy_admin_remote.js   (for adding dummy admin user in cloud db)
