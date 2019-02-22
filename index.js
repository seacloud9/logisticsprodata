const express = require("express");
const { ApolloServer, gql } = require('apollo-server-express');
const moment = require('moment');

  const Trucks = []
  
  const Job = []

  // Type definitions define the "shape" of your data and specify
  // which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
type Job {
    id: Int!
    name: String
    dateOfMove: String
    startTime: String,
    estimatedTime: Int
  }

  type Truck {
    id: Int!
    name: String
    startTime: Int,
    endTime: Int,
    totalHours:Int
  }

  type JobQue {
    id: String,
    jobName: String,
    estimatedTime: Int,
    startTime: Int,
    endTime: Int,
    truck: Int,
  }

  # the schema allows the following query:
  type Query {
    JobQue: [JobQue]
  }

  # this schema allows the following mutation:
  type Mutation {
    addJob (
      dateKey: String
    ): JobQue
  }
  `;

  const checkTruck = function(truck, job, jobQueID){
    const currentTruck = find(Truck, { id: truck.id })
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
      jobName: job.name,
      estimatedTime: job.estimatedTime,
      startTime: job.startTime,
      truck: truck.id
    }



}


  const resolvers = {
    Query: {
      JobQue: () => JobQue
    },
    Mutation: {
      addJob: (_, { dateKey, job, truck }) => {
        const jobQue = find(JobQue, { id: dateKey });
        if (!jobQue) {
          return checkTruck(truck, job, moment().format('MMMM Do YYYY, h:mm:ss a'))
        }else{
          return checkTruck(truck, job, jobQue.id)
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