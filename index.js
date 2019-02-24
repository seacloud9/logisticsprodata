const express = require("express");
const { ApolloServer, gql } = require('apollo-server-express');
const moment = require('moment');
const Trucks = []
const Jobs = []

  // Type definitions define the "shape" of your data and specify
  // which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`

input JobInput {
    name: String!
    dateOfMove: String!
    startTime: String!
    estimatedTime: Int!
  }

input TruckInput {
    name: String!
    startTime: Int!
    endTime: Int!
    totalHours:Int!
}


type Job {
    id: String!
    name: String!
    dateOfMove: String!
    startTime: String!
    estimatedTime: Int!
}

type Truck {
    id: String!
    name: String!
    startTime: Int!
    endTime: Int!
    totalHours:Int!
}

type JobQue {
    id: String!
    jobName: String!
    jobID: String!
    estimatedTime: Int!
    startTime: String!
    endTime: String!
    truckID: String!
    truckName: String!
}

  # the schema allows the following query:
type Query {
    JobQue: [JobQue]
    Job: [Job]
    Truck: [Truck]
}

  # this schema allows the following mutation:
type Mutation {
    addJobQue (
      dateKey: String
      jobID: String
      truckID: String
    ): JobQue
    addJob (
      name: String
      dateOfMove: String
      startTime: String
      estimatedTime: Int
    ): Job
    addTruck (
      truck:TruckInput
    ): Truck
}
  `;

  const checkTruck = function(truck, job, jobQueID){
    const currentTruck = find(Truck, { id: truck })
    const currentJob = find(Job, {id: job})
    const currentJobQue = find(JobQue, { id: jobQueID })
    const currentDayTruckUsage = find(JobQue, { id: jobQueID, truck: truck.id})
    if (!currentTruck) {
      throw new Error(`Couldn't find the current ${truckId}`);
    }
    if(currentDayTruckUsage){
      let allofTruckCurrenHours = 0
      currentDayTruckUsage.map((value, index) => {
        allofTruckCurrenHours+= value.estimatedTime
      })
      if(0 > (allofTruckCurrenHours - currentTruck.totalHours)){
        throw new Error(`Current truck ${truck.name} is unavailable`);
      }
    }

    return {
      id: jobQueID,
      jobName: currentJob.name,
      estimatedTime: currentJob.estimatedTime,
      startTime: currentJob.startTime,
      truck: truck
    }
}


  const resolvers = {
    Query: {
      JobQue: () => JobQue,
      Job: () => Jobs,
      Truck: () => Trucks,
    },
    Mutation: {
      addJobQue: (_, { dateKey, jobID, truckID }) => {
        const jobQue = find(JobQue, { id: dateKey });
        if (!jobQue) {
          return checkTruck(truckID, jobID, moment().format('MMMM Do YYYY, h:mm:ss a'))
        }else{
          return checkTruck(truckID, jobID, jobQue.id)
        }
      },
      addJob: (_, { name, dateOfMove, startTime, estimatedTime }) => {
        const _job = {
          id: require('crypto').randomBytes(10).toString('hex'),
          name: name,
          dateOfMove: dateOfMove,
          startTime: startTime,
          estimatedTime: estimatedTime
        }
        Jobs.push(_job)
        return _job
      },
      addTruck: (_, { truck }) => {
        return{
          name: truck.name,
          startTime: truck.startTime,
          endTime: truck.endTime,
          totalHours:truck.totalHours
        }
      },
    }
  }


  const server = new ApolloServer({
    typeDefs,
    resolvers,
    engine: process.env.ENGINE_API_KEY && {
      apiKey: process.env.ENGINE_API_KEY,
    }
  });

  const app = express();
  server.applyMiddleware({ app });
  app.get("/", (req, res) => {
    res.redirect("/graphql");
  });

  // This `listen` method launches a web-server.  Existing apps
  // can utilize middleware options, which we'll discuss later.
  const port = 4000;

  app.listen({ port }, () =>
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    )
  )