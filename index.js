const express = require("express");
const {
    ApolloServer,
    gql
} = require('apollo-server-express');
const lo = require('lodash');
const moment = require('moment');

const Trucks = []
const Jobs = []
const JobsQued = []
const typeDefs = gql `

type Job {
    id: String!
    name: String!
    dateOfMove: String!
    startTime: Int!
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
    date: String!
    jobName: String!
    jobID: String!
    estimatedTime: Int!
    startTime: Int!
    truckID: String!
    truckName: String!
}

  # the schema allows the following query:
type Query {
    JobQue: [JobQue]
    Jobs: [Job]
    Trucks: [Truck]
}

  # this schema allows the following mutation:
type Mutation {
    JobQue:JobQue
    Job (
      name: String!
      dateOfMove: String!
      startTime: Int!
      estimatedTime: Int!
    ): Job
    Truck (
      name: String!
      startTime: Int!
      endTime: Int!
    ): Truck
}
  `;

const createJobQue = function() {
    // get the last job we just made
    const currentJob = Jobs[Jobs.length - 1]    
    var currentTruck
    for(let i=0; i < Trucks.length; i++){
        let allofTruckCurrenHours = 0
        // check all jobs on that date to get allofTruckCurrenHours
        if(JobsQued.length){
            JobsQued.map((value, index) => {
                if(value.date === currentJob.dateOfMove && value.truckID === Trucks[i].id){
                    allofTruckCurrenHours = value.estimatedTime
                }
            })
        }
        if (0 > (Trucks[i].totalHours - allofTruckCurrenHours)) {
            // truck is full
            break;
        }else{
            currentTruck = Trucks[i]
            continue;
        }
        
    }
    const _job = {
        id: getUniqueID(),
        date: currentJob.dateOfMove,
        jobName: currentJob.name,
        jobID: currentJob.id,
        estimatedTime: currentJob.estimatedTime,
        startTime: currentJob.startTime,
        truckID: currentTruck.id,
        truckName: currentTruck.name
    }
    JobsQued.push(_job)
    return _job
}

const getUniqueID = _ => require('crypto').randomBytes(10).toString('hex')


const resolvers = {
    Query: {
        JobQue: () => JobsQued,
        Jobs: () => Jobs,
        Trucks: () => Trucks,
    },
    Mutation: {
        JobQue: (_, {}) => createJobQue(),
        Job: (_, {
            name,
            dateOfMove,
            startTime,
            estimatedTime
        }) => {
            const _job = {
                id: getUniqueID(),
                name: name,
                dateOfMove: dateOfMove,
                startTime: startTime,
                estimatedTime: estimatedTime
            }
            Jobs.push(_job)
            return _job
        },

        Truck: (_, {
            name,
            startTime,
            endTime
        }) => {
            // utilize military time for easy conversion on the backend
            const _truck = {
                id: getUniqueID(),
                name: name,
                startTime: startTime,
                endTime: endTime,
                totalHours: (endTime - startTime)
            }
            Trucks.push(_truck)
            return _truck
        }
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
server.applyMiddleware({
    app
});
app.get("/", (req, res) => {
    res.redirect("/graphql");
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
const port = 4000;

app.listen({
        port
    }, () =>
    console.log(
        `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    )
)