# mongo-csv-exportor
Export a mongo db collection records

To start the server

```

# Run the following commands in order

git clone https://github.com/rrkjonnapalli/mongo-csv-exportor

cd mongo-csv-exportor

docker-compose up -d

```

To generate data (continue with data generation after exportor is started)

```

docker exec -it exportor bash

# set RC=10 to generate 10 order records

$host:usr/src/app# RC=10 npm run generate

```

We are generating data for 5 different clients in round robin fashion.


### List of clients

- amazon
- flipkart
- ebay
- walmart
- ikea


Sample API request
http://localhost:8080/export?client=amazon&sd=2020-09-01&ed=2020-10-30