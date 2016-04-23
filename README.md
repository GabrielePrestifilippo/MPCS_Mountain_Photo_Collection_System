# MPCS: Mountain Photo Collection System
The main objective of a MPCS system is to collect automatically from heterogeneous user-generated pictures that may contain mountain profiles, and to aggregate them in a geographical system interface.

MPCS system is a web application developed in Node.js + Express + MongoDB that allows to: 
Search for Mountain Alps, querying DBpedia. 
Retrieve Images for a specific mountain using: Twitter, Flickr, Facebook and DBpedia. 
Validate the content of the Image doing a reverse-search from the images. 
Insert new mountains and decode their geolocation from name. 
Display the pictures on a map based on the decoded geolocation or reading the exif data from Images.
