# Posts and Authors example from graphql-tools docs



This project was created with [Apollo Launchpad](https://launchpad.graphql.com)

You can see the original pad at [https://launchpad.graphql.com/1jzxrj179](https://launchpad.graphql.com/1jzxrj179)

### Quick start guide

```bash
# Write your query or mutation here
Mutations:

mutation {
  Job(
    name: "test3",
    dateOfMove: "02-25-2019",
    startTime: 8,
    estimatedTime: 4
  ){
    id
    name
    dateOfMove
    startTime
    estimatedTime
  }

  Truck(
    name: "truck1",
    startTime: 8,
    endTime: 20
  ){
    id
    name
  	startTime
    endTime
    totalHours
  }
 
  JobQue(
    dateKey:"02-25-2019"
    jobID:"0a020bcd22ad656e2adb"
    truckID:"a5ea4c15c61755f88f0d"
  ){
    id
    date
    jobName
    jobID
    estimatedTime
    startTime
    truckID
    truckName
  }
}


Queries:

query{
  Jobs{
    id
    name
    dateOfMove
    startTime
    estimatedTime
  }
   Trucks{
    id
    name
    startTime
    endTime
    totalHours
  }
  JobQue{
    id
    date
    jobName
    jobID
    estimatedTime
    startTime
    truckID
    truckName
  }
}


}

```





Happy hacking!

The Apollo team :)
